// ============================================================
// LoadingState — Spinner + "Cargando catálogo" message
// ============================================================

export function LoadingState() {
    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center">
            {/* Spinner */}
            <div className="relative w-14 h-14 mb-5">
                <div
                    className="absolute inset-0 rounded-full border-[3px] border-slate-200"
                />
                <div
                    className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500 animate-spin"
                />
            </div>

            {/* Text */}
            <p className="text-slate-600 text-sm font-semibold tracking-wide">
                Cargando catálogo
            </p>
            <p className="text-slate-400 text-xs mt-1">
                Espera un momento...
            </p>
        </div>
    );
}
