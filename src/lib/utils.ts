// ============================================================
// SincroChatCatalog — Utility Helpers
// ============================================================

/**
 * Format a number as currency (default: COP — Colombian Pesos)
 * Adapts to any locale/currency if needed in the future.
 */
export function formatCurrency(amount: number, currency = 'COP', locale = 'es-CO'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Generate a unique ID for cart items
 */
export function generateCartItemId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Apply CSS custom properties for dynamic branding
 */
export function applyBranding(primary?: string, secondary?: string): void {
    const root = document.documentElement;
    if (primary) {
        root.style.setProperty('--brand-primary', primary);
        // Generate lighter/darker variants via HSL manipulation
        root.style.setProperty('--brand-primary-light', adjustColorBrightness(primary, 30));
        root.style.setProperty('--brand-primary-dark', adjustColorBrightness(primary, -20));
    }
    if (secondary) {
        root.style.setProperty('--brand-secondary', secondary);
    }
}

/**
 * Adjust hex color brightness
 */
function adjustColorBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Check if a session token looks valid (UUID format)
 */
export function isValidToken(token: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}…`;
}
