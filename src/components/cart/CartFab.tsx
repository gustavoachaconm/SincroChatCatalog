// ============================================================
// CartFab — Floating Action Button for cart access
// Shows item count badge and animates on change
// ============================================================

import { ShoppingCart } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $cartCount, $cartSubtotal, $isCartOpen, toggleCart } from '../../stores/cartStore';
import { formatCurrency } from '../../lib/utils';

export function CartFab() {
    const count = useStore($cartCount);
    const subtotal = useStore($cartSubtotal);
    const isOpen = useStore($isCartOpen);

    if (count === 0 || isOpen) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-40 pb-safe animate-slide-up">
            <button
                onClick={toggleCart}
                className="w-full flex items-center justify-between py-4 px-5 rounded-2xl text-white
                   font-semibold shadow-2xl transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--brand-primary)' }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingCart size={20} />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[10px] font-bold
                           flex items-center justify-center"
                            style={{ color: 'var(--brand-primary)' }}
                        >
                            {count}
                        </span>
                    </div>
                    <span className="text-sm">Ver carrito</span>
                </div>
                <span className="text-sm font-bold">
                    {formatCurrency(subtotal)}
                </span>
            </button>
        </div>
    );
}
