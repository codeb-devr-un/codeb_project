import React from 'react'

export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-lime-400' : 'bg-slate-300'
                }`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : ''
                }`} />
        </button>
    )
}

export function InputField({
    label,
    type,
    value,
    onChange,
    step
}: {
    label: string
    type: string
    value: any
    onChange: (v: string) => void
    step?: string
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                step={step}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
            />
        </div>
    )
}
