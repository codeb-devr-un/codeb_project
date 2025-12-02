# 🏢 WorkB HRIS 시스템 설계 문서  
**(근태 + 인사 + 급여 + 이력서 자동입력 + 온보딩 자동화)**  
Version: v1.0  
Last updated: 2025-11-30  
Author: CODEB

---

## 📌 0. 시스템 개요

WorkB HRIS는 **근태 관리 → 급여 계산 → 인사기록카드 자동 생성 → 전자결재 승인**까지  
인사 운영 프로세스를 자동화하는 SaaS이다.

핵심 목표:

- ☐ 사람이 데이터를 반복 입력하는 일을 제거  
- ☐ 근로계약/근무유형/근태 데이터를 기반으로 급여 자동 계산  
- ☐ 사람인·잡코리아 PDF 이력서를 업로드하면 인사기록카드 자동 생성  
- ☐ 직원 개별 로그인 시 추가 정보 입력 → 인사카드 자동 완성  
- ☐ 회사 규모별 세팅: **퀵 모드(스타트업) / 고급모드(기업 HR)** 제공  

---

## 📌 1. 도메인 구조

| 모듈 | 기능 |
|------|------|
| HR Core | 인사기록카드, 조직 구조, 직급/직책, 고용형태 |
| Resume Parser Module | 사람인/잡코리아 PDF → 구조화 데이터 |
| Onboarding Module | 직원 로그인 → 필수 정보 입력 → 인사카드 완료 |
| Attendance Module | 출퇴근 기록, 휴가, 스케줄, 근무유형 |
| Payroll Engine | 근태 기반 급여 계산, 공제 적용, 명세서 생성 |
| Approval Workflow | 근태 수정, 휴가 승인, 급여 확정 승인 |
| Workspace & RBAC | 대표/HR/팀장/직원 권한 설정 |

---

## 📌 2. 인사기록카드 자동화 프로세스

### 2.1 입력 방식

| 입력 방식 | 자동화 수준 | 사용 시점 |
|----------|------------|-----------|
| HR 직접 입력 | Low | 사용자가 적은 초기 |
| PDF 업로드(사람인/잡코리아) | High | 신규 입사자 대량 등록 |
| 직원 Self 입력 | Mandatory | 최초 로그인 시 |

---

### 2.2 PDF → 구조화 데이터 변환 알고리즘

1. HR이 PDF 업로드  
2. 시스템이 PDF 소스 판별  
   - `"saramin.co.kr"` → SaraminParser  
   - `"jobkorea.co.kr"` → JobKoreaParser  
3. 이름, 연락처, 이메일, 학력, 경력, 자격증, 주소, 사진 등 추출  
4. 표준화된 구조(`ParsedResume`)로 저장  

```ts
ParsedResume {
  name,
  phone,
  email,
  birthDate?,
  gender?,
  education[],
  experience[],
  certificates[],
  address?,
  skills[],
}
2.3 인사기록카드 생성

PDF에서 추출된 필드 매핑:

Parsed Field
인사기록카드 필드
name
nameKor
phone
mobile
email
email
address
address
experience
employee_experience[]
education
education[]
certificates
certificate[]
상태값 → ONBOARDING_DRAFT
2.4 직원 온보딩 자동화

직원 최초 로그인 시:
필수정보 체크 → 미입력 필드 알림 → 완료 후 자동 상태 변경
필수 입력 항목:
	•	주민등록번호 or 생년월일+성별
	•	주소 상세
	•	은행명, 계좌번호
	•	긴급 연락처
	•	세금 감면 정보(간단 버전)

완료되면:
Employee.status = "ACTIVE"
Onboarding.status = "COMPLETED"
3. 회사 근태·급여 설정 : 퀵 모드 + 고급 모드

3.1 퀵설정 질문 흐름

Step
질문
결과
1
국가 선택
2025 한국 근로기준법 preset
2
근무형태
고정근로 / 유연근로 / 자율근무
3
재택근무 여부
GPS/WIFI 인증 여부 설정
4
알바 사용 여부
시급제 정책 활성화
5
연차 정책 선택
법정 기준 적용 or custom
6
요약 → 적용
HR 확인 → 대표 승인
적용 후 상태 → POLICY_VERSION: ACTIVE

4. 근로계약 및 급여 프로파일 자동 구성

4.1 EmploymentContract 모델

EmploymentContract {
  employeeId,
  contractType,
  workPattern,
  baseSalaryMonthly?,
  hourlyWage?,
  workingHoursPerWeek,
}

4.2 PayrollProfile 모델

PayrollProfile {
  payrollType: "MONTHLY" | "HOURLY" | "FREELANCER",
  baseSalaryMonthly?,
  hourlyWage?,
  overtimeMultiplier,
  nightMultiplier,
  holidayMultiplier,
  fixedAllowances[],
  deductionProfileId,
}

5. 근태 → 급여 계산 엔진

5.1 배치 로직 흐름

근태로그 수집 → 근무유형 분류 → AttendanceSummary 생성 → PayrollSlip 생성

AttendanceSummary 구조

AttendanceSummary {
  normalHours,
  overtimeHours,
  nightHours,
  holidayHours,
  paidLeaveHours,
  unpaidHours
}

5.2 급여 계산 공식

정규직(월급제)

기본시급 = 월급 / 소정근로시간

본급 = 기본시급 × (정상근로 + 유급휴가 - 무급)
연장수당 = 기본시급 × 연장근로 × 1.5
야간수당 = 기본시급 × 야간근로 × 1.5
휴일수당 = 기본시급 × 휴일근로 × 1.5~2.0
총지급액 = 본급 + 수당 + 고정수당


알바(시급제)
총지급 = 시급 × 정상근무시간
       + 시급 × 연장근로 × 가산율
 
 6. 급여 확정 프로세스
[초안 생성] → HR 검토 → 대표 전자결재 승인 → 확정(Locked)

확정 후 수정 = 다음월 정산 처리


7. 권한(RBAC)

역할
권한
대표
최종 승인 / 정책 버전 확정
HR Admin
규칙 수정 / 급여계산 / 근태 조정
팀장
휴가/근태 승인
직원
출퇴근, 휴가 요청, 급여명세서 확인


8. 기술 스택 제안

레이어
기술
Backend
Node.js (NestJS), TypeScript
DB
PostgreSQL + Prisma ORM
Queue
BullMQ (Redis)
Parsing
pdf.js, 추가 Python microservice (pdfplumber)
Frontend
Next.js 14, App Router, Tailwind, shadcn UI


9. 향후 개발 단계
	•	Prisma Schema 생성
	•	ERD 다이어그램 확정
	•	PDF 파서 규칙 최적화
	•	온보딩 UX 와이어프레임 제작
	•	Payroll Engine 테스트 데이터 시뮬레이션


본 시스템은
이력서 → 인사기록카드 → 계약정보 → 근태 → 급여 → 전자결재까지
단일 자동화 로직으로 연결되며,
관리자는 설정만 하면 HR 행정이 반복되지 않는다.

