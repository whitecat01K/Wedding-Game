# 💍 幸福快問快答 · 婚禮親友互動遊戲

婚禮專屬親友互動答題小遊戲！單一連結即可讓全場賓客以手機連線作答，支援現場桌次綁定與 Google 試算表即時排行榜同步。

---

## 🚀 部署與發布到 GitHub (GitHub Deployment Guide)

### 步驟 1：匯出至 GitHub 或推送專案
您可以直接在 Google AI Studio 介面透過 **Export** 功能匯出至 GitHub，或下載專案後推送到您的 GitHub Repository：
```bash
git init
git add .
git commit -m "feat: wedding quiz application"
git branch -M main
git remote add origin <您的 GitHub 倉庫網址>
git push -u origin main
```

### 步驟 2：啟用 GitHub Pages 自動部署（完全免費）
本專案已配置 `.github/workflows/deploy.yml`，在您推送程式碼至 `main` 分支後會自動構建。

**請檢查 GitHub 倉庫的兩處設定以確保發布成功**：
1. **開放 Actions 寫入權限**（最常見失敗原因）：
   - 進入 GitHub 專案頁面 ➔ 點擊 **Settings** ➔ 左側點選 **Actions** ➔ **General**。
   - 滾動到最下方的 **Workflow permissions**，選擇 **Read and write permissions** 並點擊 **Save**。
2. **設定 GitHub Pages 來源**：
   - 在左側選單點選 **Pages**。
   - 在 **Build and deployment** 下方的 **Source** 選擇 **Deploy from a branch**。
   - 分支選擇 **`gh-pages`** 分支，資料夾選擇 **`/ (root)`** 並點擊 **Save**。
   - （Actions 在第一次執行後會自動建立 `gh-pages` 分支並將編譯好的網頁放入）。
3. 部署完成後，頂部會顯示綠色打勾與上線網址（例如：`https://<username>.github.io/<repo-name>/`），現場親友以手機掃描該網址產生的 QR Code 即可連線遊玩！

---

## 💻 本地端運行與開發 (Local Development)

```bash
# 1. 安裝依賴套件
npm install

# 2. 啟動開發環境
npm run dev

# 3. 靜態站點打包測試
npm run build:client

# 4. 全端（Express + Vite）打包編譯
npm run build
npm start
```

---

## ✨ 專案特點

- **專屬 10 道婚禮精選題目**：預先設定好新人初識地點、同校回憶、生活日常、專屬小名（葉子）與通關解析。
- **6 桌桌次快速綁定**：主桌 👑、第 2 桌、第 3 桌、第 4 桌、第 5 桌、第 6 桌，直覺 3×2 按鈕配置。
- **Google 試算表即時同步**：
  - 作答完畢自動寫入 Google 表單。
  - 排行榜直接連線 Google 試算表 CSV，不依賴後端伺服器資料庫。
  - 在試算表中刪除資料列即可平順清除測試紀錄，開場前歸零超方便。
- **作答回顧與計分體系**：答對基礎加 1,000 分，答題速度越快加分越多（最高 1,000 分），完賽揭曉各桌排行與詳細答題回顧。
