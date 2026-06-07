import { YoutubeTranscript } from "youtube-transcript";

/** Lấy transcript/caption theo video ID. */
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

/** Thật: dùng youtube-transcript npm package. */
export class YoutubeTranscriptFetcher implements TranscriptFetcher {
  async fetchTranscript(videoId: string): Promise<string | null> {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      if (!segments?.length) return null;
      return segments.map((s) => s.text).join(" ").trim() || null;
    } catch {
      return null;
    }
  }
}

/**
 * Factory transcript — bật khi YOUTUBE_TRANSCRIPT_ENABLED=true.
 */
export function createTranscriptFetcher(): TranscriptFetcher {
  if (process.env.YOUTUBE_TRANSCRIPT_ENABLED === "true") {
    return new YoutubeTranscriptFetcher();
  }
  return new DisabledTranscriptFetcher();
}
