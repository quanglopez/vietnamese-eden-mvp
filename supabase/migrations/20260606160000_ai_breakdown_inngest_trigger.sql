-- =============================================================================
-- Trigger: Auto-request AI Breakdown when content item raw_content is updated
-- =============================================================================

-- 1. Enable pg_net (one-time per project, idempotent)
create extension if not exists pg_net with schema extensions;

-- 2. Function: fires when raw_content changes from null/empty to non-empty
--    Only triggers for rows where analysis does NOT already exist or is failed.
create or replace function public.trigger_request_ai_breakdown()
returns trigger as $$
declare
  analysis_status text;
  event_key     text;
  payload       text;
  api_url       text;
begin
  -- Only fire when raw_content actually gains content (was empty/null, now has text)
  if coalesce(trim(old.raw_content), '') = '' and coalesce(trim(new.raw_content), '') != '' then

    -- Check if analysis already exists and is NOT failed
    select status into analysis_status
    from public.content_analyses
    where content_item_id = new.id
    order by created_at desc
    limit 1;

    if analysis_status is not null and analysis_status != 'failed' then
      -- Already pending or completed — skip
      return new;
    end if;

    event_key := coalesce(current_setting('app.inngest_event_key', true), '');
    api_url   := coalesce(current_setting('app.inngest_api_url', true), '');

    if api_url = '' then
      raise warning 'app.inngest_api_url is not set — skipping Inngest event';
      return new;
    end if;

    payload := jsonb_build_object(
      'name', 'content/analysis-requested',
      'data', jsonb_build_object(
        'contentItemId', new.id,
        'workspaceId',   new.workspace_id,
        'userId',        new.saved_by
      )
    )::text;

    -- Send event via pg_net
    perform extensions.net.http_post(
      url     := api_url,
      headers := jsonb_build_object(
        'Content-Type',   'application/json',
        'Authorization',  'Bearer ' || event_key,
        'x-inngest-env',  'production'
      ),
      body    := payload::extensions.jsonb,
      timeout_milliseconds := 5000
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 3. Trigger
drop trigger if exists content_item_raw_content_ai_breakdown on public.content_items;
create trigger content_item_raw_content_ai_breakdown
  after update on public.content_items
  for each row
  execute function public.trigger_request_ai_breakdown();

comment on function public.trigger_request_ai_breakdown() is
  'Fires content/analysis-requested Inngest event when raw_content gains text. Skips if analysis already pending/completed.';

comment on trigger content_item_raw_content_ai_breakdown on public.content_items is
  'Auto-kick AI Breakdown when user pastes/transcribes content into a content_items row.';
