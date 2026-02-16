// ============================================================
// CatalogShell — Root React Island Component
// Manages data fetching, state, and renders the full catalog.
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useStore } from '@nanostores/react';
import type { CatalogApiResponse, CatalogProduct, SectionWithProducts } from '../../lib/types';
import { fetchCatalog, CatalogApiError } from '../../lib/api';
import { applyBranding } from '../../lib/utils';
import { Search, Smartphone, ChevronUp } from 'lucide-react';
import { CatalogHeader } from './CatalogHeader';
import { SectionNav } from './SectionNav';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';
import { ProductDetail } from './ProductDetail';
import { CartDrawer } from '../cart/CartDrawer';
import { CartFab } from '../cart/CartFab';
import { initCartSession, $cartCount, $isCartOpen } from '../../stores/cartStore';
import { supabase } from '../../lib/supabase';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';

function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return true;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768);
}

function MobileOnlyScreen() {
    return (
        <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
            <div className="text-center max-w-sm animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Smartphone size={36} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-3">
                    Abre este enlace desde tu celular
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Este catálogo está diseñado para verse en dispositivos móviles.
                    Escanea el código QR o abre el enlace desde WhatsApp en tu teléfono.
                </p>
            </div>
        </div>
    );
}

// No props needed — token is read from URL query params

// Demo data for preview mode
const DEMO_DATA: CatalogApiResponse = {
    session: {
        id: 'demo-session',
        token: 'preview',
        business_id: 'demo-biz',
        catalog_id: 'demo-cat',
        created_at: new Date().toISOString(),
    },
    business: {
        id: 'demo-biz',
        name: 'Mi Restaurante Demo',
        category: 'restaurante',
        delivery: true,
        pick_up: true,
        created_at: new Date().toISOString(),
    },
    location: {
        id: 'demo-loc',
        business_id: 'demo-biz',
        name: 'Sucursal Centro',
        address: 'Calle 10 #5-30, Centro',
        created_at: new Date().toISOString(),
    },
    branding: {
        business_id: 'demo-biz',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        created_at: new Date().toISOString(),
    },
    catalog: {
        id: 'demo-cat',
        business_id: 'demo-biz',
        location_id: 'demo-loc',
        name: 'Menú del Día',
        is_active: true,
        created_at: new Date().toISOString(),
    },
    sections: [
        {
            id: 'sec-1',
            catalog_id: 'demo-cat',
            name: '🔥 Populares',
            order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            products: [
                {
                    id: 'cp-1',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-1',
                    order: 1,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-1',
                        business_id: 'demo-biz',
                        name: 'Hamburguesa Clásica',
                        description: 'Carne de res 150g, lechuga, tomate, cebolla y salsa especial',
                        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
                        price: 18000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [
                        {
                            id: 'cps-1',
                            catalog_product_id: 'cp-1',
                            catalog_subsection_id: 'sub-1',
                            order: 1,
                            subsection: {
                                id: 'sub-1',
                                name: 'Elige tu proteína',
                                type: 'single',
                                min: 1,
                                max: 1,
                                allow_quantity: false,
                                allow_price: true,
                                required: true,
                                created_at: new Date().toISOString(),
                                items: [
                                    { id: 'si-1', subsection_id: 'sub-1', name: 'Res', price: 0, is_active: true, created_at: new Date().toISOString() },
                                    { id: 'si-2', subsection_id: 'sub-1', name: 'Pollo', price: 0, is_active: true, created_at: new Date().toISOString() },
                                    { id: 'si-3', subsection_id: 'sub-1', name: 'Doble carne', price: 5000, is_active: true, created_at: new Date().toISOString() },
                                ],
                            },
                        },
                        {
                            id: 'cps-2',
                            catalog_product_id: 'cp-1',
                            catalog_subsection_id: 'sub-2',
                            order: 2,
                            subsection: {
                                id: 'sub-2',
                                name: 'Extras',
                                type: 'multiple',
                                min: 0,
                                max: 5,
                                allow_quantity: false,
                                allow_price: true,
                                required: false,
                                created_at: new Date().toISOString(),
                                items: [
                                    { id: 'si-4', subsection_id: 'sub-2', name: 'Queso extra', price: 2000, is_active: true, created_at: new Date().toISOString() },
                                    { id: 'si-5', subsection_id: 'sub-2', name: 'Tocineta', price: 3000, is_active: true, created_at: new Date().toISOString() },
                                    { id: 'si-6', subsection_id: 'sub-2', name: 'Huevo', price: 1500, is_active: true, created_at: new Date().toISOString() },
                                ],
                            },
                        },
                    ],
                },
                {
                    id: 'cp-2',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-2',
                    order: 2,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-2',
                        business_id: 'demo-biz',
                        name: 'Pizza Margarita',
                        description: 'Masa artesanal, salsa de tomate, mozzarella fresca y albahaca',
                        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop',
                        price: 25000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-3',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-3',
                    order: 3,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-3',
                        business_id: 'demo-biz',
                        name: 'Wrap de Pollo',
                        description: 'Tortilla de trigo, pollo a la plancha, vegetales frescos y aderezo ranch',
                        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
                        price: 16000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-7',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-7',
                    order: 4,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-7',
                        business_id: 'demo-biz',
                        name: 'Nachos Supreme',
                        description: 'Totopos con queso cheddar, jalapeños, guacamole y crema agria',
                        image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
                        price: 22000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-8',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-8',
                    order: 5,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-8',
                        business_id: 'demo-biz',
                        name: 'Hot Dog Americano',
                        description: 'Salchicha premium, mostaza, ketchup y cebolla caramelizada',
                        image: 'https://images.unsplash.com/photo-1612392062126-2f8a0e2e0b01?w=400&h=300&fit=crop',
                        price: 12000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-9',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-9',
                    order: 6,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-9',
                        business_id: 'demo-biz',
                        name: 'Alitas BBQ',
                        description: 'Alitas de pollo bañadas en salsa BBQ ahumada',
                        image: 'https://images.unsplash.com/photo-1527477396000-e27163b0a4a4?w=400&h=300&fit=crop',
                        price: 20000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-10',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-10',
                    order: 7,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-10',
                        business_id: 'demo-biz',
                        name: 'Tacos al Pastor',
                        description: 'Tres tacos de cerdo marinado con piña, cilantro y cebolla',
                        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
                        price: 19000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-11',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-1',
                    product_id: 'p-11',
                    order: 8,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-11',
                        business_id: 'demo-biz',
                        name: 'Quesadilla Mixta',
                        description: 'Tortilla de harina con queso, pollo y champiñones',
                        image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop',
                        price: 15000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
            ],
        },
        {
            id: 'sec-2',
            catalog_id: 'demo-cat',
            name: '🥤 Bebidas',
            order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            products: [
                {
                    id: 'cp-4',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-2',
                    product_id: 'p-4',
                    order: 1,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-4',
                        business_id: 'demo-biz',
                        name: 'Limonada Natural',
                        description: 'Limonada recién exprimida con hierbabuena',
                        image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
                        price: 6000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
                {
                    id: 'cp-5',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-2',
                    product_id: 'p-5',
                    order: 2,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-5',
                        business_id: 'demo-biz',
                        name: 'Smoothie Tropical',
                        description: 'Mango, piña, maracuyá y leche de coco',
                        image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400&h=300&fit=crop',
                        price: 12000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
            ],
        },
        {
            id: 'sec-3',
            catalog_id: 'demo-cat',
            name: '🍰 Postres',
            order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            products: [
                {
                    id: 'cp-6',
                    catalog_id: 'demo-cat',
                    category_id: 'sec-3',
                    product_id: 'p-6',
                    order: 1,
                    is_available: true,
                    created_at: new Date().toISOString(),
                    product: {
                        id: 'p-6',
                        business_id: 'demo-biz',
                        name: 'Brownie con Helado',
                        description: 'Brownie de chocolate caliente con helado de vainilla y salsa de chocolate',
                        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
                        price: 14000,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    },
                    subsections: [],
                },
            ],
        },
    ],
    payment_methods: [
        { id: 'pm-1', business_id: 'demo-biz', name: 'Efectivo', type: 'cash', available: true, require_confirmation: false },
        { id: 'pm-2', business_id: 'demo-biz', name: 'Nequi', type: 'transfer', available: true, require_confirmation: true },
    ],
};

export default function CatalogShell() {
    const [isMobile] = useState(() => isMobileDevice());

    if (!isMobile) {
        return <MobileOnlyScreen />;
    }

    // Read token from URL: /?t=xxx
    const [token] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        const params = new URLSearchParams(window.location.search);
        return params.get('t') || '';
    });

    const [data, setData] = useState<CatalogApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
    const cartCount = useStore($cartCount);
    const isCartOpen = useStore($isCartOpen);
    const isScrollingProgrammatically = useRef(false);

    // Reset subcategory when changing main section
    useEffect(() => {
        setActiveSubcategory(null);
    }, [activeSection]);

    // Sync deliveryFee desde el order inicial
    useEffect(() => {
        setDeliveryFee(data?.order?.delivery_fee ?? null);
    }, [data?.order?.id]);

    // Realtime: escucha cambios en delivery_fee de la orden
    useEffect(() => {
        const orderId = data?.order?.id;
        if (!orderId) return;

        const channel = supabase
            .channel(`order-fee-${orderId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'order', filter: `id=eq.${orderId}` },
                (payload) => {
                    const fee = (payload.new as { delivery_fee?: number | null }).delivery_fee;
                    setDeliveryFee(fee ?? null);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [data?.order?.id]);

    const filteredSections: SectionWithProducts[] = useMemo(() => {
        if (!data) return [];
        if (!searchQuery.trim()) return data.sections;

        const query = searchQuery.toLowerCase().trim();
        return data.sections
            .map((section) => ({
                ...section,
                products: section.products.filter((cp) =>
                    cp.product?.name.toLowerCase().includes(query) ||
                    cp.product?.description?.toLowerCase().includes(query)
                ),
            }))
            .filter((section) => section.products.length > 0);
    }, [data?.sections, searchQuery]);

    // Subcategory Filtering Logic
    const currentSection = filteredSections.find(s => s.id === activeSection);
    const subcategories = currentSection?.subcategories || [];

    const displayedSections = useMemo(() => {
        if (searchQuery) return filteredSections;

        return filteredSections.map(section => {
            if (section.id === activeSection && activeSubcategory) {
                return {
                    ...section,
                    products: section.products.filter(p => p.category_ids?.includes(activeSubcategory))
                };
            }
            return section;
        });
    }, [filteredSections, searchQuery, activeSection, activeSubcategory]);

    // Auto-select first section if current one is not in filtered results
    useEffect(() => {
        if (filteredSections.length > 0 && !filteredSections.find(s => s.id === activeSection)) {
            setActiveSection(filteredSections[0].id);
        }
    }, [filteredSections, activeSection]);

    // Show/hide scroll-to-top button based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update activeSection on scroll — find the last section whose top has passed the sticky header
    useEffect(() => {
        if (searchQuery || displayedSections.length === 0) return;

        const stickyHeader = document.querySelector('[data-sticky-header]') as HTMLElement;
        const topMargin = stickyHeader ? stickyHeader.offsetHeight + 20 : 130;
        const sectionIds = displayedSections.map(s => s.id);

        const handleScroll = () => {
            if (isScrollingProgrammatically.current) return;

            // If user scrolled to the bottom, activate the last section
            const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);
            if (atBottom) {
                setActiveSection(sectionIds[sectionIds.length - 1]);
                return;
            }

            let current = sectionIds[0];
            for (const id of sectionIds) {
                const el = document.getElementById(`section-${id}`);
                if (el && el.getBoundingClientRect().top <= topMargin + 10) {
                    current = id;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [displayedSections, searchQuery]);

    const loadCatalog = useCallback(async () => {

        // No token — show error
        if (!token) {
            setLoading(false);
            return;
        }

        // Use demo data for preview mode
        if (token === 'preview') {
            initCartSession(token);
            setData(DEMO_DATA);
            setLoading(false);
            if (DEMO_DATA.sections.length > 0) {
                setActiveSection(DEMO_DATA.sections[0].id);
            }
            applyBranding(
                DEMO_DATA.branding.primary_color,
                DEMO_DATA.branding.secondary_color
            );
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await fetchCatalog(token);
            initCartSession(token);
            setData(response);

            // Set first section as active
            if (response.sections.length > 0) {
                setActiveSection(response.sections[0].id);
            }

            // Apply business branding
            applyBranding(
                response.branding?.primary_color,
                response.branding?.secondary_color
            );
        } catch (err) {
            if (err instanceof CatalogApiError) {
                if (err.isExpired) {
                    setIsExpired(true);
                    setError('Este enlace ha expirado');
                } else if (err.isNotFound) {
                    setIsNotFound(true);
                    setError('Catálogo no encontrado');
                } else {
                    setError(err.message);
                }
            } else {
                setError('Error de conexión. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadCatalog();
    }, [loadCatalog]);

    // No token provided
    if (!loading && !token) {
        return (
            <ErrorState
                message="No se recibió un token de acceso. Abre el enlace desde WhatsApp."
                isExpired={false}
            />
        );
    }

    // Loading state
    if (loading) {
        return <LoadingState />;
    }

    // Error state
    if (error || !data) {
        return (
            <ErrorState
                message={error || 'Error desconocido'}
                isExpired={isExpired}
                isNotFound={isNotFound}
                onRetry={!isExpired && !isNotFound ? loadCatalog : undefined}
            />
        );
    }


    const isReadOnly = data.session.type === 'read';

    return (
        <div className="min-h-dvh flex flex-col bg-slate-50">
            {/* Header with branding */}
            <CatalogHeader
                business={data.business}
                location={data.location}
                branding={data.branding}
                catalogName={data.catalog.name}
                isReadOnly={isReadOnly}
            />

            {/* Sticky Header: Search + Nav */}
            <div data-sticky-header className="sticky top-0 z-30 bg-white pb-1 shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                {/* Category tabs (Level 1) */}
                {displayedSections.length > 1 && (
                    <SectionNav
                        items={displayedSections}
                        activeId={activeSection}
                        onChange={(id) => {
                            isScrollingProgrammatically.current = true;
                            setActiveSection(id);
                            // Wait for state update so sticky header resizes
                            requestAnimationFrame(() => {
                                const element = document.getElementById(`section-${id}`);
                                const stickyHeader = document.querySelector('[data-sticky-header]') as HTMLElement;
                                if (element && stickyHeader) {
                                    const headerHeight = stickyHeader.offsetHeight + 10;
                                    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                                    window.scrollTo({
                                        top: elementPosition - headerHeight,
                                        behavior: 'smooth'
                                    });
                                }
                                // Release lock after scroll settles
                                setTimeout(() => {
                                    isScrollingProgrammatically.current = false;
                                }, 800);
                            });
                        }}
                    />
                )}

                {/* Subcategory filters (Level 2) */}
                {subcategories.length > 0 && !searchQuery && (
                    <SectionNav
                        variant="secondary"
                        items={[{ id: 'all', name: 'Todos' }, ...subcategories]}
                        activeId={activeSubcategory || 'all'}
                        onChange={(id) => setActiveSubcategory(id === 'all' ? null : id)}
                    />
                )}
            </div>

            {/* Products */}
            <main className="flex-1 px-4 pb-6">
                {displayedSections.length === 0 && searchQuery ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No se encontraron productos</p>
                        <p className="text-slate-400 text-xs mt-1">Intenta con otro término de búsqueda</p>
                    </div>
                ) : (
                    displayedSections.map((section) => (
                        <div key={section.id} id={`section-${section.id}`} className="scroll-mt-[110px]">
                            <ProductGrid
                                section={section}
                                isVisible={true}
                                onProductClick={setSelectedProduct}
                                isReadOnly={isReadOnly}
                            />
                        </div>
                    ))
                )}
            </main>

            {/* Powered by footer */}
            <footer className="py-5 pb-8 flex items-center justify-center gap-1.5 text-slate-800">
                <span className="text-[11px]">Este catálogo fue creado con</span>
                <img src="/favicon.svg" alt="SincroChat" className="h-7 w-7 ml-1" />
            </footer>

            {/* Cart (hidden in read-only mode) */}
            {!isReadOnly && (
                <>
                    <CartFab />
                    <CartDrawer
                        sessionToken={token}
                        paymentMethods={data.payment_methods}
                        order={data.order}
                        customerPhone={data.session.customer_id}
                        deliveryFee={deliveryFee}
                    />
                </>
            )}

            {/* Product detail modal */}
            {selectedProduct && (
                <ProductDetail
                    catalogProduct={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    isReadOnly={isReadOnly}
                />
            )}

            {/* Scroll to top button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                    bottom: cartCount > 0 && !isCartOpen && !isReadOnly ? '88px' : '24px',
                    backgroundColor: 'var(--brand-primary)',
                }}
                className={`
                    fixed right-4 z-50
                    w-10 h-10 rounded-full shadow-lg shadow-black/10
                    flex items-center justify-center
                    transition-all duration-300
                    active:scale-90
                    ${showScrollTop && !selectedProduct && !isCartOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                `}
                aria-label="Volver arriba"
            >
                <ChevronUp size={20} className="text-white" />
            </button>
        </div>
    );
}
