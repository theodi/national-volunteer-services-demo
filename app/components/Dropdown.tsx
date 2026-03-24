"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Trigger and container take full width of parent */
  fullWidth?: boolean;
  /** Class for the trigger button */
  triggerClassName?: string;
  /** Class for the dropdown panel */
  panelClassName?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  fullWidth = false,
  triggerClassName = "",
  panelClassName = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={fullWidth ? "relative block w-full" : "relative inline-block"}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="dropdown-label"
        id="dropdown-trigger"
        className={`inline-flex items-center justify-between gap-2 border border-gray-300 bg-white p-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-custom focus:ring-offset-2 cursor-pointer ${fullWidth ? "w-full" : ""} ${triggerClassName}`.trim()}
      >
        <span>{displayLabel}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-700 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="dropdown-trigger"
          className={`absolute right-0 z-50 mt-1 min-w-full overflow-hidden border border-gray-300 bg-white py-1 shadow-lg ${panelClassName}`.trim()}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={option.value !== options[0]?.value ? "border-t border-gray-300" : ""}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset cursor-pointer ${
                    isSelected
                      ? "bg-primary-light text-primary"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Generic action menu for icon-triggered dropdowns (e.g. \"...\" menus)
export interface ActionMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

export interface ActionMenuProps {
  trigger: ReactNode;
  items: ActionMenuItem[];
  align?: "left" | "right";
}

export function ActionMenu({ trigger, items, align = "right" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const panelAlign = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute ${panelAlign} top-8 z-50 w-32 rounded-md border border-slate-100 bg-white py-1 text-sm shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`block w-full px-3 py-1.5 text-left cursor-pointer ${
                item.destructive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
