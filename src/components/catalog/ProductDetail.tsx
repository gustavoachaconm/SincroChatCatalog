// ============================================================
// ProductDetail — Full-screen product detail with modifiers
// Premium mobile design inspired by top delivery apps
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, Minus, Plus, ImageOff } from 'lucide-react';
import type { CatalogProduct, SelectedModifier, SelectedModifierItem } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import { addToCart } from '../../stores/cartStore';
import { ModifierGroup } from '../modifiers/ModifierGroup';

interface ProductDetailProps {
    catalogProduct: CatalogProduct;
    onClose: () => void;
    isReadOnly?: boolean;
}

export function ProductDetail({ catalogProduct, onClose, isReadOnly = false }: ProductDetailProps) {
    const product = catalogProduct.product!;
    const subsections = catalogProduct.subsections || [];

    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [modifierSelections, setModifierSelections] = useState<
        Record<string, SelectedModifierItem[]>
    >({});

    const hasModifiers = subsections.length > 0;
    const hasValidImage = product.image && product.image.startsWith('http');
    const [imgError, setImgError] = useState(false);

    // Calculate total price
    const totalPrice = useMemo(() => {
        const modifierTotal = Object.values(modifierSelections).reduce(
            (sum, items) =>
                sum + items.reduce((s, item) => s + item.price * item.quantity, 0),
            0
        );
        return (product.price + modifierTotal) * quantity;
    }, [product.price, modifierSelections, quantity]);

    // Check if all required modifiers are satisfied
    const isValid = useMemo(() => {
        return subsections.every((cps) => {
            const sub = cps.subsection;
            if (!sub.required) return true;
            const selected = modifierSelections[sub.id] || [];
            const count = selected.length;
            return count >= (sub.min || 1);
        });
    }, [subsections, modifierSelections]);

    const handleModifierChange = useCallback(
        (subsectionId: string, items: SelectedModifierItem[]) => {
            setModifierSelections((prev) => ({
                ...prev,
                [subsectionId]: items,
            }));
        },
        []
    );

    const handleAddToCart = () => {
        const modifiers: SelectedModifier[] = Object.entries(modifierSelections)
            .filter(([, items]) => items.length > 0)
            .map(([subsectionId, items]) => {
                const sub = subsections.find((s) => s.subsection.id === subsectionId);
                return {
                    subsection_id: subsectionId,
                    subsection_name: sub?.subsection.name || '',
                    items,
                };
            });

        addToCart(
            catalogProduct.id,
            product,
            quantity,
            modifiers,
            notes || undefined
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-light animate-fade-in"
                onClick={onClose}
            />

            {/* Modal — full screen */}
            <div className="relative bg-white w-full h-full flex flex-col animate-slide-up">

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">

                    {/* Hero image */}
                    {hasValidImage && !imgError ? (
                        <div className="relative w-full aspect-[4/3] bg-slate-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                            {/* Gradient overlay for back button visibility */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                            {/* Back button on image */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                                    flex items-center justify-center shadow-lg
                                    active:scale-95 transition-transform"
                            >
                                <ChevronLeft size={22} className="text-slate-700" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2">
                            <ImageOff size={40} className="text-slate-300" />
                            <span className="text-xs text-slate-300 font-medium">Sin imagen</span>
                            {/* Back button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm
                                    flex items-center justify-center shadow-md
                                    active:scale-95 transition-transform"
                            >
                                <ChevronLeft size={22} className="text-slate-600" />
                            </button>
                        </div>
                    )}

                    {/* Product info */}
                    <div className="px-5 pt-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-xl font-bold text-slate-900 leading-tight flex-1">
                                {product.name}
                            </h2>
                            <div className="text-right flex-shrink-0">
                                <span className="text-lg font-bold text-slate-900">
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                        </div>
                        {product.description && (
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {!isReadOnly && (
                        <>
                            {/* Quantity selector — full width */}
                            <div className="px-5 py-3">
                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-14 h-12 flex items-center justify-center text-slate-500
                                            hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <span className="text-base font-bold text-slate-800">{quantity}</span>
                                    </div>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-14 h-12 flex items-center justify-center text-slate-500
                                            hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-2 bg-slate-50" />

                            {/* Modifier groups */}
                            {subsections.length > 0 && (
                                <div className="px-5 pt-4">
                                    {subsections
                                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                        .map((cps) => (
                                            <ModifierGroup
                                                key={cps.id}
                                                subsection={cps.subsection}
                                                selectedItems={modifierSelections[cps.subsection.id] || []}
                                                onChange={(items) =>
                                                    handleModifierChange(cps.subsection.id, items)
                                                }
                                            />
                                        ))}
                                </div>
                            )}

                            {/* Notes */}
                            <div className="px-5 pt-2 pb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Notas adicionales
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ej: Sin cebolla, extra picante..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700
                                        placeholder:text-slate-300 focus:outline-none focus:border-brand focus:ring-2
                                        focus:ring-brand/10 resize-none transition-all bg-slate-50"
                                    rows={2}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer: Add to Cart (only in buy mode) */}
                {!isReadOnly && (
                    <div
                        className="px-5 pt-3 pb-4 border-t border-slate-100 bg-white"
                        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
                    >
                        <button
                            onClick={handleAddToCart}
                            disabled={!isValid}
                            className={`w-full flex items-center justify-between py-4 px-6 rounded-2xl text-white
                                font-semibold text-[15px] transition-all duration-200
                                ${isValid
                                    ? 'shadow-lg active:scale-[0.98]'
                                    : 'bg-slate-300 cursor-not-allowed'
                                }`}
                            style={
                                isValid
                                    ? { backgroundColor: 'var(--brand-primary)' }
                                    : undefined
                            }
                        >
                            <span>Agregar a mi pedido</span>
                            <span className="font-bold">{formatCurrency(totalPrice)}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
