// ============================================================
// SincroChatCatalog — API Client
// All communication goes through n8n webhooks.
// The frontend NEVER accesses Supabase directly.
// ============================================================

import type { CatalogApiResponse, OrderPayload } from './types';

// n8n webhook base URL — configure via PUBLIC_N8N_BASE_URL (without trailing slash)
// e.g. https://cloud.sincro.chat/webhook
const API_BASE = import.meta.env.PUBLIC_N8N_BASE_URL || 'https://n8n.example.com/webhook';


/**
 * Fetch the full catalog data for a given session token.
 * n8n validates the token, checks expiration, and returns all catalog data.
 */
export async function fetchCatalog(token: string): Promise<CatalogApiResponse> {
    const response = await fetch(`${API_BASE}/catalog?t=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new CatalogApiError(
            response.status,
            (error as { message?: string }).message || 'Error al cargar el catálogo'
        );
    }

    return response.json() as Promise<CatalogApiResponse>;
}

/**
 * Submit an order via n8n webhook.
 * n8n creates the order, order items, and notifies the business.
 */
export async function submitOrder(order: OrderPayload): Promise<{ order_id: string }> {
    const response = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new CatalogApiError(
            response.status,
            (error as { message?: string }).message || 'Error al enviar el pedido'
        );
    }

    return response.json() as Promise<{ order_id: string }>;
}

/**
 * Custom error class for API errors with status code context
 */
export class CatalogApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = 'CatalogApiError';
    }

    get isExpired(): boolean {
        return this.status === 410; // Gone — session expired
    }

    get isNotFound(): boolean {
        return this.status === 404;
    }

    get isUnauthorized(): boolean {
        return this.status === 401;
    }
}
