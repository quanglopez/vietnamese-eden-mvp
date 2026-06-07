export { helloVietnameseEden } from "@/inngest/hello-vietnamese-eden";
export { inngest } from "./client";
export { publishToFacebook } from "./functions/publish-to-facebook";
export { publishToTikTok } from "./functions/publish-to-tiktok";
export { publishToInstagram } from "./functions/publish-to-instagram";
export { analyzeContent } from "./functions/analyze-content";
export { autoResearch } from "./functions/auto-research";
export { exportToNotion } from "./functions/export-to-notion";
export { exportToSheets } from "./functions/export-to-sheets";
export { notifySlack } from "./functions/notify-slack";
export { notifyTelegram } from "./functions/notify-telegram";

import { helloVietnameseEden } from "@/inngest/hello-vietnamese-eden";
import { publishToFacebook } from "./functions/publish-to-facebook";
import { publishToTikTok } from "./functions/publish-to-tiktok";
import { publishToInstagram } from "./functions/publish-to-instagram";
import { analyzeContent } from "./functions/analyze-content";
import { autoResearch } from "./functions/auto-research";
import { exportToNotion } from "./functions/export-to-notion";
import { exportToSheets } from "./functions/export-to-sheets";
import { notifySlack } from "./functions/notify-slack";
import { notifyTelegram } from "./functions/notify-telegram";

export const functions = [
  helloVietnameseEden,
  publishToFacebook,
  publishToTikTok,
  publishToInstagram,
  analyzeContent,
  autoResearch,
  exportToNotion,
  exportToSheets,
  notifySlack,
  notifyTelegram,
];
