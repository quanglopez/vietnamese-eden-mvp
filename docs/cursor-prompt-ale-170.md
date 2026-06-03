# Cursor Prompt — ALE-170: Error/Loading/Empty State Fixes

## Context

ALE-170 audit (docs/error-state-audit.md) found these gaps. This prompt covers the implementation fixes. DO NOT modify AI provider/prompt. DO NOT touch analytics/events. DO NOT touch Browser Use smoke suite.

## Scope

Fix all gaps found in the error-state-audit.md. Work in order of priority.

---

## Task 1: Global Error + Not-Found Pages (P1)

### 1a. `src/app/error.tsx` (currently empty)

Create a `"use client"` error boundary:

```tsx
"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <h1 className="text-lg font-semibold">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại.
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
```

### 1b. `src/app/not-found.tsx` (currently empty)

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <h1 className="text-lg font-semibold">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Về Dashboard
        </Link>
      </div>
    </main>
  );
}
```

### 1c. `src/app/(app)/error.tsx` (currently empty)

Same as 1a but within the app layout context:

```tsx
"use client";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <h1 className="text-lg font-semibold">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Không thể tải trang này. Vui lòng thử lại.
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
```

### 1d. `src/app/(app)/not-found.tsx` (currently empty)

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AppNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-surface-elev p-8 text-center">
        <h1 className="text-lg font-semibold">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Về Dashboard
        </Link>
      </div>
    </div>
  );
}
```

---

## Task 2: Dashboard Error + Loading (P1)

### 2a. Create `src/app/(app)/dashboard/loading.tsx`

```tsx
import { AppShell } from "@/components/custom/app/app-shell";

function PulseBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <AppShell title="Tổng quan" subtitle="Đang tải…">
      <PulseBlock className="h-32 rounded-2xl mb-8" />
      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <PulseBlock key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <PulseBlock className="h-48 rounded-2xl" />
    </AppShell>
  );
}
```

### 2b. Update `src/app/(app)/dashboard/page.tsx`

Add error handling and pass `fetchError` to `DashboardView`. Currently the page silently swallows errors. Change to:

```tsx
// After workspace check, add error handling:
let fetchError: string | null = null;

if (user) {
  const { workspace, error: workspaceError } = await getCurrentWorkspace(supabase, user.id);
  if (workspaceError) {
    fetchError = workspaceError;
  } else if (workspace) {
    // ... existing parallel fetch
    // wrap in try/catch or check individual errors
  }
}

// Pass fetchError to DashboardView
<DashboardView
  title={...}
  subtitle={...}
  boards={boards}
  checklistProgress={checklistProgress}
  fetchError={fetchError}
/>
```

### 2c. Update `src/components/custom/app/dashboard-view.tsx`

Add `fetchError` prop and display error banner:

```tsx
type DashboardViewProps = {
  title: string;
  subtitle: string;
  boards: BoardListItem[];
  checklistProgress: OnboardingChecklistProgress | null;
  fetchError?: string | null;  // ADD THIS
};

// In the render, add before the checklist:
{fetchError ? (
  <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
    {fetchError}
  </div>
) : null}
```

---

## Task 3: Retry Buttons on Error Banners (P2)

Add a retry button to all `fetchError` banners. Pattern:

```tsx
{fetchError ? (
  <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-start justify-between gap-3">
    <p>Không tải được: {fetchError}</p>
    <button
      type="button"
      onClick={() => router.refresh()}
      className="shrink-0 text-xs font-medium text-destructive underline hover:no-underline"
    >
      Thử lại
    </button>
  </div>
) : null}
```

Apply to these files (add `useRouter` import if not already present):
- `src/components/custom/boards/boards-list-view.tsx` — line ~102
- `src/components/custom/boards/board-detail-view.tsx` — line ~561
- `src/components/custom/breakdown/breakdown-view.tsx` — search for fetchError banner
- `src/components/custom/remix/remix-view.tsx` — line ~65
- `src/components/custom/calendar/calendar-view.tsx` — line ~43
- `src/components/custom/voice/voice-view.tsx` — line ~31 (already has good error handling, but add retry to fetchError banner for consistency)

---

## Task 4: Auth Form Submit Spinners (P2)

### 4a. Login form (`src/components/custom/auth/login-form.tsx`)

Find the submit button and add Loader2 when `isSubmitting`:

```tsx
import { Loader2 } from "lucide-react";

// Replace the submit button:
<Button type="submit" className="w-full" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Đang đăng nhập…
    </>
  ) : (
    "Đăng nhập"
  )}
</Button>
```

### 4b. Signup form (`src/components/custom/auth/signup-form.tsx`)

Same pattern for the signup submit button.

### 4c. Forgot password form (`src/components/custom/auth/forgot-password-form.tsx`)

Same pattern for the forgot password submit button.

---

## Task 5: Custom Not-Found Pages (P3)

### 5a. Create `src/app/(app)/breakdown/[contentItemId]/not-found.tsx`

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/custom/app/app-shell";
import { Button } from "@/components/ui/button";

export default function BreakdownNotFound() {
  return (
    <AppShell title="AI Breakdown" subtitle="Không tìm thấy nội dung">
      <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 max-w-lg">
        <h2 className="font-display text-xl font-bold">Nội dung không khả dụng</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Content item này không tồn tại hoặc đã bị xóa.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/boards">
            <ArrowLeft className="h-4 w-4" />
            Về danh sách bảng
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
```

### 5b. Create `src/app/(app)/remix/[contentItemId]/not-found.tsx`

Same pattern but with "Remix Generator" title.

---

## Verification

After all changes:

```bash
npm run lint && npm run type-check && npm run build
```

All must pass. Do NOT commit if any fail.

---

## Out of Scope

- Mobile 375px visual check (needs browser testing separately)
- AI provider/prompt changes
- Analytics/events changes
- Browser Use smoke suite
