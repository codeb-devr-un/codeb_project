import Link from 'next/link'
import { ArrowRight, CheckCircle2, Layout, Users, BarChart3, Clock, Zap, Shield, Globe } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
            W
          </div>
          <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            WORKB
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">기능</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">요금제</Link>
          <Link href="#about" className="hover:text-white transition-colors">소개</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            로그인
          </Link>
          <Link href="/dashboard" className="group relative px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span className="relative z-10">무료로 시작하기</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center relative">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-md animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              v1.0 정식 출시
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
              협업툴 그룹웨어 ! <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                100% 무료선언!
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              20명 미만 무료사용하세요! <br className="hidden md:block" />
              프로젝트, 근태, 재무까지 하나의 플랫폼에서.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/dashboard" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 flex items-center justify-center gap-2 font-bold text-lg transition-all shadow-lg shadow-purple-500/25 hover:scale-105">
                무료로 시작하기 <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#demo" className="h-14 px-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center font-medium text-lg transition-all backdrop-blur-sm">
                데모 영상 보기
              </Link>
            </div>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="mt-24 max-w-7xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="aspect-[16/9] relative">
                <Image
                  src="/images/dashboard-preview.png"
                  alt="Dashboard Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">모든 업무를 한곳에서</h2>
              <p className="text-gray-400 text-xl">강력한 기능들이 유기적으로 연결되어 있습니다.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Layout className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">프로젝트 관리</h3>
                <p className="text-gray-400 leading-relaxed">
                  칸반 보드, 간트 차트, 마인드맵으로 프로젝트를 시각화하고 효율적으로 관리하세요.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">스마트 HR</h3>
                <p className="text-gray-400 leading-relaxed">
                  출퇴근 기록부터 휴가 관리, 급여 정산까지. 복잡한 인사 관리를 자동화하세요.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">재무 인사이트</h3>
                <p className="text-gray-400 leading-relaxed">
                  실시간 매출/지출 현황과 프로젝트별 손익 분석으로 데이터 기반 의사결정을 지원합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Large Item */}
              <div className="md:col-span-2 row-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">압도적인 성능</h3>
                    <p className="text-gray-400 max-w-md">최신 기술 스택으로 구축되어 빠르고 안정적입니다. 실시간 협업도 문제없습니다.</p>
                  </div>
                  <div className="mt-8 rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-mono text-green-400">System Operational</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tall Item */}
              <div className="row-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">엔터프라이즈 보안</h3>
                  <p className="text-gray-400 mb-8">금융권 수준의 보안으로 귀사의 데이터를 안전하게 보호합니다.</p>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                      <div className="absolute inset-4 border-4 border-purple-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wide Item */}
              <div className="md:col-span-3 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">글로벌 협업</h3>
                  <p className="text-gray-300">전 세계 어디서나 팀원들과 실시간으로 소통하세요.</p>
                </div>
                <div className="relative z-10 flex gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center text-xs">
                        User {i}
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs">
                      +99
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-white/10 to-transparent rounded-[3rem] p-16 border border-white/10 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/20 blur-[100px] -z-10"></div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8">지금 바로 시작하세요</h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-12">
              30일 무료 체험으로 WORKB의 모든 기능을 경험해보세요. <br />
              카드 등록 없이 1분 만에 시작할 수 있습니다.
            </p>

            <Link href="/dashboard" className="inline-flex h-16 px-10 rounded-2xl bg-white text-black hover:bg-gray-100 items-center justify-center font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              무료로 시작하기
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="font-bold text-lg text-gray-400">WORKB</span>
          </div>
          <div className="text-sm text-gray-600">
            © 2024 CodeB Platform. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">이용약관</Link>
            <Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="#" className="hover:text-white transition-colors">문의하기</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
