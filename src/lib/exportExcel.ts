import * as XLSX from 'xlsx'
import type { Employee, ShiftAssignment } from '@/types'

function formatMonthId(d: Date) {
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function exportMonthToExcel(
  employees: Employee[],
  assignments: ShiftAssignment[],
  monthStart: Date,
) {
  const y = monthStart.getFullYear()
  const m = monthStart.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`

  const monthAssignments = assignments.filter((a) => a.date.startsWith(prefix))

  // Header row: Nama | Posisi | 1 | 2 | ... | N | Total Pagi | Total Malam | Total Shift | Total Jam
  const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const headers = ['Nama', 'Posisi', ...dateHeaders.map(String), 'Total Pagi', 'Total Malam', 'Total Shift', 'Total Jam']

  const rows: (string | number)[][] = [headers]

  for (const emp of employees) {
    let pagi = 0
    let malam = 0
    const cells: string[] = dateHeaders.map((day) => {
      const dateStr = `${prefix}${String(day).padStart(2, '0')}`
      const a = monthAssignments.find((x) => x.employeeId === emp.id && x.date === dateStr)
      if (!a) return '-'
      if (a.shift === 'pagi') { pagi++; return 'P' }
      malam++; return 'M'
    })
    rows.push([emp.name, emp.position, ...cells, pagi, malam, pagi + malam, (pagi + malam) * 12])
  }

  // Footer: coverage per day (how many pagi/malam assigned)
  const coverageRow = ['Coverage Pagi', '', ...dateHeaders.map((day) => {
    const dateStr = `${prefix}${String(day).padStart(2, '0')}`
    return monthAssignments.filter((a) => a.date === dateStr && a.shift === 'pagi').length
  }), '', '', '', '']
  const coverageMalamRow = ['Coverage Malam', '', ...dateHeaders.map((day) => {
    const dateStr = `${prefix}${String(day).padStart(2, '0')}`
    return monthAssignments.filter((a) => a.date === dateStr && a.shift === 'malam').length
  }), '', '', '', '']
  rows.push(coverageRow, coverageMalamRow)

  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal')

  const filename = `Jadwal-${formatMonthId(monthStart).replace(' ', '-')}.xlsx`
  XLSX.writeFile(wb, filename)
}
