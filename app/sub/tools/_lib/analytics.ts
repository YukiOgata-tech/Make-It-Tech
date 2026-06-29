"use client";

type ToolEventName = "tool_run" | "tool_success" | "tool_download" | "tool_error";

type ToolEventParams = {
  toolId: string;
  toolName?: string;
  action?: string;
  fileCount?: number;
  inputType?: string;
  outputType?: string;
  inputBytes?: number;
  outputBytes?: number;
  reductionPercent?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    mitAnalyticsConsent?: "accepted" | "declined" | "unset";
  }
}

function toSafeInteger(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.round(value));
}

export function trackToolEvent(eventName: ToolEventName, params: ToolEventParams) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (window.mitAnalyticsConsent !== "accepted") return;

  window.gtag("event", eventName, {
    event_category: "tools",
    tool_id: params.toolId,
    tool_name: params.toolName,
    tool_action: params.action,
    file_count: toSafeInteger(params.fileCount),
    input_type: params.inputType,
    output_type: params.outputType,
    input_bytes: toSafeInteger(params.inputBytes),
    output_bytes: toSafeInteger(params.outputBytes),
    reduction_percent: toSafeInteger(params.reductionPercent),
  });
}
