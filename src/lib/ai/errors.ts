export class AiProviderError extends Error {
  readonly code:
      | "missing_api_key"
      | "missing_config"
      | "provider_error"
      | "invalid_response"
      | "timeout";

  constructor(
    message: string,
    code: AiProviderError["code"],
  ) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
  }
}

/** Thrown when remix output contains CJK / non-Vietnamese glyphs (ALE-148). */
export class RemixContentError extends AiProviderError {
  constructor(message: string) {
    super(message, "invalid_response");
    this.name = "RemixContentError";
  }
}

/** Thrown when breakdown output leaks non-Vietnamese tokens (ALE-153). */
export class BreakdownContentError extends AiProviderError {
  constructor(message: string) {
    super(message, "invalid_response");
    this.name = "BreakdownContentError";
  }
}
