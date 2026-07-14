import { useState } from 'react'

const PIN_LENGTH = 6

export function PinPad({
  onComplete,
  disabled,
}: {
  onComplete: (pin: string) => void
  disabled?: boolean
}) {
  const [pin, setPin] = useState('')

  function pressDigit(digit: string) {
    if (disabled || pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    if (next.length === PIN_LENGTH) {
      onComplete(next)
      setPin('')
    }
  }

  function backspace() {
    if (disabled) return
    setPin((p) => p.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full ${i < pin.length ? 'bg-brand-purple' : 'bg-brand-pink/40'}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => pressDigit(d)}
            disabled={disabled}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-semibold text-brand-dark shadow-sm ring-1 ring-brand-pink/40 transition-transform active:scale-95 disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => pressDigit('0')}
          disabled={disabled}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-semibold text-brand-dark shadow-sm ring-1 ring-brand-pink/40 transition-transform active:scale-95 disabled:opacity-40"
        >
          0
        </button>
        <button
          onClick={backspace}
          disabled={disabled}
          aria-label="Backspace"
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl text-brand-dark transition-transform active:scale-95 disabled:opacity-40"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
