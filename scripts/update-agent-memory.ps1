# update-agent-memory.ps1
# Utility script: kiểm tra và tạo file memory còn thiếu trong .agent-memory/
# Cách dùng: .\scripts\update-agent-memory.ps1
# Không xóa file cũ. Không ghi đè nội dung đã có.

$ErrorActionPreference = "Stop"
$MemoryDir = ".agent-memory"

# Template cho từng file
$Templates = @{
    "INSTRUCTIONS.md" = @"
# Agent Instructions

Quy tắc làm việc cho AI agent trong project này.

1. Luôn đọc MEMORY.md, DECISIONS.md, TASKS.md trước khi làm task mới.
2. Luôn cập nhật DECISIONS.md khi có quyết định mới.
3. Luôn cập nhật TASKS.md khi task thay đổi trạng thái.
4. Không tự ý xóa code lớn, thay đổi secret, merge PR.
5. Ưu tiên giải pháp đơn giản, dễ rollback.
6. Hỏi owner khi không chắc chắn.
"@
    "MEMORY.md" = @"
# Project Memory

## Project Overview
_(Điền mô tả project)_

## Tech Stack
_(Điền tech stack)_

## User Preferences
_(Điền preferences)_

## Current Constraints
_(Điền constraints)_

## Important Commands
_(Điền commands)_

## Common Pitfalls
_(Điền pitfalls)_
"@
    "DECISIONS.md" = @"
# Decision Log

Format: Date | Decision | Reason | Alternatives | Status

---

_(Chưa có quyết định nào được ghi nhận)_
"@
    "TASKS.md" = @"
# Tasks

## Backlog
_(Danh sách task pending)_

## In Progress
_(Task đang làm)_

## Done
_(Task đã xong)_

## Blocked
_(Task bị block)_

## Next Recommended Task
_(Task nên làm tiếp theo)_
"@
    "ERRORS.md" = @"
# Error Log

Format: Error | Context | Root Cause | Fix | Prevention

---

_(Chưa có lỗi nào được ghi nhận)_
"@
    "README.md" = @"
# Agent Memory

Bộ memory files cho AI agent (Hermes, Cursor) làm việc trong project này.

## Cách dùng

1. Agent đọc MEMORY.md và TASKS.md trước mỗi session.
2. Agent cập nhật DECISIONS.md khi có quyết định mới.
3. Agent cập nhật TASKS.md khi task thay đổi.
4. Agent ghi ERRORS.md khi gặp lỗi đáng nhớ.

## File structure

- INSTRUCTIONS.md — Quy tắc làm việc
- MEMORY.md — Project context
- DECISIONS.md — Decision log
- TASKS.md — Task tracking
- ERRORS.md — Error log
- README.md — File này
"@
}

Write-Host "=== Agent Memory Check ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra folder .agent-memory/
if (-not (Test-Path $MemoryDir)) {
    Write-Host "[CREATE] Creating $MemoryDir/ ..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $MemoryDir | Out-Null
} else {
    Write-Host "[OK] $MemoryDir/ exists" -ForegroundColor Green
}
Write-Host ""

# Liệt kê file hiện có
$ExistingFiles = Get-ChildItem -Path $MemoryDir -Name -File 2>$null
if ($ExistingFiles) {
    Write-Host "Existing files:" -ForegroundColor White
    foreach ($f in $ExistingFiles) {
        $size = (Get-Item "$MemoryDir/$f").Length
        Write-Host "  [EXISTS] $f ($size bytes)" -ForegroundColor Gray
    }
} else {
    Write-Host "  (no files yet)" -ForegroundColor Gray
}
Write-Host ""

# Kiểm tra từng file template
$RequiredFiles = @("INSTRUCTIONS.md", "MEMORY.md", "DECISIONS.md", "TASKS.md", "ERRORS.md", "README.md")
$Missing = @()
$Created = @()
$Skipped = @()

foreach ($file in $RequiredFiles) {
    $path = "$MemoryDir/$file"
    if (Test-Path $path) {
        $Skipped += $file
        Write-Host "[SKIP] $file — already exists (not overwriting)" -ForegroundColor Green
    } else {
        $Missing += $file
        Write-Host "[CREATE] $file — creating from template..." -ForegroundColor Yellow
        $Templates[$file] | Out-File -FilePath $path -Encoding UTF8
        $Created += $file
    }
}
Write-Host ""

# Tổng kết
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Total required: $($RequiredFiles.Count)" -ForegroundColor White
Write-Host "  Already exist: $($Skipped.Count)" -ForegroundColor Green
Write-Host "  Created:       $($Created.Count)" -ForegroundColor Yellow
Write-Host "  Missing:       $($Missing.Count - $Created.Count)" -ForegroundColor Red

if ($Created.Count -gt 0) {
    Write-Host ""
    Write-Host "Created files:" -ForegroundColor Yellow
    foreach ($f in $Created) {
        Write-Host "  $MemoryDir/$f" -ForegroundColor Yellow
    }
}
Write-Host ""

if ($Missing.Count -eq 0 -and $Created.Count -eq 0) {
    Write-Host "All memory files present. Nothing to do." -ForegroundColor Green
}
