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
}

// 색상 팔레트
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Neutral Colors
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
}

// 상태별 색상 매핑
export const statusColors = {
  // Project Status
  planning: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  design: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  development: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  testing: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  
  // Task Priority
  low: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  medium: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  urgent: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
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

// 컴포넌트 스타일
export const componentStyles = {
  // Cards
  card: 'rounded-lg border bg-card shadow-sm',
  cardHover: 'hover:shadow-lg transition-shadow cursor-pointer',
  
  // Buttons
  buttonSizes: {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4',
    lg: 'h-10 px-6',
    xl: 'h-11 px-8',
  },
  
  // Inputs
  input: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  
  // Badges
  badgeSizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  },
}

// 애니메이션
export const animations = {
  // Transitions
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  
  // Hover Effects
  hoverScale: 'hover:scale-105',
  hoverOpacity: 'hover:opacity-80',
  
  // Loading
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
}

// 레이아웃
export const layout = {
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

// 그림자
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
}

// 테두리 반경
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}