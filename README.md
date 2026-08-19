# Text Relay

临时文本中转站。创建房间后，把链接发送到另一台电脑；文本会自动保存，并在最后一次更新后的 24 小时删除。

## 本地运行

```powershell
npm install
npm run dev
```

打开终端显示的本地地址。Wrangler 的本地 Durable Objects 数据默认保存在 `.wrangler` 目录。

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
