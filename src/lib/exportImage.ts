import { toPng } from 'html-to-image'

export async function exportElementToPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    style: { padding: '16px' },
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
