import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Cake, PartyPopper } from 'lucide-react'
import { format } from 'date-fns'

// Extended user type for auth context
interface ExtendedUser {
    id?: string
    uid?: string
    email?: string | null
    name?: string | null
    displayName?: string | null
    image?: string | null
}

interface BirthdayBannerProps {
    userProfile: ExtendedUser | null
}

export function BirthdayBanner({ userProfile }: BirthdayBannerProps) {
    // 🎂 생일 체크 - 테스트를 위해 오늘이 생일인 것처럼 설정
    const isBirthday = useMemo(() => {
        // TODO: 실제 배포시에는 userProfile?.birthday와 오늘 날짜의 월/일 비교로 변경
        // const userBirthday = userProfile?.birthday // 예: '1990-11-30' 또는 Date 객체
        // if (!userBirthday) return false
        // const today = new Date()
        // const birthDate = new Date(userBirthday)
        // return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()

        // 🧪 테스트 모드: 항상 생일로 표시
        return true
    }, [])

    // 🎆 전체 화면 폭죽 애니메이션 상태 (로그인 시 1회만)
    const [showFireworks, setShowFireworks] = useState(false)

    // 🎂 생일 배너 표시 상태 (X 버튼으로 닫으면 오늘 안 보임)
    const [showBirthdayBanner, setShowBirthdayBanner] = useState(true)

    // 폭죽 애니메이션 표시 여부 체크 (오늘 날짜 + 사용자 ID로 localStorage 키 생성)
    const userId = userProfile?.uid || userProfile?.id
    useEffect(() => {
        if (!isBirthday || !userId) return

        const today = format(new Date(), 'yyyy-MM-dd')
        const fireworksKey = `birthday_fireworks_${userId}_${today}`
        const hasSeenFireworks = localStorage.getItem(fireworksKey)

        if (!hasSeenFireworks) {
            // 첫 로그인: 폭죽 애니메이션 표시
            setShowFireworks(true)
            localStorage.setItem(fireworksKey, 'true')

            // 5초 후 폭죽 애니메이션 종료
            const timer = setTimeout(() => {
                setShowFireworks(false)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [isBirthday, userId])

    // 생일 배너 표시 여부 체크 (localStorage에서 오늘 닫은 기록 확인)
    useEffect(() => {
        if (!isBirthday || !userId) return

        const today = format(new Date(), 'yyyy-MM-dd')
        const bannerKey = `birthday_banner_dismissed_${userId}_${today}`
        const hasDismissedBanner = localStorage.getItem(bannerKey)

        if (hasDismissedBanner) {
            setShowBirthdayBanner(false)
        }
    }, [isBirthday, userId])

    // 생일 배너 닫기 핸들러
    const handleDismissBirthdayBanner = useCallback(() => {
        if (!userId) return

        const today = format(new Date(), 'yyyy-MM-dd')
        const bannerKey = `birthday_banner_dismissed_${userId}_${today}`
        localStorage.setItem(bannerKey, 'true')
        setShowBirthdayBanner(false)
    }, [userId])

    if (!isBirthday) return null

    return (
        <>
            {/* 🎆 전체 화면 폭죽 애니메이션 - 로그인 시 1회만 */}
            {showFireworks && (
                <div className="fixed inset-0 z-[9999] overflow-hidden">
                    {/* X 버튼 - 오늘 하루 안보기 */}
                    <button
                        onClick={() => setShowFireworks(false)}
                        className="absolute top-6 right-6 z-[10000] p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full border border-white/30 transition-all duration-200 hover:scale-110 group pointer-events-auto"
                        title="닫기"
                    >
                        <X className="h-6 w-6 text-white group-hover:text-white drop-shadow-lg" />
                    </button>

                    {/* 배경 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-pink-900/30 animate-pulse pointer-events-none" />

                    {/* 폭죽 파티클들 */}
                    {[...Array(50)].map((_, i) => {
                        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fff', '#fff'];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        const startX = Math.random() * 100;
                        const startY = Math.random() * 100;
                        const size = 8 + Math.random() * 16;
                        const duration = 2 + Math.random() * 3;
                        const delay = Math.random() * 2;

                        return (
                            <div
                                key={i}
                                className="absolute rounded-full animate-ping"
                                style={{
                                    left: `${startX}%`,
                                    top: `${startY}%`,
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    backgroundColor: randomColor,
                                    boxShadow: `0 0 ${size * 2}px ${randomColor}, 0 0 ${size * 4}px ${randomColor}`,
                                    animationDuration: `${duration}s`,
                                    animationDelay: `${delay}s`,
                                    opacity: 0.8,
                                }}
                            />
                        );
                    })}

                    {/* 큰 폭죽 효과 */}
                    {[...Array(8)].map((_, i) => {
                        const centerX = 10 + (i % 4) * 25;
                        const centerY = 20 + Math.floor(i / 4) * 40;

                        return (
                            <div
                                key={`burst-${i}`}
                                className="absolute"
                                style={{
                                    left: `${centerX}%`,
                                    top: `${centerY}%`,
                                    animationDelay: `${i * 0.3}s`,
                                }}
                            >
                                {/* 폭죽 버스트 */}
                                {[...Array(12)].map((_, j) => {
                                    const angle = (j / 12) * 360;
                                    const distance = 60 + Math.random() * 40;
                                    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#7FFF00'];
                                    const color = colors[j % colors.length];

                                    return (
                                        <div
                                            key={j}
                                            className="absolute w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
                                                transform: `rotate(${angle}deg) translateY(-${distance}px)`,
                                                animation: `firework-burst 1.5s ease-out ${i * 0.3}s forwards`,
                                                opacity: 0,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* 떨어지는 컨페티 */}
                    {[...Array(30)].map((_, i) => {
                        const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🎂', '🥳', '🎀'];
                        const emoji = emojis[i % emojis.length];
                        const startX = Math.random() * 100;
                        const duration = 3 + Math.random() * 2;
                        const delay = Math.random() * 3;
                        const size = 1.5 + Math.random() * 1.5;

                        return (
                            <div
                                key={`confetti-${i}`}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${startX}%`,
                                    top: '-5%',
                                    fontSize: `${size}rem`,
                                    animation: `confetti-fall ${duration}s linear ${delay}s infinite`,
                                    opacity: 0.9,
                                }}
                            >
                                {emoji}
                            </div>
                        );
                    })}

                    {/* 중앙 축하 메시지 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center animate-bounce" style={{ animationDuration: '2s' }}>
                            <div className="text-8xl mb-4">🎂</div>
                            <h1 className="text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-pulse">
                                🎉 Happy Birthday! 🎉
                            </h1>
                            <p className="text-2xl text-white/90 mt-4 drop-shadow-lg">
                                {userProfile?.displayName || userProfile?.name}님, 생일 축하합니다!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS 애니메이션 스타일 */}
            <style jsx>{`
        @keyframes firework-burst {
          0% {
            opacity: 1;
            transform: rotate(var(--angle)) translateY(0);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--angle)) translateY(-100px);
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>

            {/* 🎂 생일 축하 배너 */}
            {showBirthdayBanner && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white shadow-2xl shadow-purple-500/30 animate-in fade-in slide-in-from-top-4 duration-700">
                    {/* X 버튼 - 오늘 하루 안보기 */}
                    <button
                        onClick={handleDismissBirthdayBanner}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full border border-white/30 transition-all duration-200 hover:scale-110 group"
                        title="오늘 하루 안 보기"
                    >
                        <X className="h-5 w-5 text-white group-hover:text-white drop-shadow" />
                    </button>

                    {/* 배경 장식 */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-yellow-300/20 rounded-full blur-3xl animate-pulse delay-150"></div>
                        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-pink-300/20 rounded-full blur-2xl animate-bounce"></div>
                    </div>

                    {/* 컨페티 효과 */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random()}s`
                                }}
                            >
                                <span className="text-2xl opacity-60">
                                    {['🎊', '✨', '🎈', '🌟', '💫', '🎁'][i % 6]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 flex items-center justify-between gap-4 pr-10">
                        <div className="flex items-center gap-4">
                            {/* 케이크 아이콘 */}
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                                    <Cake className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                                    <PartyPopper className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                            </div>

                            {/* 생일 메시지 */}
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold tracking-tight drop-shadow-lg flex items-center gap-2">
                                    🎉 생일 축하합니다! 🎉
                                </h2>
                                <p className="text-white/90 text-lg font-medium drop-shadow">
                                    당신이 태어나서 우주가 축하하고 있어요 ✨
                                </p>
                            </div>
                        </div>

                        {/* 축하 아이콘들 */}
                        <div className="hidden md:flex items-center gap-2 text-4xl">
                            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎂</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎈</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎁</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
