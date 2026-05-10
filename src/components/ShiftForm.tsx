import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Employee, ShiftAssignment, ShiftType } from '@/types'
import { SHIFT_CONFIG } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (assignment: Omit<ShiftAssignment, 'id'>) => void
  employees: Employee[]
  initial?: ShiftAssignment
  defaultDate?: string
}

export function ShiftForm({ open, onClose, onSave, employees, initial, defaultDate }: Props) {
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? '')
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? new Date().toISOString().split('T')[0])
  const [shift, setShift] = useState<ShiftType>(initial?.shift ?? 'pagi')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!employeeId || !date) return
    onSave({ employeeId, date, shift, notes })
    setEmployeeId('')
    setNotes('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Shift' : 'Tambah Shift'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="employee">Karyawan</Label>
            <Select value={employeeId} onValueChange={(v) => setEmployeeId(v ?? '')} required>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Pilih karyawan" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} {emp.position ? `— ${emp.position}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="shift">Shift</Label>
            <Select value={shift} onValueChange={(v) => setShift(v as ShiftType)}>
              <SelectTrigger id="shift">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SHIFT_CONFIG) as [ShiftType, typeof SHIFT_CONFIG.pagi][]).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label} ({cfg.time})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={!employeeId || !date}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
