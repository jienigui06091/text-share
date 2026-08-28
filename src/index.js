import { page } from "./html.js";
import { S3mini } from "s3mini";

const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
const MAX_TEXT_LENGTH = 100_000;
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_FILES_PER_ROOM = 20;
const MAX_TOTAL_FILE_SIZE = 500 * 1024 * 1024;
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

    const socketMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/ws$/);
    if (socketMatch) {
      const roomId = socketMatch[1];
      if (!ROOM_ID_PATTERN.test(roomId)) return json({ error: "无效的房间地址" }, 400);
      if (
        request.method !== "GET" ||
        request.headers.get("Upgrade")?.toLowerCase() !== "websocket"
      ) {
        return json({ error: "需要 WebSocket 连接" }, 426);
      }

      const room = env.CLIP_ROOM.get(env.CLIP_ROOM.idFromName(roomId));
      return room.fetch(new Request("https://room.internal/websocket", {
        headers: request.headers
      }));
    }

    const collectionMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/files$/);
    if (collectionMatch) {
      const roomId = collectionMatch[1];
      if (!ROOM_ID_PATTERN.test(roomId)) return json({ error: "无效的房间地址" }, 400);
      if (request.method !== "POST") return json({ error: "不支持的请求方法" }, 405);
      const contentLength = contentLengthOf(request.headers);
      if (contentLength === null) return json({ error: "上传请求缺少有效的文件大小" }, 411);

      const room = env.CLIP_ROOM.get(env.CLIP_ROOM.idFromName(roomId));
      const upload = fixedLengthBody(request.body, contentLength);
      const response = await room.fetch(new Request(`https://room.internal/files${url.search}`, {
        method: "POST",
        headers: uploadHeaders(request.headers, contentLength),
        body: upload.body
      }));
      if (response.ok) await upload.finished;
      return withHeaders(response);
    }

    const fileMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/files\/([A-Za-z0-9_-]+)$/);
    if (fileMatch) {
      const [, roomId, fileId] = fileMatch;
      if (!ROOM_ID_PATTERN.test(roomId) || !FILE_ID_PATTERN.test(fileId)) {
        return json({ error: "无效的文件地址" }, 400);
      }
      if (!["GET", "DELETE"].includes(request.method)) {
        return json({ error: "不支持的请求方法" }, 405);
      const room = env.CLIP_ROOM.get(env.CLIP_ROOM.idFromName(roomId));
      return withHeaders(await room.fetch(new Request(`https://room.internal/files/${fileId}`, {
        method: request.method
      })));
    }

    const roomMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)$/);
    if (roomMatch) {
      const roomId = roomMatch[1];
      if (!ROOM_ID_PATTERN.test(roomId)) return json({ error: "无效的房间地址" }, 400);
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
          "Content-Security-Policy": "default-src 'self'; connect-src 'self'; img-src 'self' blob:; media-src 'self' blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer"
        }
      });
    }

    return json({ error: "未找到资源" }, 404);
  }
};

export class ClipRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.files = createFileStore(env);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/initialize" && request.method === "POST") {
      const existing = await this.readActiveRoom();
      if (existing) return json({ error: "该房间后缀已被占用，请换一个" }, 409);

      const room = {
        text: "",
        files: [],
        updatedAt: Date.now(),
        expiresAt: Date.now() + ROOM_TTL_MS
      };
      await this.state.storage.put("room", room);
      await this.state.storage.setAlarm(room.expiresAt);
      return json(publicRoom(room), 201);
    }

    if (url.pathname === "/websocket" && request.method === "GET") {
      const room = await this.readActiveRoom();
      if (!room) return json({ error: "房间不存在或已过期" }, 404);

      const [client, server] = Object.values(new WebSocketPair());
      this.state.acceptWebSocket(server);
      server.send(JSON.stringify({ type: "room", room: publicRoom(room) }));
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === "/state") return this.handleState(request);
    }

    if (url.pathname === "/files" && request.method === "POST") {
      return this.uploadFile(request);
    }

    const fileMatch = url.pathname.match(/^\/files\/([A-Za-z0-9_-]+)$/);
    if (fileMatch && FILE_ID_PATTERN.test(fileMatch[1])) {
      if (request.method === "GET") return this.downloadFile(fileMatch[1]);
      if (request.method === "DELETE") return this.deleteFile(fileMatch[1]);
    }

    return json({ error: "未找到资源" }, 404);
  }

  async handleState(request) {
    const room = await this.readActiveRoom();
    if (!room) return json({ error: "房间不存在或已过期" }, 404);

    if (request.method === "GET") return json(publicRoom(room));

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

      const updated = this.renewRoom({ ...room, text: body.text });
      await this.saveRoom(updated);
      this.broadcast({ type: "room", room: publicRoom(updated) });
      return json(publicRoom(updated));
    }

    if (request.method === "DELETE") {
      await this.removeRoom(room);
      this.notifyRoomClosed("Room deleted");
      return new Response(null, { status: 204 });
    }

    return json({ error: "不支持的请求方法" }, 405);
  }

  async uploadFile(request) {
    const room = await this.readActiveRoom();
    if (!room) return json({ error: "房间不存在或已过期" }, 404);

    const name = readFileName(new URL(request.url).searchParams.get("name"));
    if (!name) return json({ error: "文件名无效" }, 400);
    if (room.files.length >= MAX_FILES_PER_ROOM) {
      return json({ error: `每个房间最多上传 ${MAX_FILES_PER_ROOM} 个文件` }, 413);
    }

    const currentSize = room.files.reduce((total, file) => total + file.size, 0);
    const remainingSize = MAX_TOTAL_FILE_SIZE - currentSize;
    if (remainingSize <= 0) return json({ error: "房间文件总大小已达上限" }, 413);

    const contentLength = contentLengthOf(request.headers);
    if (contentLength === null) return json({ error: "上传请求缺少有效的文件大小" }, 411);
    if (contentLength > Math.min(MAX_FILE_SIZE, remainingSize)) {
      return json({ error: "文件大小超出房间限制" }, 413);
    }

    const file = {
      id: createId(12),
      name,
      size: contentLength,
      type: normalizeContentType(request.headers.get("content-type")),
      uploadedAt: Date.now()
    };
    const key = objectKey(this.env, file.id);

    await this.files.putAnyObject(key, request.body, file.type, undefined, undefined, contentLength);

    const updated = this.renewRoom({ ...room, files: [...room.files, file] });
    try {
      await this.saveRoom(updated);
    } catch (error) {
      await this.files.deleteObject(key);
      throw error;
    }

    this.broadcast({ type: "room", room: publicRoom(updated) });
    return json(publicRoom(updated), 201);
  }

  async downloadFile(fileId) {
    const room = await this.readActiveRoom();
    if (!room) return json({ error: "房间不存在或已过期" }, 404);

    const file = room.files.find((item) => item.id === fileId);
    if (!file) return json({ error: "文件不存在或已删除" }, 404);

    const object = await this.files.getObjectResponse(objectKey(this.env, file.id));
    if (!object) return json({ error: "文件不存在或已删除" }, 404);

    const headers = new Headers({
      "Content-Type": file.type,
      "Content-Length": String(file.size),
      "Content-Disposition": contentDisposition(file),
      "Cache-Control": "no-store"
    });
    return new Response(object.body, { headers });
  }

  async deleteFile(fileId) {
    const room = await this.readActiveRoom();
    if (!room) return json({ error: "房间不存在或已过期" }, 404);

    const file = room.files.find((item) => item.id === fileId);
    if (!file) return json({ error: "文件不存在或已删除" }, 404);

    await this.files.deleteObject(objectKey(this.env, file.id));
    const updated = this.renewRoom({
      ...room,
      files: room.files.filter((item) => item.id !== fileId)
    });
    await this.saveRoom(updated);
    this.broadcast({ type: "room", room: publicRoom(updated) });
    return json(publicRoom(updated));
  }

  async alarm() {
    const room = await this.state.storage.get("room");
    if (!room) return;

    if (room.expiresAt <= Date.now()) {
      await this.removeRoom(normalizeRoom(room));
      this.notifyRoomClosed("Room expired");
      return;
    }

    await this.state.storage.setAlarm(room.expiresAt);
  }

  async readActiveRoom() {
    const stored = await this.state.storage.get("room");
    if (!stored) return null;

    const room = normalizeRoom(stored);
    if (room.expiresAt > Date.now()) {
      if (!Array.isArray(stored.files)) await this.state.storage.put("room", room);
      return room;
    }

    await this.removeRoom(room);
    this.notifyRoomClosed("Room expired");
    return null;
  }

  async saveRoom(room) {
    await this.state.storage.put("room", room);
    await this.state.storage.setAlarm(room.expiresAt);
  }

  async removeRoom(room) {
    if (room.files.length) {
      await this.files.deleteObjects(room.files.map((file) => objectKey(this.env, file.id)));
    }
    await this.state.storage.deleteAll();
  }

  renewRoom(room) {
    const now = Date.now();
    return { ...room, updatedAt: now, expiresAt: now + ROOM_TTL_MS };
  }

  async webSocketMessage() {
    // This channel only pushes updates from the Durable Object to clients.
  }

  async webSocketClose(socket, code, reason) {
    socket.close(code, reason);
  }

  broadcast(message) {
    const payload = JSON.stringify(message);
    for (const socket of this.state.getWebSockets()) {
      try {
        socket.send(payload);
      } catch {
        socket.close(1011, "Unable to send update");
      }
    }
  }

  notifyRoomClosed(reason) {
    this.broadcast({ type: "room-deleted" });
    this.closeSockets(4004, reason);
  }

  closeSockets(code, reason) {
    for (const socket of this.state.getWebSockets()) {
      socket.close(code, reason);
    }
  }
}

function createId(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function createFileStore(env) {
  const endpoint = requiredConfig(env, "R2_ENDPOINT_URL");
  const bucket = requiredConfig(env, "R2_BUCKET");
  const url = new URL(endpoint);
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${encodeURIComponent(bucket)}`;

  return new S3mini({
    accessKeyId: requiredConfig(env, "R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredConfig(env, "R2_SECRET_ACCESS_KEY"),
    endpoint: url.toString(),
    region: env.R2_REGION?.trim() || "auto"
  });
}

function requiredConfig(env, name) {
  const value = env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`缺少 R2 配置项：${name}`);
  }
  return value.trim();
}

function objectKey(env, fileId) {
  const prefix = typeof env.R2_PREFIX === "string" ? env.R2_PREFIX.trim().replace(/^\/+|\/+$/g, "") : "";
  return prefix ? `${prefix}/files/${fileId}` : `files/${fileId}`;
}

function normalizeRoom(room) {
  return {
    ...room,
    files: Array.isArray(room.files) ? room.files : []
  };
}

function readFileName(name) {
  if (!name || name.length > 255 || /[\u0000-\u001F\u007F]/.test(name)) return null;
  return name.trim() || null;
}

function normalizeContentType(value) {
  const type = value?.split(";")[0].trim().toLowerCase();
  return type && /^[!#$&^_.+\w-]+\/[!#$&^_.+\w-]+$/.test(type) ? type : "application/octet-stream";
}

function contentLengthOf(headers) {
  const value = headers.get("content-length");
  if (value === null || !/^\d+$/.test(value)) return null;
  const size = Number(value);
  return Number.isSafeInteger(size) ? size : null;
}

function fixedLengthBody(body, contentLength) {
  const stream = new FixedLengthStream(contentLength);
  return {
    body: stream.readable,
    finished: body ? body.pipeTo(stream.writable) : stream.writable.getWriter().close()
  };
}

function publicRoom(room) {
  return {
    text: room.text,
    updatedAt: room.updatedAt,
    expiresAt: room.expiresAt,
    files: room.files.map(({ id, name, size, type, uploadedAt }) => ({ id, name, size, type, uploadedAt }))
  };
}

function contentDisposition(file) {
  const inline = isPreviewableType(file.type);
  return `${inline ? "inline" : "attachment"}; filename="download"; filename*=UTF-8''${encodeURIComponent(file.name)}`;
}

function isPreviewableType(type) {
  return ["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"].includes(type) || type.startsWith("video/");
}

function uploadHeaders(headers, contentLength) {
  const result = new Headers();
  const type = headers.get("content-type");
  if (type) result.set("content-type", type);
  result.set("content-length", String(contentLength));
  return result;
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
