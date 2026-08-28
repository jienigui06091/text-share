import { page } from "./html.js";

const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
const MAX_TEXT_LENGTH = 100_000;
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return json({ error: "请求内容必须是 JSON" }, 400);
      }

      const roomId = body?.suffix === undefined || body.suffix === ""
        ? createRoomId()
        : typeof body.suffix === "string" && ROOM_ID_PATTERN.test(body.suffix)
          ? body.suffix
          : null;
      if (!roomId) {
        return json({ error: "房间后缀需为 3 至 32 位字母、数字、- 或 _" }, 400);
      }

      const room = env.CLIP_ROOM.get(env.CLIP_ROOM.idFromName(roomId));
      const response = await room.fetch("https://room.internal/initialize", { method: "POST" });
      if (!response.ok) return withHeaders(response);
      return json({ roomId }, 201);
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)$/);
    if (match) {
      const roomId = match[1];
      if (!ROOM_ID_PATTERN.test(roomId)) {
        return json({ error: "无效的房间地址" }, 400);
      }

      if (!["GET", "PUT", "DELETE"].includes(request.method)) {
        return json({ error: "不支持的请求方法" }, 405);
      }

      const room = env.CLIP_ROOM.get(env.CLIP_ROOM.idFromName(roomId));
      const upstream = new Request("https://room.internal/state", {
        method: request.method,
        headers: request.method === "PUT" ? { "Content-Type": "application/json" } : undefined,
        body: request.method === "PUT" ? await request.text() : undefined
      });
      return withHeaders(await room.fetch(upstream));
    }

    if (request.method === "GET") {
      return new Response(page, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy": "default-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
        }
      });
    }

    return json({ error: "未找到资源" }, 404);
  }
};

export class ClipRoom {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/initialize" && request.method === "POST") {
      const existing = await this.readActiveRoom();
      if (existing) return json({ error: "该房间后缀已被占用，请换一个" }, 409);

      const room = {
        text: "",
        updatedAt: Date.now(),
        expiresAt: Date.now() + ROOM_TTL_MS
      };
      await this.state.storage.put("room", room);
      await this.state.storage.setAlarm(room.expiresAt);
      return json(publicRoom(room), 201);
    }

    if (url.pathname !== "/state") {
      return json({ error: "未找到资源" }, 404);
    }

    const room = await this.readActiveRoom();
    if (!room) return json({ error: "房间不存在或已过期" }, 404);

    if (request.method === "GET") {
      return json(publicRoom(room));
    }

    if (request.method === "PUT") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "请求内容必须是 JSON" }, 400);
      }

      if (!body || typeof body.text !== "string") {
        return json({ error: "text 必须是字符串" }, 400);
      }
      if (body.text.length > MAX_TEXT_LENGTH) {
        return json({ error: "文本不能超过 100,000 个字符" }, 413);
      }

      const now = Date.now();
      const updated = {
        text: body.text,
        updatedAt: now,
        expiresAt: now + ROOM_TTL_MS
      };
      await this.state.storage.put("room", updated);
      await this.state.storage.setAlarm(updated.expiresAt);
      return json(publicRoom(updated));
    }

    if (request.method === "DELETE") {
      await this.state.storage.deleteAll();
      return new Response(null, { status: 204 });
    }

    return json({ error: "不支持的请求方法" }, 405);
  }

  async alarm() {
    const room = await this.state.storage.get("room");
    if (!room) return;

    if (room.expiresAt <= Date.now()) {
      await this.state.storage.deleteAll();
      return;
    }

    await this.state.storage.setAlarm(room.expiresAt);
  }

  async readActiveRoom() {
    const room = await this.state.storage.get("room");
    if (!room) return null;
    if (room.expiresAt > Date.now()) return room;

    await this.state.storage.deleteAll();
    return null;
  }
}

function createRoomId() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function publicRoom(room) {
  return {
    text: room.text,
    updatedAt: room.updatedAt,
    expiresAt: room.expiresAt
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function withHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  return new Response(response.body, { status: response.status, headers });
}
