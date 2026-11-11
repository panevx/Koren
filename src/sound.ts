import { useSettings } from './store/settings'

/**
 * Sound effects synthesised with Web Audio — no audio files, no licences, no downloads.
 * Respects the "Sound effects" switch in Settings. Silently does nothing where audio is unavailable.
 */
export type Sound = 'correct' | 'hint' | 'badge' | 'tap'

// Notes as [frequency Hz, start s, duration s]
const SOUNDS: Record<Sound, { wave: OscillatorType; notes: [number, number, number][]; volume: number }> = {
  correct: { wave: 'triangle', volume: 0.25, notes: [[659, 0, 0.12], [880, 0.1, 0.2]] }, // E5 → A5
  hint: { wave: 'sine', volume: 0.18, notes: [[440, 0, 0.14], [392, 0.12, 0.2]] }, // soft A4 → G4, not a "buzz"
  badge: { wave: 'triangle', volume: 0.25, notes: [[523, 0, 0.12], [659, 0.11, 0.12], [784, 0.22, 0.12], [1047, 0.33, 0.35]] },
  tap: { wave: 'sine', volume: 0.12, notes: [[700, 0, 0.05]] },
}

let ctx: AudioContext | null = null

export function play(sound: Sound) {
  if (!useSettings.getState().sound) return
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    const { wave, notes, volume } = SOUNDS[sound]
    const now = ctx.currentTime
    for (const [freq, start, dur] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = wave
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.05)
    }
  } catch {
    /* audio is a bonus, never a crash */
  }
}
