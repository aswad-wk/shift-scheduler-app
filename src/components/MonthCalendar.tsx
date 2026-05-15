import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Employee, ShiftAssignment } from '@/types'
import { SHIFT_CONFIG } from '@/types'

interface Props {
  employees: Employee[]
  assignments: ShiftAssignment[]
  monthStart: Date
  onDayClick: (date: string) => void
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MAX_NAMES_MOBILE = 2
const MAX_NAMES_DESKTOP = 3

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

function firstName(name: string) {
  return name.split(' ')[0]
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function shortTime(time: string) {
  // "06:00 - 14:00" → "06-14"
  return time.replace(/:00/g, '').replace(' ', '').replace(' ', '')
}

const SHIFT_STYLE = {
  pagi: {
    label: 'Pagi',
    time: shortTime(SHIFT_CONFIG.pagi.time),
    card: 'bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200',
  },
  malam: {
    label: 'Malam',
    time: shortTime(SHIFT_CONFIG.malam.time),
    card: 'bg-indigo-100 border-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-200',
  },
  libur: {
    label: 'Libur',
    time: null,
    card: 'bg-muted border-border text-muted-foreground',
  },
}

function ShiftCard({ names, fullNames, type }: { names: string[]; fullNames: string[]; type: keyof typeof SHIFT_STYLE }) {
  if (names.length === 0) return null
  const style = SHIFT_STYLE[type]
  const visibleMobile = names.slice(0, MAX_NAMES_MOBILE)
  const extraMobile = names.length - MAX_NAMES_MOBILE
  const visibleDesktop = names.slice(0, MAX_NAMES_DESKTOP)
  const extraDesktop = names.length - MAX_NAMES_DESKTOP
  return (
    <div className={cn('rounded border px-1 py-0.5 flex flex-col gap-0.5', style.card)}>
      <div className="text-[9px] font-bold uppercase leading-none flex items-center gap-1">
        <span className="hidden sm:inline">{style.label}</span>
        {style.time && <span className="font-normal opacity-70">{style.time}</span>}
      </div>
      {/* Mobile: inisials */}
      <div className="sm:hidden flex flex-wrap gap-x-0.5">
        {visibleMobile.map((n, i) => (
          <span key={n} className="text-[9px] font-semibold leading-tight">
            {initials(fullNames[i])}{i < visibleMobile.length - 1 ? ',' : ''}
          </span>
        ))}
        {extraMobile > 0 && (
          <span className="text-[9px] leading-tight opacity-60">+{extraMobile}</span>
        )}
      </div>
      {/* Desktop: first name */}
      <div className="hidden sm:flex flex-col gap-0.5">
        {visibleDesktop.map((n) => (
          <span key={n} className="text-[10px] font-medium leading-tight truncate">
            {n}
          </span>
        ))}
        {extraDesktop > 0 && (
          <span className="text-[10px] leading-tight opacity-60">+{extraDesktop} lainnya</span>
        )}
      </div>
    </div>
  )
}

export function MonthCalendar({ employees, assignments, monthStart, onDayClick }: Props) {
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

  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  )

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, { pagi: string[]; pagiFull: string[]; malam: string[]; malamFull: string[]; assignedIds: Set<string> }> = {}
    for (const a of assignments) {
      if (!map[a.date]) map[a.date] = { pagi: [], pagiFull: [], malam: [], malamFull: [], assignedIds: new Set() }
      const emp = empMap[a.employeeId]
      if (emp) {
        map[a.date][a.shift].push(firstName(emp.name))
        map[a.date][a.shift === 'pagi' ? 'pagiFull' : 'malamFull'].push(emp.name)
        map[a.date].assignedIds.add(a.employeeId)
      }
    }
    return map
  }, [assignments, empMap])

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />

          const dateStr = formatDate(date)
          const data = assignmentsByDate[dateStr]
          const isToday = dateStr === todayStr
          const isCurrentMonth = date.getMonth() === monthStart.getMonth()
          const liburEmps = data
            ? employees.filter((e) => !data.assignedIds.has(e.id))
            : []
          const liburNames = liburEmps.map((e) => firstName(e.name))
          const liburFullNames = liburEmps.map((e) => e.name)

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'rounded-lg border p-1 sm:p-1.5 min-h-[64px] sm:min-h-[80px] flex flex-col gap-1 text-left transition-colors hover:bg-accent',
                isToday && 'border-primary bg-primary/5',
                !isCurrentMonth && 'opacity-40',
              )}
            >
              <span
                className={cn(
                  'text-xs sm:text-sm font-medium leading-none',
                  isToday && 'text-primary font-bold',
                )}
              >
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-1 w-full">
                <ShiftCard names={data?.pagi ?? []} fullNames={data?.pagiFull ?? []} type="pagi" />
                <ShiftCard names={data?.malam ?? []} fullNames={data?.malamFull ?? []} type="malam" />
                {data && <ShiftCard names={liburNames} fullNames={liburFullNames} type="libur" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
