// CodeB Platform Design System
// 통합 스타일 가이드 및 디자인 토큰

import {
  // Layout & Navigation
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  FileText,
  MessageSquare,
  MessagesSquare,
  Bot,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  User,
  Settings,
  FileCode,

  // Status & Progress
  BarChart3,
  Activity,
  Star,

  // Business
  Target,
  Building2,

  // Actions
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Send,

  // Views
  LayoutGrid,
  LayoutList,
  Calendar,
  Kanban,

  // Auth
  LogOut,
  LogIn,
  UserPlus,

  // Notifications
  Bell,
  BellRing,

  // Media
  Image,
  Video,
  Mic,
  Camera,

  // Others
  Moon,
  Sun,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Share2,
  Heart,
  ThumbsUp,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  MoreHorizontal,

  // Additional Icons
  UserCog,
  BookOpen,
  FileSignature,
  HeadphonesIcon,
  Briefcase,
  CalendarDays,
  VideoIcon,
  GanttChart,
  History,
  CalendarCheck,
  Palmtree,
  CreditCard,
  ClipboardList,
} from 'lucide-react'

// 아이콘 매핑
export const icons = {
  // Navigation Icons
  dashboard: LayoutDashboard,
  projects: FolderOpen,
  tasks: CheckSquare,
  files: FileText,
  chat: MessageSquare,
  multiChat: MessagesSquare,
  ai: Bot,
  automation: Zap,
  analytics: TrendingUp,
  finance: DollarSign,

  // Management Icons
  marketing: Target,
  clients: Building2,
  operators: UserCog,
  users: Users,
  settings: Settings,
  logs: FileCode,

  // Customer Icons
  status: BarChart3,
  support: HeadphonesIcon,
  review: Star,

  // Action Icons
  add: Plus,
  plus: Plus,
  search: Search,
  filter: Filter,
  edit: Edit,
  delete: Trash2,
  save: Save,
  download: Download,
  upload: Upload,
  send: Send,
  close: X,
  check: Check,

  // Navigation Controls
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  expand: ChevronDown,
  collapse: ChevronRight,

  // View Icons
  grid: LayoutGrid,
  list: LayoutList,
  calendar: CalendarDays,
  kanban: Kanban,
  gantt: GanttChart,

  // Auth Icons
  logout: LogOut,
  login: LogIn,
  register: UserPlus,

  // Notification Icons
  notification: Bell,
  notificationActive: BellRing,

  // Status Icons
  info: Info,
  warning: AlertCircle,
  help: HelpCircle,
  external: ExternalLink,

  // Common Icons
  more: MoreVertical,
  moreHorizontal: MoreHorizontal,
  loading: Loader2,
  moon: Moon,
  sun: Sun,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  location: MapPin,
  time: Clock,
  copy: Copy,
  share: Share2,
  like: ThumbsUp,
  favorite: Heart,
  view: Eye,
  hide: EyeOff,

  // Additional Icons
  book: BookOpen,
  file: FileSignature,
  history: History,
  video: VideoIcon,
  briefcase: Briefcase,
  attendance: CalendarCheck,
  vacation: Palmtree,
  card: CreditCard,
  board: ClipboardList,
}

// ===========================================
// Glass Morphism Design System
// ===========================================

// 색상 팔레트
export const colors = {
  // Primary Colors - Lime/Black Theme
  primary: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635', // Main accent (lime-400)
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
    950: '#1a2e05',
  },

  // Brand Colors
  brand: {
    black: '#000000',      // Primary background
    lime: '#a3e635',       // Primary accent (lime-400)
    limeLight: '#bef264',  // Hover state (lime-300)
    limeDark: '#84cc16',   // Active state (lime-500)
  },

  // Neutral Colors - Slate palette for Glass
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Legacy Gray (for backwards compatibility)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic Colors
  success: {
    light: '#86efac',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
  },
  warning: {
    light: '#fde047',
    DEFAULT: '#eab308',
    dark: '#ca8a04',
  },
  error: {
    light: '#fca5a5',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#a5b4fc',
    DEFAULT: '#6366f1',
    dark: '#4f46e5',
  },

  // Glass Colors (transparency levels)
  glass: {
    white: {
      5: 'rgba(255, 255, 255, 0.05)',
      10: 'rgba(255, 255, 255, 0.1)',
      20: 'rgba(255, 255, 255, 0.2)',
      30: 'rgba(255, 255, 255, 0.3)',
      40: 'rgba(255, 255, 255, 0.4)',
      50: 'rgba(255, 255, 255, 0.5)',
      60: 'rgba(255, 255, 255, 0.6)',
      70: 'rgba(255, 255, 255, 0.7)',
      80: 'rgba(255, 255, 255, 0.8)',
    },
    black: {
      5: 'rgba(0, 0, 0, 0.05)',
      10: 'rgba(0, 0, 0, 0.1)',
      20: 'rgba(0, 0, 0, 0.2)',
    },
    lime: {
      20: 'rgba(163, 230, 53, 0.2)',
      40: 'rgba(163, 230, 53, 0.4)',
    },
  },

  // Background Colors
  background: {
    page: '#F8F9FA',       // Main page background
    card: 'rgba(255, 255, 255, 0.7)',
    header: 'rgba(255, 255, 255, 0.5)',
    sidebar: 'rgba(255, 255, 255, 0.8)',
    input: 'rgba(255, 255, 255, 0.6)',
  },
}

// 상태별 색상 매핑 (Glass Style)
export const statusColors = {
  // Project Status - Glass Style
  planning: {
    bg: 'bg-slate-100/80',
    text: 'text-slate-700',
    border: 'border-slate-200/60',
    glass: 'bg-slate-100/60 backdrop-blur-sm',
  },
  design: {
    bg: 'bg-violet-100/80',
    text: 'text-violet-700',
    border: 'border-violet-200/60',
    glass: 'bg-violet-100/60 backdrop-blur-sm',
  },
  development: {
    bg: 'bg-amber-100/80',
    text: 'text-amber-700',
    border: 'border-amber-200/60',
    glass: 'bg-amber-100/60 backdrop-blur-sm',
  },
  testing: {
    bg: 'bg-purple-100/80',
    text: 'text-purple-700',
    border: 'border-purple-200/60',
    glass: 'bg-purple-100/60 backdrop-blur-sm',
  },
  completed: {
    bg: 'bg-lime-100/80',
    text: 'text-lime-700',
    border: 'border-lime-200/60',
    glass: 'bg-lime-100/60 backdrop-blur-sm',
  },
  inProgress: {
    bg: 'bg-sky-100/80',
    text: 'text-sky-700',
    border: 'border-sky-200/60',
    glass: 'bg-sky-100/60 backdrop-blur-sm',
  },

  // Task Priority - Glass Style
  low: {
    bg: 'bg-slate-100/80',
    text: 'text-slate-600',
    border: 'border-slate-200/60',
    glass: 'bg-slate-100/60 backdrop-blur-sm',
  },
  medium: {
    bg: 'bg-sky-100/80',
    text: 'text-sky-700',
    border: 'border-sky-200/60',
    glass: 'bg-sky-100/60 backdrop-blur-sm',
  },
  high: {
    bg: 'bg-orange-100/80',
    text: 'text-orange-700',
    border: 'border-orange-200/60',
    glass: 'bg-orange-100/60 backdrop-blur-sm',
  },
  urgent: {
    bg: 'bg-red-100/80',
    text: 'text-red-700',
    border: 'border-red-200/60',
    glass: 'bg-red-100/60 backdrop-blur-sm',
  },
}

// 타이포그래피
export const typography = {
  // Headings
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-semibold tracking-tight',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium',

  // Body
  body: 'text-base',
  bodySmall: 'text-sm',
  bodyLarge: 'text-lg',

  // Utils
  caption: 'text-xs text-muted-foreground',
  overline: 'text-xs uppercase tracking-wider text-muted-foreground',
}

// ===========================================
// Glass Morphism Component Styles
// ===========================================

export const componentStyles = {
  // Glass Cards
  card: {
    base: 'rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5',
    hover: 'hover:shadow-xl hover:bg-white/80 transition-all duration-300 cursor-pointer',
    widget: 'rounded-3xl bg-white/50 backdrop-blur-md border border-white/40 p-6',
    accent: 'rounded-3xl bg-black text-lime-400 p-6 shadow-lg shadow-black/20',
    glass: 'rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40',
  },

  // Glass Buttons - Lime/Black Theme
  button: {
    // Primary variants
    limePrimary: 'bg-black text-lime-400 hover:bg-slate-900 hover:text-lime-300 shadow-lg shadow-black/20 rounded-xl font-bold',
    limeSecondary: 'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/20 rounded-xl font-bold',

    // Glass variants
    glass: 'bg-white/50 backdrop-blur-xl border border-white/40 text-slate-700 hover:bg-white/80 rounded-xl',
    ghost: 'text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-xl',
    outline: 'bg-white/50 border border-white/40 text-slate-600 hover:bg-white rounded-xl',

    // Dock icon button
    icon: 'bg-white text-slate-400 hover:bg-lime-400 hover:text-black shadow-lg hover:scale-110 rounded-2xl transition-all duration-300',
    iconActive: 'bg-black text-lime-400 shadow-lg shadow-lime-500/20 scale-110 rounded-2xl',

    // Sizes
    sizes: {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6',
      xl: 'h-11 px-8',
      icon: 'h-12 w-12',
    },
  },

  // Glass Inputs
  input: {
    base: 'flex h-10 w-full rounded-2xl border bg-white/60 border-white/40 px-4 py-2 text-sm shadow-sm backdrop-blur-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400 disabled:cursor-not-allowed disabled:opacity-50',
    search: 'pl-10 h-9 bg-white/60 border-white/40 rounded-xl focus:ring-lime-500/50',
    error: 'border-red-300 focus:ring-red-400/20 focus:border-red-400',
    success: 'border-lime-300 focus:ring-lime-400/20 focus:border-lime-400',
  },

  // Glass Badges
  badge: {
    base: 'inline-flex items-center rounded-full font-medium backdrop-blur-sm',
    variants: {
      default: 'bg-slate-100/80 text-slate-700',
      lime: 'bg-lime-400 text-black font-bold',
      success: 'bg-emerald-100/80 text-emerald-700',
      warning: 'bg-amber-100/80 text-amber-700',
      error: 'bg-red-100/80 text-red-700',
      info: 'bg-sky-100/80 text-sky-700',
      glass: 'bg-white/60 text-slate-700 border border-white/40',
    },
    sizes: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-sm',
    },
  },

  // Avatar styles
  avatar: {
    base: 'rounded-xl border-2 border-white shadow-sm overflow-hidden',
    branded: 'bg-black text-lime-400 font-bold',
    sizes: {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-9 w-9 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    },
  },

  // Progress styles
  progress: {
    track: 'h-2 w-full bg-slate-100 rounded-full overflow-hidden',
    bar: 'h-full bg-lime-400 rounded-full transition-all duration-500',
    circular: {
      track: 'stroke-slate-200',
      bar: 'stroke-lime-400',
    },
  },

  // Legacy support
  buttonSizes: {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4',
    lg: 'h-10 px-6',
    xl: 'h-11 px-8',
  },
  badgeSizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  },
}

// ===========================================
// Glass Morphism Animations
// ===========================================

export const animations = {
  // Transitions
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  slower: 'transition-all duration-500',

  // Glass specific transitions
  glass: 'transition-all duration-300 ease-out',
  glassHover: 'hover:shadow-xl hover:bg-white/80 transition-all duration-300',

  // Hover Effects
  hoverScale: 'hover:scale-105',
  hoverScaleLarge: 'hover:scale-110',
  hoverOpacity: 'hover:opacity-80',
  hoverLift: 'hover:-translate-y-1',
  hoverLiftLarge: 'hover:-translate-y-2',

  // Dock animations
  dockItem: 'transition-all duration-300 ease-out origin-bottom',
  dockHover: 'hover:-translate-y-2 hover:scale-110',
  dockActive: '-translate-y-2 scale-110',

  // Loading
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
}

// ===========================================
// Glass Morphism Layout System
// ===========================================

export const layout = {
  // Page backgrounds
  page: {
    base: 'min-h-screen bg-[#F8F9FA]',
    withAmbient: 'min-h-screen bg-[#F8F9FA] relative overflow-hidden',
  },

  // Ambient background blobs
  ambient: {
    topLeft: 'absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 rounded-full blur-[100px] pointer-events-none',
    bottomRight: 'absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none',
    centerGlow: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lime-100/30 rounded-full blur-[150px] pointer-events-none',
  },

  // Glass Header
  header: {
    base: 'flex h-16 shrink-0 items-center gap-2 bg-white/50 backdrop-blur-md border-b border-white/40 sticky top-0 z-10',
    content: 'flex items-center gap-2 px-4 w-full',
  },

  // Glass Sidebar
  sidebar: {
    base: 'w-[280px] border-r border-slate-100 bg-white/80 backdrop-blur-2xl flex flex-col shrink-0',
    collapsed: 'w-16',
    header: 'pb-4 pt-4 px-4',
    content: 'flex-1 overflow-auto px-2',
    footer: 'p-3',
  },

  // Glass Dock
  dock: {
    container: 'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
    content: 'flex items-end gap-3 px-4 py-3 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl shadow-black/5',
    separator: 'w-[1px] h-8 bg-slate-300/50 mx-1 self-center',
  },

  // Content area
  content: {
    base: 'flex-1 flex flex-col gap-6 p-4 md:p-8 pt-6 relative z-0',
    withDock: 'pb-24',
    maxWidth: 'max-w-7xl mx-auto w-full',
  },

  // Container
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',

  // Spacing
  section: 'py-8 sm:py-12',
  sectionLarge: 'py-12 sm:py-16 lg:py-20',

  // Grid
  grid: 'grid gap-4 sm:gap-6',
  gridCols: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
}

// ===========================================
// Glass Morphism Shadows
// ===========================================

export const shadows = {
  // Standard shadows
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none',

  // Glass shadows (with transparency)
  glass: {
    sm: 'shadow-sm shadow-black/5',
    md: 'shadow-md shadow-black/5',
    lg: 'shadow-lg shadow-black/5',
    xl: 'shadow-xl shadow-black/5',
    '2xl': 'shadow-2xl shadow-black/5',
  },

  // Colored shadows
  lime: {
    sm: 'shadow-sm shadow-lime-400/20',
    md: 'shadow-md shadow-lime-400/20',
    lg: 'shadow-lg shadow-lime-400/20',
    xl: 'shadow-xl shadow-lime-400/30',
  },
  black: {
    sm: 'shadow-sm shadow-black/10',
    md: 'shadow-md shadow-black/10',
    lg: 'shadow-lg shadow-black/20',
    xl: 'shadow-xl shadow-black/20',
  },
}

// ===========================================
// Glass Morphism Backdrop Blur
// ===========================================

export const blur = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl',
}

// ===========================================
// Border Radius
// ===========================================

export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',

  // Glass specific
  glass: {
    card: 'rounded-3xl',
    button: 'rounded-xl',
    input: 'rounded-2xl',
    badge: 'rounded-full',
    dock: 'rounded-[2rem]',
    avatar: 'rounded-xl',
  },
}

// ===========================================
// Navigation Styles
// ===========================================

export const navigation = {
  // Sidebar nav item
  sidebarItem: {
    base: 'w-full flex items-center gap-3 h-11 px-3 rounded-2xl transition-all duration-300 font-medium',
    active: 'bg-lime-400 text-slate-900 shadow-lg shadow-lime-400/20 font-bold',
    inactive: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
  },

  // Sub nav item
  subItem: {
    base: 'w-full h-9 px-3 rounded-lg text-left text-sm transition-all duration-200',
    active: 'text-slate-900 font-bold bg-slate-100',
    inactive: 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
  },

  // Dock nav item
  dockItem: {
    base: 'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300',
    active: 'bg-black text-lime-400 scale-110 shadow-lime-500/20 -translate-y-2',
    inactive: 'bg-white text-slate-400 hover:bg-lime-400 hover:text-black hover:scale-110 hover:shadow-lime-400/30',
  },

  // Active indicator (dot)
  activeIndicator: 'absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black',
}

// ===========================================
// Export combined glass styles for easy import
// ===========================================

export const glass = {
  card: componentStyles.card,
  button: componentStyles.button,
  input: componentStyles.input,
  badge: componentStyles.badge,
  avatar: componentStyles.avatar,
  progress: componentStyles.progress,
  layout,
  shadows,
  blur,
  borderRadius,
  navigation,
  animations,
}