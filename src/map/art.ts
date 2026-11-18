/**
 * Pictures of the Discover map (v0.15) — in one place, so "Download all for the trip" (src/offline/assets.ts)
 * and the asset registry (scripts/assets-v5.py) know them.
 */
export const RELIEF = 'map/relief.webp'

/** The 3D picture of each peak (design/v5: the three named peaks; the others show their range). */
export const PEAK_ART: Record<string, string> = {
  musala: 'geo/musala.webp',
  vihren: 'geo/vihren.webp',
  botev: 'geo/botev.webp',
  'cherni-vrah': 'geo/vitosha.webp',
  'golyam-perelik': 'geo/rhodopes.webp',
  midzhur: 'geo/balkan.webp',
}

export const LANDSCAPE_ART: Record<string, string> = {
  'rila': 'geo/rila.webp',
  'pirin': 'geo/pirin.webp',
  'rhodopes': 'geo/rhodopes.webp',
  'balkan': 'geo/balkan.webp',
  'vitosha': 'geo/vitosha.webp',
  'sredna-gora': 'geo/sredna-gora.webp',
  'strandzha': 'geo/strandzha.webp',
  'belasitsa': 'geo/belasitsa.webp',
  'osogovo': 'geo/osogovo.webp',
  'sakar': 'geo/sakar.webp',
  'rusenski-lom': 'geo/rusenski-lom.webp',
  'balgarka': 'geo/balgarka.webp',
  'vratsa-balkan': 'geo/vratsa-balkan.webp',
  'danube-plain': 'nature/danube-plain.webp',
  'thracian-lowland': 'nature/thracian-lowland.webp',
}

/** The map modes and their pictures. */
export const MODES = [
  { id: 'landmarks', art: 'world/tsarevets-fortress.webp' },
  { id: 'cities', art: 'city/sofia.webp' },
  { id: 'provinces', art: 'tiles/discover.webp' },
  { id: 'mountains', art: 'world/mountain-peak.webp' },
  { id: 'landscapes', art: 'geo/rusenski-lom.webp' },
  { id: 'rivers', art: 'world/river.webp' },
  { id: 'neighbours', art: 'levels/young.webp' },
  { id: 'tourism', art: 'places/ski-borovets.webp' },
] as const

/** Pictures in the info panels of rivers and lakes. */
export const RIVER_ART = 'world/river.webp'
export const LAKE_ART = 'geo/lake.webp'

export const MAP_IMAGES: readonly string[] = [RELIEF, ...Object.values(PEAK_ART), ...Object.values(LANDSCAPE_ART), ...MODES.map((m) => m.art), RIVER_ART, LAKE_ART]
