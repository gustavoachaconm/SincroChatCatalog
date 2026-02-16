// ============================================================
// SincroChatCatalog — Domain Types
// Schema-driven types matching the Supabase schema exactly
// ============================================================

// --- Core Business Entities ---

export interface Business {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    delivery: boolean;
    pick_up: boolean;
    number_id?: string;
    waba_id?: string;
    created_at: string;
    updated_at?: string;
}

export interface BusinessLocation {
    id: string;
    business_id: string;
    name: string;
    address: string;
    opening?: string;
    closing?: string;
    created_at: string;
}

export interface BusinessBranding {
    business_id: string;
    logo?: string;
    primary_color?: string;
    secondary_color?: string;
    created_at: string;
    updated_at?: string;
}

// --- Catalog Entities ---

export interface Catalog {
    id: string;
    business_id: string;
    location_id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CatalogSection {
    id: string;
    catalog_id: string;
    parent_id?: string | null;
    name: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    subcategories?: { id: string; name: string; order: number }[];
}

export interface Product {
    id: string;
    business_id: string;
    name: string;
    description?: string;
    image: string;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CatalogProduct {
    id: string;
    catalog_id: string;
    category_id: string; // Renamed from section_id
    product_id: string;
    order?: number;
    is_available: boolean;
    created_at: string;
    updated_at?: string;
    category_ids?: string[];
    // Joined data (populated by n8n)
    product?: Product;
    subsections?: CatalogProductSubsectionWithDetails[];
}

// --- Modifiers / Subsections ---

export interface CatalogSubsection {
    id: string;
    name: string;
    description?: string;
    type: 'single' | 'multiple' | 'text';
    min?: number;
    max?: number;
    allow_quantity: boolean;
    allow_price: boolean;
    required: boolean;
    created_at: string;
    updated_at?: string;
    items?: CatalogSubsectionItem[];
}

export interface CatalogSubsectionItem {
    id: string;
    subsection_id?: string;
    name: string;
    price: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CatalogProductSubsectionWithDetails {
    id: string;
    catalog_product_id: string;
    catalog_subsection_id: string;
    config?: Record<string, unknown>;
    order?: number;
    subsection: CatalogSubsection;
}

// --- Session ---

export interface CatalogSession {
    id: string;
    token: string;
    business_id: string;
    catalog_id: string;
    created_at: string;
    order_id?: string;
    customer_id?: string;
    type?: 'read' | 'buy';
}

// --- Orders ---

export interface Order {
    id: string;
    type: 'delivery' | 'pick_up';
    delivery_address?: string | null;
    delivery_fee?: number | null;
}

export interface OrderPayload {
    session_token: string;
    customer_id: string;
    type: 'delivery' | 'pick_up';
    delivery_address?: string;
    items: OrderItemPayload[];
}

export interface OrderItemPayload {
    product_id: string;
    base_price: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    modifiers: SelectedModifier[];
    notes?: string;
}

export interface SelectedModifier {
    subsection_id?: string;
    subsection_name?: string;
    items: SelectedModifierItem[];
}

export interface SelectedModifierItem {
    item_id: string;
    name: string;
    price: number;
    quantity: number;
}

// --- Payment Methods ---

export interface PaymentMethod {
    id: string;
    business_id: string;
    name: string;
    type: string;
    available: boolean;
    require_confirmation: boolean;
}

// --- API Response Shape (from n8n) ---

export interface CatalogApiResponse {
    session: CatalogSession;
    business: Business;
    location: BusinessLocation | null;
    branding: BusinessBranding;
    catalog: Catalog;
    sections: SectionWithProducts[];
    payment_methods: PaymentMethod[];
    order?: Order | null;
}

export interface SectionWithProducts extends CatalogSection {
    products: CatalogProduct[];
}

// --- Cart State ---

export interface CartItem {
    id: string; // Unique cart item ID
    catalog_product_id: string;
    product: Product;
    quantity: number;
    modifiers: SelectedModifier[];
    notes?: string;
    unit_price: number; // base price + modifier prices
    total_price: number; // unit_price * quantity
}
