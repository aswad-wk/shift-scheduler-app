import { toPng } from 'html-to-image'

export async function exportElementToPng(element: HTMLElement, filename: string) {
  const PADDING = 16
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    width: element.scrollWidth + PADDING * 2,
    height: element.scrollHeight + PADDING * 2,
    style: { padding: `${PADDING}px` },
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
