# WorkB HRIS 마이그레이션 분석 리포트

**Version**: 1.0
**Date**: 2025-11-30
**Author**: CodeB Analysis Team

---

## 1. Executive Summary

### 1.1 현재 상태 (AS-IS)
현재 WorkB CMS는 **프로젝트 관리 + 기본 근태 관리** 기능을 갖춘 시스템입니다.

### 1.2 목표 상태 (TO-BE)
job.md에 정의된 **완전한 HRIS(Human Resource Information System)**로 확장:
- 이력서 자동 파싱 → 인사기록카드 생성
- 근로계약 관리 → 급여 자동 계산
- 전자결재 워크플로우 → 급여 확정

### 1.3 GAP 분석 요약

| 영역 | 현재 | 목표 | GAP |
|------|------|------|-----|
| 근태 관리 | ✅ 기본 출퇴근 | 연장/야간/휴일 구분 | 🟡 Medium |
| 인사기록카드 | ❌ 없음 | 완전한 Employee 프로필 | 🔴 High |
| 급여 계산 | ❌ 없음 | 자동 급여 엔진 | 🔴 High |
| 이력서 파싱 | ❌ 없음 | PDF 자동 추출 | 🔴 High |
| 온보딩 | ❌ 없음 | Self-service 온보딩 | 🔴 High |
| RBAC | ✅ 기본 역할 | CEO/HR/팀장/직원 | 🟡 Medium |
| 전자결재 | ✅ 기본 승인 | 급여 확정 워크플로우 | 🟡 Medium |

---

## 2. 현재 시스템 분석 (AS-IS)

### 2.1 기존 DB 스키마 구조

```
✅ 존재하는 모델 (총 30개)
├── Core
│   ├── Workspace
│   ├── WorkspaceMember
│   ├── User
│   └── Team/TeamMember
├── Project Management
│   ├── Project/ProjectMember
│   ├── Task/TaskAttachment/TaskComment
│   ├── ChecklistItem
│   └── Activity
├── HR (기본)
│   ├── Attendance (출퇴근만)
│   ├── WorkPolicy (근무정책)
│   └── PresenceCheckLog
├── Groupware
│   ├── Announcement
│   ├── Board/BoardComment
│   └── CalendarEvent
├── Finance (기본)
│   ├── Contract
│   └── Transaction
└── Workflow
    ├── ApprovalDocument
    └── ApprovalStep
```

### 2.2 현재 근태 시스템 분석

**Attendance 모델 현황:**
```prisma
model Attendance {
  id          String           @id @default(uuid())
  userId      String
  workspaceId String?
  date        DateTime
  checkIn     DateTime?        // 출근시간
  checkOut    DateTime?        // 퇴근시간
  status      AttendanceStatus // PRESENT, ABSENT, LATE, HALF_DAY, REMOTE
  note        String?
}
```

**현재 제공하는 통계:**
- 월간: 총 근무일, 출근일, 지각일, 결근일, 반차일, 재택일, 출근율
- 주간: 요일별 근무시간 패턴
- 연간: 총 출근일, 출근율, 평균 근무시간

**부족한 부분:**
- ❌ 연장근로/야간근로/휴일근로 구분 없음
- ❌ 휴가 관리 테이블 없음 (Leave, LeaveRequest)
- ❌ 근무 스케줄 관리 없음 (WorkSchedule)
- ❌ 급여 계산용 AttendanceSummary 없음

### 2.3 현재 사용자 모델

```prisma
model User {
  id          String
  email       String    @unique
  name        String
  role        Role      // admin, member
  department  String?   // 부서 (문자열)
  avatar      String?
  phoneNumber String?
  companyName String?
  isActive    Boolean
  // ... 기본 필드만 존재
}
```

**부족한 인사기록카드 필드:**
- ❌ 주민등록번호/생년월일
- ❌ 성별
- ❌ 은행 계좌 정보
- ❌ 학력/경력/자격증
- ❌ 고용형태 (정규직/계약직/알바)
- ❌ 급여 정보

---

## 3. 목표 시스템 설계 (TO-BE)

### 3.1 신규 모델 정의

#### 3.1.1 Employee (인사기록카드 확장)

```prisma
// 고용 상태
enum EmployeeStatus {
  ONBOARDING_DRAFT    // 온보딩 대기
  ONBOARDING_PROGRESS // 온보딩 진행중
  ACTIVE              // 재직
  ON_LEAVE            // 휴직
  RESIGNED            // 퇴직
}

// 고용 형태
enum EmploymentType {
  FULL_TIME           // 정규직
  CONTRACT            // 계약직
  PART_TIME           // 파트타임
  INTERN              // 인턴
  FREELANCER          // 프리랜서
}

model Employee {
  id              String           @id @default(uuid())
  userId          String           @unique
  workspaceId     String

  // === 기본 정보 ===
  nameKor         String           // 한글 이름
  nameEng         String?          // 영문 이름
  birthDate       DateTime?
  gender          String?          // M, F
  nationality     String?          @default("KR")

  // === 연락처 ===
  mobile          String?
  email           String
  address         String?
  addressDetail   String?
  zipCode         String?

  // === 긴급연락처 ===
  emergencyName   String?
  emergencyPhone  String?
  emergencyRelation String?

  // === 은행 계좌 ===
  bankName        String?
  accountNumber   String?
  accountHolder   String?

  // === 고용 정보 ===
  employeeNumber  String?          // 사번
  employmentType  EmploymentType   @default(FULL_TIME)
  status          EmployeeStatus   @default(ONBOARDING_DRAFT)
  hireDate        DateTime?
  resignDate      DateTime?

  // === 직급/직책 ===
  position        String?          // 직책 (팀장, 대리 등)
  rank            String?          // 직급 (사원, 대리, 과장 등)
  departmentId    String?
  teamId          String?

  // === 세금 정보 (선택) ===
  residentNumber  String?          // 주민번호 (암호화 필수)
  taxExemptType   String?          // 세금 감면 유형

  // === 메타 ===
  profilePhoto    String?
  onboardingCompletedAt DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  user            User             @relation(fields: [userId], references: [id])
  workspace       Workspace        @relation(fields: [workspaceId], references: [id])
  education       EmployeeEducation[]
  experience      EmployeeExperience[]
  certificates    EmployeeCertificate[]
  contracts       EmploymentContract[]
  payrollProfiles PayrollProfile[]
}

// 학력
model EmployeeEducation {
  id              String    @id @default(uuid())
  employeeId      String
  schoolName      String
  major           String?
  degree          String?   // 고졸, 학사, 석사, 박사
  startDate       DateTime?
  endDate         DateTime?
  isGraduated     Boolean   @default(true)

  employee        Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}

// 경력
model EmployeeExperience {
  id              String    @id @default(uuid())
  employeeId      String
  companyName     String
  position        String?
  department      String?
  startDate       DateTime
  endDate         DateTime?
  isCurrent       Boolean   @default(false)
  description     String?

  employee        Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}

// 자격증
model EmployeeCertificate {
  id              String    @id @default(uuid())
  employeeId      String
  name            String
  issuer          String?
  issueDate       DateTime?
  expiryDate      DateTime?
  certificateNumber String?

  employee        Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
}
```

#### 3.1.2 근로계약 (EmploymentContract)

```prisma
enum ContractType {
  PERMANENT         // 무기계약
  FIXED_TERM        // 기간제
  PROBATION         // 수습
}

enum WorkPattern {
  FIXED             // 고정근무
  FLEXIBLE          // 유연근무
  SHIFT             // 교대근무
  FREE              // 자율출퇴근
}

model EmploymentContract {
  id                    String       @id @default(uuid())
  employeeId            String
  workspaceId           String

  // === 계약 기본 ===
  contractType          ContractType
  workPattern           WorkPattern  @default(FIXED)
  startDate             DateTime
  endDate               DateTime?    // null = 무기계약

  // === 근무 조건 ===
  workingHoursPerWeek   Int          @default(40)
  workingDaysPerWeek    Int          @default(5)
  standardWorkStart     String?      // "09:00"
  standardWorkEnd       String?      // "18:00"
  breakTimeMinutes      Int          @default(60)

  // === 급여 조건 ===
  baseSalaryMonthly     Float?       // 월급제
  hourlyWage            Float?       // 시급제

  // === 상태 ===
  isActive              Boolean      @default(true)
  version               Int          @default(1)

  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  employee              Employee     @relation(fields: [employeeId], references: [id])
  workspace             Workspace    @relation(fields: [workspaceId], references: [id])
}
```

#### 3.1.3 급여 프로파일 (PayrollProfile)

```prisma
enum PayrollType {
  MONTHLY           // 월급제
  HOURLY            // 시급제
  FREELANCER        // 프리랜서
}

model PayrollProfile {
  id                    String       @id @default(uuid())
  employeeId            String
  workspaceId           String

  // === 급여 유형 ===
  payrollType           PayrollType
  baseSalaryMonthly     Float?
  hourlyWage            Float?

  // === 가산율 ===
  overtimeMultiplier    Float        @default(1.5)  // 연장근로
  nightMultiplier       Float        @default(1.5)  // 야간근로 (22:00~06:00)
  holidayMultiplier     Float        @default(1.5)  // 휴일근로

  // === 고정 수당 ===
  fixedAllowances       Json?        // { "식대": 100000, "교통비": 50000 }

  // === 공제 ===
  deductionProfileId    String?

  isActive              Boolean      @default(true)
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  employee              Employee     @relation(fields: [employeeId], references: [id])
  workspace             Workspace    @relation(fields: [workspaceId], references: [id])
}
```

#### 3.1.4 근태 요약 (AttendanceSummary)

```prisma
model AttendanceSummary {
  id                String    @id @default(uuid())
  employeeId        String
  workspaceId       String

  // === 기간 ===
  year              Int
  month             Int

  // === 근무시간 집계 ===
  normalHours       Float     @default(0)   // 정상근로
  overtimeHours     Float     @default(0)   // 연장근로 (주40시간 초과)
  nightHours        Float     @default(0)   // 야간근로 (22:00~06:00)
  holidayHours      Float     @default(0)   // 휴일근로

  // === 휴가 집계 ===
  paidLeaveHours    Float     @default(0)   // 유급휴가
  unpaidHours       Float     @default(0)   // 무급휴가/결근

  // === 출근 현황 ===
  totalWorkDays     Int       @default(0)
  presentDays       Int       @default(0)
  lateDays          Int       @default(0)
  absentDays        Int       @default(0)
  remoteDays        Int       @default(0)

  // === 확정 상태 ===
  isFinalized       Boolean   @default(false)
  finalizedAt       DateTime?
  finalizedBy       String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([employeeId, year, month])
}
```

#### 3.1.5 급여 명세서 (PayrollSlip)

```prisma
enum PayrollStatus {
  DRAFT             // 초안
  PENDING_REVIEW    // HR 검토중
  PENDING_APPROVAL  // 대표 승인 대기
  APPROVED          // 승인됨
  LOCKED            // 확정 (수정불가)
  ADJUSTED          // 조정됨
}

model PayrollSlip {
  id                String         @id @default(uuid())
  employeeId        String
  workspaceId       String

  // === 기간 ===
  year              Int
  month             Int

  // === 지급 항목 ===
  basePay           Float          @default(0)   // 기본급
  overtimePay       Float          @default(0)   // 연장수당
  nightPay          Float          @default(0)   // 야간수당
  holidayPay        Float          @default(0)   // 휴일수당
  fixedAllowances   Json?                        // 고정수당 내역
  bonuses           Json?                        // 상여금

  // === 공제 항목 ===
  nationalPension   Float          @default(0)   // 국민연금
  healthInsurance   Float          @default(0)   // 건강보험
  longTermCare      Float          @default(0)   // 장기요양
  employmentIns     Float          @default(0)   // 고용보험
  incomeTax         Float          @default(0)   // 소득세
  localIncomeTax    Float          @default(0)   // 지방소득세
  otherDeductions   Json?                        // 기타 공제

  // === 합계 ===
  totalEarnings     Float          @default(0)   // 총 지급액
  totalDeductions   Float          @default(0)   // 총 공제액
  netPay            Float          @default(0)   // 실수령액

  // === 상태 ===
  status            PayrollStatus  @default(DRAFT)

  // === 승인 정보 ===
  reviewedBy        String?
  reviewedAt        DateTime?
  approvedBy        String?
  approvedAt        DateTime?
  lockedAt          DateTime?

  // === 메모 ===
  hrNote            String?
  employeeNote      String?

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@unique([employeeId, year, month])
}
```

#### 3.1.6 휴가 관리 (Leave)

```prisma
enum LeaveType {
  ANNUAL            // 연차
  SICK              // 병가
  PERSONAL          // 경조사
  MATERNITY         // 출산휴가
  PATERNITY         // 배우자출산휴가
  UNPAID            // 무급휴가
  HALF_DAY_AM       // 오전반차
  HALF_DAY_PM       // 오후반차
}

enum LeaveStatus {
  PENDING           // 승인대기
  APPROVED          // 승인
  REJECTED          // 반려
  CANCELLED         // 취소
}

model LeaveBalance {
  id                String    @id @default(uuid())
  employeeId        String
  workspaceId       String
  year              Int

  totalDays         Float     @default(15)  // 총 연차
  usedDays          Float     @default(0)   // 사용 연차
  remainingDays     Float     @default(15)  // 잔여 연차

  // 연차 발생 기준
  accrualType       String    @default("LEGAL") // LEGAL(법정), CUSTOM(커스텀)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([employeeId, year])
}

model LeaveRequest {
  id                String       @id @default(uuid())
  employeeId        String
  workspaceId       String

  leaveType         LeaveType
  startDate         DateTime
  endDate           DateTime
  days              Float        // 사용 일수 (0.5 = 반차)
  reason            String?

  status            LeaveStatus  @default(PENDING)

  // 승인 정보
  approvedBy        String?
  approvedAt        DateTime?
  rejectedReason    String?

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}
```

#### 3.1.7 이력서 파싱 (ParsedResume)

```prisma
enum ResumeSource {
  SARAMIN           // 사람인
  JOBKOREA          // 잡코리아
  MANUAL            // 수동 입력
  OTHER             // 기타
}

enum ResumeStatus {
  PENDING           // 파싱 대기
  PARSED            // 파싱 완료
  CONVERTED         // Employee 변환됨
  FAILED            // 파싱 실패
}

model ParsedResume {
  id                String        @id @default(uuid())
  workspaceId       String

  // === 원본 정보 ===
  originalFileName  String
  fileUrl           String
  source            ResumeSource

  // === 파싱된 데이터 ===
  name              String?
  phone             String?
  email             String?
  birthDate         DateTime?
  gender            String?
  address           String?
  profilePhoto      String?

  // === 복합 데이터 (JSON) ===
  education         Json?         // [{ schoolName, major, degree, ... }]
  experience        Json?         // [{ companyName, position, ... }]
  certificates      Json?         // [{ name, issuer, issueDate, ... }]
  skills            String[]

  // === 상태 ===
  status            ResumeStatus  @default(PENDING)
  parsingError      String?

  // === 변환 정보 ===
  convertedEmployeeId String?
  convertedAt       DateTime?

  uploadedBy        String
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

---

## 4. 급여 계산 알고리즘

### 4.1 근태 → AttendanceSummary 집계

```typescript
// 급여 계산 배치 로직
async function generateAttendanceSummary(
  employeeId: string,
  year: number,
  month: number
): Promise<AttendanceSummary> {

  // 1. 해당 월의 모든 출퇴근 기록 조회
  const attendances = await prisma.attendance.findMany({
    where: {
      userId: employee.userId,
      date: {
        gte: startOfMonth(new Date(year, month - 1)),
        lte: endOfMonth(new Date(year, month - 1))
      }
    }
  })

  // 2. 근무유형별 시간 계산
  let normalHours = 0
  let overtimeHours = 0
  let nightHours = 0
  let holidayHours = 0

  for (const record of attendances) {
    if (!record.checkIn || !record.checkOut) continue

    const workMinutes = differenceInMinutes(record.checkOut, record.checkIn)
    const workHours = workMinutes / 60

    // 2.1 휴일 여부 확인
    const isHoliday = await isPublicHoliday(record.date) || isWeekend(record.date)

    if (isHoliday) {
      holidayHours += workHours
    } else {
      // 2.2 야간 근무 계산 (22:00 ~ 06:00)
      const nightWork = calculateNightHours(record.checkIn, record.checkOut)
      nightHours += nightWork

      // 2.3 정상 vs 연장 분리
      const dailyStandard = 8 // 하루 소정근로시간
      if (workHours <= dailyStandard) {
        normalHours += workHours - nightWork
      } else {
        normalHours += dailyStandard - nightWork
        overtimeHours += workHours - dailyStandard
      }
    }
  }

  // 3. 주간 연장근로 추가 계산 (주 40시간 초과분)
  const weeklyOvertime = calculateWeeklyOvertime(attendances, 40)
  overtimeHours += weeklyOvertime

  // 4. AttendanceSummary 저장
  return prisma.attendanceSummary.upsert({
    where: { employeeId_year_month: { employeeId, year, month } },
    create: {
      employeeId,
      workspaceId,
      year,
      month,
      normalHours,
      overtimeHours,
      nightHours,
      holidayHours,
      // ... 기타 필드
    },
    update: {
      normalHours,
      overtimeHours,
      nightHours,
      holidayHours,
    }
  })
}
```

### 4.2 급여 계산 공식

```typescript
// 급여 계산 엔진
async function calculatePayroll(
  employeeId: string,
  year: number,
  month: number
): Promise<PayrollSlip> {

  // 1. 필요한 데이터 조회
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { payrollProfiles: { where: { isActive: true } } }
  })

  const summary = await prisma.attendanceSummary.findUnique({
    where: { employeeId_year_month: { employeeId, year, month } }
  })

  const profile = employee.payrollProfiles[0]

  // 2. 기본시급 계산
  let hourlyRate: number

  if (profile.payrollType === 'MONTHLY') {
    // 월급제: 월급 / 소정근로시간 (209시간 = 주40시간 기준)
    const standardMonthlyHours = 209
    hourlyRate = profile.baseSalaryMonthly / standardMonthlyHours
  } else {
    // 시급제
    hourlyRate = profile.hourlyWage
  }

  // 3. 각 항목별 급여 계산

  // 3.1 기본급 (정상근로 + 유급휴가 - 무급)
  const basePay = hourlyRate * (
    summary.normalHours +
    summary.paidLeaveHours -
    summary.unpaidHours
  )

  // 3.2 연장수당 = 기본시급 × 연장근로시간 × 1.5
  const overtimePay = hourlyRate * summary.overtimeHours * profile.overtimeMultiplier

  // 3.3 야간수당 = 기본시급 × 야간근로시간 × 0.5 (가산분만)
  const nightPay = hourlyRate * summary.nightHours * (profile.nightMultiplier - 1)

  // 3.4 휴일수당 = 기본시급 × 휴일근로시간 × 1.5~2.0
  const holidayPay = hourlyRate * summary.holidayHours * profile.holidayMultiplier

  // 3.5 고정수당
  const fixedAllowances = profile.fixedAllowances || {}
  const fixedAllowancesTotal = Object.values(fixedAllowances).reduce((a, b) => a + b, 0)

  // 4. 총 지급액
  const totalEarnings = basePay + overtimePay + nightPay + holidayPay + fixedAllowancesTotal

  // 5. 4대보험 공제 계산
  const deductions = calculate4Insurance(totalEarnings)

  // 6. 소득세 계산
  const incomeTax = calculateIncomeTax(totalEarnings, employee)
  const localIncomeTax = incomeTax * 0.1 // 지방소득세 = 소득세의 10%

  // 7. 총 공제액
  const totalDeductions =
    deductions.nationalPension +
    deductions.healthInsurance +
    deductions.longTermCare +
    deductions.employmentIns +
    incomeTax +
    localIncomeTax

  // 8. 실수령액
  const netPay = totalEarnings - totalDeductions

  // 9. PayrollSlip 생성
  return prisma.payrollSlip.upsert({
    where: { employeeId_year_month: { employeeId, year, month } },
    create: {
      employeeId,
      workspaceId,
      year,
      month,
      basePay,
      overtimePay,
      nightPay,
      holidayPay,
      fixedAllowances,
      ...deductions,
      incomeTax,
      localIncomeTax,
      totalEarnings,
      totalDeductions,
      netPay,
      status: 'DRAFT'
    },
    update: { /* 동일 */ }
  })
}

// 4대보험 계산 (2025년 기준)
function calculate4Insurance(totalEarnings: number) {
  return {
    nationalPension: totalEarnings * 0.045,     // 국민연금 4.5%
    healthInsurance: totalEarnings * 0.03545,   // 건강보험 3.545%
    longTermCare: totalEarnings * 0.03545 * 0.1291, // 장기요양 (건보의 12.91%)
    employmentIns: totalEarnings * 0.009,       // 고용보험 0.9%
  }
}
```

---

## 5. 마이그레이션 계획

### 5.1 Phase 1: 기반 모델 확장 (1주차)

**우선순위: HIGH**

1. **Employee 모델 생성**
   - User와 1:1 관계로 인사기록카드 확장
   - 기존 User 데이터 마이그레이션

2. **EmployeeEducation, EmployeeExperience, EmployeeCertificate 생성**
   - 학력/경력/자격증 정보 저장

3. **Attendance 모델 확장**
   - 기존 필드 유지
   - 근무유형 필드 추가 (연장/야간/휴일 구분용)

```bash
# Migration 명령어
npx prisma migrate dev --name add_employee_models
```

### 5.2 Phase 2: 급여 시스템 (2주차)

**우선순위: HIGH**

1. **EmploymentContract 모델 생성**
   - 근로계약 정보 관리

2. **PayrollProfile 모델 생성**
   - 급여 프로파일 (월급제/시급제, 가산율)

3. **AttendanceSummary 모델 생성**
   - 월별 근태 집계

4. **PayrollSlip 모델 생성**
   - 급여명세서

### 5.3 Phase 3: 휴가 시스템 (3주차)

**우선순위: MEDIUM**

1. **LeaveBalance 모델 생성**
   - 연차 잔여일수 관리

2. **LeaveRequest 모델 생성**
   - 휴가 신청/승인

3. **휴가 → 근태 연동**
   - 승인된 휴가 자동 반영

### 5.4 Phase 4: 이력서 파싱 (4주차)

**우선순위: MEDIUM**

1. **ParsedResume 모델 생성**
   - PDF 업로드 및 파싱 결과 저장

2. **PDF 파서 서비스 구현**
   - 사람인/잡코리아 PDF 파싱

3. **온보딩 워크플로우**
   - 직원 Self-service 정보 입력

### 5.5 Phase 5: 급여 확정 워크플로우 (5주차)

**우선순위: MEDIUM**

1. **전자결재 확장**
   - 급여 확정 승인 타입 추가

2. **PayrollSlip 상태 관리**
   - DRAFT → PENDING_REVIEW → PENDING_APPROVAL → APPROVED → LOCKED

3. **알림 시스템**
   - 급여 검토/승인 알림

---

## 6. 데이터 마이그레이션 스크립트

### 6.1 User → Employee 마이그레이션

```typescript
// scripts/migrate-users-to-employees.ts
async function migrateUsersToEmployees() {
  const users = await prisma.user.findMany({
    include: { workspaces: true }
  })

  for (const user of users) {
    // 각 워크스페이스별로 Employee 생성
    for (const membership of user.workspaces) {
      await prisma.employee.create({
        data: {
          userId: user.id,
          workspaceId: membership.workspaceId,
          nameKor: user.name,
          email: user.email,
          mobile: user.phoneNumber,
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
          hireDate: membership.joinedAt,
        }
      })
    }
  }

  console.log(`Migrated ${users.length} users to employees`)
}
```

### 6.2 기존 Attendance 데이터 보존

```typescript
// 기존 데이터는 그대로 유지
// 새로운 필드만 추가됨 (null 허용)
// 점진적으로 새 알고리즘 적용
```

---

## 7. API 엔드포인트 계획

### 7.1 Employee API

```
POST   /api/employees                    # 직원 생성
GET    /api/employees                    # 직원 목록
GET    /api/employees/:id                # 직원 상세
PUT    /api/employees/:id                # 직원 수정
DELETE /api/employees/:id                # 직원 삭제

# 인사기록카드 세부
POST   /api/employees/:id/education      # 학력 추가
POST   /api/employees/:id/experience     # 경력 추가
POST   /api/employees/:id/certificates   # 자격증 추가
```

### 7.2 Payroll API

```
POST   /api/payroll/calculate            # 급여 계산 실행
GET    /api/payroll/slips                # 급여명세서 목록
GET    /api/payroll/slips/:id            # 급여명세서 상세
PUT    /api/payroll/slips/:id/review     # HR 검토 완료
PUT    /api/payroll/slips/:id/approve    # 대표 승인
PUT    /api/payroll/slips/:id/lock       # 확정
```

### 7.3 Leave API

```
GET    /api/leave/balance                # 연차 잔여일수
POST   /api/leave/requests               # 휴가 신청
GET    /api/leave/requests               # 휴가 신청 목록
PUT    /api/leave/requests/:id/approve   # 휴가 승인
PUT    /api/leave/requests/:id/reject    # 휴가 반려
```

### 7.4 Resume Parser API

```
POST   /api/resumes/upload               # 이력서 업로드
GET    /api/resumes/:id                  # 파싱 결과 조회
POST   /api/resumes/:id/convert          # Employee로 변환
```

---

## 8. UI/UX 설계 계획

### 8.1 HR 페이지 확장

```
/hr
├── /attendance       # 출퇴근 관리 (현재)
├── /employees        # 직원 관리 (신규)
│   ├── /list         # 직원 목록
│   ├── /[id]         # 직원 상세 (인사기록카드)
│   └── /onboarding   # 온보딩 관리
├── /payroll          # 급여 관리 (신규)
│   ├── /calculate    # 급여 계산
│   ├── /slips        # 급여명세서
│   └── /approval     # 급여 승인
├── /leave            # 휴가 관리 (신규)
│   ├── /balance      # 연차 현황
│   ├── /requests     # 휴가 신청
│   └── /calendar     # 휴가 캘린더
└── /stats            # 통계 (현재)
```

### 8.2 직원 셀프서비스

```
/my
├── /profile          # 내 정보 (인사기록카드)
├── /attendance       # 내 출퇴근
├── /payslips         # 내 급여명세서
├── /leave            # 내 휴가
└── /onboarding       # 온보딩 (신규 입사자)
```

---

## 9. 일정 및 리소스

### 9.1 예상 일정

| Phase | 기간 | 주요 작업 |
|-------|------|----------|
| Phase 1 | Week 1 | Employee 모델, 기반 구축 |
| Phase 2 | Week 2 | 급여 시스템 |
| Phase 3 | Week 3 | 휴가 시스템 |
| Phase 4 | Week 4 | 이력서 파싱 |
| Phase 5 | Week 5 | 워크플로우, 테스트 |

**총 예상 기간: 5주**

### 9.2 우선순위 기준

1. **Must Have**: Employee 모델, 급여 계산 기본
2. **Should Have**: 휴가 관리, 연장/야간 수당
3. **Nice to Have**: 이력서 파싱, 온보딩 자동화

---

## 10. 사용자 그룹 및 워크스페이스 타입 설정

### 10.1 사용자 그룹 정의

WorkB는 크게 **3가지 사용자 그룹**을 대상으로 합니다:

| 사용자 그룹 | 설명 | 주요 기능 | 예시 |
|------------|------|----------|------|
| **Enterprise** | 프로젝트관리 + HR + 급여 풀패키지 | 프로젝트, 칸반, 간트, 근태, 급여, 인사기록카드 | 스타트업, 중소기업, IT회사 |
| **SMB HR Only** | 근태관리 + 급여만 사용 | 출퇴근, 급여계산, 직원관리 (프로젝트 기능 OFF) | 음식점, 카페, 편의점, 소상공인 |
| **Project Only** | 프로젝트관리만 사용 | 칸반, 간트, 마인드맵 (HR 기능 OFF) | 프리랜서, 외주 에이전시 |

### 10.2 워크스페이스 타입 모델

```prisma
// 워크스페이스 타입 (가입 시 선택)
enum WorkspaceType {
  ENTERPRISE         // 프로젝트 + HR + 급여 (풀패키지)
  HR_ONLY            // 근태관리 + 급여만 (소상공인용)
  PROJECT_ONLY       // 프로젝트관리만 (프리랜서/에이전시)
}

// 비즈니스 유형 (HR_ONLY 선택 시 세부 분류)
enum BusinessType {
  RESTAURANT         // 음식점
  CAFE               // 카페
  RETAIL             // 소매점/편의점
  BEAUTY             // 미용/뷰티샵
  CLINIC             // 병원/의원
  ACADEMY            // 학원
  LOGISTICS          // 물류/배송
  MANUFACTURING      // 제조업
  OTHER              // 기타
}

// 확장된 Workspace 모델
model Workspace {
  id              String           @id @default(uuid())
  name            String
  slug            String           @unique

  // === 워크스페이스 타입 설정 ===
  type            WorkspaceType    @default(ENTERPRISE)
  businessType    BusinessType?    // HR_ONLY 선택 시 필수

  // === 기능 활성화 플래그 ===
  features        WorkspaceFeatures?

  // === 기존 필드 ===
  ownerId         String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  owner           User             @relation(fields: [ownerId], references: [id])
  members         WorkspaceMember[]
  projects        Project[]
  employees       Employee[]
  // ...
}

// 기능 활성화 설정 (JSON 또는 별도 테이블)
model WorkspaceFeatures {
  id              String    @id @default(uuid())
  workspaceId     String    @unique

  // === 프로젝트 관리 기능 ===
  projectEnabled      Boolean   @default(true)
  kanbanEnabled       Boolean   @default(true)
  ganttEnabled        Boolean   @default(true)
  mindmapEnabled      Boolean   @default(true)

  // === HR 기능 ===
  attendanceEnabled   Boolean   @default(true)
  employeeEnabled     Boolean   @default(true)

  // === 급여 기능 ===
  payrollEnabled      Boolean   @default(true)
  payslipEnabled      Boolean   @default(true)

  // === 휴가 기능 ===
  leaveEnabled        Boolean   @default(true)

  // === 이력서 파싱 ===
  resumeParsingEnabled Boolean  @default(false)

  // === 전자결재 ===
  approvalEnabled     Boolean   @default(true)

  // === 그룹웨어 ===
  announcementEnabled Boolean   @default(true)
  boardEnabled        Boolean   @default(true)
  calendarEnabled     Boolean   @default(true)

  workspace       Workspace @relation(fields: [workspaceId], references: [id])
}
```

### 10.3 타입별 기본 기능 설정

```typescript
// 워크스페이스 타입별 기본 기능 프리셋
const WORKSPACE_FEATURE_PRESETS: Record<WorkspaceType, WorkspaceFeatures> = {
  // 풀패키지: 모든 기능 활성화
  ENTERPRISE: {
    projectEnabled: true,
    kanbanEnabled: true,
    ganttEnabled: true,
    mindmapEnabled: true,
    attendanceEnabled: true,
    employeeEnabled: true,
    payrollEnabled: true,
    payslipEnabled: true,
    leaveEnabled: true,
    resumeParsingEnabled: true,
    approvalEnabled: true,
    announcementEnabled: true,
    boardEnabled: true,
    calendarEnabled: true,
  },

  // 소상공인: HR + 급여만
  HR_ONLY: {
    projectEnabled: false,        // 프로젝트 OFF
    kanbanEnabled: false,         // 칸반 OFF
    ganttEnabled: false,          // 간트 OFF
    mindmapEnabled: false,        // 마인드맵 OFF
    attendanceEnabled: true,      // 출퇴근 ON
    employeeEnabled: true,        // 직원관리 ON
    payrollEnabled: true,         // 급여계산 ON
    payslipEnabled: true,         // 급여명세 ON
    leaveEnabled: true,           // 휴가 ON
    resumeParsingEnabled: false,  // 이력서 파싱 OFF (간소화)
    approvalEnabled: true,        // 전자결재 ON (휴가/급여 승인)
    announcementEnabled: true,    // 공지사항 ON
    boardEnabled: false,          // 게시판 OFF
    calendarEnabled: true,        // 캘린더 ON (근무 스케줄)
  },

  // 프로젝트만: 프로젝트 관리만
  PROJECT_ONLY: {
    projectEnabled: true,
    kanbanEnabled: true,
    ganttEnabled: true,
    mindmapEnabled: true,
    attendanceEnabled: false,     // 출퇴근 OFF
    employeeEnabled: false,       // 직원관리 OFF
    payrollEnabled: false,        // 급여 OFF
    payslipEnabled: false,        // 급여명세 OFF
    leaveEnabled: false,          // 휴가 OFF
    resumeParsingEnabled: false,
    approvalEnabled: true,        // 전자결재 ON (프로젝트 승인)
    announcementEnabled: true,
    boardEnabled: true,
    calendarEnabled: true,
  },
}
```

### 10.4 소상공인 특화 기능 (HR_ONLY)

```prisma
// 소상공인 근무 스케줄 (시간제 알바 관리)
model WorkSchedule {
  id              String    @id @default(uuid())
  employeeId      String
  workspaceId     String

  // === 스케줄 정보 ===
  dayOfWeek       Int       // 0=일, 1=월, ..., 6=토
  startTime       String    // "09:00"
  endTime         String    // "18:00"
  isWorkingDay    Boolean   @default(true)

  // === 유효 기간 ===
  effectiveFrom   DateTime
  effectiveTo     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  employee        Employee  @relation(fields: [employeeId], references: [id])
  workspace       Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([employeeId, dayOfWeek, effectiveFrom])
}

// 시급 직원 급여 간소화 계산
model HourlyPayRecord {
  id              String    @id @default(uuid())
  employeeId      String
  workspaceId     String

  // === 기간 ===
  year            Int
  month           Int

  // === 근무 시간 ===
  totalHours      Float     @default(0)    // 총 근무시간
  overtimeHours   Float     @default(0)    // 연장 근무시간

  // === 급여 ===
  hourlyRate      Float                     // 시급
  basePay         Float     @default(0)    // 기본급 (시급 × 시간)
  overtimePay     Float     @default(0)    // 연장수당
  totalPay        Float     @default(0)    // 총액

  // === 지급 상태 ===
  isPaid          Boolean   @default(false)
  paidAt          DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  employee        Employee  @relation(fields: [employeeId], references: [id])
  workspace       Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([employeeId, year, month])
}
```

---

## 11. 온보딩 플로우 설계

### 11.1 신규 가입 온보딩 스텝

```
[Step 1] 기본 정보 입력
├── 이메일/비밀번호
├── 이름
└── 전화번호

[Step 2] 워크스페이스 타입 선택  ⭐ 핵심
├── 🏢 Enterprise (프로젝트 + HR + 급여)
│   └── "스타트업/IT회사를 위한 올인원 솔루션"
├── 🏪 소상공인 HR (근태 + 급여만)
│   └── "카페, 음식점, 소매점을 위한 직원관리"
└── 📋 프로젝트 전용 (프로젝트만)
    └── "프리랜서/에이전시를 위한 협업툴"

[Step 3] 비즈니스 정보 (타입별 분기)
├── Enterprise: 회사명, 직원수, 산업분야
├── HR_ONLY: 상호명, 업종선택, 직원수
└── PROJECT_ONLY: 팀명, 팀 규모

[Step 4] 근무 정책 설정 (HR 기능 있을 때만)
├── 근무시간 (예: 09:00~18:00)
├── 근무일 (월~금 / 주6일 등)
├── 시급제 여부
└── 휴게시간

[Step 5] 초대 또는 시작
├── 팀원 이메일로 초대
└── 나중에 하기 → 대시보드
```

### 11.2 온보딩 상태 모델

```prisma
enum OnboardingStatus {
  NOT_STARTED       // 시작 안함
  TYPE_SELECTED     // 타입 선택 완료
  INFO_ENTERED      // 기본정보 입력 완료
  POLICY_SET        // 정책 설정 완료
  COMPLETED         // 온보딩 완료
}

// 워크스페이스 온보딩 진행 상태
model WorkspaceOnboarding {
  id              String            @id @default(uuid())
  workspaceId     String            @unique

  status          OnboardingStatus  @default(NOT_STARTED)

  // === 각 스텝 완료 여부 ===
  typeSelected    Boolean           @default(false)
  infoEntered     Boolean           @default(false)
  policySet       Boolean           @default(false)

  // === 타임스탬프 ===
  typeSelectedAt  DateTime?
  infoEnteredAt   DateTime?
  policySetAt     DateTime?
  completedAt     DateTime?

  // === 스킵 여부 ===
  skippedSteps    String[]          // ["policy", "invite"]

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  workspace       Workspace         @relation(fields: [workspaceId], references: [id])
}

// 직원 온보딩 (Employee Self-service)
model EmployeeOnboarding {
  id              String            @id @default(uuid())
  employeeId      String            @unique

  status          OnboardingStatus  @default(NOT_STARTED)

  // === 필수 입력 항목 체크 ===
  basicInfoDone       Boolean       @default(false)  // 생년월일, 성별
  contactInfoDone     Boolean       @default(false)  // 주소, 연락처
  bankInfoDone        Boolean       @default(false)  // 은행계좌
  emergencyInfoDone   Boolean       @default(false)  // 긴급연락처
  documentsDone       Boolean       @default(false)  // 서류 제출

  completedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  employee        Employee          @relation(fields: [employeeId], references: [id])
}
```

### 11.3 온보딩 UI 컴포넌트

```tsx
// components/onboarding/WorkspaceTypeSelector.tsx

const WORKSPACE_TYPES = [
  {
    type: 'ENTERPRISE',
    icon: Building2,
    title: 'Enterprise',
    subtitle: '프로젝트 + HR + 급여',
    description: '스타트업/IT회사를 위한 올인원 솔루션',
    features: ['프로젝트 관리', '칸반/간트', '근태관리', '급여계산', '인사기록카드'],
    color: 'from-violet-500 to-purple-600',
    recommended: true,
  },
  {
    type: 'HR_ONLY',
    icon: Users,
    title: '소상공인 HR',
    subtitle: '근태 + 급여만',
    description: '카페, 음식점, 소매점을 위한 직원관리',
    features: ['출퇴근 체크', '시급 계산', '급여명세서', '스케줄 관리'],
    color: 'from-emerald-500 to-teal-600',
    recommended: false,
  },
  {
    type: 'PROJECT_ONLY',
    icon: FolderKanban,
    title: '프로젝트 전용',
    subtitle: '프로젝트만',
    description: '프리랜서/에이전시를 위한 협업툴',
    features: ['칸반보드', '간트차트', '마인드맵', '파일관리'],
    color: 'from-blue-500 to-cyan-600',
    recommended: false,
  },
]

export function WorkspaceTypeSelector({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {WORKSPACE_TYPES.map((item) => (
        <Card
          key={item.type}
          className={`relative cursor-pointer transition-all hover:scale-105 hover:shadow-xl
            ${item.recommended ? 'ring-2 ring-lime-400' : ''}
          `}
          onClick={() => onSelect(item.type)}
        >
          {item.recommended && (
            <Badge className="absolute -top-2 -right-2 bg-lime-400 text-slate-900">
              추천
            </Badge>
          )}

          <CardHeader>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color}
              flex items-center justify-center text-white mb-4`}>
              <item.icon className="w-6 h-6" />
            </div>
            <CardTitle>{item.title}</CardTitle>
            <p className="text-sm text-slate-500">{item.subtitle}</p>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-slate-600 mb-4">{item.description}</p>
            <ul className="space-y-2">
              {item.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### 11.4 소상공인 업종 선택 (HR_ONLY 전용)

```tsx
// components/onboarding/BusinessTypeSelector.tsx

const BUSINESS_TYPES = [
  { type: 'RESTAURANT', icon: UtensilsCrossed, label: '음식점' },
  { type: 'CAFE', icon: Coffee, label: '카페' },
  { type: 'RETAIL', icon: Store, label: '소매점/편의점' },
  { type: 'BEAUTY', icon: Sparkles, label: '미용/뷰티샵' },
  { type: 'CLINIC', icon: Stethoscope, label: '병원/의원' },
  { type: 'ACADEMY', icon: GraduationCap, label: '학원' },
  { type: 'LOGISTICS', icon: Truck, label: '물류/배송' },
  { type: 'MANUFACTURING', icon: Factory, label: '제조업' },
  { type: 'OTHER', icon: MoreHorizontal, label: '기타' },
]

export function BusinessTypeSelector({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
      {BUSINESS_TYPES.map((item) => (
        <button
          key={item.type}
          onClick={() => onSelect(item.type)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl
            bg-white/70 backdrop-blur border border-slate-200
            hover:border-lime-400 hover:bg-lime-50 transition-all"
        >
          <item.icon className="w-8 h-8 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
```

### 11.5 퀵 설정 플로우 (소상공인용)

```typescript
// 소상공인 퀵 설정 질문 흐름
const HR_ONLY_QUICK_SETUP = [
  {
    step: 1,
    question: '직원들이 주로 어떻게 근무하나요?',
    options: [
      { value: 'FIXED', label: '고정 근무 (예: 9시~6시)', description: '매일 같은 시간' },
      { value: 'SHIFT', label: '교대 근무', description: '오픈/미들/마감' },
      { value: 'FLEXIBLE', label: '자유 출퇴근', description: '시간 자율' },
    ],
    result: 'workPattern'
  },
  {
    step: 2,
    question: '급여는 어떻게 지급하나요?',
    options: [
      { value: 'HOURLY', label: '시급제', description: '시간당 급여' },
      { value: 'MONTHLY', label: '월급제', description: '매월 고정 급여' },
      { value: 'MIXED', label: '혼합', description: '정직원은 월급, 알바는 시급' },
    ],
    result: 'payrollType'
  },
  {
    step: 3,
    question: '2025년 최저시급 (10,030원)을 기준으로 설정할까요?',
    options: [
      { value: true, label: '네, 최저시급 기준으로', description: '10,030원' },
      { value: false, label: '아니오, 직접 입력할게요', description: '커스텀 설정' },
    ],
    result: 'useMinimumWage'
  },
  {
    step: 4,
    question: '주휴수당을 자동 계산할까요?',
    options: [
      { value: true, label: '네, 자동 계산', description: '주 15시간 이상 시 자동 적용' },
      { value: false, label: '아니오, 수동 관리', description: '직접 계산' },
    ],
    result: 'autoWeeklyAllowance'
  },
]

// 설정 결과 → WorkPolicy + PayrollProfile 자동 생성
async function applyQuickSetup(workspaceId: string, answers: QuickSetupAnswers) {
  // 1. WorkPolicy 생성
  await prisma.workPolicy.create({
    data: {
      workspaceId,
      workPattern: answers.workPattern,
      // ...
    }
  })

  // 2. 기본 PayrollProfile 템플릿 생성
  if (answers.useMinimumWage) {
    await prisma.workspaceSettings.update({
      where: { workspaceId },
      data: {
        defaultHourlyWage: 10030, // 2025 최저시급
        autoWeeklyAllowance: answers.autoWeeklyAllowance,
      }
    })
  }
}
```

---

## 12. 사이드바 메뉴 동적 렌더링

### 12.1 기능별 메뉴 표시/숨김

```tsx
// components/layout/Sidebar.tsx

export function Sidebar() {
  const { currentWorkspace } = useWorkspace()
  const features = currentWorkspace?.features

  const menuItems = useMemo(() => {
    const items = []

    // 항상 표시
    items.push({ href: '/dashboard', icon: Home, label: '대시보드' })

    // 프로젝트 기능 (ENTERPRISE, PROJECT_ONLY)
    if (features?.projectEnabled) {
      items.push(
        { href: '/projects', icon: FolderKanban, label: '프로젝트' },
        { href: '/kanban', icon: Columns, label: '칸반' },
        { href: '/gantt', icon: GanttChart, label: '간트' },
      )
    }

    // HR 기능 (ENTERPRISE, HR_ONLY)
    if (features?.attendanceEnabled) {
      items.push({ href: '/hr', icon: Clock, label: '근태관리' })
    }

    if (features?.employeeEnabled) {
      items.push({ href: '/hr/employees', icon: Users, label: '직원관리' })
    }

    // 급여 기능
    if (features?.payrollEnabled) {
      items.push({ href: '/hr/payroll', icon: Wallet, label: '급여관리' })
    }

    // 휴가 기능
    if (features?.leaveEnabled) {
      items.push({ href: '/hr/leave', icon: Calendar, label: '휴가관리' })
    }

    // 공통 기능
    items.push(
      { href: '/settings', icon: Settings, label: '설정' },
    )

    return items
  }, [features])

  return (
    <nav>
      {menuItems.map((item) => (
        <SidebarItem key={item.href} {...item} />
      ))}
    </nav>
  )
}
```

### 12.2 대시보드 위젯 동적 구성

```tsx
// app/(dashboard)/dashboard/page.tsx

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspace()
  const features = currentWorkspace?.features

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* 항상 표시 */}
      <WelcomeCard />

      {/* 프로젝트 기능 있을 때 */}
      {features?.projectEnabled && (
        <>
          <ProjectProgressWidget />
          <RecentTasksWidget />
        </>
      )}

      {/* HR 기능 있을 때 */}
      {features?.attendanceEnabled && (
        <>
          <AttendanceWidget />
          <WorkHoursWidget />
        </>
      )}

      {/* 급여 기능 있을 때 */}
      {features?.payrollEnabled && (
        <PayrollSummaryWidget />
      )}

      {/* 휴가 기능 있을 때 */}
      {features?.leaveEnabled && (
        <LeaveBalanceWidget />
      )}
    </div>
  )
}
```

---

## 13. 결론

현재 WorkB CMS는 기본적인 프로젝트 관리와 출퇴근 기록 기능을 갖추고 있습니다.
job.md의 HRIS 설계를 구현하기 위해서는:

1. **13개 신규 모델** 추가 필요
2. **급여 계산 엔진** 개발 필요
3. **PDF 파서 서비스** 개발 필요
4. **5주 개발 기간** 예상

### 사용자 그룹별 지원 (신규 추가)

| 그룹 | 주요 기능 | 타겟 |
|------|----------|------|
| **Enterprise** | 프로젝트 + HR + 급여 | 스타트업, IT회사, 중소기업 |
| **HR Only** | 근태 + 급여 (간소화) | 음식점, 카페, 소매점 |
| **Project Only** | 프로젝트 관리만 | 프리랜서, 에이전시 |

### 온보딩 플로우

1. **가입 시 워크스페이스 타입 선택** → 불필요한 기능 OFF
2. **소상공인 퀵 설정** → 5단계 질문으로 자동 정책 생성
3. **직원 셀프 온보딩** → 필수정보 입력 → 인사기록카드 자동 완성

점진적 마이그레이션을 통해 기존 데이터를 보존하면서 새로운 HRIS 기능을 추가할 수 있습니다.
