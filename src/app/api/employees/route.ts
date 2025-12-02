// =============================================================================
// Employees API - CVE Fixes Applied
// CVE-CB-005: Secure Logging
// CVE-CB-009: Input Validation with Zod
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma, getReadClient } from '@/lib/prisma'
import { getOrSet, CacheKeys, CacheTTL, invalidateCache } from '@/lib/redis'
import { secureLogger, createErrorResponse } from '@/lib/security'
import { validateBody, employeeCreateSchema, validationErrorResponse } from '@/lib/validation'

// =============================================================================
// Employees API - Hyperscale Optimized
// Target: <100ms response time with caching
// =============================================================================

// GET: 워크스페이스의 전체 직원 목록 조회 - 캐싱 최적화
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaceId = request.headers.get('x-workspace-id')
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    // 권한 확인 (캐시)
    const membershipCacheKey = `membership:${session.user.id}:${workspaceId}`
    const membership = await getOrSet(membershipCacheKey, async () => {
      return prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: session.user.id
        }
      })
    }, CacheTTL.MEDIUM)

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 })
    }

    const isAdmin = membership.role === 'admin'
    const readClient = getReadClient()

    // 캐시 키 (관리자와 일반 사용자 구분)
    const cacheKey = `${CacheKeys.employees(workspaceId)}:${isAdmin ? 'admin' : 'user'}`

    const result = await getOrSet(cacheKey, async () => {
      const employees = await readClient.employee.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // 관리자가 아닌 경우 민감 정보 제외
      const sanitizedEmployees = employees.map(emp => ({
        id: emp.id,
        userId: emp.userId,
        nameKor: emp.nameKor,
        nameEng: emp.nameEng,
        email: emp.email,
        employeeNumber: emp.employeeNumber,
        department: emp.department,
        position: emp.position,
        jobTitle: emp.jobTitle,
        employmentType: emp.employmentType,
        status: emp.status,
        hireDate: emp.hireDate,
        profileImage: emp.user?.avatar || emp.profileImage,
        // 관리자만 볼 수 있는 정보
        ...(isAdmin ? {
          mobile: emp.mobile,
          bankName: emp.bankName,
          bankAccount: emp.bankAccount,
          baseSalaryMonthly: emp.baseSalaryMonthly,
          hourlyWage: emp.hourlyWage,
          payrollType: emp.payrollType
        } : {})
      }))

      return { employees: sanitizedEmployees }
    }, CacheTTL.EMPLOYEES)

    return NextResponse.json(result)
  } catch (error) {
    // CVE-CB-005: Secure logging
    secureLogger.error('Failed to fetch employees', error as Error, { operation: 'employees.list' })
    return createErrorResponse('Failed to fetch employees', 500, 'FETCH_FAILED')
  }
}

// POST: 새 직원 생성 (관리자/HR 전용) - 캐시 무효화 포함
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaceId = request.headers.get('x-workspace-id')
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    // 관리자 권한 확인 (캐시)
    const membershipCacheKey = `membership:${session.user.id}:${workspaceId}`
    const membership = await getOrSet(membershipCacheKey, async () => {
      return prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: session.user.id,
          role: 'admin'
        }
      })
    }, CacheTTL.MEDIUM)

    if (!membership) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // CVE-CB-009 Fix: Validate request body with Zod schema
    const validation = await validateBody(request, employeeCreateSchema)
    if (!validation.success) {
      return validationErrorResponse(validation.errors!)
    }

    const {
      userId,
      nameKor,
      nameEng,
      email,
      mobile,
      employeeNumber,
      department,
      position,
      jobTitle,
      hireDate,
      employmentType,
      payrollType,
      baseSalaryMonthly,
      hourlyWage,
      bankName,
      bankAccount
    } = validation.data!

    // 이메일 중복 확인
    const existingEmployee = await prisma.employee.findFirst({
      where: { workspaceId, email }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        workspaceId,
        userId,
        nameKor,
        nameEng,
        email,
        mobile,
        employeeNumber,
        department,
        position,
        jobTitle,
        hireDate: hireDate ? new Date(hireDate) : null,
        employmentType: employmentType || 'FULL_TIME',
        payrollType: payrollType || 'MONTHLY',
        baseSalaryMonthly,
        hourlyWage,
        bankName,
        bankAccount,
        status: 'ONBOARDING'
      }
    })

    // 온보딩 레코드 생성
    await prisma.employeeOnboarding.create({
      data: {
        employeeId: employee.id,
        status: 'NOT_STARTED'
      }
    })

    // 직원 목록 캐시 무효화
    await invalidateCache(CacheKeys.employees(workspaceId))
    // HR 통계 캐시도 무효화
    await invalidateCache(CacheKeys.hrStats(workspaceId))

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    // CVE-CB-005: Secure logging
    secureLogger.error('Failed to create employee', error as Error, { operation: 'employees.create' })
    return createErrorResponse('Failed to create employee', 500, 'CREATE_FAILED')
  }
}
