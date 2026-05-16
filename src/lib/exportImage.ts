import { toPng } from 'html-to-image'

export async function exportElementToPng(element: HTMLElement, filename: string) {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    pixelRatio: 2,
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
