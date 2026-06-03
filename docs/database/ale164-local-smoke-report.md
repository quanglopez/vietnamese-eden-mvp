# ALE-164 local smoke report — 2026-06-03T02:41:19.572Z

- Base URL: http://localhost:3008
- Email: ***
- Steps: 14 | PASS: 7 | FAIL: 7 | SKIP: 0

## Steps
- PASS (3247ms) **Login**
- PASS (1788ms) **Open /boards and pick first board with content**
- PASS (5264ms) **Open board detail**
- PASS (110ms) **Select 1 item by checkbox**
- PASS (141ms) **Select 3 items by checkbox**
- FAIL (221ms) **Shift-click range select extends** — Shift-click range expected 4 selected, got: "Đã chọn 2 nội dung
Thêm tag
Chuyển board
Gỡ khỏi board
Bỏ chọn"
- PASS (2803ms) **Setup: create a test tag 'ALE164_smoke' via single-card tag manager**
- FAIL (30004ms) **Bulk add tag: pick first existing workspace tag** — locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[data-testid="bulk-action-toolbar"] button:has-text("Thêm tag")')[22m

- PASS (1066ms) **Bulk unlink: select 2 items, click Gỡ khỏi board, confirm dialog**
- FAIL (31553ms) **Bulk move: select 1 remaining item, move to another board** — locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[role="menuitem"]').filter({ hasText: /^(?!Không).+/ }).first()[22m
[2m    - locator resolved to <div tabindex="-1" ro
- FAIL (5ms) **Empty selection: bulk toolbar hidden** — Toolbar still visible when no items selected
- FAIL (30014ms) **Regression: single-card tag manager dialog opens** — locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[data-testid="manage-tags-button"]').first()[22m
[2m    - locator resolved to <button type="button" data-size="sm" dat
- FAIL (30020ms) **Regression: Breakdown link navigates** — locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('a[href^="/breakdown/"]').first()[22m
[2m    - locator resolved to <a class="block flex-1" href="/breakdown/65b6ff01-ee
- FAIL (1865ms) **Regression: search input filters cards** — Search did not filter: before=3 after=3

## Screenshots
See `C:/Users/ADMIN/vietnamese-eden-mvp/scripts/browser-use/screenshots/ale164/` for full-page snapshots.