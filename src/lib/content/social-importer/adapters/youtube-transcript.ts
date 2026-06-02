/**
 * Seam transcript YouTube — ALE-155 chỉ bật interface + implementation tắt.
 * Không gọi timedtext / scrape watch page trong production.
 */

/** Lấy transcript/caption theo video ID (tương lai / opt-in). */
export interface TranscriptFetcher {
  fetchTranscript(videoId: string): Promise<string | null>;
}

/** Mặc định: không fetch transcript. */
export class DisabledTranscriptFetcher implements TranscriptFetcher {
  async fetchTranscript(videoId: string): Promise<null> {
    void videoId;
    return null;
  }
}

/**
 * Factory transcript — env `YOUTUBE_TRANSCRIPT_ENABLED` chỉ là seam tương lai;
 * ALE-155 luôn trả DisabledTranscriptFetcher (không HTTP transcript).
 */
export function createTranscriptFetcher(): TranscriptFetcher {
  void process.env.YOUTUBE_TRANSCRIPT_ENABLED;
  return new DisabledTranscriptFetcher();
}
