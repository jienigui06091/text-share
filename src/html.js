export const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#12171d">
  <title>Text Relay</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f4f6f8;
      color: #18212b;
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; }
    button, textarea, input { font: inherit; }
    button { cursor: pointer; }
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
    header {
      height: 64px;
      padding: 0 max(24px, calc((100vw - 1180px) / 2));
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #12171d;
      color: #f8fafc;
    }
    .brand { display: flex; align-items: center; gap: 11px; font-weight: 700; letter-spacing: 0; }
    .brand-mark { width: 25px; height: 25px; border: 2px solid #6dd6b1; position: relative; }
    .brand-mark::after { content: ""; position: absolute; width: 9px; height: 2px; background: #6dd6b1; right: -6px; bottom: 3px; transform: rotate(-45deg); }
    .connection { color: #b6c2cf; font-size: 13px; display: flex; align-items: center; gap: 7px; }
    .connection::before { content: ""; width: 8px; height: 8px; background: #8795a5; border-radius: 50%; }
    .connection.online::before { background: #6dd6b1; }
    main { width: min(1180px, 100%); margin: 0 auto; padding: 42px 24px; display: grid; grid-template-columns: minmax(0, 1fr) 310px; gap: 32px; }
    .workspace { min-width: 0; }
    .title-row { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 17px; }
    h1 { font-size: 24px; line-height: 1.2; margin: 0; letter-spacing: 0; }
    h2 { margin: 0; font-size: 16px; line-height: 1.25; }
    .status { color: #657386; font-size: 13px; min-height: 20px; text-align: right; }
    .editor {
      width: 100%;
      min-height: 310px;
      padding: 20px;
      border: 1px solid #c9d1da;
      border-radius: 6px;
      resize: vertical;
      outline: none;
      line-height: 1.55;
      color: #18212b;
      background: #fff;
      box-shadow: 0 1px 2px rgb(24 33 43 / 5%);
    }
    .editor:focus { border-color: #188c72; box-shadow: 0 0 0 3px rgb(24 140 114 / 14%); }
    .editor:disabled { background: #e9edf1; cursor: not-allowed; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 14px; }
    .meta { color: #657386; font-size: 13px; }
    .actions { display: flex; gap: 8px; }
    .button {
      min-height: 38px;
      border: 1px solid #bdc7d1;
      border-radius: 5px;
      padding: 0 14px;
      background: #fff;
      color: #263342;
      font-weight: 650;
    }
    .button:hover:not(:disabled) { background: #edf2f5; }
    .button:disabled { opacity: .55; cursor: not-allowed; }
    .button-primary { border-color: #167b65; background: #188c72; color: #fff; }
    .button-primary:hover:not(:disabled) { background: #116e5b; }
    .file-section { margin-top: 32px; padding-top: 25px; border-top: 1px solid #d5dbe2; }
    .file-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 13px; }
    .file-dropzone {
      display: block;
      min-height: 98px;
      padding: 20px;
      border: 1px dashed #92a1b1;
      border-radius: 6px;
      background: #fff;
      color: #455466;
      cursor: pointer;
      transition: background .15s, border-color .15s;
    }
    .file-dropzone:hover, .file-dropzone.dragging { border-color: #188c72; background: #f1faf7; }
    .file-dropzone.disabled { background: #e9edf1; color: #788596; cursor: not-allowed; }
    .file-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
    .drop-title { display: block; color: #263342; font-weight: 650; }
    .drop-note { display: block; margin-top: 6px; font-size: 13px; line-height: 1.45; }
    .file-list { margin-top: 16px; }
    .file-empty { margin: 0; padding: 9px 0; color: #657386; font-size: 13px; }
    .file-item {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #dce2e8;
    }
    .file-preview, .file-type {
      width: 58px;
      height: 46px;
      border: 1px solid #c9d1da;
      border-radius: 4px;
      background: #eef2f5;
      object-fit: cover;
    }
    .file-type { display: grid; place-items: center; padding: 5px; color: #526173; font-size: 10px; font-weight: 750; text-align: center; overflow: hidden; }
    .file-name { min-width: 0; color: #263342; font-size: 14px; font-weight: 650; overflow-wrap: anywhere; }
    .file-detail { margin-top: 4px; color: #657386; font-size: 12px; }
    .file-actions { display: flex; align-items: center; gap: 7px; }
    .file-link, .file-remove {
      min-height: 32px;
      border: 1px solid #bdc7d1;
      border-radius: 4px;
      padding: 0 9px;
      background: #fff;
      color: #263342;
      font-size: 12px;
      font-weight: 650;
      line-height: 30px;
      text-decoration: none;
      white-space: nowrap;
    }
    .file-link:hover, .file-remove:hover:not(:disabled) { background: #edf2f5; }
    .file-remove { color: #a5382d; border-color: #dfb4af; }
    .file-remove:hover:not(:disabled) { background: #fff0ef; }
    aside { border-left: 1px solid #d5dbe2; padding-left: 32px; }
    .side-title { margin: 0 0 9px; font-size: 14px; color: #455466; }
    .share-row { display: flex; gap: 7px; }
    .share-link {
      flex: 1 1 auto;
      min-width: 0;
      height: 38px;
      padding: 0 9px;
      border: 1px solid #c9d1da;
      border-radius: 5px;
      background: #fff;
      color: #526173;
      font-size: 12px;
    }
    .icon-button {
      width: 38px;
      height: 38px;
      flex: 0 0 38px;
      border: 1px solid #bdc7d1;
      border-radius: 5px;
      background: #fff;
      color: #263342;
      font-size: 17px;
      line-height: 1;
    }
    .icon-button:hover:not(:disabled) { background: #edf2f5; }
    .icon-button:disabled { opacity: .5; cursor: not-allowed; }
    .room-note { margin: 10px 0 26px; color: #657386; font-size: 13px; line-height: 1.55; }
    .new-room { width: 100%; }
    .empty-state { color: #657386; font-size: 14px; line-height: 1.65; margin: 0 0 22px; }
    footer { padding: 18px 24px; border-top: 1px solid #dce2e8; color: #788596; font-size: 12px; text-align: center; }
    @media (max-width: 760px) {
      header { padding: 0 18px; }
      .connection { font-size: 12px; }
      main { padding: 28px 18px; display: flex; flex-direction: column; gap: 30px; }
      .editor { min-height: 280px; }
      aside { border-left: 0; border-top: 1px solid #d5dbe2; padding: 25px 0 0; }
      .toolbar { align-items: flex-start; flex-direction: column; }
      .title-row { align-items: flex-start; flex-direction: column; gap: 5px; }
      .status { text-align: left; }
      .file-item { grid-template-columns: 48px minmax(0, 1fr); }
      .file-preview, .file-type { width: 48px; height: 42px; }
      .file-actions { grid-column: 2; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>Text Relay</span></div>
      <div id="connection" class="connection">未连接</div>
    </header>
    <main>
      <section class="workspace" aria-label="共享内容">
        <div class="title-row">
          <h1 id="title">临时共享房间</h1>
          <div id="status" class="status" aria-live="polite">创建房间后即可开始</div>
        </div>
        <textarea id="editor" class="editor" maxlength="100000" disabled placeholder="在这里粘贴或输入文本"></textarea>
        <div class="toolbar">
          <span id="character-count" class="meta">0 / 100,000</span>
          <div class="actions">
            <button id="clear-button" class="button" type="button" disabled>清空</button>
            <button id="copy-button" class="button button-primary" type="button" disabled>复制文本</button>
          </div>
        </div>
        <section class="file-section" aria-label="共享文件">
          <div class="file-heading">
            <h2>文件</h2>
            <span id="file-count" class="meta">0 / 20 个文件</span>
          </div>
          <label id="file-dropzone" class="file-dropzone disabled">
            <input id="file-input" class="file-input" type="file" multiple disabled>
            <span class="drop-title">选择文件或拖放到这里</span>
            <span class="drop-note">支持图片、文档、压缩包、视频等格式。单个文件最大 100 MiB，房间总计最大 500 MiB。</span>
          </label>
          <div id="file-list" class="file-list" aria-live="polite"></div>
        </section>
      </section>
      <aside>
        <p class="side-title">房间链接</p>
        <div class="share-row">
          <input id="share-link" class="share-link" aria-label="房间链接" readonly value="创建房间后显示链接">
          <button id="share-copy" class="icon-button" type="button" title="复制房间链接" aria-label="复制房间链接" disabled>⧉</button>
        </div>
        <p id="room-note" class="room-note">文本和文件将在最后一次更新后的 24 小时自动删除。</p>
        <p id="empty-state" class="empty-state">创建一个临时房间，再将链接发送到另一台电脑或手机。</p>
        <button id="new-room" class="button button-primary new-room" type="button">新建临时房间</button>
      </aside>
    </main>
    <footer>文本以纯文本形式保存。房间链接相当于访问凭证，请勿在公开场合泄露。</footer>
  </div>
  <script>
    (() => {
      const MAX_TEXT_LENGTH = 100000;
      const MAX_FILE_SIZE = 100 * 1024 * 1024;
      const MAX_TOTAL_FILE_SIZE = 500 * 1024 * 1024;
      const MAX_FILES = 20;
      const POLL_INTERVAL_MS = 2500;
      const ROOM_PATTERN = /^\\/r\\/([A-Za-z0-9_-]{32})\\/?$/;
      const elements = {
        editor: document.querySelector("#editor"),
        title: document.querySelector("#title"),
        status: document.querySelector("#status"),
        connection: document.querySelector("#connection"),
        count: document.querySelector("#character-count"),
        clear: document.querySelector("#clear-button"),
        copy: document.querySelector("#copy-button"),
        shareLink: document.querySelector("#share-link"),
        shareCopy: document.querySelector("#share-copy"),
        newRoom: document.querySelector("#new-room"),
        emptyState: document.querySelector("#empty-state"),
        roomNote: document.querySelector("#room-note"),
        fileInput: document.querySelector("#file-input"),
        fileDropzone: document.querySelector("#file-dropzone"),
        fileList: document.querySelector("#file-list"),
        fileCount: document.querySelector("#file-count")
      };

      let roomId = getRoomId();
      let lastUpdatedAt = 0;
      let saveTimer = null;
      let pollTimer = null;
      let hasLocalEdits = false;
      let files = [];
      let uploading = [];

      function getRoomId() {
        const match = window.location.pathname.match(ROOM_PATTERN);
        return match ? match[1] : null;
      }

      function fileUrl(file) {
        return "/api/rooms/" + roomId + "/files/" + file.id;
      }

      function setStatus(message, isOnline = false) {
        elements.status.textContent = message;
        elements.connection.textContent = isOnline ? "已连接" : "未连接";
        elements.connection.classList.toggle("online", isOnline);
      }

      function updateCount() {
        elements.count.textContent = elements.editor.value.length.toLocaleString() + " / " + MAX_TEXT_LENGTH.toLocaleString();
      }

      function updateFileCount() {
        elements.fileCount.textContent = files.length + " / " + MAX_FILES + " 个文件";
      }

      function setRoomUi(active) {
        elements.editor.disabled = !active;
        elements.clear.disabled = !active;
        elements.copy.disabled = !active;
        elements.shareCopy.disabled = !active;
        elements.fileInput.disabled = !active;
        elements.fileDropzone.classList.toggle("disabled", !active);
        elements.emptyState.hidden = active;
        elements.shareLink.value = active ? window.location.href : "创建房间后显示链接";
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
        elements.newRoom.disabled = true;
        setStatus("正在创建房间...");
        try {
          const room = await request("/api/rooms", { method: "POST" });
          window.location.assign("/r/" + room.roomId);
        } catch (error) {
          setStatus(error.message || "无法创建房间");
          elements.newRoom.disabled = false;
        }
      }

      async function loadRoom(silent = false) {
        if (!roomId) return;
        try {
          const room = await request("/api/rooms/" + roomId);
          applyRoom(room);
          setStatus("自动保存已开启", true);
        } catch (error) {
          if (error.message === "房间不存在或已过期") {
            stopPolling();
            setRoomUi(false);
            elements.roomNote.textContent = "该房间已过期或已被删除。请创建一个新的临时房间。";
          }
          if (!silent) setStatus(error.message || "连接失败");
        }
      }

      async function saveText() {
        saveTimer = null;
        if (!roomId) return;
        setStatus("正在保存...");
        try {
          const room = await request("/api/rooms/" + roomId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: elements.editor.value })
          });
          hasLocalEdits = false;
          applyRoom(room, false);
          setStatus("已保存", true);
        } catch (error) {
          setStatus(error.message || "保存失败");
        }
      }

      function scheduleSave() {
        hasLocalEdits = true;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveText, 700);
      }

      function startPolling() {
        stopPolling();
        pollTimer = setInterval(() => loadRoom(true), POLL_INTERVAL_MS);
      }

      function stopPolling() {
        if (pollTimer) window.clearInterval(pollTimer);
        pollTimer = null;
      }

      function renderFiles() {
        elements.fileList.replaceChildren();
        updateFileCount();
        const visibleFiles = [...files, ...uploading];
        if (!visibleFiles.length) {
          const empty = document.createElement("p");
          empty.className = "file-empty";
          empty.textContent = "尚未上传文件。";
          elements.fileList.append(empty);
          return;
        }

        for (const file of visibleFiles) {
          const item = document.createElement("div");
          item.className = "file-item";
          item.append(createFilePreview(file));

          const details = document.createElement("div");
          const name = document.createElement("div");
          name.className = "file-name";
          name.textContent = file.name;
          const meta = document.createElement("div");
          meta.className = "file-detail";
          meta.textContent = file.uploading ? "正在上传..." : formatSize(file.size) + " · " + fileLabel(file);
          details.append(name, meta);
          item.append(details);

          const actions = document.createElement("div");
          actions.className = "file-actions";
          if (!file.uploading) {
            const open = document.createElement("a");
            open.className = "file-link";
            open.href = fileUrl(file);
            open.target = "_blank";
            open.rel = "noopener";
            open.textContent = isPreviewable(file) ? "预览" : "下载";
            actions.append(open);

            const remove = document.createElement("button");
            remove.className = "file-remove";
            remove.type = "button";
            remove.textContent = "删除";
            remove.addEventListener("click", () => deleteFile(file));
            actions.append(remove);
          }
          item.append(actions);
          elements.fileList.append(item);
        }
      }

      function createFilePreview(file) {
        if (!file.uploading && file.type.startsWith("image/")) {
          const image = document.createElement("img");
          image.className = "file-preview";
          image.src = fileUrl(file);
          image.alt = "";
          return image;
        }
        if (!file.uploading && file.type.startsWith("video/")) {
          const video = document.createElement("video");
          video.className = "file-preview";
          video.src = fileUrl(file);
          video.muted = true;
          video.preload = "metadata";
          video.setAttribute("aria-label", "视频文件");
          return video;
        }
        const type = document.createElement("div");
        type.className = "file-type";
        type.textContent = extensionOf(file.name);
        return type;
      }

      async function selectFiles(selected) {
        if (!roomId || !selected.length) return;
        const candidates = selected.filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            setStatus(file.name + " 超过单个文件 100 MiB 限制");
            return false;
          }
          return true;
        });
        if (!candidates.length) return;

        const knownSize = files.reduce((total, file) => total + file.size, 0);
        const selectedSize = candidates.reduce((total, file) => total + file.size, 0);
        if (files.length + candidates.length > MAX_FILES) {
          setStatus("每个房间最多上传 " + MAX_FILES + " 个文件");
          return;
        }
        if (knownSize + selectedSize > MAX_TOTAL_FILE_SIZE) {
          setStatus("房间文件总大小不能超过 500 MiB");
          return;
        }

        for (const file of candidates) {
          const pending = {
            id: "upload-" + Math.random().toString(36).slice(2),
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            uploading: true
          };
          uploading.push(pending);
          renderFiles();
          setStatus("正在上传 " + file.name + "...");
          try {
            const room = await request("/api/rooms/" + roomId + "/files?name=" + encodeURIComponent(file.name), {
              method: "POST",
              headers: { "Content-Type": file.type || "application/octet-stream" },
              body: file
            });
            applyRoom(room, false);
            setStatus(file.name + " 已上传", true);
          } catch (error) {
            setStatus(error.message || file.name + " 上传失败");
          } finally {
            uploading = uploading.filter((item) => item !== pending);
            renderFiles();
          }
        }
      }

      async function deleteFile(file) {
        if (!window.confirm("删除“" + file.name + "”吗？")) return;
        setStatus("正在删除文件...");
        try {
          const room = await request("/api/rooms/" + roomId + "/files/" + file.id, { method: "DELETE" });
          applyRoom(room, false);
          setStatus("文件已删除", true);
        } catch (error) {
          setStatus(error.message || "删除文件失败");
        }
      }

      function isPreviewable(file) {
        return ["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"].includes(file.type) || file.type.startsWith("video/");
      }

      function extensionOf(name) {
        const extension = name.includes(".") ? name.split(".").pop() : "FILE";
        return extension.slice(0, 7).toUpperCase();
      }

      function fileLabel(file) {
        if (file.type.startsWith("image/")) return "图片";
        if (file.type.startsWith("video/")) return "视频";
        if (file.type.includes("zip") || file.name.match(/\\.(zip|rar|7z|tar|gz)$/i)) return "压缩包";
        return "文件";
      }

      function formatSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KiB";
        return (bytes / 1024 / 1024).toFixed(1) + " MiB";
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
        setStatus(label, true);
      }

      elements.editor.addEventListener("input", () => {
        updateCount();
        scheduleSave();
      });
      elements.newRoom.addEventListener("click", createRoom);
      elements.clear.addEventListener("click", () => {
        if (elements.editor.value && window.confirm("清空房间内的文本吗？")) {
          elements.editor.value = "";
          updateCount();
          scheduleSave();
        }
      });
      elements.copy.addEventListener("click", () => copyText(elements.editor.value, "文本已复制"));
      elements.shareCopy.addEventListener("click", () => copyText(window.location.href, "链接已复制"));
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
        startPolling();
      }
    })();
  </script>
</body>
</html>`;
