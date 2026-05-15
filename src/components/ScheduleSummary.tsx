import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Employee, ShiftAssignment } from '@/types'

interface Props {
  employees: Employee[]
  assignments: ShiftAssignment[]
  monthStart: Date
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function ScheduleSummary({ employees, assignments, monthStart }: Props) {
  const { employeeStats, totals, gaps } = useMemo(() => {
    const y = monthStart.getFullYear()
    const m = monthStart.getMonth()
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`

    const monthAssignments = assignments.filter((a) => a.date.startsWith(prefix))

    // Per employee stats
    const statMap = new Map<string, { pagi: number; malam: number }>()
    for (const emp of employees) statMap.set(emp.id, { pagi: 0, malam: 0 })
    for (const a of monthAssignments) {
      const s = statMap.get(a.employeeId)
      if (s) s[a.shift]++
    }

    const employeeStats = employees.map((emp) => {
      const s = statMap.get(emp.id) ?? { pagi: 0, malam: 0 }
      return { ...emp, pagi: s.pagi, malam: s.malam, total: s.pagi + s.malam }
    })

    const totalPagi = monthAssignments.filter((a) => a.shift === 'pagi').length
    const totalMalam = monthAssignments.filter((a) => a.shift === 'malam').length
    const totals = {
      shift: monthAssignments.length,
      pagi: totalPagi,
      malam: totalMalam,
      jam: monthAssignments.length * 12,
    }

    // Coverage gaps: days without pagi or malam
    const gaps: { date: string; missing: ('pagi' | 'malam')[] }[] = []
    const totalDays = daysInMonth(monthStart)
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = formatDate(y, m, day)
      const dayAssignments = monthAssignments.filter((a) => a.date === dateStr)
      const hasPagi = dayAssignments.some((a) => a.shift === 'pagi')
      const hasMalam = dayAssignments.some((a) => a.shift === 'malam')
      const missing: ('pagi' | 'malam')[] = []
      if (!hasPagi) missing.push('pagi')
      if (!hasMalam) missing.push('malam')
      if (missing.length) gaps.push({ date: dateStr, missing })
    }

    return { employeeStats, totals, gaps }
  }, [employees, assignments, monthStart])

  if (totals.shift === 0) return null

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ringkasan Bulan Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-muted/40 p-3 text-center">
            <p className="text-2xl font-bold">{totals.shift}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Shift</p>
          </div>
          <div className="rounded-lg border bg-amber-50 border-amber-200 p-3 text-center">
            <p className="text-2xl font-bold text-amber-800">{totals.pagi}</p>
            <p className="text-xs text-amber-600 mt-0.5">Shift Pagi</p>
          </div>
          <div className="rounded-lg border bg-indigo-50 border-indigo-200 p-3 text-center">
            <p className="text-2xl font-bold text-indigo-800">{totals.malam}</p>
            <p className="text-xs text-indigo-600 mt-0.5">Shift Malam</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 text-center">
            <p className="text-2xl font-bold">{totals.jam}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Jam</p>
          </div>
        </div>

        {/* Per-employee table */}
        <div>
          <p className="text-sm font-medium mb-2">Per Karyawan</p>
          <div className="rounded-lg border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[360px]">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground text-xs">
                  <th className="text-left px-3 py-2 font-medium">Nama</th>
                  <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Posisi</th>
                  <th className="text-center px-3 py-2 font-medium">Pagi</th>
                  <th className="text-center px-3 py-2 font-medium">Malam</th>
                  <th className="text-center px-3 py-2 font-medium">Total</th>
                  <th className="text-center px-3 py-2 font-medium hidden sm:table-cell">Jam</th>
                </tr>
              </thead>
              <tbody>
                {employeeStats.map((emp, i) => (
                  <tr key={emp.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="px-3 py-2 font-medium">{emp.name}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{emp.position}</td>
                    <td className="px-3 py-2 text-center">
                      {emp.pagi > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                          {emp.pagi}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {emp.malam > 0 ? (
                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100">
                          {emp.malam}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center font-medium">{emp.total}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground hidden sm:table-cell">{emp.total * 12}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coverage gaps */}
        {gaps.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">Hari belum tercover ({gaps.length} hari)</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {gaps.map(({ date, missing }) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1 rounded-md bg-yellow-100 border border-yellow-200 px-2 py-0.5 text-xs text-yellow-800"
                >
                  {formatDayLabel(date)}
                  <span className="opacity-60">
                    ({missing.map((s) => (s === 'pagi' ? 'P' : 'M')).join('+')})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
