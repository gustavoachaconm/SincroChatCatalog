// ============================================================
// ProductGrid — Displays products for a section
// ============================================================

import type { SectionWithProducts, CatalogProduct } from '../../lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
    section: SectionWithProducts;
    isVisible: boolean;
    onProductClick: (product: CatalogProduct) => void;
    isReadOnly?: boolean;
}

export function ProductGrid({ section, isVisible, onProductClick, isReadOnly = false }: ProductGridProps) {
    if (!isVisible) return null;

    const availableProducts = section.products.filter((cp) => cp.is_available);

    const isCompact = availableProducts.length > 4;

    return (
        <section className="py-4 animate-fade-in" id={`section-${section.id}`}>
            <h2 className="text-lg font-bold text-slate-800 mb-3 px-1">
                {section.name}
            </h2>

            {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                    No hay productos disponibles en esta sección
                </div>
            ) : (
                <div className={isCompact ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                    {availableProducts.map((cp) => (
                        <ProductCard
                            key={cp.id}
                            catalogProduct={cp}
                            onClick={() => onProductClick(cp)}
                            compact={isCompact}
                            isReadOnly={isReadOnly}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
