import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeList } from '@/components/EmployeeList'
import { EmployeeForm } from '@/components/EmployeeForm'
import { ShiftForm } from '@/components/ShiftForm'
import { MonthCalendar } from '@/components/MonthCalendar'
import { ScheduleSummary } from '@/components/ScheduleSummary'
import { DayDetailDialog } from '@/components/DayDetailDialog'
import { GenerateShiftDialog } from '@/components/GenerateShiftDialog'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Employee, ShiftAssignment } from '@/types'

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function formatMonthLabel(d: Date): string {
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export default function App() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('shift-employees', [])
  const [assignments, setAssignments] = useLocalStorage<ShiftAssignment[]>('shift-assignments', [])

  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()))
  const [empFormOpen, setEmpFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()
  const [shiftFormOpen, setShiftFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | undefined>()
  const [defaultDate, setDefaultDate] = useState<string>('')
  const [dayDetailOpen, setDayDetailOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)

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
      setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...data } : e)))
      toast.success('Karyawan berhasil diperbarui')
    } else {
      setEmployees((prev) => [...prev, { id: crypto.randomUUID(), ...data }])
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
      setAssignments((prev) => [...prev, { id: crypto.randomUUID(), ...data }])
      toast.success('Shift berhasil ditambahkan')
    }
  }

  function handleDeleteAssignment(id: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    toast.success('Shift berhasil dihapus')
  }

  function handleDayClick(date: string) {
    setSelectedDate(date)
    setDayDetailOpen(true)
  }

  function handleGenerateShifts(generated: Omit<ShiftAssignment, 'id'>[]) {
    const newAssignments = generated.map((a) => ({ ...a, id: crypto.randomUUID() }))
    setAssignments((prev) => [...prev, ...newAssignments])
    toast.success(`${newAssignments.length} shift berhasil digenerate`)
  }

  function prevMonth() {
    setMonthStart((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setMonthStart((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function goToday() {
    setMonthStart(startOfMonth(new Date()))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <CalendarDays className="size-6 text-primary" />
          <h1 className="text-xl font-semibold">Jadwal Shift</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Jadwal Bulanan</TabsTrigger>
            <TabsTrigger value="employees">Karyawan</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={prevMonth} aria-label="Bulan lalu">
                  <ChevronLeft />
                </Button>
                <span className="text-sm font-medium min-w-40 text-center capitalize">
                  {formatMonthLabel(monthStart)}
                </span>
                <Button size="icon" variant="outline" onClick={nextMonth} aria-label="Bulan depan">
                  <ChevronRight />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={goToday}>
                  Hari ini
                </Button>
                <Button size="sm" onClick={() => setGenerateOpen(true)}>
                  <Sparkles data-icon="inline-start" />
                  Generate Shift
                </Button>
              </div>
            </div>

            {employees.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Tambahkan karyawan terlebih dahulu di tab <strong>Karyawan</strong>.
              </p>
            ) : (
              <>
                <MonthCalendar
                  employees={employees}
                  assignments={assignments}
                  monthStart={monthStart}
                  onDayClick={handleDayClick}
                />
                <ScheduleSummary
                  employees={employees}
                  assignments={assignments}
                  monthStart={monthStart}
                />
              </>
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

      <DayDetailDialog
        open={dayDetailOpen}
        onClose={() => setDayDetailOpen(false)}
        date={selectedDate}
        employees={employees}
        assignments={assignments}
        onAdd={handleAddShift}
        onEdit={handleEditShift}
        onDelete={handleDeleteAssignment}
      />

      <GenerateShiftDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        employees={employees}
        assignments={assignments}
        onGenerate={handleGenerateShifts}
      />

      <Toaster />
    </div>
  )
}
