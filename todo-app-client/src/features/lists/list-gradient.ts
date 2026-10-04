// Match HSL lightness * 1.2 used by the original card, without an ESM-only dependency.
export function listGradient(color: string): string {
  const channels = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255);
  const max = Math.max(...channels), min = Math.min(...channels);
  const light = (max + min) / 2;
  const chroma = max - min;
  const saturation = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * light - 1));
  const nextLight = Math.min(1, light * 1.2);
  const nextChroma = (1 - Math.abs(2 * nextLight - 1)) * saturation;
  const highlight = "#" + channels.map(channel => {
    const next = chroma === 0 ? nextLight : (channel - min) * nextChroma / chroma + nextLight - nextChroma / 2;
    return Math.round(Math.max(0, Math.min(1, next)) * 255).toString(16).padStart(2, "0");
  }).join("").toUpperCase();
  return `radial-gradient(circle at center top, ${highlight} 0%, ${color} 100%)`;
}
