// =============================================================================
// Sample Data - CVE-CB-005 Fixed: Development-only Logging
// =============================================================================

import { prisma } from '@/lib/prisma'

const isDev = process.env.NODE_ENV === 'development'
const devLog = (message: string) => isDev && console.log(`[DEV] ${message}`)

// 샘플 데이터 생성 헬퍼 함수
export async function createSampleData(workspaceId: string, adminUserId: string) {
    devLog(`Creating sample data for workspace: ${workspaceId}`)

    // 1. 5개 팀 생성
    const teams = [
        { name: '기획팀', color: '#3B82F6', order: 0 },
        { name: '개발팀', color: '#10B981', order: 1 },
        { name: '디자인팀', color: '#8B5CF6', order: 2 },
        { name: '운영팀', color: '#F59E0B', order: 3 },
        { name: '마케팅팀', color: '#EF4444', order: 4 },
    ]

    const createdTeams = await Promise.all(
        teams.map(team =>
            prisma.team.create({
                data: {
                    workspaceId,
                    name: team.name,
                    color: team.color,
                    order: team.order,
                },
            })
        )
    )
    devLog(`Teams created: ${createdTeams.length}`)

    // 2. 각 팀별 1명씩 샘플 직원 생성 (총 5명)
    // 워크스페이스 ID를 이메일에 포함하여 고유성 보장
    const workspacePrefix = workspaceId.slice(0, 8)
    const sampleMembers = [
        { name: '김기획', email: `kim.planning-${workspacePrefix}@example.com`, department: '기획팀', role: 'member' as const },
        { name: '강개발', email: `kang.dev-${workspacePrefix}@example.com`, department: '개발팀', role: 'member' as const },
        { name: '한디자인', email: `han.design-${workspacePrefix}@example.com`, department: '디자인팀', role: 'member' as const },
        { name: '유운영', email: `yoo.ops-${workspacePrefix}@example.com`, department: '운영팀', role: 'member' as const },
        { name: '양마케팅', email: `yang.marketing-${workspacePrefix}@example.com`, department: '마케팅팀', role: 'member' as const },
    ]

    const createdUsers = await Promise.all(
        sampleMembers.map(member =>
            prisma.user.upsert({
                where: { email: member.email },
                update: {},
                create: {
                    email: member.email,
                    name: member.name,
                    department: member.department,
                    role: member.role,
                },
            })
        )
    )
    devLog(`Sample users created: ${createdUsers.length}`)

    // 3. 워크스페이스 멤버로 추가
    await Promise.all(
        createdUsers.map(user =>
            prisma.workspaceMember.create({
                data: {
                    workspaceId,
                    userId: user.id,
                    role: 'member',
                },
            })
        )
    )

    // 4. 각 팀에 멤버 배정 (각 팀당 1명씩)
    await Promise.all(
        createdTeams.map((team, index) =>
            prisma.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: createdUsers[index].id,
                    role: '팀원',
                },
            })
        )
    )
    devLog('Team members assigned')

    // 현재 날짜 기준 설정
    const now = new Date()
    const addDays = (date: Date, days: number) => {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
    }

    // 5. 샘플 프로젝트 생성
    const project = await prisma.project.create({
        data: {
            workspaceId,
            name: '웹페이지 제작',
            description: '새로운 웹페이지를 기획하고 개발하여 런칭하는 프로젝트입니다.',
            status: 'development',
            priority: 'high',
            visibility: 'private',
            progress: 15,
            startDate: now,
            endDate: addDays(now, 90), // 3달 후
            budget: 50000000,
            createdBy: adminUserId,
            tags: ['웹개발', '리뉴얼', '반응형'],
        },
    })
    devLog(`Sample project created: ${project.id}`)

    // 6. 프로젝트에 모든 샘플 사용자 추가
    await Promise.all(
        createdUsers.map((user, index) => {
            const roles = ['PM', '개발자', '디자이너', '운영자', '마케터']
            return prisma.projectMember.create({
                data: {
                    projectId: project.id,
                    userId: user.id,
                    role: roles[index],
                },
            })
        })
    )

    // Admin도 프로젝트 멤버로 추가
    await prisma.projectMember.create({
        data: {
            projectId: project.id,
            userId: adminUserId,
            role: 'Admin',
        },
    })

    // 7. 간트 차트용 태스크 생성 (의존성 포함)
    // 날짜를 오늘 기준으로 동적 생성
    const ganttTasks = [
        {
            title: '프로젝트 킥오프',
            description: '프로젝트 목표 및 일정 공유',
            status: 'done' as const,
            priority: 'high' as const,
            startDate: now,
            dueDate: addDays(now, 2),
            assigneeId: createdUsers[0].id, // 김기획
            progress: 100,
            dependencies: [],
        },
        {
            title: '요구사항 분석',
            description: '고객 요구사항 및 기능 명세서 작성',
            status: 'in_progress' as const,
            priority: 'high' as const,
            startDate: addDays(now, 3),
            dueDate: addDays(now, 7),
            assigneeId: createdUsers[0].id, // 김기획
            progress: 60,
            dependencies: [],
        },
        {
            title: 'UI/UX 디자인',
            description: '와이어프레임 및 디자인 시스템 구축',
            status: 'todo' as const,
            priority: 'high' as const,
            startDate: addDays(now, 8),
            dueDate: addDays(now, 20),
            assigneeId: createdUsers[2].id, // 한디자인
            progress: 0,
            dependencies: [],
        },
        {
            title: '퍼블리싱',
            description: 'HTML/CSS 마크업 작업',
            status: 'todo' as const,
            priority: 'medium' as const,
            startDate: addDays(now, 21),
            dueDate: addDays(now, 30),
            assigneeId: createdUsers[1].id, // 강개발
            progress: 0,
            dependencies: [],
        },
        {
            title: '프론트엔드 개발',
            description: '기능 구현 및 API 연동',
            status: 'todo' as const,
            priority: 'high' as const,
            startDate: addDays(now, 31),
            dueDate: addDays(now, 50),
            assigneeId: createdUsers[1].id, // 강개발
            progress: 0,
            dependencies: [],
        },
        {
            title: 'QA 및 테스트',
            description: '버그 수정 및 품질 검수',
            status: 'todo' as const,
            priority: 'medium' as const,
            startDate: addDays(now, 51),
            dueDate: addDays(now, 60),
            assigneeId: createdUsers[3].id, // 유운영
            progress: 0,
            dependencies: [],
        },
        {
            title: '배포 및 런칭',
            description: '실서버 배포 및 모니터링',
            status: 'todo' as const,
            priority: 'urgent' as const,
            startDate: addDays(now, 61),
            dueDate: addDays(now, 65),
            assigneeId: createdUsers[1].id, // 강개발
            progress: 0,
            dependencies: [],
        },
    ]

    const createdGanttTasks = []
    for (const taskData of ganttTasks) {
        const task = await prisma.task.create({
            data: {
                projectId: project.id,
                title: taskData.title,
                description: taskData.description,
                status: taskData.status,
                priority: taskData.priority,
                startDate: taskData.startDate,
                dueDate: taskData.dueDate,
                assigneeId: taskData.assigneeId,
                createdBy: adminUserId,
                progress: taskData.progress,
                dependencies: taskData.dependencies,
            },
        })
        createdGanttTasks.push(task)
    }

    // 의존성 설정 (단순화: 이전 태스크에 의존)
    for (let i = 1; i < createdGanttTasks.length; i++) {
        await prisma.task.update({
            where: { id: createdGanttTasks[i].id },
            data: {
                dependencies: [createdGanttTasks[i - 1].id],
            },
        })
    }
    devLog(`Gantt tasks created: ${createdGanttTasks.length}`)

    // 8. 칸반 보드용 태스크 생성 (총 10개)
    const kanbanTasks = [
        // Backlog (2)
        { title: '반응형 모바일 검토', status: 'backlog' as const, priority: 'low' as const, assigneeId: createdUsers[0].id },
        { title: 'SEO 키워드 분석', status: 'backlog' as const, priority: 'low' as const, assigneeId: createdUsers[4].id },
        // To Do (3)
        { title: '메인 비주얼 시안 제작', status: 'todo' as const, priority: 'high' as const, assigneeId: createdUsers[2].id },
        { title: '공통 컴포넌트 개발', status: 'todo' as const, priority: 'high' as const, assigneeId: createdUsers[1].id },
        { title: 'API 명세서 작성', status: 'todo' as const, priority: 'medium' as const, assigneeId: createdUsers[1].id },
        // In Progress (3)
        { title: '로그인 페이지 퍼블리싱', status: 'in_progress' as const, priority: 'medium' as const, assigneeId: createdUsers[1].id },
        { title: '아이콘 리소스 정리', status: 'in_progress' as const, priority: 'low' as const, assigneeId: createdUsers[2].id },
        { title: '경쟁사 벤치마킹', status: 'in_progress' as const, priority: 'medium' as const, assigneeId: createdUsers[0].id },
        // Done (2)
        { title: '개발 환경 셋팅', status: 'done' as const, priority: 'high' as const, assigneeId: createdUsers[1].id },
        { title: '기획안 리뷰', status: 'done' as const, priority: 'high' as const, assigneeId: createdUsers[0].id },
    ]

    await Promise.all(
        kanbanTasks.map((taskData, index) =>
            prisma.task.create({
                data: {
                    projectId: project.id,
                    title: taskData.title,
                    status: taskData.status,
                    priority: taskData.priority,
                    assigneeId: taskData.assigneeId,
                    createdBy: adminUserId,
                    order: index,
                    progress: taskData.status === 'done' ? 100 : taskData.status === 'in_progress' ? 50 : 0,
                },
            })
        )
    )
    devLog(`Kanban tasks created: ${kanbanTasks.length}`)

    // 9. 근태 정책 생성
    await prisma.workPolicy.create({
        data: {
            workspaceId,
            type: 'FLEXIBLE',
            dailyRequiredMinutes: 480, // 8시간
            weeklyRequiredMinutes: 2400, // 40시간
            workStartTime: '09:00',
            workEndTime: '18:00',
            coreTimeStart: '11:00',
            coreTimeEnd: '16:00',
            allowRemoteCheckIn: true,
            autoClockOutEnabled: true,
            autoClockOutTime: '19:30',
            presenceCheckEnabled: true,
            presenceIntervalMinutes: 90,
            presenceResponseWindowMinutes: 10,
            presenceCheckOnlyRemote: true,
        },
    })
    devLog('Work policy created')

    // 9. 공지사항 생성
    const announcements = [
        {
            title: '🎉 워크스페이스 생성을 환영합니다!',
            content: `안녕하세요! 새로운 워크스페이스가 성공적으로 생성되었습니다.

**시작하기**
1. 팀 멤버를 초대하여 함께 협업을 시작하세요
2. 프로젝트를 생성하고 작업을 관리하세요
3. 캘린더에서 일정을 관리하세요

궁금한 점이 있으시면 언제든지 문의해 주세요!`,
            isPinned: true,
        },
        {
            title: '📋 샘플 프로젝트가 생성되었습니다',
            content: `샘플 프로젝트 "신규 서비스 런칭"이 생성되었습니다.

프로젝트 페이지에서 Gantt 차트와 Kanban 보드를 확인해보세요.
- Gantt 뷰: 타임라인 기반 프로젝트 일정 관리
- Kanban 뷰: 작업 흐름 시각화 및 관리`,
            isPinned: false,
        },
        {
            title: '👥 5명의 샘플 팀원이 추가되었습니다',
            content: `각 팀별로 1명씩 총 5명의 샘플 팀원이 추가되었습니다:
- 김기획 (기획팀)
- 강개발 (개발팀)
- 한디자인 (디자인팀)
- 유운영 (운영팀)
- 양마케팅 (마케팅팀)

실제 팀원을 초대하면 샘플 데이터는 삭제하셔도 됩니다.`,
            isPinned: false,
        },
    ]

    await Promise.all(
        announcements.map(announcement =>
            prisma.announcement.create({
                data: {
                    workspaceId,
                    title: announcement.title,
                    content: announcement.content,
                    authorId: adminUserId,
                    isPinned: announcement.isPinned,
                },
            })
        )
    )
    devLog(`Announcements created: ${announcements.length}`)

    // 10. 게시판 글 생성
    const boardPosts = [
        {
            title: '점심 메뉴 추천 받습니다 🍱',
            content: `안녕하세요! 오늘 점심 뭐 먹을지 고민중인데 추천해주세요.

근처에 맛집 아시는 분 댓글 부탁드립니다!`,
            category: '자유',
            authorId: createdUsers[0].id, // 김기획
        },
        {
            title: '개발팀 스터디 모집 📚',
            content: `다음 주부터 React 스터디를 시작하려고 합니다.

**스터디 계획:**
- 주 1회 (매주 수요일 19:00)
- React 공식 문서 및 프로젝트 진행
- 온라인/오프라인 병행

관심있으신 분들은 댓글 남겨주세요!`,
            category: '일반',
            authorId: createdUsers[1].id, // 강개발
        },
        {
            title: '디자인 시스템 가이드 공유 🎨',
            content: `우리 팀의 디자인 시스템 가이드를 공유합니다.

**주요 내용:**
- 컬러 팔레트
- 타이포그래피
- 컴포넌트 라이브러리
- 아이콘 시스템

프로젝트 파일에서 확인하실 수 있습니다.`,
            category: '공지',
            authorId: createdUsers[2].id, // 한디자인
            isPinned: true,
        },
        {
            title: '주차장 이용 관련 문의 🚗',
            content: `건물 지하 주차장 이용 방법이 궁금합니다.

월정액 주차권은 어디서 신청하나요?`,
            category: '질문',
            authorId: createdUsers[3].id, // 유운영
        },
        {
            title: '마케팅 캠페인 아이디어 회의 💡',
            content: `다음 주 목요일에 마케팅 캠페인 브레인스토밍 회의를 진행합니다.

참석 가능하신 분들은 댓글로 의견 남겨주세요!`,
            category: '일반',
            authorId: createdUsers[4].id, // 양마케팅
        },
    ]

    const createdBoards = await Promise.all(
        boardPosts.map(post =>
            prisma.board.create({
                data: {
                    workspaceId,
                    title: post.title,
                    content: post.content,
                    category: post.category,
                    authorId: post.authorId,
                    isPinned: post.isPinned || false,
                },
            })
        )
    )
    devLog(`Board posts created: ${createdBoards.length}`)

    // 게시판 댓글 샘플 추가
    await Promise.all([
        prisma.boardComment.create({
            data: {
                boardId: createdBoards[0].id, // 점심 메뉴 추천 글
                authorId: createdUsers[1].id, // 강개발
                content: '저는 오늘 파스타 먹었는데 맛있었어요!',
            },
        }),
        prisma.boardComment.create({
            data: {
                boardId: createdBoards[1].id, // 개발팀 스터디 모집 글
                authorId: createdUsers[0].id, // 김기획
                content: '저도 참여하고 싶습니다!',
            },
        }),
        prisma.boardComment.create({
            data: {
                boardId: createdBoards[1].id, // 개발팀 스터디 모집 글
                authorId: createdUsers[2].id, // 한디자인
                content: 'React 배우고 싶었는데 좋은 기회네요 👍',
            },
        }),
    ])
    devLog('Board comments created')

    // 11. 캘린더 이벤트 생성
    // now is already defined above
    const calendarEvents = [
        {
            title: '전사 회의',
            description: '월간 전사 회의 - 각 팀별 진행 상황 공유',
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14, 0), // 3일 후 14:00
            endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 0), // 3일 후 16:00
            location: '본사 대회의실',
            color: '#EF4444',
            isAllDay: false,
            createdBy: adminUserId,
        },
        {
            title: '프로젝트 킥오프 미팅',
            description: '신규 서비스 런칭 프로젝트 킥오프',
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0), // 내일 10:00
            endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0), // 내일 12:00
            location: '회의실 A',
            color: '#3B82F6',
            isAllDay: false,
            createdBy: createdUsers[0].id, // 김기획
        },
        {
            title: '디자인 리뷰',
            description: 'UI/UX 디자인 최종 검토',
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 15, 0), // 5일 후 15:00
            endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 17, 0), // 5일 후 17:00
            location: '온라인 (Zoom)',
            color: '#10B981',
            isAllDay: false,
            createdBy: createdUsers[2].id, // 한디자인
        },
        {
            title: '개발팀 스프린트 회고',
            description: '2주간의 스프린트 회고 및 다음 스프린트 계획',
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 16, 0), // 7일 후 16:00
            endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 18, 0), // 7일 후 18:00
            location: '회의실 B',
            color: '#8B5CF6',
            isAllDay: false,
            createdBy: createdUsers[1].id, // 강개발
        },
        {
            title: '팀 빌딩 데이',
            description: '전 직원 참여 팀 빌딩 행사',
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 9, 0), // 14일 후 09:00
            endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 18, 0), // 14일 후 18:00
            location: '강남 워크샵 센터',
            color: '#F59E0B',
            isAllDay: true,
            createdBy: adminUserId,
        },
    ]

    const createdEvents = await Promise.all(
        calendarEvents.map(event =>
            prisma.calendarEvent.create({
                data: {
                    workspaceId,
                    title: event.title,
                    description: event.description,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    location: event.location,
                    color: event.color,
                    isAllDay: event.isAllDay,
                    createdBy: event.createdBy,
                },
            })
        )
    )
    devLog(`Calendar events created: ${createdEvents.length}`)

    // 일부 이벤트에 참석자 추가
    await Promise.all([
        // 전사 회의 - 모든 샘플 사용자 참석
        ...createdUsers.map(user =>
            prisma.calendarEventAttendee.create({
                data: {
                    eventId: createdEvents[0].id,
                    userId: user.id,
                    status: 'accepted',
                },
            })
        ),
        // 프로젝트 킥오프 미팅 - 일부 사용자 참석
        prisma.calendarEventAttendee.create({
            data: {
                eventId: createdEvents[1].id,
                userId: createdUsers[0].id, // 김기획
                status: 'accepted',
            },
        }),
        prisma.calendarEventAttendee.create({
            data: {
                eventId: createdEvents[1].id,
                userId: createdUsers[1].id, // 강개발
                status: 'accepted',
            },
        }),
        prisma.calendarEventAttendee.create({
            data: {
                eventId: createdEvents[1].id,
                userId: createdUsers[2].id, // 한디자인
                status: 'pending',
            },
        }),
    ])
    devLog('Event attendees created')

    devLog('Sample data creation completed!')
}
