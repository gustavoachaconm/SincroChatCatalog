// ============================================================
// ModifierGroup — Schema-driven modifier renderer
// Premium design with clean list items and price badges
// ============================================================

import { Check, Minus, Plus } from 'lucide-react';
import type { CatalogSubsection, SelectedModifierItem } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface ModifierGroupProps {
    subsection: CatalogSubsection;
    selectedItems: SelectedModifierItem[];
    onChange: (items: SelectedModifierItem[]) => void;
}

export function ModifierGroup({
    subsection,
    selectedItems,
    onChange,
}: ModifierGroupProps) {
    // --- Text type: render a textarea instead of item list ---
    if (subsection.type === 'text') {
        const textValue = selectedItems[0]?.name ?? '';
        const handleTextChange = (val: string) => {
            if (val.trim()) {
                onChange([{ item_id: subsection.id, name: val, price: 0, quantity: 1 }]);
            } else {
                onChange([]);
            }
        };
        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            {subsection.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {subsection.required ? 'Obligatorio' : 'Opcional'}
                        </p>
                    </div>
                </div>
                <textarea
                    value={textValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={subsection.description || 'Escribe aquí...'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700
                        placeholder:text-slate-300 focus:outline-none focus:border-brand focus:ring-2
                        focus:ring-brand/10 resize-none transition-all bg-slate-50"
                    rows={2}
                />
            </div>
        );
    }

    const items = (subsection.items?.filter((i) => i.is_active) || [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const selectedCount = selectedItems.length;
    const isComplete =
        !subsection.required ||
        selectedCount >= (subsection.min || 1);
    const isMaxReached = subsection.max
        ? selectedCount >= subsection.max
        : false;

    const handleSelect = (item: typeof items[0]) => {
        const isSelected = selectedItems.some((s) => s.item_id === item.id);

        if (subsection.type === 'single') {
            onChange([
                {
                    item_id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                },
            ]);
        } else {
            if (isSelected) {
                onChange(selectedItems.filter((s) => s.item_id !== item.id));
            } else if (!isMaxReached) {
                onChange([
                    ...selectedItems,
                    {
                        item_id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                    },
                ]);
            }
        }
    };

    const handleQuantityChange = (itemId: string, delta: number) => {
        onChange(
            selectedItems
                .map((s) => {
                    if (s.item_id !== itemId) return s;
                    const newQty = s.quantity + delta;
                    return newQty <= 0 ? null : { ...s, quantity: newQty };
                })
                .filter(Boolean) as SelectedModifierItem[]
        );
    };

    // Build subtitle text
    const subtitle = [
        subsection.required ? 'Obligatorio' : 'Opcional',
        subsection.min && subsection.max
            ? `Selecciona entre ${subsection.min} y ${subsection.max} opciones`
            : subsection.type === 'single'
                ? 'Elige 1'
                : subsection.max
                    ? `Máx. ${subsection.max}`
                    : null,
    ].filter(Boolean).join(' · ');

    return (
        <div className="mb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {subsection.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        {subtitle}
                    </p>
                </div>
                {subsection.required && !isComplete && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
                        Requerido
                    </span>
                )}
                {isComplete && subsection.required && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <Check size={10} className="inline -mt-0.5" /> Listo
                    </span>
                )}
            </div>

            {/* Options */}
            <div className="divide-y divide-slate-100">
                {items.map((item) => {
                    const selected = selectedItems.find((s) => s.item_id === item.id);
                    const isSelected = !!selected;
                    const isDisabled = subsection.type !== 'single' && !isSelected && isMaxReached;

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 py-3 ${isDisabled ? 'opacity-40' : ''}`}
                        >
                            {/* Item name + price badge */}
                            <button
                                onClick={() => !isDisabled && handleSelect(item)}
                                disabled={isDisabled}
                                className="flex-1 flex items-center gap-2.5 text-left"
                            >
                                <span className={`text-sm ${isSelected ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                    {item.name}
                                </span>
                                {subsection.allow_price && item.price > 0 && (
                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {formatCurrency(item.price)}
                                    </span>
                                )}
                            </button>

                            {/* Quantity controls (when allow_quantity and selected) or +/- toggle */}
                            {subsection.allow_quantity && isSelected ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(item.id, -1)}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center
                                            text-slate-500 active:bg-slate-100 transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm font-bold text-slate-800 w-4 text-center">
                                        {selected.quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(item.id, 1)}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center
                                            text-slate-500 active:bg-slate-100 transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ) : subsection.type === 'multiple' ? (
                                /* Multiple: checkbox style */
                                <button
                                    onClick={() => !isDisabled && handleSelect(item)}
                                    disabled={isDisabled}
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                        transition-all ${isSelected ? '' : 'border-slate-300'}`}
                                    style={
                                        isSelected
                                            ? {
                                                borderColor: 'var(--brand-primary)',
                                                backgroundColor: 'var(--brand-primary)',
                                            }
                                            : undefined
                                    }
                                >
                                    {isSelected && <Check size={14} className="text-white" />}
                                </button>
                            ) : (
                                /* Single: radio style */
                                <button
                                    onClick={() => !isDisabled && handleSelect(item)}
                                    disabled={isDisabled}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                        transition-all ${isSelected ? '' : 'border-slate-300'}`}
                                    style={
                                        isSelected
                                            ? {
                                                borderColor: 'var(--brand-primary)',
                                                backgroundColor: 'var(--brand-primary)',
                                            }
                                            : undefined
                                    }
                                >
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
