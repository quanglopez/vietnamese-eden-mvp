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
      if (!segments?.length) {
        console.warn("[youtube-transcript] empty segments", { videoId });
        return null;
      }
      const transcript = segments.map((s) => s.text).join(" ").trim();
      console.info("[youtube-transcript] fetched", {
        videoId,
        segments: segments.length,
        length: transcript.length,
      });
      return transcript || null;
    } catch (error) {
      console.warn("[youtube-transcript] failed", {
        videoId,
        reason: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

/**
 * Runtime-gated fetcher. Đọc env var ở mỗi request để tránh bị freeze sai lúc module load.
 */
export class RuntimeTranscriptFetcher implements TranscriptFetcher {
  private readonly enabledFetcher = new YoutubeTranscriptFetcher();
  private readonly disabledFetcher = new DisabledTranscriptFetcher();

  async fetchTranscript(videoId: string): Promise<string | null> {
    const enabled = process.env.YOUTUBE_TRANSCRIPT_ENABLED === "true";
    if (!enabled) {
      console.info("[youtube-transcript] disabled", { videoId });
      return this.disabledFetcher.fetchTranscript(videoId);
    }
    return this.enabledFetcher.fetchTranscript(videoId);
  }
}

/**
 * Factory transcript — runtime-gated bằng YOUTUBE_TRANSCRIPT_ENABLED=true.
 */
export function createTranscriptFetcher(): TranscriptFetcher {
  return new RuntimeTranscriptFetcher();
}

export function isYouTubeTranscriptEnabled(): boolean {
  return process.env.YOUTUBE_TRANSCRIPT_ENABLED === "true";
}
