// ============================================================
// ErrorState — Error display with retry option
// ============================================================

import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    message: string;
    isExpired?: boolean;
    onRetry?: () => void;
}

export function ErrorState({ message, isExpired, onRetry }: ErrorStateProps) {
    return (
        <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="text-center max-w-sm animate-fade-in">
                <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg
            ${isExpired
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'
                            : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-200'
                        }`}
                >
                    {isExpired ? (
                        <Clock size={36} className="text-white" />
                    ) : (
                        <AlertTriangle size={36} className="text-white" />
                    )}
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {isExpired ? 'Enlace expirado' : 'Algo salió mal'}
                </h2>

                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {message}
                </p>

                {isExpired && (
                    <p className="text-slate-400 text-xs mb-6">
                        Solicita un nuevo enlace al negocio para ver su catálogo.
                    </p>
                )}

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-slate-800 text-white text-sm font-medium
                       hover:bg-slate-700 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        <RefreshCw size={16} />
                        Intentar de nuevo
                    </button>
                )}
            </div>
        </div>
    );
}
