import { useEffect, useRef } from 'react';
import { AlertTriangle, X, Pause, Play, ShieldAlert } from 'lucide-react';

/**
 * Professional confirmation modal replacing native browser confirm().
 * 
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirm: () => void
 *  - title: string
 *  - message: string
 *  - confirmLabel: string (default "Confirm")
 *  - cancelLabel: string (default "Cancel")
 *  - variant: 'danger' | 'warning' | 'success' (default 'warning')
 *  - icon: Lucide icon component (optional)
 *  - isLoading: boolean (optional)
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning',
    icon: CustomIcon,
    isLoading = false,
}) => {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    const variants = {
        danger: {
            iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
            confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            accentBorder: 'border-red-100',
            Icon: CustomIcon || AlertTriangle,
        },
        warning: {
            iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
            confirmBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
            accentBorder: 'border-orange-100',
            Icon: CustomIcon || ShieldAlert,
        },
        success: {
            iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            confirmBg: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
            accentBorder: 'border-emerald-100',
            Icon: CustomIcon || Play,
        },
    };

    const v = variants[variant] || variants.warning;
    const Icon = v.Icon;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={(e) => e.target === overlayRef.current && !isLoading && onClose()}
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${v.iconBg}`} />

                {/* Close */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="px-6 pt-8 pb-6 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-14 h-14 ${v.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>

                    {/* Message */}
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{message}</p>
                </div>

                {/* Actions */}
                <div className={`flex gap-3 px-6 py-4 bg-slate-50 border-t ${v.accentBorder}`}>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 ${v.confirmBg} text-white rounded-xl text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
