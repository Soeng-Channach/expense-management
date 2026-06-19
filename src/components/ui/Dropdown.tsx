import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DropdownOption {
  value: string;
  label: string;
  /** Secondary muted line shown under the label. */
  description?: string;
  /** Leading visual (color dot, icon chip, currency symbol, …). */
  leading?: ReactNode;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  /** Override popup position/width (defaults to `left-0 w-full`). */
  menuClassName?: string;
}

/**
 * A fully styled, accessible single-select dropdown — a drop-in replacement for
 * a native <select> that themes correctly in dark mode and supports rich option
 * content. Controlled via `value` / `onChange`.
 */
export function Dropdown({
  value,
  onChange,
  options,
  label,
  error,
  placeholder = 'Select…',
  disabled,
  className,
  buttonClassName,
  menuClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Highlight the selected option when the menu opens.
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the highlighted option in view while navigating with the keyboard.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const commit = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    // While open, keep navigation keys (esp. Escape) from reaching global
    // handlers like the parent Modal's close-on-Escape listener.
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape', 'Tab'].includes(
        e.key
      )
    ) {
      e.stopPropagation();
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[activeIndex]) commit(options[activeIndex].value);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      {label && <span className="label-base">{label}</span>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'input-base flex items-center justify-between gap-2 text-left',
          open && 'border-brand-500 ring-2 ring-brand-500/30',
          error && 'border-expense focus:border-expense focus:ring-expense/30',
          disabled && 'cursor-not-allowed opacity-60',
          buttonClassName
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.leading}
          <span className={cn('truncate', !selected && 'text-content-muted')}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-content-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            'scroll-area absolute z-50 mt-1.5 max-h-60 origin-top overflow-y-auto rounded-xl',
            'border border-border bg-surface p-1.5 shadow-card-hover animate-scale-in',
            menuClassName ?? 'left-0 w-full'
          )}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === activeIndex;
            return (
              // Keyboard selection is handled centrally on the trigger button
              // (Enter/Space commits the active option), per the listbox pattern,
              // so the option itself needs only a mouse click handler.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(opt.value)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  isActive ? 'bg-surface-muted' : '',
                  isSelected
                    ? 'font-semibold text-brand-600 dark:text-brand-400'
                    : 'text-content'
                )}
              >
                {opt.leading}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{opt.label}</span>
                  {opt.description && (
                    <span className="block truncate text-xs font-normal text-content-muted">
                      {opt.description}
                    </span>
                  )}
                </span>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-xs font-medium text-expense">{error}</p>}
    </div>
  );
}
