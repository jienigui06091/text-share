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
    main { width: min(1180px, 100%); margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: minmax(0, 1fr) 310px; gap: 32px; }
    .workspace { min-width: 0; }
    .title-row { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 17px; }
    h1 { font-size: 24px; line-height: 1.2; margin: 0; letter-spacing: 0; }
    .status { color: #657386; font-size: 13px; min-height: 20px; text-align: right; }
    .editor {
      width: 100%;
      min-height: 470px;
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
    .room-suffix { width: 100%; height: 38px; padding: 0 9px; border: 1px solid #c9d1da; border-radius: 5px; background: #fff; color: #18212b; }
    .room-suffix:focus { border-color: #188c72; box-shadow: 0 0 0 3px rgb(24 140 114 / 14%); outline: none; }
    .room-suffix-label { display: block; }
    .suffix-note { margin: 7px 0 18px; color: #657386; font-size: 12px; line-height: 1.5; }
    .new-room { width: 100%; }
    .empty-state { color: #657386; font-size: 14px; line-height: 1.65; margin: 0 0 22px; }
    footer { padding: 18px 24px; border-top: 1px solid #dce2e8; color: #788596; font-size: 12px; text-align: center; }
    @media (max-width: 760px) {
      header { padding: 0 18px; }
      .connection { font-size: 12px; }
      main { padding: 28px 18px; display: flex; flex-direction: column; gap: 30px; }
      .editor { min-height: 360px; }
      aside { border-left: 0; border-top: 1px solid #d5dbe2; padding: 25px 0 0; }
      .toolbar { align-items: flex-start; flex-direction: column; }
      .title-row { align-items: flex-start; flex-direction: column; gap: 5px; }
      .status { text-align: left; }
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
      <section class="workspace" aria-label="文本编辑器">
        <div class="title-row">
          <h1 id="title">临时文本房间</h1>
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
      </section>
      <aside>
        <p class="side-title">房间链接</p>
        <div class="share-row">
          <input id="share-link" class="share-link" aria-label="房间链接" readonly value="创建房间后显示链接">
          <button id="share-copy" class="icon-button" type="button" title="复制房间链接" aria-label="复制房间链接" disabled>⧉</button>
        </div>
        <p id="room-note" class="room-note">房间内的文本将在最后一次更新后的 24 小时自动删除。</p>
        <p id="empty-state" class="empty-state">创建一个临时房间，再将链接发送到另一台电脑。</p>
        <div id="create-controls">
          <label class="side-title room-suffix-label" for="room-suffix">房间后缀（可选）</label>
          <input id="room-suffix" class="room-suffix" type="text" minlength="3" maxlength="32" pattern="[A-Za-z0-9_-]{3,32}" autocomplete="off" spellcheck="false" placeholder="例如：project-notes">
          <p class="suffix-note">留空则自动生成；仅支持字母、数字、- 和 _。</p>
        </div>
        <button id="new-room" class="button button-primary new-room" type="button">新建临时房间</button>
      </aside>
    </main>
    <footer>文本以纯文本形式保存，不会执行其中的内容。</footer>
  </div>
  <script>
    (() => {
      const MAX_TEXT_LENGTH = 100000;
      const POLL_INTERVAL_MS = 2500;
      const ROOM_PATTERN = /^\\/r\\/([A-Za-z0-9_-]{3,32})\\/?$/;
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
        createControls: document.querySelector("#create-controls"),
        roomSuffix: document.querySelector("#room-suffix"),
        emptyState: document.querySelector("#empty-state"),
        roomNote: document.querySelector("#room-note")
      };

      let roomId = getRoomId();
      let lastUpdatedAt = 0;
      let saveTimer = null;
      let pollTimer = null;
      let hasLocalEdits = false;

      function getRoomId() {
        const match = window.location.pathname.match(ROOM_PATTERN);
        return match ? match[1] : null;
      }

      function setStatus(message, isOnline = false) {
        elements.status.textContent = message;
        elements.connection.textContent = isOnline ? "已连接" : "未连接";
        elements.connection.classList.toggle("online", isOnline);
      }

      function updateCount() {
        elements.count.textContent = elements.editor.value.length.toLocaleString() + " / " + MAX_TEXT_LENGTH.toLocaleString();
      }

      function setRoomUi(active) {
        elements.editor.disabled = !active;
        elements.clear.disabled = !active;
        elements.copy.disabled = !active;
        elements.shareCopy.disabled = !active;
        elements.emptyState.hidden = active;
        elements.createControls.hidden = active;
        elements.shareLink.value = active ? window.location.href : "创建房间后显示链接";
        elements.title.textContent = active ? "临时文本房间" : "临时文本房间";
      }

      async function request(path, options = {}) {
        const response = await fetch(path, {
          ...options,
          headers: { "Content-Type": "application/json", ...(options.headers || {}) },
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
        if (suffix && !/^[A-Za-z0-9_-]{3,32}$/.test(suffix)) {
          setStatus("后缀需为 3 至 32 位字母、数字、- 或 _");
          elements.roomSuffix.focus();
          return;
        }

        elements.newRoom.disabled = true;
        elements.roomSuffix.disabled = true;
        setStatus("正在创建房间...");
        try {
          const room = await request("/api/rooms", {
            method: "POST",
            body: JSON.stringify({ suffix })
          });
          window.location.assign("/r/" + room.roomId);
        } catch (error) {
          setStatus(error.message || "无法创建房间");
          elements.newRoom.disabled = false;
          elements.roomSuffix.disabled = false;
        }
      }

      async function loadRoom(silent = false) {
        if (!roomId) return;
        try {
          const room = await request("/api/rooms/" + roomId);
          if (!hasLocalEdits && room.updatedAt > lastUpdatedAt) {
            elements.editor.value = room.text;
            updateCount();
            lastUpdatedAt = room.updatedAt;
          }
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
        const text = elements.editor.value;
        setStatus("正在保存...");
        try {
          const room = await request("/api/rooms/" + roomId, {
            method: "PUT",
            body: JSON.stringify({ text })
          });
          lastUpdatedAt = room.updatedAt;
          hasLocalEdits = false;
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
        if (elements.editor.value && window.confirm("清空房间内的文本？")) {
          elements.editor.value = "";
          updateCount();
          scheduleSave();
        }
      });
      elements.copy.addEventListener("click", () => copyText(elements.editor.value, "文本已复制"));
      elements.shareCopy.addEventListener("click", () => copyText(window.location.href, "链接已复制"));

      setRoomUi(Boolean(roomId));
      updateCount();
      if (roomId) {
        loadRoom();
        startPolling();
      }
    })();
  </script>
</body>
</html>`;
