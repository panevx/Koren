import { detailImage } from './detailImage'
import { img } from './Brand'
import { ART } from '../world'

/**
 * The back wall of the diorama, in layers (back → front): the sky of the painted landscape, two hazy mountain ranges
 * drawn in code (aerial perspective: paler and bluer the further away), a cloud BEHIND the near range, a cloud between
 * the ranges and the hills, then the hills cut out of the same painting (scripts/diorama-layers.py).
 * All layers share one canvas with the painting's 3:2 proportions, sized and anchored like `object-fit: cover;
 * object-position: 50% 65%` (container units), so they stay aligned at every size and proportion. No parallax — the depth comes from overlap, haze and light.
 */
/** `className` must give the wall its position and size (e.g. `relative h-48` or `absolute inset-0`). */
export function BackWall({ className }: { className: string }) {
  return (
    <div className={`backwall overflow-hidden bg-sky-soft [container-type:size] ${className}`} aria-hidden="true">
      {/* "cover" for ANY proportion: as wide as the wall, or 1.5 × its height if the wall is tall (a phone's welcome screen) */}
      <div className="absolute top-[65%] left-1/2 aspect-[3/2] w-[max(100cqw,150cqh)] -translate-x-1/2 -translate-y-[65%]">
        <img src={img(ART.hills)} {...detailImage(ART.hills, '(min-width: 1024px) 64vw, 100vw')} alt="" width={960} height={640} className="absolute inset-0 size-full" fetchPriority="high" />
        <svg viewBox="0 0 960 640" className="absolute inset-0 size-full" focusable="false">
          <defs>
            <linearGradient id="dio-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bdd3e7" />
              <stop offset="1" stopColor="#dde9f3" />
            </linearGradient>
            <linearGradient id="dio-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8eaed0" />
              <stop offset="0.7" stopColor="#b5cce2" />
              <stop offset="1" stopColor="#d6e4f0" />
            </linearGradient>
            {/* Light from the top-left: the left half of the near range catches it, the right half falls into shade. */}
            <linearGradient id="dio-lit" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#4a6f94" stopOpacity="0.12" />
            </linearGradient>
            {/* haze: no hard edge — it thickens toward the hills and thins out upward */}
            <linearGradient id="dio-haze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef5fa" stopOpacity="0" />
              <stop offset="0.7" stopColor="#eef5fa" stopOpacity="0.55" />
              <stop offset="1" stopColor="#eef5fa" stopOpacity="0.2" />
            </linearGradient>
            <clipPath id="dio-mid-shape">
              <path d="M0 382 Q60 336 124 350 Q180 300 236 324 Q300 262 366 318 Q420 340 476 330 Q540 280 604 318 Q656 334 706 306 Q768 252 832 306 Q890 330 960 322 V480 H0Z" />
            </clipPath>
            <clipPath id="dio-far-shape">
              <path d="M0 352 Q50 300 110 318 Q160 262 222 296 Q290 236 360 286 Q410 262 462 292 Q530 246 596 282 Q660 226 732 278 Q790 250 850 286 Q905 268 960 296 V470 H0Z" />
            </clipPath>
          </defs>
          {/* a cloud drifting BEHIND the furthest range — only its top shows */}
          <image href={img(ART.cloud)} x="610" y="196" width="150" height="150" opacity="0.95" />
          {/* the furthest range: barely darker than the sky (aerial perspective), snow on its tops */}
          <path d="M0 352 Q50 300 110 318 Q160 262 222 296 Q290 236 360 286 Q410 262 462 292 Q530 246 596 282 Q660 226 732 278 Q790 250 850 286 Q905 268 960 296 V470 H0Z" fill="url(#dio-far)" />
          <rect x="0" y="0" width="960" height="262" fill="#f6f9fc" opacity="0.85" clipPath="url(#dio-far-shape)" />
          {/* the near range, lit from the left, with snow clipped to its own ridge (it can never float above it) */}
          <path d="M0 382 Q60 336 124 350 Q180 300 236 324 Q300 262 366 318 Q420 340 476 330 Q540 280 604 318 Q656 334 706 306 Q768 252 832 306 Q890 330 960 322 V480 H0Z" fill="url(#dio-mid)" />
          <path d="M0 382 Q60 336 124 350 Q180 300 236 324 Q300 262 366 318 Q420 340 476 330 Q540 280 604 318 Q656 334 706 306 Q768 252 832 306 Q890 330 960 322 V480 H0Z" fill="url(#dio-lit)" />
          <rect x="0" y="0" width="960" height="292" fill="#f4f8fb" opacity="0.92" clipPath="url(#dio-mid-shape)" />
          {/* haze where the ranges meet the hills */}
          <rect x="0" y="300" width="960" height="130" fill="url(#dio-haze)" />
          {/* a small cloud between the mountains and the hills — the hills cover its lower half */}
          <image href={img(ART.cloud)} x="150" y="292" width="112" height="112" opacity="0.9" />
        </svg>
        <img src={img(ART.hillsNear)} {...detailImage(ART.hillsNear, '(min-width: 1024px) 64vw, 100vw')} alt="" width={960} height={640} className="absolute inset-0 size-full" fetchPriority="high" />
      </div>
      {/* rim + ambient occlusion toward the floor */}
      <span className="rim-over absolute inset-0 rounded-[inherit]" />
    </div>
  )
}

