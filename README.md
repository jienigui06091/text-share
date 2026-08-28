# Text Relay

临时文本与文件中转站。创建房间后，把链接发送到另一台电脑或手机；文本与文件会自动保存，并在最后一次更新后的 24 小时删除。

支持多文件上传，包括图片、文档、压缩包和视频等常见格式。图片和视频可在浏览器中预览，其他文件可直接下载。

每个房间最多保存 20 个文件；单个文件最大 100 MiB，所有文件总计最大 500 MiB。

## 本地运行

```powershell
npm install
npm run dev
```

打开终端显示的本地地址。文本和房间文件清单保存在本机 `.wrangler` 目录；上传的文件直接写入真实的 Cloudflare R2 存储桶。

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

## 使用真实 R2

将配置模板复制为本机配置文件：

```powershell
Copy-Item .dev.vars.example .dev.vars
```

编辑 `.dev.vars`，填写 R2 的 S3 API 配置：

```ini
R2_ENDPOINT_URL=https://你的账号ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=你的R2访问密钥ID
R2_SECRET_ACCESS_KEY=你的R2机密访问密钥
R2_REGION=auto
R2_BUCKET=cfbucket
R2_PREFIX=images
```

`R2_PUBLIC_BASE_URL` 为可选项，当前应用不会直接暴露 R2 公共链接，因此可留空。文件下载仍由应用接口代理，存储桶可保持私有。

`.dev.vars` 已加入 `.gitignore`，不会提交到 Git。无需执行 `wrangler login`，也无需执行 `wrangler deploy`；`wrangler dev` 会在本机运行，并用 S3 兼容 API 直接连接 R2。

局域网访问时运行：

```powershell
npm run dev:lan
```

服务仍在本机运行，其他设备通过本机 IPv4 地址和端口 `8787` 访问；文件数据会保存在 R2，文本和文件清单保存在运行服务这台电脑的 `.wrangler` 目录。

## 使用方式

1. 打开首页，点击“新建临时房间”。
2. 在输入框中粘贴或输入文本，也可选择或拖放多个文件。
3. 复制房间链接，在另一台电脑或手机打开。
4. 在另一台设备预览、下载或删除共享内容。

创建房间时可填写 3 至 32 位的自定义后缀（字母、数字、`-`、`_`）；留空则生成 192 位随机值。链接相当于访问凭证，请勿使用容易猜到的后缀，也不要在公开场合泄露。
