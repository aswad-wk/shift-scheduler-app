import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Employee, ShiftAssignment } from '@/types'
import { generateShifts } from '@/lib/generateShifts'

interface Props {
  open: boolean
  onClose: () => void
  employees: Employee[]
  assignments: ShiftAssignment[]
  onGenerate: (generated: Omit<ShiftAssignment, 'id'>[]) => void
}

function toMonthInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function GenerateShiftDialog({ open, onClose, employees, assignments, onGenerate }: Props) {
  const [monthValue, setMonthValue] = useState(() => toMonthInput(new Date()))

  const selectedMonth = new Date(monthValue + '-01')
  const year = selectedMonth.getFullYear()
  const month = selectedMonth.getMonth()

  const existingInMonth = assignments.filter((a) => {
    const d = new Date(a.date)
    return d.getFullYear() === year && d.getMonth() === month
  }).length

  const preview = generateShifts(employees, selectedMonth)

  function handleGenerate() {
    onGenerate(preview)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Generate Shift Otomatis</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="month">Bulan</Label>
            <Input
              id="month"
              type="month"
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
            />
          </div>

          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada karyawan. Tambahkan karyawan terlebih dahulu.
            </p>
          ) : (
            <>
              <div className="text-sm text-muted-foreground flex flex-col gap-1">
                <p>
                  <strong>{preview.length}</strong> shift akan digenerate untuk{' '}
                  <strong>{employees.length}</strong> karyawan secara round-robin.
                </p>
                {existingInMonth > 0 && (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠ Bulan ini sudah punya {existingInMonth} shift. Shift baru akan ditambahkan
                    (bukan menggantikan).
                  </p>
                )}
              </div>

              {/* Preview first 3 days */}
              <div className="rounded-md border text-xs overflow-hidden">
                <div className="grid grid-cols-3 bg-muted px-3 py-1.5 font-semibold text-muted-foreground">
                  <span>Tanggal</span>
                  <span>Shift</span>
                  <span>Karyawan</span>
                </div>
                {preview.slice(0, 6).map((a, i) => {
                  const emp = employees.find((e) => e.id === a.employeeId)
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 px-3 py-1 border-t odd:bg-background even:bg-muted/30"
                    >
                      <span>{a.date.split('-')[2]}</span>
                      <span className="capitalize">{a.shift}</span>
                      <span className="truncate">{emp?.name}</span>
                    </div>
                  )
                })}
                {preview.length > 6 && (
                  <div className="px-3 py-1 border-t text-muted-foreground">
                    + {preview.length - 6} shift lainnya…
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleGenerate} disabled={employees.length === 0}>
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
