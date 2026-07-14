import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    'min-h-11 rounded-full px-6 font-semibold tracking-wide transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100'
  const variants: Record<Variant, string> = {
    primary: 'bg-brand-purple text-white hover:bg-brand-purple-deep',
    outline: 'border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/10',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
