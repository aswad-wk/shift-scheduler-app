import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeList } from '@/components/EmployeeList'
import { EmployeeForm } from '@/components/EmployeeForm'
import { ShiftForm } from '@/components/ShiftForm'
import { ScheduleView } from '@/components/ScheduleView'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Employee, ShiftAssignment } from '@/types'

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`
}

export default function App() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('shift-employees', [])
  const [assignments, setAssignments] = useLocalStorage<ShiftAssignment[]>('shift-assignments', [])

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [empFormOpen, setEmpFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()
  const [shiftFormOpen, setShiftFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | undefined>()
  const [defaultDate, setDefaultDate] = useState<string>('')

  function handleAddEmployee() {
    setEditingEmployee(undefined)
    setEmpFormOpen(true)
  }

  function handleEditEmployee(emp: Employee) {
    setEditingEmployee(emp)
    setEmpFormOpen(true)
  }

  function handleSaveEmployee(data: Omit<Employee, 'id'>) {
    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...data } : e)),
      )
      toast.success('Karyawan berhasil diperbarui')
    } else {
      const newEmp: Employee = { id: crypto.randomUUID(), ...data }
      setEmployees((prev) => [...prev, newEmp])
      toast.success('Karyawan berhasil ditambahkan')
    }
  }

  function handleDeleteEmployee(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    setAssignments((prev) => prev.filter((a) => a.employeeId !== id))
    toast.success('Karyawan berhasil dihapus')
  }

  function handleAddShift(date: string) {
    setEditingAssignment(undefined)
    setDefaultDate(date)
    setShiftFormOpen(true)
  }

  function handleEditShift(assignment: ShiftAssignment) {
    setEditingAssignment(assignment)
    setShiftFormOpen(true)
  }

  function handleSaveAssignment(data: Omit<ShiftAssignment, 'id'>) {
    if (editingAssignment) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === editingAssignment.id ? { ...a, ...data } : a)),
      )
      toast.success('Shift berhasil diperbarui')
    } else {
      const newAssignment: ShiftAssignment = { id: crypto.randomUUID(), ...data }
      setAssignments((prev) => [...prev, newAssignment])
      toast.success('Shift berhasil ditambahkan')
    }
  }

  function handleDeleteAssignment(id: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    toast.success('Shift berhasil dihapus')
  }

  function prevWeek() {
    setWeekStart((d) => {
      const prev = new Date(d)
      prev.setDate(d.getDate() - 7)
      return prev
    })
  }

  function nextWeek() {
    setWeekStart((d) => {
      const next = new Date(d)
      next.setDate(d.getDate() + 7)
      return next
    })
  }

  function goToday() {
    setWeekStart(getMonday(new Date()))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <CalendarDays className="size-6 text-primary" />
          <h1 className="text-xl font-semibold">Jadwal Shift</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Jadwal Mingguan</TabsTrigger>
            <TabsTrigger value="employees">Karyawan</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={prevWeek} aria-label="Minggu lalu">
                  <ChevronLeft />
                </Button>
                <span className="text-sm font-medium min-w-48 text-center">
                  {formatWeekRange(weekStart)}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={nextWeek}
                  aria-label="Minggu depan"
                >
                  <ChevronRight />
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={goToday}>
                Hari ini
              </Button>
            </div>

            {employees.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Tambahkan karyawan terlebih dahulu di tab <strong>Karyawan</strong>.
              </p>
            ) : (
              <ScheduleView
                employees={employees}
                assignments={assignments}
                weekStart={weekStart}
                onAdd={handleAddShift}
                onEdit={handleEditShift}
                onDelete={handleDeleteAssignment}
              />
            )}
          </TabsContent>

          <TabsContent value="employees" className="mt-4">
            <EmployeeList
              employees={employees}
              onAdd={handleAddEmployee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
          </TabsContent>
        </Tabs>
      </main>

      <EmployeeForm
        open={empFormOpen}
        onClose={() => setEmpFormOpen(false)}
        onSave={handleSaveEmployee}
        initial={editingEmployee}
      />

      <ShiftForm
        open={shiftFormOpen}
        onClose={() => setShiftFormOpen(false)}
        onSave={handleSaveAssignment}
        employees={employees}
        initial={editingAssignment}
        defaultDate={defaultDate}
      />

      <Toaster />
    </div>
  )
}
