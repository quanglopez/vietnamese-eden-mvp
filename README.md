# Vietnamese Eden MVP

AI Content Workspace tiếng Việt cho creator, agency và người làm content.

## Tính năng chính

- 📌 **Swipe Board**: Lưu bài viral tiếng Việt
- 🤖 **AI Breakdown**: Phân tích Hook, Angle, Structure, CTA
- 🎙️ **Voice Profile**: Học giọng viết cá nhân
- ✨ **Remix Generator**: Biến content thành nội dung mới
- 📅 **Content Calendar**: Lên lịch publish

## Tech Stack

- Next.js 14 App Router + TypeScript strict
- Tailwind CSS + shadcn/ui (base color: slate)
- Supabase (PostgreSQL + Auth + Edge Functions)
- OpenAI / Anthropic API
- TanStack Query
- Zod + React Hook Form

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Dev server tại `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Chạy production server |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript check |
| `npm run supabase:start` | Khởi động Supabase local (Docker) |
| `npm run supabase:test` | Test query kết nối Supabase |
| `npm run supabase:reset` | Reset DB + chạy migrations |

## Cấu trúc

```
src/
├── app/                    # Routes + layouts (App Router)
│   ├── (auth)/             # Route group cho auth
│   │   ├── login/
│   │   └── signup/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── custom/             # App-specific components
├── lib/                    # Utils, API clients
├── types/                  # TypeScript interfaces
└── hooks/                  # Custom React hooks
```

## Setup

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Copy biến môi trường:

   ```bash
   cp .env.example .env.local
   ```

   Điền Supabase credentials vào `.env.local`.

   **Local dev:** chạy `npm run supabase:start`, copy keys từ `npm run supabase:status` vào `.env.local`, rồi `npm run supabase:test`.

   Chi tiết: [supabase/README.md](./supabase/README.md)

3. Chạy dev server:

   ```bash
   npm run dev
   ```

4. Mở [http://localhost:3000](http://localhost:3000)

## License

Private — Rex Ai (1/2)
