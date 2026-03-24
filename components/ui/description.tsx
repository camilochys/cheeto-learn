import * as React from 'react'
import { cn } from '@/lib/utils'

function Description({ className, onChange, ...props }: React.ComponentProps<'textarea'>) {

    // --- CONSTS FOR ADJUSTING CLIENT TEXTAREA HEIGHT ---
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const adjustHeight = () => {
        const textarea = textareaRef.current
        if (textarea) {
            if (textarea.scrollHeight > textarea.clientHeight) {
                textarea.style.height = `${textarea.scrollHeight + 2}px`
            }
        }
    }
    // --- EVENT TO HANDLE THE CHANGE OF HEIGHT ---
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight ()
        if (onChange) onChange(e)
    }

    // --- CUSTOM UI COMPONENT STYLE + HEIGHT ADJUSTER + TEXTAREA ---
    return (
    <textarea
    {...props}
    ref={textareaRef}
    onChange={handleChange}
    data-slot="textarea"
    className={cn(
        'flex file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 min-h-30 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
    )}
    />
  )
}

export { Description }