import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const DesignTokenTypography = () => {
  return (
    <div className="p-8 space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Typography System</h1>
        <p className="text-slate-500">new_page 디자인 시스템 타이포그래피</p>
      </div>

      {/* Font Family */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Font Family</h2>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <p className="text-lg text-slate-700">
            System UI Font Stack (Inter-like)
          </p>
          <p className="text-sm text-slate-500 font-mono mt-2">
            font-family: system-ui, -apple-system, BlinkMacSystemFont, &apos;Segoe UI&apos;, Roboto, sans-serif
          </p>
        </div>
      </div>

      {/* Headings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Headings</h2>
        <div className="space-y-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Heading 1</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-4xl font-bold tracking-tight</p>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Heading 2</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-3xl font-bold tracking-tight</p>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-bold text-slate-900">Heading 3</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-2xl font-bold</p>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <h4 className="text-xl font-bold text-slate-900">Heading 4</h4>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-xl font-bold</p>
          </div>
          <div>
            <h5 className="text-lg font-bold text-slate-900">Heading 5</h5>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-lg font-bold</p>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Body Text</h2>
        <div className="space-y-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-base font-medium text-slate-900">Body Medium</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-base font-medium text-slate-900</p>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <p className="text-base text-slate-700">Body Regular</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-base text-slate-700</p>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <p className="text-sm font-medium text-slate-600">Small Medium</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-sm font-medium text-slate-600</p>
          </div>
          <div className="border-b border-slate-100 pb-4">
            <p className="text-sm text-slate-500">Small Regular (Description)</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-sm text-slate-500</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Extra Small (Caption)</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">text-xs text-slate-400</p>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Font Weights</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4 text-center">
            <p className="text-2xl font-normal text-slate-900">Aa</p>
            <p className="text-xs text-slate-500 mt-1">Normal (400)</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4 text-center">
            <p className="text-2xl font-medium text-slate-900">Aa</p>
            <p className="text-xs text-slate-500 mt-1">Medium (500)</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4 text-center">
            <p className="text-2xl font-semibold text-slate-900">Aa</p>
            <p className="text-xs text-slate-500 mt-1">Semibold (600)</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">Aa</p>
            <p className="text-xs text-slate-500 mt-1">Bold (700)</p>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Text Colors</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
            <span className="text-lg font-medium text-slate-900">Primary Text</span>
            <span className="text-xs text-slate-400 font-mono">text-slate-900</span>
          </div>
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
            <span className="text-lg font-medium text-slate-700">Secondary Text</span>
            <span className="text-xs text-slate-400 font-mono">text-slate-700</span>
          </div>
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
            <span className="text-lg font-medium text-slate-500">Muted Text</span>
            <span className="text-xs text-slate-400 font-mono">text-slate-500</span>
          </div>
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
            <span className="text-lg font-medium text-slate-400">Disabled Text</span>
            <span className="text-xs text-slate-400 font-mono">text-slate-400</span>
          </div>
          <div className="flex items-center gap-4 bg-black rounded-2xl p-4">
            <span className="text-lg font-medium text-lime-400">Accent Text</span>
            <span className="text-xs text-slate-400 font-mono">text-lime-400</span>
          </div>
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-4">
            <span className="text-lg font-medium text-lime-600">Link/Hover Text</span>
            <span className="text-xs text-slate-400 font-mono">text-lime-600</span>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Usage Example</h2>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6 space-y-4">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              반가워요, 천동은님 👋
            </h3>
            <p className="text-slate-500 font-medium mt-1">
              오늘도 활기찬 하루 되세요! 2025년 11월 29일 토요일
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-lg font-bold text-slate-900 mb-2">최근 활동</h4>
            <p className="text-sm text-slate-500">
              지출 결의서 승인 요청이 도착했습니다.
            </p>
            <p className="text-xs text-slate-400 mt-1">2시간 전</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof DesignTokenTypography> = {
  title: 'Design Tokens/Typography',
  component: DesignTokenTypography,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'new_page 디자인 시스템의 타이포그래피 스케일과 스타일입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DesignTokenTypography>

export const Default: Story = {}
