# PhoneDrop - File Sharing App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- File upload flow: user selects a file, uploads it, receives a short share code (e.g. "AB12")
- File receive flow: user enters a share code, previews file info (name, size, type), and downloads it
- Files expire after 24 hours
- Mobile-first UI optimized for phone use
- Share code clipboard copy button

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Store file blobs with associated metadata (name, size, type, expiry). Generate random 6-char alphanumeric share codes. APIs: uploadFile, getFileInfo(code), downloadFile(code), deleteExpiredFiles.
2. Frontend: Two-tab layout — Send tab (drag/tap to upload, show generated code with copy button) and Receive tab (enter code, show file info card, download button).
3. Use blob-storage component for large file support.
