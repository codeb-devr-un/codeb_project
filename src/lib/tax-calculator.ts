// =============================================================================
// 세금 계산기 - 2025년 한국 근로소득 간이세액표 기준
// =============================================================================

/**
 * 2025년 근로소득 간이세액표 (월급여 기준)
 * 국세청 간이세액표 기준으로 작성
 * https://www.nts.go.kr/
 */

// 부양가족 수에 따른 공제액 (월 기준, 원)
const DEPENDENT_DEDUCTION_PER_PERSON = 150000 // 1인당 월 15만원

// 간이세액표 구간 (월급여 기준)
interface TaxBracket {
  min: number
  max: number
  baseRate: number // 기본 세율
  baseAmount: number // 기본 세액
}

// 2025년 간이세액표 (근사치, 실제 국세청 표 기준)
const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 1060000, baseRate: 0, baseAmount: 0 },
  { min: 1060000, max: 1500000, baseRate: 0.06, baseAmount: 0 },
  { min: 1500000, max: 3000000, baseRate: 0.06, baseAmount: 26400 },
  { min: 3000000, max: 4500000, baseRate: 0.15, baseAmount: 116400 },
  { min: 4500000, max: 6000000, baseRate: 0.15, baseAmount: 341400 },
  { min: 6000000, max: 8000000, baseRate: 0.24, baseAmount: 566400 },
  { min: 8000000, max: 10000000, baseRate: 0.24, baseAmount: 1046400 },
  { min: 10000000, max: 14000000, baseRate: 0.35, baseAmount: 1526400 },
  { min: 14000000, max: 28000000, baseRate: 0.35, baseAmount: 2926400 },
  { min: 28000000, max: 30000000, baseRate: 0.38, baseAmount: 7826400 },
  { min: 30000000, max: 45000000, baseRate: 0.38, baseAmount: 8586400 },
  { min: 45000000, max: 87000000, baseRate: 0.40, baseAmount: 14286400 },
  { min: 87000000, max: 100000000, baseRate: 0.42, baseAmount: 31086400 },
  { min: 100000000, max: Infinity, baseRate: 0.45, baseAmount: 36546400 },
]

// 4대보험 요율 (2025년 기준)
export const INSURANCE_RATES = {
  // 국민연금 (근로자 4.5%, 사업주 4.5%)
  nationalPension: {
    employee: 0.045,
    employer: 0.045,
    maxMonthlyWage: 5900000, // 기준소득월액 상한 (2025년)
    minMonthlyWage: 370000,  // 기준소득월액 하한
  },
  // 건강보험 (근로자 3.545%, 사업주 3.545%)
  healthInsurance: {
    employee: 0.03545,
    employer: 0.03545,
  },
  // 장기요양보험 (건강보험료의 12.95%)
  longTermCare: {
    rate: 0.1295,
  },
  // 고용보험 (근로자 0.9%, 사업주 0.9%~1.65%)
  employmentInsurance: {
    employee: 0.009,
    employerBase: 0.009,
    // 사업주 추가 요율 (150인 미만: 0.25%, 150~1000인: 0.45%, 1000인 이상: 0.65%, 우선지원대상: 0.25%)
  },
  // 산재보험 (사업주 전액 부담, 업종별 상이)
  industrialAccident: {
    // 업종별 요율 상이 (0.6%~34%)
    defaultRate: 0.007, // 사무직 기준
  },
}

// 2025년 최저임금
export const MINIMUM_WAGE_2025 = {
  hourly: 10030, // 시급
  monthly: 2096270, // 월급 (209시간 기준)
  weekly: 40, // 주 40시간
  dailyHours: 8,
}

/**
 * 근로소득세 계산 (간이세액표 기준)
 * @param monthlyWage 월 급여 (비과세 제외)
 * @param dependents 부양가족 수 (본인 포함)
 * @param taxExemptionRate 세액 감면율 (0~1)
 */
export function calculateIncomeTax(
  monthlyWage: number,
  dependents: number = 1,
  taxExemptionRate: number = 0
): { incomeTax: number; localTax: number; totalTax: number } {
  // 부양가족 공제 적용
  const taxableWage = Math.max(0, monthlyWage - (dependents * DEPENDENT_DEDUCTION_PER_PERSON))

  // 해당 구간 찾기
  let incomeTax = 0
  for (const bracket of TAX_BRACKETS) {
    if (taxableWage >= bracket.min && taxableWage < bracket.max) {
      if (taxableWage <= 1060000) {
        incomeTax = 0
      } else {
        incomeTax = bracket.baseAmount + Math.floor((taxableWage - bracket.min) * bracket.baseRate)
      }
      break
    }
  }

  // 세액 감면 적용
  incomeTax = Math.floor(incomeTax * (1 - taxExemptionRate))

  // 지방소득세 (소득세의 10%)
  const localTax = Math.floor(incomeTax * 0.1)

  return {
    incomeTax,
    localTax,
    totalTax: incomeTax + localTax,
  }
}

/**
 * 4대보험료 계산
 * @param monthlyWage 월 급여
 */
export function calculateInsurance(monthlyWage: number): {
  nationalPension: number
  healthInsurance: number
  longTermCare: number
  employmentInsurance: number
  totalEmployee: number
  totalEmployer: number
} {
  const rates = INSURANCE_RATES

  // 국민연금 (상한/하한 적용)
  const pensionWage = Math.min(
    Math.max(monthlyWage, rates.nationalPension.minMonthlyWage),
    rates.nationalPension.maxMonthlyWage
  )
  const nationalPension = Math.floor(pensionWage * rates.nationalPension.employee)

  // 건강보험
  const healthInsurance = Math.floor(monthlyWage * rates.healthInsurance.employee)

  // 장기요양보험 (건강보험료 기준)
  const longTermCare = Math.floor(healthInsurance * rates.longTermCare.rate)

  // 고용보험
  const employmentInsurance = Math.floor(monthlyWage * rates.employmentInsurance.employee)

  // 사업주 부담분
  const employerNationalPension = Math.floor(pensionWage * rates.nationalPension.employer)
  const employerHealthInsurance = Math.floor(monthlyWage * rates.healthInsurance.employer)
  const employerLongTermCare = Math.floor(employerHealthInsurance * rates.longTermCare.rate)
  const employerEmploymentInsurance = Math.floor(monthlyWage * rates.employmentInsurance.employerBase)
  const industrialAccident = Math.floor(monthlyWage * rates.industrialAccident.defaultRate)

  return {
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    totalEmployee: nationalPension + healthInsurance + longTermCare + employmentInsurance,
    totalEmployer: employerNationalPension + employerHealthInsurance + employerLongTermCare +
                   employerEmploymentInsurance + industrialAccident,
  }
}

/**
 * 연장/야간/휴일 수당 계산
 * @param hourlyWage 통상시급
 * @param overtimeHours 연장근로시간
 * @param nightHours 야간근로시간 (22:00~06:00)
 * @param holidayHours 휴일근로시간
 * @param holidayOvertimeHours 휴일연장근로시간
 */
export function calculateOvertimePay(
  hourlyWage: number,
  overtimeHours: number = 0,
  nightHours: number = 0,
  holidayHours: number = 0,
  holidayOvertimeHours: number = 0
): {
  overtimePay: number
  nightPay: number
  holidayPay: number
  holidayOvertimePay: number
  totalExtra: number
} {
  // 근로기준법 제56조 기준
  const overtimePay = Math.floor(hourlyWage * 1.5 * overtimeHours) // 150%
  const nightPay = Math.floor(hourlyWage * 0.5 * nightHours) // 추가 50% (기본급 별도)
  const holidayPay = Math.floor(hourlyWage * 1.5 * holidayHours) // 150%
  const holidayOvertimePay = Math.floor(hourlyWage * 2.0 * holidayOvertimeHours) // 200%

  return {
    overtimePay,
    nightPay,
    holidayPay,
    holidayOvertimePay,
    totalExtra: overtimePay + nightPay + holidayPay + holidayOvertimePay,
  }
}

/**
 * 주휴수당 계산
 * @param weeklyHours 주간 근무시간
 * @param hourlyWage 시급
 */
export function calculateWeeklyAllowance(weeklyHours: number, hourlyWage: number): number {
  // 주 15시간 이상 근무 시 주휴수당 발생
  if (weeklyHours < 15) return 0

  // 주휴시간 = (1주 소정근로시간 / 40) × 8
  const weeklyAllowanceHours = Math.min((weeklyHours / 40) * 8, 8)
  return Math.floor(weeklyAllowanceHours * hourlyWage)
}

/**
 * 퇴직금 계산
 * @param averageWage3Months 최근 3개월 평균 임금 (일당)
 * @param totalWorkDays 총 근무일수
 */
export function calculateSeverancePay(
  averageWage3Months: number,
  totalWorkDays: number
): {
  severancePay: number
  yearsOfService: number
  eligibleForSeverance: boolean
} {
  // 1년 이상 근무 시 퇴직금 지급
  const yearsOfService = totalWorkDays / 365
  const eligibleForSeverance = totalWorkDays >= 365

  if (!eligibleForSeverance) {
    return {
      severancePay: 0,
      yearsOfService,
      eligibleForSeverance,
    }
  }

  // 퇴직금 = 1일 평균임금 × 30일 × (근속연수)
  const severancePay = Math.floor(averageWage3Months * 30 * yearsOfService)

  return {
    severancePay,
    yearsOfService,
    eligibleForSeverance,
  }
}

/**
 * 연차휴가 발생일수 계산 (근로기준법 제60조)
 * @param workStartDate 입사일
 * @param asOfDate 기준일
 */
export function calculateAnnualLeave(
  workStartDate: Date,
  asOfDate: Date = new Date()
): {
  totalDays: number
  usedDays: number
  remainingDays: number
  yearsOfService: number
  monthsInFirstYear: number
} {
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = Math.floor((asOfDate.getTime() - workStartDate.getTime()) / msPerDay)
  const yearsOfService = totalDays / 365

  let annualLeaveDays = 0

  if (yearsOfService < 1) {
    // 1년 미만: 1개월 개근 시 1일씩 (최대 11일)
    const monthsWorked = Math.floor(totalDays / 30)
    annualLeaveDays = Math.min(monthsWorked, 11)
  } else {
    // 1년 이상: 기본 15일 + 2년마다 1일 추가 (최대 25일)
    const additionalDays = Math.floor((yearsOfService - 1) / 2)
    annualLeaveDays = Math.min(15 + additionalDays, 25)
  }

  return {
    totalDays: annualLeaveDays,
    usedDays: 0, // 실제 사용량은 LeaveBalance에서 조회
    remainingDays: annualLeaveDays,
    yearsOfService,
    monthsInFirstYear: yearsOfService < 1 ? Math.floor(totalDays / 30) : 0,
  }
}

/**
 * 월급에서 통상시급 계산
 * @param monthlySalary 월급
 * @param monthlyHours 월 소정근로시간 (기본 209시간)
 */
export function calculateHourlyWage(monthlySalary: number, monthlyHours: number = 209): number {
  return Math.floor(monthlySalary / monthlyHours)
}

/**
 * 전체 급여 계산 (급여명세서용)
 */
export function calculateFullPayroll(params: {
  baseSalary: number
  dependents?: number
  taxExemptionRate?: number
  overtimeHours?: number
  nightHours?: number
  holidayHours?: number
  holidayOvertimeHours?: number
  weeklyHours?: number
  bonusPay?: number
  otherAllowance?: number
  otherDeduction?: number
}): {
  // 지급 항목
  basePay: number
  overtimePay: number
  nightPay: number
  holidayPay: number
  weeklyAllowance: number
  bonusPay: number
  otherAllowance: number
  grossPay: number
  // 공제 항목
  nationalPension: number
  healthInsurance: number
  longTermCare: number
  employmentInsurance: number
  incomeTax: number
  localTax: number
  otherDeduction: number
  totalDeduction: number
  // 실수령액
  netPay: number
  // 사업주 부담분
  employerTotal: number
} {
  const {
    baseSalary,
    dependents = 1,
    taxExemptionRate = 0,
    overtimeHours = 0,
    nightHours = 0,
    holidayHours = 0,
    holidayOvertimeHours = 0,
    weeklyHours = 40,
    bonusPay = 0,
    otherAllowance = 0,
    otherDeduction = 0,
  } = params

  // 통상시급 계산
  const hourlyWage = calculateHourlyWage(baseSalary)

  // 연장/야간/휴일 수당
  const overtime = calculateOvertimePay(
    hourlyWage,
    overtimeHours,
    nightHours,
    holidayHours,
    holidayOvertimeHours
  )

  // 주휴수당 (시급제인 경우만)
  const weeklyAllowance = 0 // 월급제는 기본급에 포함

  // 총 지급액
  const grossPay = baseSalary + overtime.totalExtra + bonusPay + otherAllowance + weeklyAllowance

  // 4대보험 계산
  const insurance = calculateInsurance(baseSalary) // 기본급 기준

  // 소득세 계산
  const tax = calculateIncomeTax(grossPay, dependents, taxExemptionRate)

  // 총 공제액
  const totalDeduction = insurance.totalEmployee + tax.totalTax + otherDeduction

  // 실수령액
  const netPay = grossPay - totalDeduction

  return {
    basePay: baseSalary,
    overtimePay: overtime.overtimePay,
    nightPay: overtime.nightPay,
    holidayPay: overtime.holidayPay + overtime.holidayOvertimePay,
    weeklyAllowance,
    bonusPay,
    otherAllowance,
    grossPay,
    nationalPension: insurance.nationalPension,
    healthInsurance: insurance.healthInsurance,
    longTermCare: insurance.longTermCare,
    employmentInsurance: insurance.employmentInsurance,
    incomeTax: tax.incomeTax,
    localTax: tax.localTax,
    otherDeduction,
    totalDeduction,
    netPay,
    employerTotal: insurance.totalEmployer,
  }
}
