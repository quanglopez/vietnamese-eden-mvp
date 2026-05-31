export const MIN_VOICE_SAMPLE_CHARS = 500;
export const MAX_VOICE_SAMPLE_CHARS = 80_000;

export function countSamplePosts(sampleWritings: string): number {
  const blocks = sampleWritings
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  return blocks.length > 0 ? blocks.length : 1;
}
