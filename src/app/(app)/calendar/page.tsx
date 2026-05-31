import type { Metadata } from "next";

import { CalendarView } from "@/components/custom/calendar/calendar-view";
import { listCalendarItemsForWorkspace } from "@/lib/calendar/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Lịch nội dung · Vietnamese Eden",
  description: "Content Calendar — lên lịch đăng nội dung",
};

export default async function CalendarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <CalendarView items={[]} fetchError="Bạn cần đăng nhập để xem lịch nội dung." />
    );
  }

  const { workspace, error: workspaceError } = await getCurrentWorkspace(supabase, user.id);

  if (workspaceError) {
    return <CalendarView items={[]} fetchError={workspaceError} />;
  }

  if (!workspace) {
    return (
      <CalendarView
        items={[]}
        fetchError="Không tìm thấy workspace. Hãy tham gia hoặc tạo workspace trước."
      />
    );
  }

  const { items, error: itemsError } = await listCalendarItemsForWorkspace(
    supabase,
    workspace.id,
  );

  return <CalendarView items={items} fetchError={itemsError} />;
}
