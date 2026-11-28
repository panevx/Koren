import type { SyntheticEvent } from 'react'
import imageWidths from '../content/imageWidths.json'

const widths: Record<string, number[]> = imageWidths
const root = import.meta.env.BASE_URL + 'img/'

/** If a larger file isn't cached offline, the original can still be shown. */
function fallback(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (image.hasAttribute('srcset')) {
    image.removeAttribute('srcset')
    image.src = image.src
  }
}

export function detailImage(path: string, sizes: string) {
  const pair = widths[path]
  if (!pair) return {}
  return {
    sizes,
    srcSet: `${root}${path} ${pair[0]}w, ${root}detail/${path} ${pair[1]}w`,
    onError: fallback,
  }
}
