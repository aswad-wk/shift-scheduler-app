import XLSX from 'xlsx-js-style'
import type { Employee, ShiftAssignment } from '@/types'

const THIN = { style: 'thin', color: { rgb: 'D1D5DB' } }
const BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN }

const S = {
  title: {
    font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1D4ED8' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  },
  header: {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1E3A5F' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: BORDER,
  },
  headerLeft: {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1E3A5F' } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: BORDER,
  },
  pagi: {
    font: { bold: true, color: { rgb: '78350F' } },
    fill: { fgColor: { rgb: 'FDE68A' } },
    alignment: { horizontal: 'center' },
    border: BORDER,
  },
  malam: {
    font: { bold: true, color: { rgb: '3730A3' } },
    fill: { fgColor: { rgb: 'C7D2FE' } },
    alignment: { horizontal: 'center' },
    border: BORDER,
  },
  libur: {
    font: { color: { rgb: '9CA3AF' } },
    fill: { fgColor: { rgb: 'F3F4F6' } },
    alignment: { horizontal: 'center' },
    border: BORDER,
  },
  rowEven: {
    font: { sz: 10 },
    fill: { fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER,
  },
  rowOdd: {
    font: { sz: 10 },
    fill: { fgColor: { rgb: 'F9FAFB' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER,
  },
  rowNumEven: {
    font: { sz: 10 },
    fill: { fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER,
  },
  rowNumOdd: {
    font: { sz: 10 },
    fill: { fgColor: { rgb: 'F9FAFB' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER,
  },
  section: {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '374151' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  },
  coverage: {
    font: { bold: true, sz: 10, color: { rgb: '374151' } },
    fill: { fgColor: { rgb: 'E5E7EB' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER,
  },
  coverageLabel: {
    font: { bold: true, sz: 10, color: { rgb: '374151' } },
    fill: { fgColor: { rgb: 'E5E7EB' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER,
  },
  summaryHeader: {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '4B5563' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER,
  },
  summaryHeaderLeft: {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '4B5563' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER,
  },
  legendCode: (fill: string, font: string) => ({
    font: { bold: true, color: { rgb: font } },
    fill: { fgColor: { rgb: fill } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER,
  }),
  legendLabel: (fill: string, font: string) => ({
    font: { color: { rgb: font } },
    fill: { fgColor: { rgb: fill } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER,
  }),
  plain: {
    font: { sz: 10 },
    fill: { fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER,
  },
}

const DAY_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function c(v: string | number, s: object): object {
  return { v, t: typeof v === 'number' ? 'n' : 's', s }
}

function enc(r: number, col: number) {
  return XLSX.utils.encode_cell({ r, c: col })
}

function merge(ws: object, r: number, c1: number, c2: number, r2 = r) {
  const merges: object[] = (ws as Record<string, object[]>)['!merges'] ?? []
  merges.push({ s: { r, c: c1 }, e: { r: r2, c: c2 } })
  ;(ws as Record<string, object[]>)['!merges'] = merges
}

function formatMonthId(d: Date) {
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function exportMonthToExcel(
  employees: Employee[],
  assignments: ShiftAssignment[],
  monthStart: Date,
) {
  const y = monthStart.getFullYear()
  const m = monthStart.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`
  const monthLabel = formatMonthId(monthStart)
  const monthAssignments = assignments.filter((a) => a.date.startsWith(prefix))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: Record<string, any> = {}
  const totalCols = 3 + daysInMonth // No + Nama + Jabatan + days

  let row = 0

  // ── JUDUL ─────────────────────────────────────────────────────────────────
  ws[enc(row, 0)] = c(`JADWAL SHIFT KARYAWAN — ${monthLabel.toUpperCase()}`, S.title)
  for (let col = 1; col < totalCols; col++) ws[enc(row, col)] = c('', S.title)
  merge(ws, row, 0, totalCols - 1)
  row += 2

  // ── HEADER JADWAL ─────────────────────────────────────────────────────────
  ws[enc(row, 0)] = c('No', S.header)
  ws[enc(row, 1)] = c('Nama', S.headerLeft)
  ws[enc(row, 2)] = c('Jabatan', S.headerLeft)
  for (let d = 1; d <= daysInMonth; d++) {
    const dayName = DAY_ID[new Date(y, m, d).getDay()]
    ws[enc(row, 2 + d)] = c(`${d}\n${dayName}`, S.header)
  }
  row++

  // ── BARIS KARYAWAN ────────────────────────────────────────────────────────
  const empTotals: { pagi: number; malam: number }[] = []

  for (let ei = 0; ei < employees.length; ei++) {
    const emp = employees[ei]
    const base = ei % 2 === 0 ? S.rowEven : S.rowOdd
    const baseNum = ei % 2 === 0 ? S.rowNumEven : S.rowNumOdd

    ws[enc(row, 0)] = c(ei + 1, baseNum)
    ws[enc(row, 1)] = c(emp.name, base)
    ws[enc(row, 2)] = c(emp.position, base)

    let pagi = 0, malam = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${prefix}${String(d).padStart(2, '0')}`
      const a = monthAssignments.find((x) => x.employeeId === emp.id && x.date === dateStr)
      if (!a) {
        ws[enc(row, 2 + d)] = c('-', S.libur)
      } else if (a.shift === 'pagi') {
        pagi++
        ws[enc(row, 2 + d)] = c('P', S.pagi)
      } else {
        malam++
        ws[enc(row, 2 + d)] = c('M', S.malam)
      }
    }
    empTotals.push({ pagi, malam })
    row++
  }

  // ── COVERAGE ──────────────────────────────────────────────────────────────
  row++
  for (const shift of ['pagi', 'malam'] as const) {
    const label = shift === 'pagi' ? 'Coverage Pagi' : 'Coverage Malam'
    ws[enc(row, 0)] = c(label, S.coverageLabel)
    ws[enc(row, 1)] = c('', S.coverage)
    ws[enc(row, 2)] = c('', S.coverage)
    merge(ws, row, 0, 2)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${prefix}${String(d).padStart(2, '0')}`
      const count = monthAssignments.filter((a) => a.date === dateStr && a.shift === shift).length
      ws[enc(row, 2 + d)] = c(count, S.coverage)
    }
    row++
  }

  // ── RINGKASAN ─────────────────────────────────────────────────────────────
  row++
  ws[enc(row, 0)] = c('RINGKASAN', S.section)
  for (let col = 1; col < 7; col++) ws[enc(row, col)] = c('', S.section)
  merge(ws, row, 0, 6)
  row++

  const sumHeaders = ['No', 'Nama', 'Jabatan', 'Total Pagi', 'Total Malam', 'Total Shift', 'Total Jam (12j)']
  sumHeaders.forEach((h, col) => {
    ws[enc(row, col)] = c(h, col <= 2 ? S.summaryHeaderLeft : S.summaryHeader)
  })
  row++

  for (let ei = 0; ei < employees.length; ei++) {
    const { pagi, malam } = empTotals[ei]
    const base = ei % 2 === 0 ? S.rowEven : S.rowOdd
    const baseNum = ei % 2 === 0 ? S.rowNumEven : S.rowNumOdd
    ws[enc(row, 0)] = c(ei + 1, baseNum)
    ws[enc(row, 1)] = c(employees[ei].name, base)
    ws[enc(row, 2)] = c(employees[ei].position, base)
    ws[enc(row, 3)] = c(pagi, { ...baseNum, font: { ...S.pagi.font } })
    ws[enc(row, 4)] = c(malam, { ...baseNum, font: { ...S.malam.font } })
    ws[enc(row, 5)] = c(pagi + malam, baseNum)
    ws[enc(row, 6)] = c((pagi + malam) * 12, baseNum)
    row++
  }

  // ── KETERANGAN ────────────────────────────────────────────────────────────
  row++
  ws[enc(row, 0)] = c('KETERANGAN', S.section)
  for (let col = 1; col < 4; col++) ws[enc(row, col)] = c('', S.section)
  merge(ws, row, 0, 3)
  row++

  const legend = [
    { code: 'P', label: 'Shift Pagi', desc: '08:00 - 20:00', fill: 'FDE68A', font: '78350F' },
    { code: 'M', label: 'Shift Malam', desc: '20:00 - 08:00', fill: 'C7D2FE', font: '3730A3' },
    { code: '-', label: 'Libur / Tidak Bertugas', desc: '-', fill: 'F3F4F6', font: '9CA3AF' },
  ]
  for (const { code, label, desc, fill, font } of legend) {
    ws[enc(row, 0)] = c(code, S.legendCode(fill, font))
    ws[enc(row, 1)] = c(label, S.legendLabel(fill, font))
    ws[enc(row, 2)] = c(desc, S.plain)
    ws[enc(row, 3)] = c('', S.plain)
    row++
  }

  // ── SHEET CONFIG ──────────────────────────────────────────────────────────
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: totalCols - 1 } })

  ws['!cols'] = [
    { wch: 4 },
    { wch: 22 },
    { wch: 14 },
    ...Array.from({ length: daysInMonth }, () => ({ wch: 5 })),
  ]

  ws['!rows'] = [
    { hpx: 36 },
    {},
    { hpx: 40 },
  ]

  ws['!pageSetup'] = {
    orientation: 'landscape',
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  }
  ws['!printOptions'] = { gridLines: false }
  ws['!margins'] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal')

  XLSX.writeFile(wb, `Jadwal-${monthLabel.replace(' ', '-')}.xlsx`)
}
