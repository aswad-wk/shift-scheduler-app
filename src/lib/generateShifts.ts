import type { Employee, ShiftAssignment } from '@/types'

export function generateShifts(
  employees: Employee[],
  month: Date,
): Omit<ShiftAssignment, 'id'>[] {
  if (employees.length === 0) return []

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const results: Omit<ShiftAssignment, 'id'>[] = []
  const n = employees.length

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const d = day - 1
    results.push({ employeeId: employees[d % n].id, date, shift: 'pagi', notes: '' })
    results.push({ employeeId: employees[(d + 1) % n].id, date, shift: 'malam', notes: '' })
  }

  return results
}
