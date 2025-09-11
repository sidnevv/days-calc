'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface DropdownButtonProps {
  label: ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function DropdownButton({ label, items, className }: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне меню
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className ?? ''}`} ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-sm text-gray-200 text-sm">
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {open && (
        <div
          className="absolute mt-4 w-52 rounded-lg shadow-lg bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5"
          style={{ zIndex: 100, top: '50px', left: 0 }}>
          <ul className="py-1">
            {items.map((item, index) =>
              item.divider ? (
                <li key={item.id || `divider-${index}`}>
                  <hr className="my-1 border-gray-700" />
                </li>
              ) : (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors                     ${
                      item.disabled
                        ? 'text-gray-500 cursor-not-allowed opacity-50'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white'
                    }`}
                    disabled={item.disabled}>
                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
