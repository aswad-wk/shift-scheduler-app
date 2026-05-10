import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  open: boolean
  onClose: () => void
  date: string
  employees: Employee[]
  assignments: ShiftAssignment[]
  onAdd: (date: string) => void
  onEdit: (assignment: ShiftAssignment) => void
  onDelete: (id: string) => void
}

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function DayDetailDialog({
  open,
  onClose,
  date,
  employees,
  assignments,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const empMap = Object.fromEntries(employees.map((e) => [e.id, e]))
  const dayAssignments = assignments.filter((a) => a.date === date)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{date ? formatDayLabel(date) : ''}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {(Object.entries(SHIFT_CONFIG) as [ShiftType, typeof SHIFT_CONFIG.pagi][]).map(
            ([shiftKey, cfg]) => {
              const list = dayAssignments.filter((a) => a.shift === shiftKey)
              return (
                <div key={shiftKey} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${cfg.color}`}>
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
                              onClick={() => { onClose(); onEdit(assignment) }}
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
                                    Yakin ingin menghapus {cfg.label} untuk{' '}
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

          {(() => {
            const assignedIds = new Set(dayAssignments.map((a) => a.employeeId))
            const liburList = employees.filter((e) => !assignedIds.has(e.id))
            if (liburList.length === 0) return null
            return (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-muted text-muted-foreground border-border">
                    Libur / Tidak Dijadwalkan
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pl-2">
                  {liburList.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-1 bg-muted/50 border rounded-md px-2 py-1 text-sm text-muted-foreground"
                    >
                      <span>{emp.name}</span>
                      {emp.position && (
                        <span className="text-xs opacity-70">· {emp.position}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {dayAssignments.length} shift
          </Badge>
          <Button size="sm" onClick={() => { onClose(); onAdd(date) }}>
            <Plus data-icon="inline-start" />
            Tambah Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
