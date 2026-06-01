export class AiProviderError extends Error {
  readonly code:
    | "missing_api_key"
    | "missing_config"
    | "provider_error"
    | "invalid_response";

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
