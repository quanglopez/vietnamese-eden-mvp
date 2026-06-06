-- =============================================================================
-- SUPABASE TRIGGER: fire Inngest event when a calendar item is scheduled
-- =============================================================================
--
-- This migration uses pg_net (HTTP extension) to POST to the Inngest API
-- whenever a content_calendar_items row changes status to 'scheduled'.
--
-- Prerequisites:
--   1. Enable pg_net in Supabase dashboard: Database → Extensions → pg_net
--   2. Set INNGEST_EVENT_KEY in your Vercel / Supabase Vault env
--   3. Set INNGEST_API_URL (default: https://inn.gs/e/<event-key> or custom)
--
-- Alternative (if pg_net unavailable):
--   Use a Supabase Edge Function + Webhook, or call Inngest directly from app code.
-- =============================================================================

-- pg_net must be enabled on the project
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =============================================================================
-- TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.trigger_inngest_calendar_scheduled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- runs as postgres so pg_net works
SET search_path = ''
AS $$
DECLARE
  payload JSONB;
  inngest_url TEXT;
BEGIN
  -- Only react when status changes TO 'scheduled' (not FROM scheduled, not every update)
  IF NEW.status = 'scheduled' AND (OLD.status IS DISTINCT FROM NEW.status) THEN

    inngest_url := COALESCE(
      current_setting('app.inngest_api_url', true),
      'https://inn.gs/e/' || COALESCE(current_setting('app.inngest_event_key', true), '')
    );

    -- Skip if no URL configured (graceful degradation in dev / local)
    IF inngest_url IS NULL OR inngest_url = 'https://inn.gs/e/' THEN
      RAISE NOTICE 'INNGEST_API_URL or INNGEST_EVENT_KEY not set — skipping Inngest trigger';
      RETURN NEW;
    END IF;

    payload := jsonb_build_object(
      'name', 'calendar/scheduled',
      'data', jsonb_build_object(
        'calendarItemId', NEW.id,
        'workspaceId', NEW.workspace_id,
        'scheduledAt', NEW.scheduled_at
      )
    );

    -- Async HTTP POST via pg_net (non-blocking for the transaction)
    PERFORM net.http_post(
      url := inngest_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := payload
    );

  END IF;

  RETURN NEW;
END;
$$;

-- =============================================================================
-- ATTACH TRIGGER
-- =============================================================================

DROP TRIGGER IF EXISTS calendar_scheduled_inngest ON public.content_calendar_items;

CREATE TRIGGER calendar_scheduled_inngest
  AFTER INSERT OR UPDATE ON public.content_calendar_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_inngest_calendar_scheduled();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.trigger_inngest_calendar_scheduled() IS
  'Fires Inngest "calendar/scheduled" event when content_calendar_items.status becomes "scheduled". Uses pg_net for async HTTP POST.';
