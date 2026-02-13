// ============================================================
// SincroChatCatalog — Cart Store (Nanostores)
// Global reactive state for the shopping cart.
// Uses nanostores for Astro island compatibility.
// Persists cart to localStorage, scoped by session token.
// ============================================================

import { atom, computed } from 'nanostores';
import type { CartItem, Product, SelectedModifier } from '../lib/types';
import { generateCartItemId } from '../lib/utils';

// --- localStorage helpers (token-scoped) ---

const STORAGE_KEY = 'sincro_cart';
const TOKEN_KEY = 'sincro_cart_token';

/** Current session token — set by initCartSession() */
let currentToken: string | null = null;

function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as CartItem[];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]): void {
    try {
        if (items.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    } catch {
        // Storage full or unavailable — silently ignore
    }
}

/**
 * Initialize cart for a specific session token.
 * If the token matches the stored one, restore the cart.
 * If it's a different token (new link), clear and start fresh.
 */
export function initCartSession(token: string): void {
    currentToken = token;

    try {
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedToken === token) {
            // Same session — restore cart from storage
            $cartItems.set(loadCart());
        } else {
            // New session — clear old cart and save new token
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem(TOKEN_KEY, token);
            $cartItems.set([]);
        }
    } catch {
        // localStorage unavailable — start with empty cart
        $cartItems.set([]);
    }
}

// --- State atoms ---

export const $cartItems = atom<CartItem[]>([]);
export const $isCartOpen = atom<boolean>(false);

// Sync to localStorage on every change
$cartItems.subscribe((items) => {
    saveCart(items);
});

// --- Computed values ---

export const $cartCount = computed($cartItems, (items) =>
    items.reduce((sum, item) => sum + item.quantity, 0)
);

export const $cartSubtotal = computed($cartItems, (items) =>
    items.reduce((sum, item) => sum + item.total_price, 0)
);

// --- Actions ---

export function addToCart(
    catalogProductId: string,
    product: Product,
    quantity: number,
    modifiers: SelectedModifier[],
    notes?: string
): void {
    const modifierTotal = modifiers.reduce(
        (sum, mod) =>
            sum + mod.items.reduce((s, item) => s + item.price * item.quantity, 0),
        0
    );
    const unitPrice = product.price + modifierTotal;

    const newItem: CartItem = {
        id: generateCartItemId(),
        catalog_product_id: catalogProductId,
        product,
        quantity,
        modifiers,
        notes,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
    };

    $cartItems.set([...$cartItems.get(), newItem]);
}

export function removeFromCart(cartItemId: string): void {
    $cartItems.set($cartItems.get().filter((item) => item.id !== cartItemId));
}

export function updateCartItemQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
        removeFromCart(cartItemId);
        return;
    }

    $cartItems.set(
        $cartItems.get().map((item) =>
            item.id === cartItemId
                ? { ...item, quantity, total_price: item.unit_price * quantity }
                : item
        )
    );
}

export function clearCart(): void {
    $cartItems.set([]);
}

export function toggleCart(): void {
    $isCartOpen.set(!$isCartOpen.get());
}
