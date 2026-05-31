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
