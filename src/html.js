export function renderPage(fileBaseUrl = "") {
  const serializedFileBaseUrl = JSON.stringify(fileBaseUrl).replace(/</g, "\\u003c");
  return page.replace("__PUBLIC_FILE_BASE_URL__", serializedFileBaseUrl);
}

const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090d16">
  <title>Text Relay - 极速文本与文件中转站</title>
  <script>
    if (typeof window !== "undefined") {
      if (!window.crypto) window.crypto = {};
      if (typeof window.crypto.randomUUID !== "function") {
        window.crypto.randomUUID = function() {
          return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function(c) {
            var r = (window.crypto.getRandomValues ? window.crypto.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * 256));
            return (c ^ (r & 15 >> c / 4)).toString(16);
          });
        };
      }
    }
  </script>
  <style>
    :root {
      color-scheme: light;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --border: #e2e8f0;
      --border-focus: #10b981;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-light: #94a3b8;
      --primary: #10b981;
      --primary-hover: #059669;
      --primary-light: #ecfdf5;
      --primary-border: #a7f3d0;
      --danger: #ef4444;
      --danger-hover: #dc2626;
      --danger-light: #fef2f2;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06);
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-width: 320px;
      font-family: var(--font-sans);
      background-color: var(--bg);
      background-image: radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.04) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
    }
    button, textarea, input { font: inherit; }
    button { cursor: pointer; }
    .shell { min-height: 100vh; display: flex; flex-direction: column; }

    /* Header */
    header {
      height: 64px;
      padding: 0 max(24px, calc((100vw - 1200px) / 2));
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #090d16;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #f8fafc;
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #fff;
    }
    .brand-icon {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      border-radius: 9px;
      display: grid;
      place-items: center;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
    }
    .brand-icon svg { width: 19px; height: 19px; fill: none; stroke: #fff; stroke-width: 2.2; }
    .brand-name { font-weight: 700; font-size: 16px; letter-spacing: -0.3px; }
    .brand-badge {
      font-size: 11px;
      font-weight: 500;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 9999px;
      margin-left: 2px;
    }
    .connection-badge {
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
    }
    .connection-dot {
      width: 8px;
      height: 8px;
      background: #64748b;
      border-radius: 50%;
      position: relative;
    }
    .connection-badge.online { color: #a7f3d0; background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.25); }
    .connection-badge.online .connection-dot {
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .connection-badge.online .connection-dot::after {
      content: "";
      position: absolute;
      top: -3px;
      left: -3px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.4);
      animation: pulse 2s infinite ease-out;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Main Container */
    main {
      width: min(1200px, 100%);
      margin: 0 auto;
      padding: 32px 24px;
      flex: 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 28px;
      align-items: start;
    }
    .workspace { min-width: 0; display: flex; flex-direction: column; gap: 24px; }

    /* Card */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 24px;
      transition: box-shadow .2s;
    }
    .card:hover {
      box-shadow: var(--shadow-md);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .card-title-group { display: flex; align-items: center; gap: 10px; }
    .card-title-icon {
      width: 32px;
      height: 32px;
      background: #f1f5f9;
      border-radius: var(--radius-sm);
      display: grid;
      place-items: center;
      color: #334155;
    }
    .card-title-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; }
    h1, h2 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-main); letter-spacing: -0.2px; }
    .sub-badge {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 9999px;
    }

    /* Editor */
    .editor-wrapper {
      position: relative;
    }
    .editor {
      width: 100%;
      min-height: 290px;
      padding: 18px 20px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      resize: vertical;
      outline: none;
      font-size: 15px;
      line-height: 1.65;
      color: var(--text-main);
      background: #ffffff;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: border-color .15s, box-shadow .15s;
    }
    .editor:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
    .editor:disabled {
      background: #f8fafc;
      color: #94a3b8;
      cursor: not-allowed;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .status-hint {
      color: var(--text-muted);
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .status-hint svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; }
    .actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    /* Buttons */
    .btn {
      min-height: 38px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0 14px;
      background: #ffffff;
      color: #334155;
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all .15s ease;
      user-select: none;
    }
    .btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; }
    .btn:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .btn:active:not(:disabled) { transform: translateY(1px); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-primary {
      border-color: transparent;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.28);
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #ffffff;
      box-shadow: 0 3px 8px rgba(16, 185, 129, 0.38);
    }
    .btn-danger {
      color: var(--danger);
      border-color: #fecaca;
      background: #fff;
    }
    .btn-danger:hover:not(:disabled) {
      background: var(--danger-light);
      border-color: #fca5a5;
      color: var(--danger-hover);
    }

    /* File Section */
    .file-dropzone {
      display: block;
      padding: 28px 20px;
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-md);
      background: linear-gradient(180deg, #fcfdfe 0%, #f8fafc 100%);
      text-align: center;
      cursor: pointer;
      transition: all .2s ease;
      position: relative;
    }
    .file-dropzone:hover, .file-dropzone.dragging {
      border-color: var(--primary);
      background: #f0fdf4;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.12);
      transform: scale(1.002);
    }
    .file-dropzone.disabled {
      background: #f8fafc;
      border-color: #e2e8f0;
      color: #94a3b8;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .file-input { position: absolute; width: 1px; height: 1px; opacity: 0; }
    .drop-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      background: var(--primary-light);
      border: 1px solid var(--primary-border);
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: var(--primary);
      transition: transform .2s;
    }
    .file-dropzone:hover .drop-icon, .file-dropzone.dragging .drop-icon {
      transform: translateY(-2px) scale(1.08);
    }
    .drop-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; }
    .drop-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      display: block;
    }
    .drop-tags {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin: 10px 0 8px;
      flex-wrap: wrap;
    }
    .format-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #475569;
    }
    .format-pill.apk {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
      font-weight: 700;
    }
    .drop-note {
      font-size: 12px;
      color: var(--text-muted);
      display: block;
    }

    /* File List */
    .file-list {
      margin-top: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .file-empty {
      padding: 36px 20px;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .file-empty-icon {
      width: 40px;
      height: 40px;
      background: #f1f5f9;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: #94a3b8;
    }
    .file-empty-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; }

    .file-item {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: #ffffff;
      transition: all .15s ease;
    }
    .file-item:hover {
      border-color: #cbd5e1;
      background: #fbfcfe;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
    }
    .file-icon-box {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      position: relative;
    }
    .file-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .file-type-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      gap: 2px;
    }
    .file-type-badge.apk {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      color: #15803d;
      border: 1px solid #86efac;
    }
    .file-type-badge.video {
      background: #ede9fe;
      color: #6d28d9;
    }
    .file-type-badge.audio {
      background: #fef3c7;
      color: #b45309;
    }
    .file-type-badge.archive {
      background: #ffedd5;
      color: #c2410c;
    }
    .file-type-badge.doc {
      background: #fee2e2;
      color: #b91c1c;
    }
    .file-type-badge svg { width: 18px; height: 18px; fill: currentColor; }

    .file-info { min-width: 0; }
    .file-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
    .file-meta {
      margin-top: 4px;
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .file-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
    }
    .file-tag.apk {
      background: #dcfce7;
      color: #15803d;
    }

    /* Progress bar */
    .upload-progress-wrapper {
      margin-top: 6px;
      width: 100%;
    }
    .upload-progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      width: 100%;
    }
    .upload-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
      width: 0%;
      transition: width .2s ease;
    }
    .upload-progress-text {
      font-size: 11px;
      color: var(--primary-hover);
      margin-top: 3px;
      font-weight: 600;
      display: block;
    }

    .file-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .file-btn {
      height: 32px;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: #ffffff;
      color: #334155;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all .15s;
    }
    .file-btn svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; }
    .file-btn:hover:not(:disabled) {
      background: #f1f5f9;
      color: #0f172a;
    }
    .file-btn-download {
      color: var(--primary);
      border-color: var(--primary-border);
      background: var(--primary-light);
    }
    .file-btn-download:hover {
      background: #d1fae5;
      color: var(--primary-hover);
    }
    .file-btn-delete {
      color: var(--danger);
      border-color: #fee2e2;
    }
    .file-btn-delete:hover:not(:disabled) {
      background: var(--danger-light);
      border-color: #fca5a5;
    }

    /* Aside Sidebar */
    aside {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .side-label {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin: 0 0 8px;
      display: block;
    }
    .share-row { display: flex; gap: 8px; }
    .share-input {
      flex: 1 1 auto;
      min-width: 0;
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: #f8fafc;
      color: #334155;
      font-size: 13px;
      font-family: var(--font-mono);
      outline: none;
    }
    .share-input:focus { border-color: var(--primary); background: #fff; }

    /* QR Code Card */
    .qr-box {
      margin-top: 14px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: #f8fafc;
      text-align: center;
    }
    .qr-canvas-container {
      width: 176px;
      height: 176px;
      margin: 0 auto 12px;
      padding: 6px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      display: grid;
      place-items: center;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .qr-canvas-container img {
      width: 100%;
      height: 100%;
      display: block;
      image-rendering: pixelated;
    }
    .qr-hint {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0;
    }
    .qr-lan-box {
      font-size: 11px;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: var(--radius-sm);
      padding: 10px;
      margin-top: 12px;
      line-height: 1.45;
      text-align: left;
    }
    .qr-lan-title {
      font-weight: 700;
      color: #78350f;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .qr-lan-desc {
      margin-bottom: 8px;
      color: #92400e;
      line-height: 1.4;
    }
    .qr-lan-row {
      display: flex;
      gap: 6px;
    }
    .qr-lan-input {
      flex: 1;
      height: 28px;
      padding: 2px 8px;
      font-size: 12px;
      border: 1px solid #d97706;
      border-radius: 4px;
      background: #ffffff;
      color: #0f172a;
      outline: none;
      min-width: 0;
    }
    .qr-lan-input:focus {
      border-color: #b45309;
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
    }
    .qr-lan-btn {
      height: 28px;
      padding: 0 10px;
      font-size: 11px;
      font-weight: 600;
      background: #d97706;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
    }
    .qr-lan-btn:hover {
      background: #b45309;
    }

    .room-info-box {
      padding: 12px 14px;
      background: #f1f5f9;
      border-radius: var(--radius-sm);
      font-size: 12px;
      line-height: 1.55;
      color: #475569;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .room-info-box svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .input-prefix-group {
      display: flex;
      align-items: center;
      height: 40px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: #ffffff;
      overflow: hidden;
      transition: border-color .15s;
    }
    .input-prefix-group:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
    .input-prefix {
      padding: 0 10px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 13px;
      font-family: var(--font-mono);
      font-weight: 600;
      border-right: 1px solid var(--border);
      height: 100%;
      display: grid;
      place-items: center;
      user-select: none;
    }
    .suffix-input {
      flex: 1;
      height: 100%;
      border: none;
      padding: 0 10px;
      font-size: 13px;
      outline: none;
      color: var(--text-main);
    }
    .field-hint {
      margin: 6px 0 16px;
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Toast system */
    #toast-container {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      min-width: 240px;
      max-width: 90vw;
      padding: 10px 18px;
      background: #0f172a;
      color: #f8fafc;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: toastIn .25s ease-out forwards;
      pointer-events: auto;
    }
    .toast.success { background: #065f46; color: #ecfdf5; border: 1px solid #059669; }
    .toast.error { background: #991b1b; color: #fef2f2; border: 1px solid #dc2626; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Modal dialog */
    .preview-dialog {
      width: min(960px, calc(100vw - 32px));
      height: min(780px, calc(100vh - 48px));
      padding: 0;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: #ffffff;
      color: var(--text-main);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    .preview-dialog::backdrop {
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
    }
    .preview-header {
      height: 56px;
      padding: 0 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: #ffffff;
    }
    .preview-title {
      font-size: 15px;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .preview-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: #f8fafc;
      color: #475569;
      display: grid;
      place-items: center;
      font-size: 18px;
    }
    .preview-close:hover { background: #e2e8f0; color: #0f172a; }
    .preview-body {
      height: calc(100% - 56px);
      padding: 20px;
      display: grid;
      place-items: center;
      overflow: auto;
      background: #f8fafc;
    }
    .preview-image, .preview-video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }
    .preview-audio { width: min(520px, 100%); }
    .preview-pdf { width: 100%; height: 100%; border: none; }
    .preview-text {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: #ffffff;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow: auto;
    }

    /* Footer */
    footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border);
      color: var(--text-light);
      font-size: 12px;
      text-align: center;
      background: #ffffff;
    }

    @media (max-width: 860px) {
      header { padding: 0 16px; }
      main {
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .card { padding: 18px; }
      .editor { min-height: 240px; }
      .file-item {
        grid-template-columns: 46px minmax(0, 1fr);
      }
      .file-actions {
        grid-column: 1 / -1;
        justify-content: flex-end;
        padding-top: 4px;
        border-top: 1px dashed #f1f5f9;
      }
      .file-icon-box { width: 46px; height: 46px; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <a class="brand" href="/">
        <div class="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 12v-2a4 4 0 0 1 4-4h8m0 0l-3-3m3 3l-3 3M20 12v2a4 4 0 0 1-4 4H8m0 0l3 3m-3-3l3-3"/></svg>
        </div>
        <div>
          <span class="brand-name">Text Relay</span>
          <span class="brand-badge">中转站</span>
        </div>
      </a>
      <div id="connection" class="connection-badge">
        <span class="connection-dot" aria-hidden="true"></span>
        <span id="connection-text">未连接</span>
      </div>
    </header>

    <main>
      <div class="workspace">
        <!-- Text Sharing Card -->
        <section class="card" aria-label="文本共享">
          <div class="card-header">
            <div class="card-title-group">
              <div class="card-title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <h1 id="title">文本共享</h1>
              </div>
            </div>
            <span id="character-count" class="sub-badge">0 / 100,000 字</span>
          </div>

          <div class="editor-wrapper">
            <textarea id="editor" class="editor" maxlength="100000" disabled placeholder="在此粘贴或输入需要共享的文本内容..."></textarea>
          </div>

          <div class="toolbar">
            <div id="status" class="status-hint" aria-live="polite">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>创建或进入房间后即可开始同步</span>
            </div>
            <div class="actions">
              <button id="clear-button" class="btn" type="button" disabled title="清空文本框">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                清空
              </button>
              <button id="export-text-button" class="btn" type="button" disabled title="保存为文本文件">
                <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                导出 .txt
              </button>
              <button id="copy-button" class="btn btn-primary" type="button" disabled title="复制文本到剪贴板">
                <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                复制文本
              </button>
            </div>
          </div>
        </section>

        <!-- File Sharing Card -->
        <section class="card" aria-label="文件共享">
          <div class="card-header">
            <div class="card-title-group">
              <div class="card-title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <h2>文件共享</h2>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="cancel-all-btn" class="file-btn file-btn-delete" type="button" style="display: none; height: 26px; padding: 0 8px; font-size: 11px;">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                取消全部 (<span id="uploading-count">0</span>)
              </button>
              <span id="file-size-total" class="sub-badge">已用 0 B / 2 GiB</span>
              <span id="file-count" class="sub-badge">0 / 30 个文件</span>
            </div>
          </div>

          <label id="file-dropzone" class="file-dropzone disabled">
            <input id="file-input" class="file-input" type="file" multiple disabled>
            <div class="drop-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span class="drop-title">选择文件 或 拖放文件至此处</span>
            <div class="drop-tags">
              <span class="format-pill apk">🤖 APK 安装包</span>
              <span class="format-pill">🖼️ 图片</span>
              <span class="format-pill">🎬 视频</span>
              <span class="format-pill">🎵 音频</span>
              <span class="format-pill">📄 文档</span>
              <span class="format-pill">🗜️ 压缩包</span>
            </div>
            <span class="drop-note">支持任意格式文件 · 单文件最大 1 GiB · 房间总计最大 2 GiB</span>
          </label>

          <div id="file-list" class="file-list" aria-live="polite"></div>
        </section>
      </div>

      <!-- Aside Sidebar -->
      <aside>
        <!-- Room Link Card -->
        <section class="card">
          <span class="side-label">当前房间链接</span>
          <div class="share-row">
            <input id="share-link" class="share-input" aria-label="房间链接" readonly value="创建房间后显示链接">
            <button id="share-copy" class="btn btn-primary" type="button" title="复制房间链接" disabled>
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              复制
            </button>
          </div>

          <!-- QR Code Section -->
          <div id="qr-section" style="margin-top: 14px;" hidden>
            <div class="qr-box">
              <div id="qr-container" class="qr-canvas-container"></div>
              <p class="qr-hint">📱 手机扫码直达本房间<br>可直接在手机上下载 APK 或查看文本</p>
            </div>
          </div>

          <div style="margin-top: 14px;">
            <div class="room-info-box">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div id="room-note">房间内的文本将在最后一次更新后的 24 小时自动删除，上传的文件长期保留。</div>
            </div>
          </div>
        </section>

        <!-- Create Room Card -->
        <section class="card">
          <div class="card-header" style="margin-bottom: 12px;">
            <div class="card-title-group">
              <h2>新建临时房间</h2>
            </div>
          </div>

          <div id="create-controls">
            <label class="side-label" for="room-suffix">自定义房间后缀（可选）</label>
            <div class="input-prefix-group">
              <span class="input-prefix">/r/</span>
              <input id="room-suffix" class="suffix-input" type="text" minlength="3" maxlength="32" pattern="([A-Za-z0-9_]|-){3,32}" autocomplete="off" spellcheck="false" placeholder="例如：my-share">
            </div>
            <p class="field-hint">留空则自动生成高强度随机地址；支持字母、数字、- 和 _</p>
          </div>

          <button id="new-room" class="btn btn-primary" style="width: 100%; height: 42px; font-size: 14px;" type="button">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新建临时房间
          </button>
        </section>
      </aside>
    </main>

    <footer>
      文本以纯文本形式实时保存 · 房间链接即为访问凭证，请勿在公开场所泄露 · 专为高速跨设备中转设计
    </footer>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container" aria-live="polite"></div>

  <!-- Preview Dialog -->
  <dialog id="file-preview-dialog" class="preview-dialog" aria-labelledby="file-preview-title">
    <div class="preview-header">
      <div id="file-preview-title" class="preview-title"></div>
      <button id="file-preview-close" class="preview-close" type="button" title="关闭预览">&times;</button>
    </div>
    <div id="file-preview-body" class="preview-body"></div>
  </dialog>

  <script>
    (() => {
      const MAX_TEXT_LENGTH = 100000;
      const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GiB
      const MAX_TOTAL_FILE_SIZE = 2048 * 1024 * 1024; // 2 GiB
      const MAX_FILES = 30;
      const MAX_TEXT_PREVIEW_SIZE = 2 * 1024 * 1024;
      const ROOM_PATTERN = /^\\/r\\/((?:[A-Za-z0-9_]|-){3,32})\\/?$/;

      const elements = {
        editor: document.querySelector("#editor"),
        title: document.querySelector("#title"),
        status: document.querySelector("#status"),
        connection: document.querySelector("#connection"),
        connectionText: document.querySelector("#connection-text"),
        count: document.querySelector("#character-count"),
        clear: document.querySelector("#clear-button"),
        exportText: document.querySelector("#export-text-button"),
        copy: document.querySelector("#copy-button"),
        shareLink: document.querySelector("#share-link"),
        shareCopy: document.querySelector("#share-copy"),
        qrSection: document.querySelector("#qr-section"),
        qrContainer: document.querySelector("#qr-container"),
        newRoom: document.querySelector("#new-room"),
        createControls: document.querySelector("#create-controls"),
        roomSuffix: document.querySelector("#room-suffix"),
        roomNote: document.querySelector("#room-note"),
        fileInput: document.querySelector("#file-input"),
        fileDropzone: document.querySelector("#file-dropzone"),
        fileList: document.querySelector("#file-list"),
        fileCount: document.querySelector("#file-count"),
        fileSizeTotal: document.querySelector("#file-size-total"),
        cancelAllBtn: document.querySelector("#cancel-all-btn"),
        uploadingCount: document.querySelector("#uploading-count"),
        previewDialog: document.querySelector("#file-preview-dialog"),
        previewTitle: document.querySelector("#file-preview-title"),
        previewBody: document.querySelector("#file-preview-body"),
        previewClose: document.querySelector("#file-preview-close"),
        toastContainer: document.querySelector("#toast-container")
      };

      let roomId = getRoomId();
      let lastUpdatedAt = 0;
      let saveTimer = null;
      let socket = null;
      let reconnectTimer = null;
      let hasLocalEdits = false;
      let files = [];
      let uploading = [];
      const PUBLIC_FILE_BASE_URL = __PUBLIC_FILE_BASE_URL__;

      // Toast notification helper
      function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.textContent = message;
        elements.toastContainer.append(toast);
        setTimeout(() => {
          toast.style.transition = "opacity .3s, transform .3s";
          toast.style.opacity = "0";
          toast.style.transform = "translateY(-8px)";
          setTimeout(() => toast.remove(), 300);
        }, 2800);
      }

      function getRoomId() {
        const match = window.location.pathname.match(ROOM_PATTERN);
        return match ? match[1] : null;
      }

      function fileUrl(file) {
        if (PUBLIC_FILE_BASE_URL && file.objectPath) {
          return PUBLIC_FILE_BASE_URL + "/" + file.objectPath
            .split("/")
            .map((segment) => encodeURIComponent(segment))
            .join("/");
        }
        return "/api/rooms/" + roomId + "/files/" + file.id;
      }

      function previewUrl(file) {
        if (!isTextPreviewable(file)) return fileUrl(file);
        return "/api/rooms/" + roomId + "/files/" + file.id;
      }

      function downloadUrl(file) {
        return "/api/rooms/" + roomId + "/files/" + file.id + "?download=1";
      }

      function setStatus(message, isOnline = false) {
        const span = elements.status.querySelector("span") || elements.status;
        span.textContent = message;
        elements.connectionText.textContent = isOnline ? "已连接 · 实时同步" : "未连接";
        elements.connection.classList.toggle("online", isOnline);
      }

      function updateCount() {
        elements.count.textContent = elements.editor.value.length.toLocaleString() + " / " + MAX_TEXT_LENGTH.toLocaleString() + " 字";
      }

      function updateFileCount() {
        elements.fileCount.textContent = files.length + " / " + MAX_FILES + " 个文件";
        const currentSize = files.reduce((tot, f) => tot + (f.size || 0), 0);
        elements.fileSizeTotal.textContent = "已用 " + formatSize(currentSize) + " / 2 GiB";
      }

      function getEffectiveRoomUrl() {
        if (!roomId) return "";
        const isLocal = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
        if (isLocal) {
          const savedIp = localStorage.getItem("clip_lan_ip") || "";
          if (savedIp) {
            const port = window.location.port ? ":" + window.location.port : "";
            return window.location.protocol + "//" + savedIp + port + "/r/" + roomId;
          }
        }
        return window.location.href;
      }

      function renderQrCode(targetUrl) {
        const url = "/api/qr?text=" + encodeURIComponent(targetUrl);
        elements.qrContainer.innerHTML = '<img class="qr-image" src="' + url + '" alt="扫码直达本房间" width="160" height="160">';
      }

      function updateShareAndQr() {
        const finalUrl = getEffectiveRoomUrl();
        elements.shareLink.value = finalUrl;
        renderQrCode(finalUrl);

        const isLocal = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
        let lanBox = elements.qrSection.querySelector(".qr-lan-box");

        if (isLocal) {
          if (!lanBox) {
            lanBox = document.createElement("div");
            lanBox.className = "qr-lan-box";
            lanBox.innerHTML =
              '<div class="qr-lan-title">' +
                '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ' +
                '局域网手机扫码配置' +
              '</div>' +
              '<div class="qr-lan-desc">当前电脑使用 localhost，手机无法直接连通。输入电脑局域网 IP（在终端运行 <code>ipconfig</code> 查看），即可生成手机可扫的二维码：</div>' +
              '<div class="qr-lan-row">' +
                '<input type="text" id="qr-lan-ip" class="qr-lan-input" placeholder="例如 192.168.1.5">' +
                '<button type="button" id="qr-lan-btn" class="qr-lan-btn">切换IP</button>' +
              '</div>';
            elements.qrSection.querySelector(".qr-box").append(lanBox);

            const input = lanBox.querySelector("#qr-lan-ip");
            const btn = lanBox.querySelector("#qr-lan-btn");
            input.value = localStorage.getItem("clip_lan_ip") || "";

            function applyLanIp() {
              const val = input.value.trim().replace(/^https?:\\/\\//i, "").replace(/\\/.*$/, "").replace(/:.*$/, "");
              if (val) {
                localStorage.setItem("clip_lan_ip", val);
                showToast("已将二维码切换为局域网 IP: " + val, "success");
              } else {
                localStorage.removeItem("clip_lan_ip");
                showToast("已重置为默认地址", "info");
              }
              updateShareAndQr();
            }

            btn.addEventListener("click", applyLanIp);
            input.addEventListener("keydown", (e) => {
              if (e.key === "Enter") applyLanIp();
            });
          }
        } else if (lanBox) {
          lanBox.remove();
        }
      }

      function setRoomUi(active) {
        elements.editor.disabled = !active;
        elements.clear.disabled = !active;
        elements.exportText.disabled = !active;
        elements.copy.disabled = !active;
        elements.shareCopy.disabled = !active;
        elements.fileInput.disabled = !active;
        elements.fileDropzone.classList.toggle("disabled", !active);
        elements.qrSection.hidden = !active;

        if (active) {
          updateShareAndQr();
        } else {
          elements.shareLink.value = "创建房间后显示链接";
        }
      }

      function applyRoom(room, syncText = true) {
        const nextFiles = Array.isArray(room.files) ? room.files : [];
        const filesChanged = JSON.stringify(nextFiles) !== JSON.stringify(files);
        files = nextFiles;
        if (syncText && !hasLocalEdits && room.updatedAt >= lastUpdatedAt) {
          elements.editor.value = room.text;
          updateCount();
        }
        lastUpdatedAt = Math.max(lastUpdatedAt, room.updatedAt);
        if (filesChanged) renderFiles();
      }

      async function request(path, options = {}) {
        const response = await fetch(path, {
          ...options,
          headers: options.headers,
          cache: "no-store"
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "请求失败");
        }
        return response.status === 204 ? null : response.json();
      }

      async function createRoom() {
        const suffix = elements.roomSuffix.value.trim();
        if (suffix && !/^([A-Za-z0-9_]|-){3,32}$/.test(suffix)) {
          showToast("后缀需为 3 至 32 位字母、数字、- 或 _", "error");
          elements.roomSuffix.focus();
          return;
        }

        elements.newRoom.disabled = true;
        elements.roomSuffix.disabled = true;
        setStatus("正在创建房间...");
        try {
          const room = await request("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ suffix })
          });
          window.location.assign("/r/" + room.roomId);
        } catch (error) {
          setStatus(error.message || "无法创建房间");
          showToast(error.message || "无法创建房间", "error");
          elements.newRoom.disabled = false;
          elements.roomSuffix.disabled = false;
        }
      }

      async function loadRoom(silent = false) {
        if (!roomId) return;
        try {
          const room = await request("/api/rooms/" + roomId);
          applyRoom(room);
          setStatus("实时同步已开启", true);
        } catch (error) {
          if (error.message === "房间不存在或已过期") {
            disconnectRoom();
            setRoomUi(false);
            elements.roomNote.textContent = "该房间已过期或已被删除。请创建一个新的临时房间。";
          }
          if (!silent) setStatus(error.message || "连接失败");
        }
      }

      async function saveText() {
        saveTimer = null;
        if (!roomId) return;
        setStatus("正在保存文本...");
        try {
          const room = await request("/api/rooms/" + roomId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: elements.editor.value })
          });
          hasLocalEdits = false;
          applyRoom(room, false);
          setStatus("已自动保存同步", true);
        } catch (error) {
          setStatus(error.message || "保存失败");
          showToast(error.message || "保存失败", "error");
        }
      }

      function scheduleSave() {
        hasLocalEdits = true;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveText, 700);
      }

      function connectRoom() {
        if (!roomId || socket) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const roomSocket = new WebSocket(
          protocol + "//" + window.location.host + "/api/rooms/" + encodeURIComponent(roomId) + "/ws"
        );
        socket = roomSocket;

        roomSocket.addEventListener("open", () => {
          setStatus("已连接 · 实时同步", true);
        });
        roomSocket.addEventListener("message", event => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "room-deleted") {
              expireRoom();
              return;
            }
            if (message.type === "room" && message.room) {
              applyRoom(message.room);
            }
          } catch {
            setStatus("收到无效更新");
          }
        });
        roomSocket.addEventListener("close", event => {
          if (socket === roomSocket) socket = null;
          if (event.code === 4004) {
            expireRoom();
            return;
          }
          if (!roomId) return;
          setStatus("连接中断，正在重连...");
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connectRoom, 2000);
        });
        roomSocket.addEventListener("error", () => {
          setStatus("连接出现异常，准备重连...");
        });
      }

      function expireRoom() {
        disconnectRoom();
        setRoomUi(false);
        elements.roomNote.textContent = "该房间已过期或已被删除。请创建一个新的临时房间。";
        setStatus("房间已过期");
        showToast("房间已过期或已被删除", "error");
      }

      function disconnectRoom() {
        roomId = null;
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
        if (socket) {
          const roomSocket = socket;
          socket = null;
          roomSocket.close();
        }
      }

      function renderFiles() {
        elements.fileList.replaceChildren();
        updateFileCount();
        const visibleFiles = [...files, ...uploading];

        if (elements.cancelAllBtn && elements.uploadingCount) {
          if (uploading.length > 1) {
            elements.cancelAllBtn.style.display = "inline-flex";
            elements.uploadingCount.textContent = uploading.length;
          } else {
            elements.cancelAllBtn.style.display = "none";
          }
        }

        if (!visibleFiles.length) {
          const empty = document.createElement("div");
          empty.className = "file-empty";
          empty.innerHTML = '<div class="file-empty-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div><div>当前房间暂无文件，上传后其他设备可立即下载</div>';
          elements.fileList.append(empty);
          return;
        }

        for (const file of visibleFiles) {
          const item = document.createElement("div");
          item.className = "file-item";
          item.append(createFilePreview(file));

          const details = document.createElement("div");
          details.className = "file-info";
          const name = document.createElement("div");
          name.className = "file-name";
          name.textContent = file.name;
          name.title = file.name;

          const meta = document.createElement("div");
          meta.className = "file-meta";
          const label = fileLabel(file);
          const isApk = file.name.match(/\.apk$/i) || file.type === "application/vnd.android.package-archive";
          meta.innerHTML = '<span class="file-tag ' + (isApk ? "apk" : "") + '">' + label + '</span><span>' + formatSize(file.size) + '</span>';

          details.append(name, meta);

          if (file.uploading) {
            const progWrap = document.createElement("div");
            progWrap.className = "upload-progress-wrapper";
            const percent = file.progress || 0;
            const statusText = file.statusText || ("正在上传 " + percent + "% · " + formatSize((file.size * percent) / 100) + " / " + formatSize(file.size));
            progWrap.innerHTML = '<div class="upload-progress-bar"><div class="upload-progress-fill" style="width: ' + percent + '%"></div></div><span class="upload-progress-text">' + statusText + '</span>';
            details.append(progWrap);
          }

          item.append(details);

          const actions = document.createElement("div");
          actions.className = "file-actions";

          if (file.uploading) {
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "file-btn file-btn-delete";
            cancelBtn.type = "button";
            cancelBtn.title = "取消上传此文件";
            cancelBtn.innerHTML = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> 取消';
            cancelBtn.addEventListener("click", () => {
              if (file.cancel) file.cancel();
            });
            actions.append(cancelBtn);
          } else {
            if (isPreviewable(file)) {
              const preview = document.createElement("button");
              preview.className = "file-btn";
              preview.type = "button";
              preview.innerHTML = '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> 预览';
              preview.addEventListener("click", () => previewFile(file));
              actions.append(preview);
            }

            const download = document.createElement("a");
            download.className = "file-btn file-btn-download";
            download.href = downloadUrl(file);
            download.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> 下载';
            actions.append(download);

            const copyBtn = document.createElement("button");
            copyBtn.className = "file-btn";
            copyBtn.type = "button";
            copyBtn.title = "复制直接下载链接";
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
            copyBtn.addEventListener("click", () => {
              const url = window.location.origin + downloadUrl(file);
              copyText(url, "文件链接已复制");
            });
            actions.append(copyBtn);

            const remove = document.createElement("button");
            remove.className = "file-btn file-btn-delete";
            remove.type = "button";
            remove.title = "删除文件";
            remove.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
            remove.addEventListener("click", () => deleteFile(file));
            actions.append(remove);
          }
          item.append(actions);
          elements.fileList.append(item);
        }
      }

      function createFilePreview(file) {
        const box = document.createElement("div");
        box.className = "file-icon-box";

        if (!file.uploading && file.type.startsWith("image/")) {
          const image = document.createElement("img");
          image.className = "file-preview";
          image.src = fileUrl(file);
          image.alt = file.name;
          box.append(image);
          return box;
        }

        const isApk = file.name.match(/\.apk$/i) || file.type === "application/vnd.android.package-archive";
        const badge = document.createElement("div");
        badge.className = "file-type-badge " + (isApk ? "apk" : fileTypeCategory(file));

        if (isApk) {
          badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 4.26 6 6.01 6 8h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg><span>APK</span>';
        } else {
          badge.textContent = extensionOf(file.name);
        }
        box.append(badge);
        return box;
      }

      function fileTypeCategory(file) {
        if (file.type.startsWith("video/")) return "video";
        if (file.type.startsWith("audio/")) return "audio";
        if (file.type.includes("zip") || file.name.match(/\.(zip|rar|7z|tar|gz)$/i)) return "archive";
        if (file.type === "application/pdf" || file.name.match(/\.pdf$/i)) return "doc";
        return "";
      }

      async function previewFile(file) {
        elements.previewTitle.textContent = file.name;
        elements.previewBody.replaceChildren();
        elements.previewDialog.showModal();

        if (isTextPreviewable(file)) {
          if (file.size > MAX_TEXT_PREVIEW_SIZE) {
            showPreviewMessage("文本文件超过 2 MiB，为避免浏览器卡顿未打开预览。");
            return;
          }
          showPreviewMessage("正在读取文件...");
          try {
            const response = await fetch(previewUrl(file), { cache: "no-store" });
            if (!response.ok) throw new Error("文件读取失败");
            const text = await response.text();
            const preview = document.createElement("pre");
            preview.className = "preview-text";
            preview.textContent = text;
            elements.previewBody.replaceChildren(preview);
          } catch (error) {
            showPreviewMessage(error.message || "文件读取失败");
          }
          return;
        }

        if (file.type === "application/pdf") {
          const pdf = document.createElement("iframe");
          pdf.className = "preview-pdf";
          pdf.src = previewUrl(file);
          pdf.title = file.name;
          elements.previewBody.append(pdf);
          return;
        }

        if (file.type.startsWith("image/")) {
          const image = document.createElement("img");
          image.className = "preview-image";
          image.src = previewUrl(file);
          image.alt = file.name;
          elements.previewBody.append(image);
          return;
        }

        if (file.type.startsWith("video/")) {
          const video = document.createElement("video");
          video.className = "preview-video";
          video.src = previewUrl(file);
          video.controls = true;
          video.autoplay = true;
          video.preload = "metadata";
          elements.previewBody.append(video);
          return;
        }

        if (file.type.startsWith("audio/")) {
          const audio = document.createElement("audio");
          audio.className = "preview-audio";
          audio.src = previewUrl(file);
          audio.controls = true;
          audio.autoplay = true;
          audio.preload = "metadata";
          elements.previewBody.append(audio);
        }
      }

      function showPreviewMessage(message) {
        const text = document.createElement("p");
        text.className = "preview-message";
        text.style.color = "var(--text-muted)";
        text.textContent = message;
        elements.previewBody.replaceChildren(text);
      }

      function closePreview() {
        if (elements.previewDialog.open) elements.previewDialog.close();
        elements.previewBody.replaceChildren();
      }

      function getFileContentType(file) {
        const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
        if (ext === "apk") return "application/vnd.android.package-archive";
        if (file.type && file.type !== "application/octet-stream") return file.type;
        const map = {
          apk: "application/vnd.android.package-archive",
          zip: "application/zip",
          rar: "application/x-rar-compressed",
          "7z": "application/x-7z-compressed",
          tar: "application/x-tar",
          gz: "application/gzip",
          pdf: "application/pdf",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          webp: "image/webp",
          svg: "image/svg+xml",
          mp4: "video/mp4",
          webm: "video/webm",
          mp3: "audio/mpeg"
        };
        return map[ext] || "application/octet-stream";
      }

      function uploadWithXhr(file, contentType, onProgress, setCancel) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          let isAborted = false;

          function handleAbort() {
            if (isAborted) return;
            isAborted = true;
            const err = new Error("上传已取消");
            err.name = "AbortError";
            reject(err);
          }

          if (setCancel) {
            setCancel(() => {
              handleAbort();
              try {
                xhr.abort();
              } catch {}
            });
          }

          xhr.open("POST", "/api/rooms/" + roomId + "/files?name=" + encodeURIComponent(file.name));
          xhr.setRequestHeader("Content-Type", contentType);

          xhr.upload.onprogress = (event) => {
            if (isAborted) return;
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };

          xhr.onload = () => {
            if (isAborted) return;
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                resolve(null);
              }
            } else if (xhr.status === 499) {
              handleAbort();
            } else {
              try {
                const body = JSON.parse(xhr.responseText);
                reject(new Error(body.error || "上传失败 (状态码 " + xhr.status + ")"));
              } catch {
                reject(new Error("上传失败 (状态码 " + xhr.status + ")"));
              }
            }
          };

          xhr.onabort = () => {
            handleAbort();
          };

          xhr.onerror = () => {
            if (isAborted) {
              handleAbort();
              return;
            }
            reject(new Error("网络异常，上传失败"));
          };

          xhr.send(file);
        });
      }

      async function selectFiles(selected) {
        if (!roomId || !selected.length) return;
        const candidates = selected.filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            showToast(file.name + " 超过单文件 1 GiB 限制", "error");
            return false;
          }
          return true;
        });
        if (!candidates.length) return;

        const knownSize = files.reduce((total, file) => total + file.size, 0);
        const selectedSize = candidates.reduce((total, file) => total + file.size, 0);
        if (files.length + candidates.length > MAX_FILES) {
          showToast("每个房间最多上传 " + MAX_FILES + " 个文件", "error");
          return;
        }
        if (knownSize + selectedSize > MAX_TOTAL_FILE_SIZE) {
          showToast("房间文件总大小不能超过 2 GiB", "error");
          return;
        }

        const queue = [];
        for (const file of candidates) {
          const contentType = getFileContentType(file);
          const pending = {
            id: "upload-" + Math.random().toString(36).slice(2),
            name: file.name,
            size: file.size,
            type: contentType,
            uploading: true,
            progress: 0,
            statusText: "等待上传...",
            aborted: false,
            cancelFn: null,
            cancel() {
              this.aborted = true;
              if (this.cancelFn) {
                this.cancelFn();
              } else {
                uploading = uploading.filter((item) => item !== this);
                renderFiles();
                showToast("已取消上传 " + this.name, "info");
              }
            }
          };
          uploading.push(pending);
          queue.push({ file, contentType, pending });
        }
        renderFiles();

        for (const { file, contentType, pending } of queue) {
          if (pending.aborted) continue;

          pending.statusText = "正在上传 0%...";
          renderFiles();
          setStatus("正在上传 " + file.name + "...");

          try {
            const room = await uploadWithXhr(file, contentType, (percent) => {
              pending.progress = percent;
              pending.statusText = "正在上传 " + percent + "% · " + formatSize((file.size * percent) / 100) + " / " + formatSize(file.size);
              renderFiles();
            }, (cancel) => {
              pending.cancelFn = cancel;
              if (pending.aborted) cancel();
            });
            if (room) applyRoom(room, false);
            setStatus(file.name + " 已上传", true);
            showToast("✓ " + file.name + " 上传成功", "success");
          } catch (error) {
            if (error.name === "AbortError" || pending.aborted) {
              setStatus("已取消上传 " + file.name);
              showToast("已取消上传 " + file.name, "info");
            } else {
              setStatus(error.message || file.name + " 上传失败");
              showToast(error.message || file.name + " 上传失败", "error");
            }
          } finally {
            uploading = uploading.filter((item) => item !== pending);
            renderFiles();
          }
        }
      }

      async function deleteFile(file) {
        if (!window.confirm("确定删除“" + file.name + "”吗？")) return;
        setStatus("正在删除文件...");
        try {
          const room = await request("/api/rooms/" + roomId + "/files/" + file.id, { method: "DELETE" });
          applyRoom(room, false);
          setStatus("文件已删除", true);
          showToast("文件“" + file.name + "”已删除");
        } catch (error) {
          setStatus(error.message || "删除文件失败");
          showToast(error.message || "删除文件失败", "error");
        }
      }

      function isPreviewable(file) {
        return isInlinePreviewable(file) || isTextPreviewable(file);
      }

      function isInlinePreviewable(file) {
        return ["application/pdf", "image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"].includes(file.type)
          || file.type.startsWith("audio/")
          || file.type.startsWith("video/");
      }

      function isTextPreviewable(file) {
        return file.type.startsWith("text/")
          || file.type === "application/json"
          || file.type === "application/xml"
          || file.type.endsWith("+json")
          || ["application/x-yaml", "application/yaml"].includes(file.type);
      }

      function extensionOf(name) {
        const extension = name.includes(".") ? name.split(".").pop() : "FILE";
        return extension.slice(0, 7).toUpperCase();
      }

      function fileLabel(file) {
        if (file.name.match(/\.apk$/i) || file.type === "application/vnd.android.package-archive") return "Android 安装包";
        if (file.type.startsWith("image/")) return "图片";
        if (file.type.startsWith("video/")) return "视频";
        if (file.type.startsWith("audio/")) return "音频";
        if (file.type === "application/pdf" || file.name.match(/\.pdf$/i)) return "PDF 文档";
        if (file.type.includes("zip") || file.name.match(/\.(zip|rar|7z|tar|gz)$/i)) return "压缩包";
        return "文件";
      }

      function formatSize(bytes) {
        if (!bytes || bytes <= 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KiB";
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MiB";
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GiB";
      }

      async function copyText(value, label) {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const fallback = document.createElement("textarea");
          fallback.value = value;
          fallback.style.position = "fixed";
          fallback.style.opacity = "0";
          document.body.appendChild(fallback);
          fallback.select();
          document.execCommand("copy");
          fallback.remove();
        }
        showToast("✓ " + label, "success");
        setStatus(label, true);
      }

      function exportTextToFile() {
        const text = elements.editor.value;
        if (!text) {
          showToast("暂无可导出的文本", "info");
          return;
        }
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "text-share-" + (roomId || "export") + ".txt";
        a.click();
        URL.revokeObjectURL(a.href);
        showToast("✓ 已导出为 .txt 文件", "success");
      }

      elements.editor.addEventListener("input", () => {
        updateCount();
        scheduleSave();
      });
      elements.newRoom.addEventListener("click", createRoom);
      elements.clear.addEventListener("click", () => {
        if (elements.editor.value && window.confirm("确定清空房间内的全部文本吗？")) {
          elements.editor.value = "";
          updateCount();
          scheduleSave();
          showToast("文本已清空");
        }
      });
      elements.exportText.addEventListener("click", exportTextToFile);
      elements.copy.addEventListener("click", () => copyText(elements.editor.value, "文本已复制到剪贴板"));
      elements.shareCopy.addEventListener("click", () => copyText(window.location.href, "房间链接已复制到剪贴板"));
      elements.cancelAllBtn.addEventListener("click", () => {
        if (window.confirm("确定取消当前所有的上传任务吗？")) {
          for (const item of [...uploading]) {
            if (item.cancel) item.cancel();
          }
          showToast("已取消所有上传任务", "info");
        }
      });
      elements.previewClose.addEventListener("click", closePreview);
      elements.previewDialog.addEventListener("close", () => elements.previewBody.replaceChildren());
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") closePreview();
      });
      elements.fileInput.addEventListener("change", () => {
        selectFiles([...elements.fileInput.files]);
        elements.fileInput.value = "";
      });
      for (const eventName of ["dragenter", "dragover"]) {
        elements.fileDropzone.addEventListener(eventName, (event) => {
          if (elements.fileInput.disabled) return;
          event.preventDefault();
          elements.fileDropzone.classList.add("dragging");
        });
      }
      for (const eventName of ["dragleave", "drop"]) {
        elements.fileDropzone.addEventListener(eventName, (event) => {
          if (elements.fileInput.disabled) return;
          event.preventDefault();
          elements.fileDropzone.classList.remove("dragging");
        });
      }
      elements.fileDropzone.addEventListener("drop", (event) => {
        if (!elements.fileInput.disabled) selectFiles([...event.dataTransfer.files]);
      });

      setRoomUi(Boolean(roomId));
      updateCount();
      renderFiles();
      if (roomId) {
        loadRoom();
        connectRoom();
      }
    })();
  </script>
</body>
</html>`;
