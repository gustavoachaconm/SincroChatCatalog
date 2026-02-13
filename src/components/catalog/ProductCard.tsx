// ============================================================
// ProductCard — Individual product display card
// Mobile-first horizontal layout with image, name, price
// ============================================================

import { useState } from 'react';
import { Plus, ImageOff } from 'lucide-react';
import type { CatalogProduct } from '../../lib/types';
import { formatCurrency, truncate } from '../../lib/utils';

interface ProductCardProps {
    catalogProduct: CatalogProduct;
    onClick: () => void;
    compact?: boolean;
}

export function ProductCard({ catalogProduct, onClick, compact = false }: ProductCardProps) {
    const product = catalogProduct.product;
    if (!product) return null;

    const hasModifiers = (catalogProduct.subsections?.length ?? 0) > 0;
    const hasValidImage = product.image && product.image.startsWith('http');
    const [imgError, setImgError] = useState(false);

    const ImageFallback = () => (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-1">
            <ImageOff size={20} className="text-slate-300" />
            <span className="text-[10px] font-medium text-slate-300 px-2 text-center leading-tight line-clamp-1">
                {product.name}
            </span>
        </div>
    );

    if (compact) {
        return (
            <button
                onClick={onClick}
                className="w-full flex flex-col bg-white rounded-2xl p-2 shadow-sm
                     border border-slate-100 hover:shadow-md hover:border-slate-200
                     transition-all duration-200 active:scale-[0.98] text-left group h-full"
            >
                {/* Image */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                    {hasValidImage && !imgError ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <ImageFallback />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-[13px] font-semibold text-slate-800 leading-tight mb-1 line-clamp-2">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-brand block">
                            {formatCurrency(product.price)}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand group-hover:text-white transition-colors">
                            <Plus size={14} />
                        </div>
                    </div>
                </div>
            </button>
        );
    }

    // Standard Layout (List)
    return (
        <button
            onClick={onClick}
            className="w-full flex items-stretch gap-3 bg-white rounded-2xl p-3 shadow-sm
                 border border-slate-100 hover:shadow-md hover:border-slate-200
                 transition-all duration-200 active:scale-[0.98] text-left group"
        >
            {/* Product image */}
            <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-100">
                {hasValidImage && !imgError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <ImageFallback />
                )}
            </div>

            {/* Product info */}
            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-tight">
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-brand">
                        {formatCurrency(product.price)}
                    </span>

                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center
                        bg-slate-100 group-hover:bg-brand group-hover:text-white
                        text-slate-400 transition-all duration-200"
                    >
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </button>
    );
}
