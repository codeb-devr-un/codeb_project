import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const ShadowDemo = ({ name, className, description }: { name: string; className: string; description: string }) => (
  <div className="space-y-2">
    <div className={`w-40 h-28 rounded-3xl bg-white ${className} flex items-center justify-center`}>
      <span className="text-sm text-slate-400">Preview</span>
    </div>
    <div>
      <p className="font-semibold text-sm text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </div>
)

const DesignTokenShadows = () => {
  return (
    <div className="p-8 space-y-10 max-w-4xl bg-[#F8F9FA] min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Shadow System</h1>
        <p className="text-slate-500">Glass Morphism 기반의 그림자 시스템</p>
      </div>

      {/* Basic Shadows */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Basic Shadows</h2>
        <div className="flex flex-wrap gap-8">
          <ShadowDemo
            name="Glass Shadow"
            className="shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            description="기본 카드 그림자"
          />
          <ShadowDemo
            name="Glass Shadow Hover"
            className="shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            description="호버 시 그림자"
          />
          <ShadowDemo
            name="Elevated"
            className="shadow-2xl"
            description="강조 요소"
          />
        </div>
      </div>

      {/* Colored Shadows */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Colored Shadows</h2>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <div className="w-40 h-28 rounded-3xl bg-black shadow-lg shadow-black/20 flex items-center justify-center">
              <span className="text-sm text-lime-400">Preview</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Black Shadow</p>
              <p className="text-xs text-slate-500">shadow-black/20</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-40 h-28 rounded-3xl bg-lime-400 shadow-lg shadow-lime-400/30 flex items-center justify-center">
              <span className="text-sm text-slate-900">Preview</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Lime Shadow</p>
              <p className="text-xs text-slate-500">shadow-lime-400/30</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-40 h-28 rounded-3xl bg-lime-400 shadow-lg shadow-lime-500/20 flex items-center justify-center">
              <span className="text-sm text-slate-900">Active</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Active Item Shadow</p>
              <p className="text-xs text-slate-500">shadow-lime-500/20</p>
            </div>
          </div>
        </div>
      </div>

      {/* Glass Effect */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Glass Morphism Effects</h2>
        <div className="relative p-8 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)' }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white" />
            <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white" />
          </div>

          <div className="relative flex gap-6">
            <div className="w-48 h-32 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center">
              <span className="text-sm text-slate-700 font-medium">Glass Card</span>
            </div>
            <div className="w-48 h-32 rounded-3xl bg-white/50 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <span className="text-sm text-slate-700 font-medium">Light Glass</span>
            </div>
            <div className="w-48 h-32 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center">
              <span className="text-sm text-slate-700 font-medium">Glass Hover</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blur Effects */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Backdrop Blur Levels</h2>
        <div className="relative p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-lime-200 to-emerald-200">
          <div className="flex gap-6">
            <div className="space-y-2">
              <div className="w-32 h-24 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xs text-slate-600">blur-sm</span>
              </div>
              <p className="text-xs text-center text-slate-600">4px</p>
            </div>
            <div className="space-y-2">
              <div className="w-32 h-24 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center">
                <span className="text-xs text-slate-600">blur-md</span>
              </div>
              <p className="text-xs text-center text-slate-600">12px</p>
            </div>
            <div className="space-y-2">
              <div className="w-32 h-24 rounded-2xl bg-white/60 backdrop-blur-xl flex items-center justify-center">
                <span className="text-xs text-slate-600">blur-xl</span>
              </div>
              <p className="text-xs text-center text-slate-600">24px</p>
            </div>
            <div className="space-y-2">
              <div className="w-32 h-24 rounded-2xl bg-white/60 backdrop-blur-2xl flex items-center justify-center">
                <span className="text-xs text-slate-600">blur-2xl</span>
              </div>
              <p className="text-xs text-center text-slate-600">40px</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Reference */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Code Reference</h2>
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono">
          <pre className="text-lime-400">
{`/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 30px rgb(0, 0, 0, 0.04);
  border-radius: 1.5rem;
}

/* Tailwind Classes */
className="bg-white/70 backdrop-blur-xl
           border border-white/40
           shadow-[0_8px_30px_rgb(0,0,0,0.04)]
           rounded-3xl"`}
          </pre>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof DesignTokenShadows> = {
  title: 'Design Tokens/Shadows & Effects',
  component: DesignTokenShadows,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Glass Morphism 기반의 그림자와 블러 효과 시스템입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DesignTokenShadows>

export const Default: Story = {}
