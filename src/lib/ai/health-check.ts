import { resolveAiModel, type AiProviderKind } from "@/lib/ai/config";

export type AiHealthStatus = {
  ok: boolean;
  provider: "configured" | "missing_api_key" | "missing_config";
  kind: AiProviderKind;
  model: string;
};

type AiHealthEnv = Partial<Record<string, string | undefined>>;

export function getAiHealthStatus(env: AiHealthEnv = process.env): AiHealthStatus {
  const kind = resolveKind(env.AI_PROVIDER);
  const model = resolveModel(kind, env);

  if (env.AI_USE_MOCK === "true" && env.NODE_ENV !== "production") {
    return { ok: true, provider: "configured", kind: "mock", model: "mock-dev" };
  }

  if (kind === "xiaomi") {
    const hasConfig = Boolean(env.XIAOMI_API_KEY?.trim() && env.XIAOMI_BASE_URL?.trim());
    return {
      ok: hasConfig,
      provider: hasConfig ? "configured" : "missing_config",
      kind,
      model,
    };
  }

  if (kind === "mock") {
    return { ok: true, provider: "configured", kind, model };
  }

  const hasKey = Boolean(env.OPENAI_API_KEY?.trim());
  return {
    ok: hasKey,
    provider: hasKey ? "configured" : "missing_api_key",
    kind,
    model,
  };
}

function resolveKind(rawProvider: string | undefined): AiProviderKind {
  const raw = rawProvider?.trim().toLowerCase();
  if (!raw) {
    return "openai";
  }
  if (raw === "mock" || raw === "openai" || raw === "xiaomi") {
    return raw;
  }
  return "openai";
}

function resolveModel(kind: AiProviderKind, env: AiHealthEnv): string {
  const fromEnv = env.AI_MODEL?.trim();
  if (fromEnv) {
    return fromLabel(fromEnv);
  }
  if (kind === "xiaomi") {
    return "mimo-v2.5";
  }
  return fromLabel(env.OPENAI_MODEL?.trim() || resolveAiModel(kind));
}

function fromLabel(model: string): string {
  return model || "configured";
}
