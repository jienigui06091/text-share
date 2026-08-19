# Text Relay

临时文本中转站。创建房间后，把链接发送到另一台电脑；文本会自动保存，并在最后一次更新后的 24 小时删除。

## 本地运行

```powershell
npm install
npm run dev
```

打开终端显示的本地地址。Wrangler 的本地 Durable Objects 数据默认保存在 `.wrangler` 目录。

## 局域网访问

在运行项目的电脑上执行：

```powershell
npm run dev:lan
```

同一局域网内的其他设备可通过 `http://<这台电脑的 IPv4 地址>:8787` 访问，例如 `http://192.168.1.20:8787`。

可用以下命令查看本机 IPv4 地址：

```powershell
ipconfig
```

首次访问失败时，请在 Windows 防火墙提示中允许 Node.js 在“专用网络”通信，或手动放行 TCP `8787` 入站端口。局域网模式仅适合受信任的内部网络；停止 `npm run dev:lan` 后，该地址将不再可访问。

## 部署到 Cloudflare

```powershell
npx wrangler login
npm run deploy
```

首次部署时，Wrangler 会按 `wrangler.toml` 创建 Durable Object 绑定和 SQLite 迁移。部署成功后，使用输出的 `workers.dev` 地址即可。

## 使用方式

1. 打开首页，点击“新建临时房间”。
2. 在输入框中粘贴或输入文本。
3. 复制房间链接，在另一台电脑打开。
4. 在另一台电脑点击“复制文本”。

每个房间链接是 192 位随机值。链接相当于访问凭证，请不要在公开场合泄露。
