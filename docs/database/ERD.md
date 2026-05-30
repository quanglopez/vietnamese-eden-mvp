# Vietnamese Eden MVP — Database ERD

> **Issue:** ALE-63 · **Milestone:** Foundation  
> **Tables:** 10 bảng chính + `health_check` (ALE-62 probe)

## Entity Relationship Diagram

```mermaid
erDiagram
    auth_users ||--|| profiles : "extends"
    profiles ||--o{ workspaces : "owns"
    workspaces ||--o{ workspace_members : "has"
    profiles ||--o{ workspace_members : "belongs"
    workspaces ||--o{ boards : "contains"
    workspaces ||--o{ content_items : "stores"
    boards ||--o{ board_content_items : "pins"
    content_items ||--o{ board_content_items : "pinned_on"
    content_items ||--o| content_analyses : "analyzed_by"
    workspaces ||--o{ voice_profiles : "defines"
    profiles ||--o{ voice_profiles : "creates"
    content_items ||--o{ generated_outputs : "sources"
    voice_profiles ||--o{ generated_outputs : "styles"
    workspaces ||--o{ generated_outputs : "owns"
    generated_outputs ||--o{ content_calendar_items : "schedules"
    content_items ||--o{ content_calendar_items : "schedules"
    workspaces ||--o{ content_calendar_items : "plans"

    profiles {
        uuid id PK
        text email
        text full_name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    workspaces {
        uuid id PK
        text name
        text slug UK
        uuid owner_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        workspace_role role
        timestamptz joined_at
    }

    boards {
        uuid id PK
        uuid workspace_id FK
        text name
        text description
        int sort_order
        uuid created_by FK
        timestamptz created_at
    }

    content_items {
        uuid id PK
        uuid workspace_id FK
        text title
        platform_type platform
        text source_url
        text raw_content
        uuid saved_by FK
        timestamptz saved_at
    }

    board_content_items {
        uuid id PK
        uuid board_id FK
        uuid content_item_id FK
        int sort_order
        uuid added_by FK
        timestamptz added_at
    }

    content_analyses {
        uuid id PK
        uuid content_item_id FK UK
        uuid workspace_id FK
        text hook
        text angle
        text structure
        text cta
        analysis_status status
        timestamptz analyzed_at
    }

    voice_profiles {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        text name
        text tone
        int sample_count
        boolean is_default
    }

    generated_outputs {
        uuid id PK
        uuid workspace_id FK
        uuid source_content_item_id FK
        uuid voice_profile_id FK
        text content
        output_status status
        uuid created_by FK
    }

    content_calendar_items {
        uuid id PK
        uuid workspace_id FK
        uuid generated_output_id FK
        uuid content_item_id FK
        text title
        platform_type platform
        timestamptz scheduled_at
        calendar_status status
    }
```

## Bảng & mục đích

| # | Bảng | Mô tả |
|---|------|--------|
| 1 | `profiles` | Hồ sơ user (mở rộng `auth.users`) |
| 2 | `workspaces` | Không gian làm việc (cá nhân / agency) |
| 3 | `workspace_members` | Thành viên + vai trò trong workspace |
| 4 | `boards` | Swipe Board — nhóm content viral |
| 5 | `content_items` | Bài viral đã lưu |
| 6 | `board_content_items` | Liên kết content ↔ board (M:N) |
| 7 | `content_analyses` | AI Breakdown (Hook, Angle, Structure, CTA) |
| 8 | `voice_profiles` | Giọng viết cá nhân |
| 9 | `generated_outputs` | Remix / content AI sinh ra |
| 10 | `content_calendar_items` | Lịch publish |

## Enums

| Enum | Values |
|------|--------|
| `platform_type` | tiktok, facebook, instagram, youtube, other |
| `workspace_role` | owner, admin, member |
| `analysis_status` | pending, completed, failed |
| `output_status` | draft, ready, published, archived |
| `calendar_status` | scheduled, published, skipped, failed |

## RLS tóm tắt

- Mọi bảng workspace-scoped: chỉ **workspace member** mới truy cập được.
- `profiles`: user chỉ đọc/sửa profile của chính mình.
- `workspace_members`: member xem được danh sách thành viên cùng workspace.
- Helper: `public.is_workspace_member(uuid)` — dùng trong policies.

## Migration

DDL đầy đủ: [`supabase/migrations/20260530130000_initial_schema.sql`](../../supabase/migrations/20260530130000_initial_schema.sql)

Apply local:

```bash
npm run supabase:reset
```
