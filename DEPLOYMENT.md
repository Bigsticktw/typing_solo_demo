# 多人對戰系統部署指南

## 📦 部署架構

多人對戰系統包含前端和後端，需要分開部署：

```
前端 (React)  →  GitHub Pages / Vercel / Netlify
     ↓ WebSocket 連線
後端 (Node.js) →  Render / Railway / Fly.io / Heroku
```

---

## 🎨 前端部署

### 選項 1：GitHub Pages（推薦用於測試）

#### 1. 設定 Vite 配置

編輯 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/<你的 repo 名稱>/', // 例如：'/typing/'
})
```

#### 2. 安裝部署工具

```bash
npm install -D gh-pages
```

#### 3. 修改 package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://<你的使用者名>.github.io/<repo名稱>"
}
```

#### 4. 部署

```bash
npm run deploy
```

網站將發布到：`https://<你的使用者名>.github.io/<repo名稱>`

---

### 選項 2：Vercel（推薦用於正式環境）

#### 優點
- ✅ 自動 CI/CD（推送即部署）
- ✅ 免費額度充足
- ✅ 全球 CDN 加速
- ✅ 自動 HTTPS

#### 部署步驟

1. 前往 [vercel.com](https://vercel.com)
2. 用 GitHub 帳號登入
3. Import Repository
4. Vercel 自動偵測 Vite 專案並部署

**環境變數設定：**
```
VITE_WEBSOCKET_URL=https://你的後端網址.com
```

---

## 🖥️ 後端部署

### 選項 1：Render.com（推薦，免費）

#### 優點
- ✅ 免費方案（有限制）
- ✅ 自動部署
- ✅ 支援 WebSocket
- ✅ 免費 HTTPS

#### 限制
- ⚠️ 閒置 15 分鐘後休眠
- ⚠️ 冷啟動需 30-60 秒

#### 部署步驟

1. 前往 [render.com](https://render.com)
2. 建立新的 **Web Service**
3. 連接 GitHub Repository
4. 設定：
   ```
   Name: typing-battle-server
   Environment: Node
   Build Command: cd server && npm install && npm run build
   Start Command: cd server && npm start
   ```
5. 環境變數：
   ```
   PORT=3001
   NODE_ENV=production
   ```

#### 前端連接設定

在前端專案中建立 `.env.production`：

```env
VITE_WEBSOCKET_URL=https://你的render網址.onrender.com
```

修改 `src/services/SocketService.ts`：

```typescript
export class SocketService {
  private socket: MultiplayerSocket | null = null;
  private serverUrl: string = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001';
  // ...
}
```

---

### 選項 2：Railway.app

#### 優點
- ✅ 免費 $5 額度/月
- ✅ 不會自動休眠
- ✅ 更快的冷啟動

#### 部署步驟

1. 前往 [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. 選擇 Repository
4. 設定環境變數
5. 自動部署

---

### 選項 3：Fly.io

#### 優點
- ✅ 全球分散式部署
- ✅ 免費額度
- ✅ 低延遲

#### 部署步驟

需要建立 `fly.toml` 配置檔。詳見 [fly.io 文件](https://fly.io/docs/)。

---

## 🔧 完整部署範例

### 情境：免費部署（前端 Vercel + 後端 Render）

#### 1. 後端部署到 Render

```bash
# 在 server 目錄確保有 start script
cd server
npm run build  # 確認可以建置
```

在 Render 設定：
- Build Command: `cd server && npm install && npm run build`
- Start Command: `cd server && npm start`

假設部署後網址為：`https://typing-battle-server.onrender.com`

#### 2. 前端設定環境變數

建立 `.env.production`：

```env
VITE_WEBSOCKET_URL=https://typing-battle-server.onrender.com
```

#### 3. 修改 Socket 連線

`src/services/SocketService.ts`：

```typescript
connect(url?: string): MultiplayerSocket {
  if (url) {
    this.serverUrl = url;
  }
  
  // 使用環境變數
  const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || this.serverUrl;
  
  this.socket = io(serverUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  
  return this.socket;
}
```

#### 4. 部署前端到 Vercel

```bash
# Push 到 GitHub
git add .
git commit -m "Add production config"
git push

# Vercel 會自動部署
```

在 Vercel 專案設定中加入環境變數：
```
VITE_WEBSOCKET_URL=https://typing-battle-server.onrender.com
```

---

## 🔒 安全性設定（生產環境必做）

### 後端 CORS 設定

修改 `server/src/index.ts`：

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',  // 開發環境
      'https://你的vercel網址.vercel.app',  // 生產環境
      'https://你的使用者名.github.io'  // GitHub Pages
    ],
    methods: ['GET', 'POST']
  }
});
```

### 環境變數管理

建立 `server/.env.production`：

```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://你的前端網址.vercel.app,https://另一個網址.com
```

修改 CORS 設定讀取環境變數：

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});
```

---

## 📊 費用估算

### 完全免費方案

| 服務 | 前端 | 後端 | 限制 |
|------|------|------|------|
| GitHub Pages + Render | ✅ | ✅ | 後端閒置會休眠 |
| Vercel + Render | ✅ | ✅ | 後端閒置會休眠 |
| Netlify + Railway | ✅ | ✅ | Railway $5/月免費額度 |

### 推薦組合（免費）

**開發/測試環境：**
- 前端：GitHub Pages
- 後端：Render.com 免費版

**正式環境（小規模）：**
- 前端：Vercel
- 後端：Railway.app（不會休眠）

---

## 🚀 快速開始

### 1 分鐘快速部署（使用 Render + Vercel）

```bash
# 1. 推送到 GitHub
git add .
git commit -m "Add multiplayer system"
git push

# 2. 在 Render 建立 Web Service
# 3. 在 Vercel Import GitHub Repository
# 4. 完成！
```

---

## ⚠️ 注意事項

### Render 免費版限制
- 閒置 15 分鐘自動休眠
- 首次喚醒需 30-60 秒
- 建議：定期 ping 保持活躍（可用 cron-job.org）

### WebSocket 連線
- 確保部署平台支援 WebSocket
- Render、Railway、Fly.io 都支援
- GitHub Pages **不支援**後端運行

### HTTPS 要求
- 生產環境建議使用 HTTPS
- 現代瀏覽器可能阻擋 HTTP WebSocket
- 所有推薦平台都提供免費 HTTPS

---

## 📝 檢查清單

部署前確認：

- [ ] 後端已設定正確的 CORS
- [ ] 前端環境變數已設定
- [ ] WebSocket URL 指向正確的後端
- [ ] 測試本地開發環境可正常運作
- [ ] Git 已忽略 `.env` 檔案（使用 `.env.example`）
- [ ] 生產環境使用 HTTPS

---

## 🛠️ 故障排除

### 前端無法連接後端

**症狀：** 顯示「未連線」

**檢查：**
1. 後端是否正在運行？訪問 `https://你的後端網址/health`
2. CORS 設定是否包含前端網址？
3. 環境變數 `VITE_WEBSOCKET_URL` 是否正確？

### Render 後端休眠

**解決方案：**
使用免費 cron 服務定期 ping：
- [cron-job.org](https://cron-job.org)
- 每 10 分鐘訪問一次 `/health` 端點

### WebSocket 連線失敗

**檢查：**
1. 後端平台是否支援 WebSocket？
2. 是否使用 HTTPS？（WSS protocol）
3. 瀏覽器 Console 是否有錯誤訊息？
