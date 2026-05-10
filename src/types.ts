export type ShiftType = 'pagi' | 'malam'

export interface Employee {
  id: string
  name: string
  position: string
}

export interface ShiftAssignment {
  id: string
  employeeId: string
  date: string
  shift: ShiftType
  notes: string
}

export const SHIFT_CONFIG: Record<ShiftType, { label: string; time: string; color: string }> = {
  pagi: {
    label: 'Shift Pagi',
    time: '08:00 - 20:00',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  malam: {
    label: 'Shift Malam',
    time: '20:00 - 08:00',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
}
