import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const ColorPalette = ({ colors, title }: { colors: { name: string; value: string; textColor?: string }[]; title: string }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {colors.map((color) => (
        <div key={color.name} className="space-y-2">
          <div
            className="w-full h-20 rounded-2xl shadow-md border border-white/20"
            style={{ backgroundColor: color.value }}
          />
          <div>
            <p className="font-semibold text-sm text-slate-900">{color.name}</p>
            <p className="text-xs text-slate-500 font-mono">{color.value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const DesignTokenColors = () => {
  const primaryColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Slate 900', value: '#0f172a' },
    { name: 'Slate 800', value: '#1e293b' },
    { name: 'Slate 700', value: '#334155' },
  ]

  const limeColors = [
    { name: 'Lime 300', value: '#bef264' },
    { name: 'Lime 400', value: '#a3e635' },
    { name: 'Lime 500', value: '#84cc16' },
    { name: 'Lime 600', value: '#65a30d' },
  ]

  const slateColors = [
    { name: 'Slate 50', value: '#f8fafc' },
    { name: 'Slate 100', value: '#f1f5f9' },
    { name: 'Slate 200', value: '#e2e8f0' },
    { name: 'Slate 300', value: '#cbd5e1' },
    { name: 'Slate 400', value: '#94a3b8' },
    { name: 'Slate 500', value: '#64748b' },
  ]

  const semanticColors = [
    { name: 'Success', value: '#10b981' },
    { name: 'Warning', value: '#f59e0b' },
    { name: 'Error', value: '#ef4444' },
    { name: 'Info', value: '#3b82f6' },
  ]

  const glassColors = [
    { name: 'Glass BG', value: 'rgba(255, 255, 255, 0.7)' },
    { name: 'Glass Border', value: 'rgba(255, 255, 255, 0.4)' },
    { name: 'Glass BG Hover', value: 'rgba(255, 255, 255, 0.9)' },
    { name: 'Background', value: '#F8F9FA' },
  ]

  return (
    <div className="p-8 space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Color System</h1>
        <p className="text-slate-500">new_page 디자인 시스템 컬러 팔레트</p>
      </div>

      <ColorPalette title="Primary (Black)" colors={primaryColors} />
      <ColorPalette title="Accent (Lime)" colors={limeColors} />
      <ColorPalette title="Neutral (Slate)" colors={slateColors} />
      <ColorPalette title="Semantic" colors={semanticColors} />
      <ColorPalette title="Glass Morphism" colors={glassColors} />

      {/* Usage Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Usage Example</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-6 py-3 rounded-xl bg-black text-lime-400 font-bold shadow-lg shadow-black/20 hover:bg-slate-900 hover:text-lime-300 transition-all">
            Primary Button
          </button>
          <button className="px-6 py-3 rounded-xl bg-lime-400 text-slate-900 font-bold shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition-all">
            Lime Button
          </button>
          <button className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 text-slate-700 font-medium hover:bg-white transition-all">
            Glass Button
          </button>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof DesignTokenColors> = {
  title: 'Design Tokens/Colors',
  component: DesignTokenColors,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Figma Make에서 생성된 new_page 디자인 시스템의 컬러 팔레트입니다.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DesignTokenColors>

export const Default: Story = {}
