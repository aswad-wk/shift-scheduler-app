import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Employee, ShiftAssignment } from '@/types'

interface Props {
  employees: Employee[]
  assignments: ShiftAssignment[]
  monthStart: Date
  onDayClick: (date: string) => void
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function mondayIndex(date: Date) {
  // 0=Mon … 6=Sun
  return (date.getDay() + 6) % 7
}

export function MonthCalendar({ assignments, monthStart, onDayClick }: Props) {
  const todayStr = formatDate(new Date())

  const cells = useMemo(() => {
    const firstDay = startOfMonth(monthStart)
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
    const leadingBlanks = mondayIndex(firstDay)
    const total = leadingBlanks + daysInMonth

    return Array.from({ length: Math.ceil(total / 7) * 7 }, (_, i) => {
      const dayOffset = i - leadingBlanks
      if (dayOffset < 0 || dayOffset >= daysInMonth) return null
      const date = new Date(firstDay)
      date.setDate(dayOffset + 1)
      return date
    })
  }, [monthStart])

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, { pagi: number; malam: number }> = {}
    for (const a of assignments) {
      if (!map[a.date]) map[a.date] = { pagi: 0, malam: 0 }
      map[a.date][a.shift]++
    }
    return map
  }, [assignments])

  return (
    <div className="select-none">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`blank-${i}`} />
          }
          const dateStr = formatDate(date)
          const counts = assignmentsByDate[dateStr]
          const isToday = dateStr === todayStr
          const isCurrentMonth = date.getMonth() === monthStart.getMonth()

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'rounded-lg border p-1.5 min-h-[72px] flex flex-col gap-1 text-left transition-colors hover:bg-accent',
                isToday && 'border-primary bg-primary/5',
                !isCurrentMonth && 'opacity-40',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium leading-none',
                  isToday && 'text-primary font-bold',
                )}
              >
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {counts?.pagi ? (
                  <div className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 leading-none truncate">
                      {counts.pagi}P
                    </span>
                  </div>
                ) : null}
                {counts?.malam ? (
                  <div className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-indigo-400 shrink-0" />
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 leading-none truncate">
                      {counts.malam}M
                    </span>
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
