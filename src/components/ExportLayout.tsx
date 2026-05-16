import { useMemo } from 'react'
import type { Employee, ShiftAssignment } from '@/types'

interface Props {
  employees: Employee[]
  assignments: ShiftAssignment[]
  monthStart: Date
}

const DAY_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
// Monday-first order
const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

function localDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatMonthLabel(d: Date) {
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function ExportLayout({ employees, assignments, monthStart }: Props) {
  const y = monthStart.getFullYear()
  const m = monthStart.getMonth()
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`
  const monthLabel = formatMonthLabel(monthStart)

  const { cells, empStats, totals } = useMemo(() => {
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const firstDay = new Date(y, m, 1)
    const leadingBlanks = mondayIndex(firstDay)
    const total = leadingBlanks + daysInMonth
    const gridSize = Math.ceil(total / 7) * 7

    const monthAssignments = assignments.filter((a) => a.date.startsWith(prefix))
    const empMap = Object.fromEntries(employees.map((e) => [e.id, e]))

    // Build assignment map
    const byDate: Record<string, { pagi: string[]; malam: string[] }> = {}
    for (const a of monthAssignments) {
      if (!byDate[a.date]) byDate[a.date] = { pagi: [], malam: [] }
      const emp = empMap[a.employeeId]
      if (emp) byDate[a.date][a.shift].push(emp.name.split(' ')[0])
    }

    const cells = Array.from({ length: gridSize }, (_, i) => {
      const d = i - leadingBlanks + 1
      if (d < 1 || d > daysInMonth) return null
      const date = localDateStr(y, m, d)
      const dayOfWeek = DAY_ID[new Date(y, m, d).getDay()]
      return { d, date, dayOfWeek, ...(byDate[date] ?? { pagi: [], malam: [] }) }
    })

    // Per-employee stats
    const statMap = new Map<string, { pagi: number; malam: number }>()
    for (const emp of employees) statMap.set(emp.id, { pagi: 0, malam: 0 })
    for (const a of monthAssignments) {
      const s = statMap.get(a.employeeId)
      if (s) s[a.shift]++
    }
    const empStats = employees.map((emp) => {
      const s = statMap.get(emp.id) ?? { pagi: 0, malam: 0 }
      return { id: emp.id, name: emp.name, position: emp.position, ...s, total: s.pagi + s.malam }
    })

    const totalPagi = monthAssignments.filter((a) => a.shift === 'pagi').length
    const totalMalam = monthAssignments.filter((a) => a.shift === 'malam').length
    const totals = { shift: monthAssignments.length, pagi: totalPagi, malam: totalMalam, jam: monthAssignments.length * 12 }

    return { cells, empStats, totals }
  }, [employees, assignments, monthStart])

  const td: React.CSSProperties = {
    padding: '6px 10px',
    borderBottom: '1px solid #E5E7EB',
    borderRight: '1px solid #E5E7EB',
    fontSize: 13,
    color: '#111827',
  }
  const tdC = { ...td, textAlign: 'center' as const }

  return (
    <div style={{ width: 1120, backgroundColor: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A5F 100%)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>
            JADWAL SHIFT KARYAWAN
          </div>
          <div style={{ color: '#BFDBFE', fontSize: 14, marginTop: 4 }}>
            {monthLabel.toUpperCase()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Karyawan', value: employees.length, bg: '#1E40AF', color: '#BFDBFE' },
            { label: 'Total Shift', value: totals.shift, bg: '#92400E', color: '#FDE68A' },
            { label: 'Total Jam', value: totals.jam, bg: '#1E3A5F', color: '#C7D2FE' },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ backgroundColor: bg, borderRadius: 8, padding: '8px 16px', textAlign: 'center', minWidth: 72 }}>
              <div style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</div>
              <div style={{ color, fontSize: 10, opacity: 0.8, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendar ── */}
      <div style={{ padding: '20px 24px 0' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAY_HEADERS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B7280', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={`blank-${i}`} style={{ minHeight: 80, backgroundColor: '#F9FAFB', borderRadius: 6 }} />
            const isWeekend = cell.dayOfWeek === 'Sab' || cell.dayOfWeek === 'Min'
            return (
              <div
                key={cell.date}
                style={{
                  minHeight: 80,
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                  backgroundColor: isWeekend ? '#F8FAFF' : '#FFFFFF',
                  padding: '6px 6px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{cell.d}</span>
                  <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500 }}>{cell.dayOfWeek}</span>
                </div>
                {cell.pagi.length > 0 && (
                  <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 4, padding: '2px 4px' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#78350F', textTransform: 'uppercase', lineHeight: 1.2 }}>Pagi</div>
                    <div style={{ fontSize: 9, color: '#92400E', fontWeight: 500, lineHeight: 1.3 }}>
                      {cell.pagi.slice(0, 3).join(', ')}{cell.pagi.length > 3 ? ` +${cell.pagi.length - 3}` : ''}
                    </div>
                  </div>
                )}
                {cell.malam.length > 0 && (
                  <div style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 4, padding: '2px 4px' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#3730A3', textTransform: 'uppercase', lineHeight: 1.2 }}>Malam</div>
                    <div style={{ fontSize: 9, color: '#4338CA', fontWeight: 500, lineHeight: 1.3 }}>
                      {cell.malam.slice(0, 3).join(', ')}{cell.malam.length > 3 ? ` +${cell.malam.length - 3}` : ''}
                    </div>
                  </div>
                )}
                {cell.pagi.length === 0 && cell.malam.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, color: '#D1D5DB' }}>—</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Ringkasan ── */}
      <div style={{ padding: '20px 24px 0' }}>
        {/* Section title */}
        <div style={{ backgroundColor: '#374151', color: '#ffffff', padding: '6px 12px', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', borderRadius: '6px 6px 0 0' }}>
          RINGKASAN
        </div>

        {/* Stat boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid #E5E7EB', borderTop: 'none' }}>
          {[
            { label: 'Total Shift', value: totals.shift, bg: '#F9FAFB', color: '#111827' },
            { label: 'Shift Pagi', value: totals.pagi, bg: '#FFFBEB', color: '#78350F' },
            { label: 'Shift Malam', value: totals.malam, bg: '#EEF2FF', color: '#3730A3' },
            { label: 'Total Jam', value: totals.jam, bg: '#F9FAFB', color: '#111827' },
          ].map(({ label, value, bg, color }, i) => (
            <div key={label} style={{ backgroundColor: bg, padding: '12px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid #E5E7EB' : 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Employee table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E5E7EB', borderTop: 'none' }}>
          <thead>
            <tr style={{ backgroundColor: '#4B5563' }}>
              {['No', 'Nama', 'Jabatan', 'Pagi', 'Malam', 'Total Shift', 'Total Jam'].map((h, i) => (
                <th key={h} style={{ ...tdC, color: '#fff', fontWeight: 700, backgroundColor: '#4B5563', textAlign: i <= 2 ? 'left' : 'center' as 'left' | 'center' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empStats.map((emp, i) => (
              <tr key={emp.id} style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                <td style={tdC}>{i + 1}</td>
                <td style={{ ...td, fontWeight: 500 }}>{emp.name}</td>
                <td style={{ ...td, color: '#6B7280' }}>{emp.position}</td>
                <td style={{ ...tdC, color: '#78350F', fontWeight: 600, backgroundColor: i % 2 === 0 ? '#FFFBEB' : '#FFF7E6' }}>{emp.pagi}</td>
                <td style={{ ...tdC, color: '#3730A3', fontWeight: 600, backgroundColor: i % 2 === 0 ? '#EEF2FF' : '#E8ECFF' }}>{emp.malam}</td>
                <td style={{ ...tdC, fontWeight: 600 }}>{emp.total}</td>
                <td style={tdC}>{emp.total * 12}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, padding: '10px 0 20px', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>KETERANGAN:</span>
          {[
            { code: 'P', label: 'Shift Pagi', time: '08:00 – 20:00', bg: '#FEF3C7', border: '#FDE68A', color: '#78350F' },
            { code: 'M', label: 'Shift Malam', time: '20:00 – 08:00', bg: '#EEF2FF', border: '#C7D2FE', color: '#3730A3' },
            { code: '—', label: 'Libur', time: 'Tidak bertugas', bg: '#F3F4F6', border: '#D1D5DB', color: '#6B7280' },
          ].map(({ code, label, time, bg, border, color }) => (
            <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '4px 10px' }}>
              <span style={{ fontWeight: 700, fontSize: 12, color }}>{code}</span>
              <span style={{ fontSize: 11, color, fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 10, color, opacity: 0.7 }}>{time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
