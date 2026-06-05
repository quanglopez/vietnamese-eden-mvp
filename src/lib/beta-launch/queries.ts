import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AnalyticsEventType } from "@/types/analytics";
import type {
  BetaCoreFlowStatus,
  BetaFeedbackStatus,
  BetaInviteStatus,
  BetaPersona,
  BetaSignupStatus,
  BetaTesterWithHint,
} from "@/types/beta-testers";
import { listBetaTestersWithHints } from "@/lib/beta-testers/queries";
import { getWorkspaceAnalyticsCounts } from "@/lib/analytics/queries";
import { getPlatformAuthCounts } from "@/lib/analytics/platform-queries";
import { listFeedbackEntries } from "@/lib/feedback/queries";
import type { Database } from "@/types/database";

export type LaunchOverview = {
  totalTesters: number;
  byInviteStatus: Record<BetaInviteStatus, number>;
  bySignupStatus: Record<BetaSignupStatus, number>;
  byCoreFlowStatus: Record<BetaCoreFlowStatus, number>;
  byFeedbackStatus: Record<BetaFeedbackStatus, number>;
};

export type CohortBreakdown = {
  byPersona: Record<BetaPersona, number>;
  byStatus: Record<BetaInviteStatus, number>;
  sourceNote: string;
};

export type ActivationSnapshot = {
  platformAuth: { signup: number; login: number };
  workspaceEvents: Record<AnalyticsEventType, number>;
};

export type BetaLaunchData = {
  overview: LaunchOverview;
  cohort: CohortBreakdown;
  activation: ActivationSnapshot;
  feedbackCount: number;
  testers: BetaTesterWithHint[];
  errors: string[];
};

const ZERO_INVITE_STATUS: Record<BetaInviteStatus, number> = {
  pending: 0,
  invited: 0,
  accepted: 0,
  declined: 0,
  expired: 0,
};

const ZERO_SIGNUP_STATUS: Record<BetaSignupStatus, number> = {
  not_signed_up: 0,
  signed_up: 0,
  onboarded: 0,
};

const ZERO_CORE_FLOW_STATUS: Record<BetaCoreFlowStatus, number> = {
  not_started: 0,
  in_progress: 0,
  partial: 0,
  completed: 0,
};

const ZERO_FEEDBACK_STATUS: Record<BetaFeedbackStatus, number> = {
  not_requested: 0,
  requested: 0,
  received: 0,
  "n/a": 0,
};

const ZERO_PERSONA: Record<BetaPersona, number> = {
  creator: 0,
  agency: 0,
  beauty_lifestyle: 0,
  educator_coach: 0,
  other: 0,
};

function emptyOverview(): LaunchOverview {
  return {
    totalTesters: 0,
    byInviteStatus: { ...ZERO_INVITE_STATUS },
    bySignupStatus: { ...ZERO_SIGNUP_STATUS },
    byCoreFlowStatus: { ...ZERO_CORE_FLOW_STATUS },
    byFeedbackStatus: { ...ZERO_FEEDBACK_STATUS },
  };
}

function emptyCohort(): CohortBreakdown {
  return {
    byPersona: { ...ZERO_PERSONA },
    byStatus: { ...ZERO_INVITE_STATUS },
    sourceNote:
      "Nguồn đăng ký (source) không có sẵn — bảng beta_testers chưa có cột source.",
  };
}

export function computeLaunchOverview(testers: BetaTesterWithHint[]): LaunchOverview {
  const overview = emptyOverview();
  overview.totalTesters = testers.length;

  for (const tester of testers) {
    overview.byInviteStatus[tester.invite_status] += 1;
    overview.bySignupStatus[tester.signup_status] += 1;
    overview.byCoreFlowStatus[tester.core_flow_status] += 1;
    overview.byFeedbackStatus[tester.feedback_status] += 1;
  }

  return overview;
}

export function computeCohortBreakdown(testers: BetaTesterWithHint[]): CohortBreakdown {
  const cohort = emptyCohort();

  for (const tester of testers) {
    cohort.byPersona[tester.persona] += 1;
    cohort.byStatus[tester.invite_status] += 1;
  }

  return cohort;
}

export async function getBetaLaunchData(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<BetaLaunchData> {
  const errors: string[] = [];

  const [testerResult, workspaceCountsResult, authCountsResult, feedbackResult] =
    await Promise.all([
      listBetaTestersWithHints(supabase, workspaceId),
      getWorkspaceAnalyticsCounts(supabase, workspaceId, 30),
      getPlatformAuthCounts(30),
      listFeedbackEntries(supabase, workspaceId),
    ]);

  if (testerResult.error) errors.push(testerResult.error);
  if (workspaceCountsResult.error) errors.push(workspaceCountsResult.error);
  if (authCountsResult.error) errors.push(authCountsResult.error);
  if (feedbackResult.error) errors.push(feedbackResult.error);

  const testers = testerResult.testers ?? [];
  const overview = computeLaunchOverview(testers);
  const cohort = computeCohortBreakdown(testers);

  const workspaceEvents = Object.fromEntries(
    workspaceCountsResult.rows.map((r) => [r.event_type, r.count]),
  ) as Record<AnalyticsEventType, number>;

  const activation: ActivationSnapshot = {
    platformAuth: {
      signup: authCountsResult.counts.signup,
      login: authCountsResult.counts.login,
    },
    workspaceEvents,
  };

  return {
    overview,
    cohort,
    activation,
    feedbackCount: feedbackResult.entries.length,
    testers,
    errors,
  };
}
