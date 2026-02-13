// ============================================================
// SectionNav — Premium mobile navigation
// Two variants: category tabs + subcategory filters
// ============================================================

import { useRef, useEffect, useState } from 'react';

interface NavItem {
    id: string;
    name: string;
}

interface SectionNavProps {
    items: NavItem[];
    activeId: string;
    onChange: (id: string) => void;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export function SectionNav({
    items,
    activeId,
    onChange,
    variant = 'primary',
    className = '',
}: SectionNavProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLButtonElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

    // Auto-scroll to active button + update indicator position
    useEffect(() => {
        if (activeRef.current && scrollRef.current) {
            const container = scrollRef.current;
            const button = activeRef.current;

            // Center the active button in viewport
            const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });

            // Update floating indicator position (primary only)
            if (variant === 'primary') {
                setIndicatorStyle({
                    left: button.offsetLeft,
                    width: button.offsetWidth,
                });
            }
        }
    }, [activeId, variant, items]);

    const isPrimary = variant === 'primary';

    if (isPrimary) {
        return (
            <nav className={`relative ${className}`}>
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scroll-smooth no-scrollbar relative px-4 gap-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* Animated background indicator */}
                    <div
                        className="absolute bottom-0 h-[3px] rounded-full transition-all duration-300 ease-out"
                        style={{
                            ...indicatorStyle,
                            backgroundColor: 'var(--brand-primary)',
                        }}
                    />

                    {items.map((item) => {
                        const isActive = activeId === item.id;
                        return (
                            <button
                                key={item.id}
                                ref={isActive ? activeRef : undefined}
                                onClick={() => onChange(item.id)}
                                className={`
                                    flex-shrink-0 relative px-4 pb-3 pt-2
                                    text-[14px] font-semibold leading-none
                                    transition-colors duration-200
                                    ${isActive
                                        ? 'text-slate-900'
                                        : 'text-slate-400 active:text-slate-500'
                                    }
                                `}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                </div>
            </nav>
        );
    }

    // Secondary variant — subtle filter chips
    return (
        <nav className={`${className}`}>
            <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth no-scrollbar gap-2 px-4 py-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                        <button
                            key={item.id}
                            ref={isActive ? activeRef : undefined}
                            onClick={() => onChange(item.id)}
                            className={`
                                flex-shrink-0 rounded-lg
                                text-[12px] font-semibold leading-none
                                px-3 py-[7px]
                                transition-all duration-200
                                ${isActive
                                    ? 'text-white shadow-sm'
                                    : 'text-slate-500 bg-slate-100 active:bg-slate-200'
                                }
                            `}
                            style={isActive ? {
                                backgroundColor: 'var(--brand-primary)',
                            } : undefined}
                        >
                            {item.name}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
