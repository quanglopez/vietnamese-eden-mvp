1|-- ALE-167 Post-Migration Verification
2|-- Run this AFTER applying 20260603120000_analytics_events.sql
3|
4|-- 1. Enum exists with 7 values
5|SELECT enumlabel FROM pg_enum
6|WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'analytics_event_type')
7|ORDER BY enumsortorder;
8|
9|-- Expected: signup, login, board_create, content_add, breakdown_run, remix_run, calendar_add
10|
11|-- 2. Table exists
12|SELECT column_name, data_type, is_nullable, column_default
13|FROM information_schema.columns
14|WHERE table_schema = 'public' AND table_name = 'analytics_events'
15|ORDER BY ordinal_position;
16|
17|-- Expected: id (uuid), user_id (uuid, nullable), workspace_id (uuid, nullable),
18|--           event_type (USER-DEFINED), metadata (jsonb), created_at (timestamp with time zone)
19|
20|-- 3. Indexes exist
21|SELECT indexname, indexdef FROM pg_indexes
22|WHERE tablename = 'analytics_events' AND schemaname = 'public';
23|
24|-- Expected: 4 indexes + primary key
25|
26|-- 4. RLS enabled
27|SELECT relname, relrowsecurity FROM pg_class
28|WHERE relname = 'analytics_events';
29|
30|-- Expected: relrowsecurity = true
31|
32|-- 5. Policies exist
33|SELECT policyname, cmd, qual, with_check FROM pg_policies
34|WHERE tablename = 'analytics_events';
35|
36|-- Expected:
37|-- "Users insert own analytics events" | INSERT | (user_id = auth.uid())
38|-- "Workspace admins read workspace analytics" | SELECT | (workspace_id is not null and is_workspace_admin(workspace_id))
39|
40|-- 6. Helper function exists (prerequisite)
41|SELECT proname FROM pg_proc WHERE proname = 'is_workspace_admin';
42|
43|-- Expected: is_workspace_admin
44|
45|-- 7. No broad SELECT policy (security check)
46|SELECT policyname FROM pg_policies
47|WHERE tablename = 'analytics_events' AND cmd = 'select'
48|AND (qual IS NULL OR qual = 'true');
49|
50|-- Expected: 0 rows (no unrestricted SELECT)
51|