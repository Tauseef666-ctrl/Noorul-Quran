/*
 * Restrained equalizer/waveform indicator — signals active playback without a
 * "music player" look. Muted is a standstill 3-bar glyph.
 */

export function EqualizerBars({ muted = false }: { muted?: boolean }) {
  return (
    <span
      aria-hidden
      className={`eq-bars ${muted ? 'eq-bars--muted' : ''}`}
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  )
}