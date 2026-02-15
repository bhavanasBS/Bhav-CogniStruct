import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    icon: Icon,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate dropdown position
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 160),
                zIndex: 99999,
            });
        }
    };

    // Update position when opening
    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption?.label || placeholder;

    const dropdownContent = isOpen ? (
        <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
        >
            <div className="py-1 max-h-60 overflow-y-auto">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`
                            flex items-center justify-between w-full px-3 py-2.5 text-sm text-left
                            transition-colors cursor-pointer
                            ${value === option.value
                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }
                        `}
                    >
                        <span>{option.label}</span>
                        {value === option.value && (
                            <Check className="h-4 w-4 text-indigo-600" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    ) : null;

    return (
        <>
            <div ref={triggerRef} className={`relative ${className}`}>
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex items-center justify-between gap-2 w-full
                        h-10 pl-3 pr-2 min-w-[140px]
                        text-sm font-medium 
                        bg-white border border-slate-200 rounded-lg 
                        hover:bg-slate-50 hover:border-slate-300
                        focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
                        transition-all cursor-pointer
                        ${isOpen ? 'ring-2 ring-indigo-200 border-indigo-400' : ''}
                        ${value !== null && value !== '' ? 'text-slate-800' : 'text-slate-500'}
                    `}
                >
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
                        <span className="truncate">{displayLabel}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Portal the dropdown to body */}
            {createPortal(dropdownContent, document.body)}
        </>
    );
};

export default CustomSelect;
