// ============================================================
// CartDrawer — Full-screen cart view with premium styling
// ============================================================

import { ChevronLeft, Trash2, Minus, Plus, ShoppingBag, ImageOff, MapPin, Phone, Bike, Store } from 'lucide-react';
import { useStore } from '@nanostores/react';
import {
    $cartItems,
    $cartSubtotal,
    $isCartOpen,
    toggleCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
} from '../../stores/cartStore';
import type { Order, PaymentMethod } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface CartDrawerProps {
    sessionToken: string;
    paymentMethods: PaymentMethod[];
    order?: Order | null;
    customerPhone?: string | null;
    deliveryFee: number | null;
}

export function CartDrawer({ sessionToken, paymentMethods, order, customerPhone, deliveryFee }: CartDrawerProps) {
    const items = useStore($cartItems);
    const subtotal = useStore($cartSubtotal);
    const isOpen = useStore($isCartOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-light animate-fade-in"
                onClick={toggleCart}
            />

            {/* Full-screen panel */}
            <div className="relative bg-white w-full h-full flex flex-col animate-slide-up">

                {/* Header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                    <button
                        onClick={toggleCart}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center
                            active:scale-95 transition-transform flex-shrink-0"
                    >
                        <ChevronLeft size={22} className="text-slate-600" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900">Tu pedido</h2>
                        <p className="text-xs text-slate-400">
                            {items.length} {items.length === 1 ? 'producto' : 'productos'}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="text-xs font-semibold text-red-400 hover:text-red-500 px-3 py-1.5
                                rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Vaciar todo
                        </button>
                    )}
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-8">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-5">
                                <ShoppingBag size={36} className="text-slate-200" />
                            </div>
                            <p className="text-slate-500 font-semibold text-base">
                                Tu carrito está vacío
                            </p>
                            <p className="text-slate-300 text-sm mt-1 text-center">
                                Explora el catálogo y agrega productos
                            </p>
                            <button
                                onClick={toggleCart}
                                className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                                    active:scale-95 transition-transform"
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                            >
                                Ver catálogo
                            </button>
                        </div>
                    ) : (
                        <div className="px-4 py-4 space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 p-3 bg-slate-50/80 rounded-2xl animate-scale-in"
                                >
                                    {/* Product image */}
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    target.parentElement!.querySelector('.img-fallback')?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center img-fallback ${item.product.image ? 'hidden' : ''}`}>
                                            <ImageOff size={20} className="text-slate-300" />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 leading-tight">
                                            {item.product.name}
                                        </h4>

                                        {/* Modifiers + Notes as simple list */}
                                        {(item.modifiers.length > 0 || item.notes) && (
                                            <div className="mt-1.5 space-y-0.5">
                                                {item.modifiers.flatMap((m) =>
                                                    m.items.map((i) => (
                                                        <p key={i.item_id} className="text-xs text-slate-500">
                                                            + {i.quantity > 1 ? `${i.name} x${i.quantity}` : i.name}
                                                        </p>
                                                    ))
                                                )}
                                                {item.notes && (
                                                    <div className="bg-slate-100 rounded-lg px-2.5 py-1.5 mt-1">
                                                        <p className="text-xs text-slate-500 italic leading-relaxed">
                                                            &ldquo;{item.notes}&rdquo;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Price + quantity controls */}
                                        <div className="flex items-center justify-between mt-2">
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: 'var(--brand-primary)' }}
                                            >
                                                {formatCurrency(item.total_price)}
                                            </span>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() =>
                                                        updateCartItemQuantity(item.id, item.quantity - 1)
                                                    }
                                                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center
                                                        text-slate-500 active:scale-90 transition-all"
                                                >
                                                    {item.quantity === 1 ? (
                                                        <Trash2 size={13} className="text-red-400" />
                                                    ) : (
                                                        <Minus size={13} />
                                                    )}
                                                </button>
                                                <span className="text-sm font-bold text-slate-800 w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateCartItemQuantity(item.id, item.quantity + 1)
                                                    }
                                                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center
                                                        text-slate-500 active:scale-90 transition-all"
                                                >
                                                    <Plus size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Order info + Totals + Checkout */}
                {items.length > 0 && (
                    <div
                        className="px-4 pt-4 border-t border-slate-100 bg-white space-y-4"
                        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
                    >
                        {/* Order info section */}
                        {order && (
                            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2.5">
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                    Info del pedido
                                </p>

                                {/* Type */}
                                <div className="flex items-center gap-2.5">
                                    {order.type === 'delivery' ? (
                                        <Bike size={15} className="text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <Store size={15} className="text-slate-400 flex-shrink-0" />
                                    )}
                                    <span className="text-sm text-slate-700 font-medium">
                                        {order.type === 'delivery' ? 'Domicilio' : 'Recoger en tienda'}
                                    </span>
                                </div>

                                {/* Address (only if delivery) */}
                                {order.type === 'delivery' && order.delivery_address && (
                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-slate-700 font-medium leading-snug">
                                            {order.delivery_address}
                                        </span>
                                    </div>
                                )}

                                {/* Customer phone */}
                                {customerPhone && (
                                    <div className="flex items-center gap-2.5">
                                        <Phone size={15} className="text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-700 font-medium">
                                            {(() => {
                                                const d = customerPhone.replace(/\D/g, '');
                                                if (d.length === 12) return `+${d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`;
                                                if (d.length === 11) return `+${d.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`;
                                                if (d.length === 10) return `+${d.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`;
                                                return `+${d}`;
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Subtotal</span>
                                <span className="text-sm font-semibold text-slate-800">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>

                            {deliveryFee != null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Domicilio</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {formatCurrency(deliveryFee)}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                <span className="text-base font-bold text-slate-900">Total</span>
                                <span className="text-xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                                    {formatCurrency(deliveryFee != null ? subtotal + deliveryFee : subtotal)}
                                </span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <button
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white
                                font-semibold text-[15px] shadow-lg transition-all duration-200 active:scale-[0.98]"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            Continuar con el pedido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
