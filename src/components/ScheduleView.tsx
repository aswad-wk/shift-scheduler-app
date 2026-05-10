import { useMemo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Employee, ShiftAssignment, ShiftType } from '@/types'
import { SHIFT_CONFIG } from '@/types'

interface Props {
  employees: Employee[]
  assignments: ShiftAssignment[]
  weekStart: Date
  onAdd: (date: string) => void
  onEdit: (assignment: ShiftAssignment) => void
  onDelete: (id: string) => void
}

function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

const isToday = (date: Date) => formatDate(date) === formatDate(new Date())

export function ScheduleView({ employees, assignments, weekStart, onAdd, onEdit, onDelete }: Props) {
  const days = useMemo(() => getWeekDays(weekStart), [weekStart])

  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  )

  function getAssignments(date: Date, shift: ShiftType) {
    const dateStr = formatDate(date)
    return assignments.filter((a) => a.date === dateStr && a.shift === shift)
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <Card key={formatDate(day)} className={isToday(day) ? 'border-primary' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-base ${isToday(day) ? 'text-primary' : ''}`}>
              {formatDateLabel(day)}
              {isToday(day) && (
                <Badge variant="default" className="ml-2 text-xs">
                  Hari ini
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => onAdd(formatDate(day))}>
              <Plus data-icon="inline-start" />
              Tambah Shift
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.entries(SHIFT_CONFIG) as [ShiftType, typeof SHIFT_CONFIG.pagi][]).map(
              ([shiftKey, cfg]) => {
                const list = getAssignments(day, shiftKey)
                return (
                  <div key={shiftKey} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{cfg.time}</span>
                    </div>
                    {list.length === 0 ? (
                      <p className="text-xs text-muted-foreground pl-2">Tidak ada karyawan</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pl-2">
                        {list.map((assignment) => {
                          const emp = empMap[assignment.employeeId]
                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-sm"
                            >
                              <span className="font-medium">{emp?.name ?? 'Karyawan dihapus'}</span>
                              {assignment.notes && (
                                <span className="text-muted-foreground">· {assignment.notes}</span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-5 ml-1"
                                onClick={() => onEdit(assignment)}
                                aria-label="Edit shift"
                              >
                                <Pencil />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="size-5"
                                      aria-label="Hapus shift"
                                    />
                                  }
                                >
                                  <Trash2 />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Shift</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Yakin ingin menghapus shift {cfg.label} untuk{' '}
                                      <strong>{emp?.name}</strong>?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(assignment.id)}>
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              },
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
