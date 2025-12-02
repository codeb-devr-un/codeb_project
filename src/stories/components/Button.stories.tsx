import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Plus, Calendar, ChevronRight, Star, LogOut } from 'lucide-react'

interface ButtonProps {
  variant: 'lime-primary' | 'lime-secondary' | 'glass' | 'ghost' | 'outline' | 'icon'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

const Button = ({ variant, size, children, disabled, icon }: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-300'

  const variantClasses = {
    'lime-primary': 'bg-black text-lime-400 hover:bg-slate-900 hover:text-lime-300 shadow-lg shadow-black/20 hover:-translate-y-0.5',
    'lime-secondary': 'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/20 hover:-translate-y-0.5',
    'glass': 'bg-white/50 backdrop-blur-xl border border-white/40 text-slate-700 hover:bg-white/80 shadow-sm',
    'ghost': 'text-slate-500 hover:text-slate-900 hover:bg-white/60',
    'outline': 'bg-white/50 border border-white/40 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-white',
    'icon': 'bg-white text-slate-400 hover:bg-lime-400 hover:text-black shadow-lg hover:scale-110',
  }

  const sizeClasses = {
    sm: variant === 'icon' ? 'w-10 h-10 rounded-xl' : 'px-4 py-2 text-sm rounded-lg',
    md: variant === 'icon' ? 'w-12 h-12 rounded-2xl' : 'px-6 py-2.5 text-sm rounded-xl',
    lg: variant === 'icon' ? 'w-14 h-14 rounded-2xl' : 'px-8 py-3 text-base rounded-xl',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Lime/Black 테마 기반의 버튼 컴포넌트입니다.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['lime-primary', 'lime-secondary', 'glass', 'ghost', 'outline', 'icon'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const LimePrimary: Story = {
  args: {
    variant: 'lime-primary',
    size: 'md',
    children: '새 업무 작성',
    icon: <Plus className="w-4 h-4" />,
  },
}

export const LimeSecondary: Story = {
  args: {
    variant: 'lime-secondary',
    size: 'md',
    children: '일정 관리',
    icon: <Calendar className="w-4 h-4" />,
  },
}

export const Glass: Story = {
  args: {
    variant: 'glass',
    size: 'md',
    children: '일정 관리',
    icon: <Calendar className="w-4 h-4" />,
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    children: '전체보기',
    icon: <ChevronRight className="w-4 h-4" />,
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    children: '기획',
  },
}

export const IconButton: Story = {
  args: {
    variant: 'icon',
    size: 'md',
    children: <Star className="w-5 h-5" />,
  },
}

// All Variants
export const AllVariants = () => (
  <div className="space-y-8 p-8">
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Primary Buttons</h3>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2.5 rounded-xl bg-black text-lime-400 font-bold shadow-lg shadow-black/20 hover:bg-slate-900 hover:text-lime-300 transition-all hover:-translate-y-0.5 inline-flex items-center">
          <Plus className="w-4 h-4 mr-2" /> 새 업무 작성
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-lime-400 text-slate-900 font-bold shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition-all hover:-translate-y-0.5 inline-flex items-center">
          <Calendar className="w-4 h-4 mr-2" /> 일정 관리
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Glass Buttons</h3>
      <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-lime-100 to-emerald-100">
        <button className="px-6 py-2.5 rounded-xl bg-white/50 backdrop-blur-xl border border-white/40 text-slate-700 font-medium hover:bg-white/80 transition-all shadow-sm inline-flex items-center">
          <Calendar className="w-4 h-4 mr-2" /> Glass Button
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 text-slate-700 font-medium hover:bg-white transition-all shadow-sm">
          Another Glass
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Ghost & Outline</h3>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-lg font-medium transition-all inline-flex items-center">
          전체보기 <ChevronRight className="w-4 h-4 ml-1" />
        </button>
        <button className="px-4 py-2 text-sm rounded-full bg-white/50 border border-white/40 text-slate-600 hover:bg-white hover:text-slate-900 font-medium transition-all">
          기획
        </button>
        <button className="px-4 py-2 text-sm rounded-full bg-white/50 border border-white/40 text-slate-600 hover:bg-white hover:text-slate-900 font-medium transition-all">
          디자인
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Icon Buttons</h3>
      <div className="flex items-center gap-4">
        <button className="w-12 h-12 rounded-2xl bg-white text-slate-400 hover:bg-lime-400 hover:text-black shadow-lg hover:scale-110 transition-all flex items-center justify-center">
          <Star className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 rounded-2xl bg-black text-lime-400 shadow-lg shadow-lime-500/20 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Sizes</h3>
      <div className="flex items-end gap-4">
        <button className="px-4 py-2 text-sm rounded-lg bg-black text-lime-400 font-bold shadow-lg">
          Small
        </button>
        <button className="px-6 py-2.5 text-sm rounded-xl bg-black text-lime-400 font-bold shadow-lg">
          Medium
        </button>
        <button className="px-8 py-3 text-base rounded-xl bg-black text-lime-400 font-bold shadow-lg">
          Large
        </button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-4">States</h3>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2.5 rounded-xl bg-black text-lime-400 font-bold shadow-lg">
          Normal
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-slate-900 text-lime-300 font-bold shadow-lg -translate-y-0.5">
          Hover
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-black text-lime-400 font-bold shadow-lg opacity-50 cursor-not-allowed">
          Disabled
        </button>
      </div>
    </div>
  </div>
)
