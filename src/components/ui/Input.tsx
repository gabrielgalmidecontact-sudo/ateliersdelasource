// src/components/ui/Input.tsx
import { cn } from '@/lib/utils/cn'
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const inputBase = 'w-full rounded-sm border border-[#D4C4A8] bg-white/80 px-4 py-3 font-sans text-sm text-[#2D1F14] placeholder-[#7A6355]/60 transition-colors duration-200 focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30 disabled:opacity-50 disabled:cursor-not-allowed'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputBase, error && 'border-red-400 focus:border-red-400 focus:ring-red-200', className)}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-[#7A6355] font-sans">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-600 font-sans">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(inputBase, 'resize-y min-h-[120px]', error && 'border-red-400', className)}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-[#7A6355] font-sans">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-600 font-sans">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
