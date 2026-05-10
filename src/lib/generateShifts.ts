import type { Employee, ShiftAssignment, ShiftType } from '@/types'

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

  let counter = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const shifts: { shift: ShiftType; idx: number }[] = [
      { shift: 'pagi', idx: counter % n },
      { shift: 'malam', idx: (counter + 1) % n },
    ]
    for (const { shift, idx } of shifts) {
      results.push({ employeeId: employees[idx].id, date, shift, notes: '' })
    }
    counter += 2
  }

  return results
}
