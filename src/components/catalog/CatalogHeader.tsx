// ============================================================
// CatalogHeader — Business branding, name, location info
// ============================================================

import { MapPin, Clock } from 'lucide-react';
import type { Business, BusinessLocation, BusinessBranding } from '../../lib/types';

interface CatalogHeaderProps {
    business: Business;
    location: BusinessLocation | null;
    branding: BusinessBranding;
    catalogName: string;
}

export function CatalogHeader({
    business,
    location,
    branding,
    catalogName,
}: CatalogHeaderProps) {
    return (
        <header
            className="relative overflow-hidden"
            style={{ backgroundColor: branding.primary_color || '#6366f1' }}
        >

            {/* Content */}
            <div className="relative z-10 px-5 pt-14 pb-6 flex flex-col items-center text-center">
                {/* Logo */}
                {branding.logo && branding.logo.startsWith('http') ? (
                    <img
                        src={branding.logo}
                        alt={business.name}
                        className="w-16 h-16 rounded-2xl object-cover bg-white/20 shadow-lg mb-3 ring-2 ring-white/20"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-3 ring-2 ring-white/20">
                        <span className="text-2xl font-bold text-white">
                            {business.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Business Name */}
                <h1 className="text-xl font-bold text-white leading-tight">
                    {business.name}
                </h1>

                {/* Location */}
                {location && (
                    <p className="text-white/70 text-sm font-medium inline-flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {location.name}
                    </p>
                )}
            </div>
        </header>
    );
}
