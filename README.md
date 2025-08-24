# 📦 Peek WebApp

A mobile-first web application for tracking what's inside your boxes using QR codes. Store your data securely in your private GitHub repository.

## ✨ Features

- 📱 **QR Code Scanner** - Use your device camera to scan box labels
- 📦 **Box Contents Management** - Add, view, and remove items from boxes
- 🏷️ **QR Code Generator** - Create printable QR codes for new boxes
- 💾 **GitHub Storage** - Secure, private data storage in your GitHub repo
- 📱 **Mobile-First PWA** - Install on your phone like a native app
- 🖨️ **Print Support** - Generate print-friendly QR code labels

## 🚀 Quick Start

### 1. Setup GitHub Repository for Data Storage

**Important**: Create a **separate private repository** for storing your box data (not the same as this app's source code).

1. **Create Private Repository**:
   - Go to [GitHub](https://github.com) → Click **"+"** → **"New repository"**
   - Name it (e.g., "peek-boxes", "my-boxes", "box-storage")
   - **Make it Private** ✅ (keeps your inventory data secure)
   - Click **"Create repository"** (leave it empty, the app will create files automatically)

2. **Generate Personal Access Token**:
   - Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - **Recommended**: Use **"Fine-grained tokens"** for better security:
     - Click **"Fine-grained tokens"** tab → **"Generate new token"**
     - **Token name**: "Peek App"
     - **Resource owner**: Your GitHub username
     - **Selected repositories**: Choose your data repository (e.g., "peek-boxes")
     - **Repository permissions**: Set **"Contents"** to **"Read and write"**
   - **Alternative**: Use **"Tokens (classic)"**:
     - Click **"Generate new token (classic)"**
     - Select **"repo"** or **"Contents"** permission
   - Click **"Generate token"** and **copy it immediately** (you won't see it again!)

3. **Repository Structure** (created automatically):
   ```
   your-data-repo/
   └── boxes.json    # Your box contents (auto-created by app)
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Configure in App

1. Open the app in your browser
2. Enter your GitHub credentials:
   - **GitHub Username**: Your GitHub username
   - **Repository Name**: The private repo you created (e.g., "peek-boxes")
   - **Personal Access Token**: The token you copied from step 1
3. The app will test the connection and save your credentials locally
4. **Note**: You'll need to reconfigure when using different browsers/devices

## 📱 Mobile Installation

### iOS Safari
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android Chrome
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Vanilla CSS (mobile-first)
- **QR Scanning**: html5-qrcode
- **QR Generation**: qrcode
- **Storage**: GitHub API
- **PWA**: Service Worker + Web App Manifest

## 📊 Data Structure

Your box data is stored as a simple JSON file in your GitHub repository:

```json
{
  "KITCHEN-01": ["Blender", "Measuring cups", "Mixing bowls"],
  "GARAGE-A1": ["Extension cord", "Car wax", "Work gloves"],
  "BEDROOM-02": ["Winter clothes", "Blankets", "Photo albums"]
}
```

## 🔒 Privacy & Security

- ✅ **Private GitHub Repository** - Only you have access
- ✅ **Personal Access Token** - Stored locally in your browser
- ✅ **No Third-Party Servers** - Direct GitHub API communication
- ✅ **Client-Side Only** - No data sent to external services

## 🏗️ Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy Options

- **GitHub Pages**: Push `dist/` folder to `gh-pages` branch
- **Netlify**: Connect GitHub repo and auto-deploy
- **Vercel**: Import project and deploy
- **Any Static Host**: Upload `dist/` folder contents

## 📝 Usage Tips

### QR Code Best Practices
- Print on white paper or white sticker labels
- Ensure high contrast (black on white)
- Test scan before applying to boxes
- Laminate for durability in storage areas

### Box ID Naming
- Use clear, descriptive IDs: `KITCHEN-01`, `GARAGE-A1`
- Include location and number for easy identification
- Keep IDs short but meaningful

### Mobile Usage
- Grant camera permissions for QR scanning
- Add to home screen for quick access
- Works offline (syncs when back online)

---

**Made for organizing your physical storage with digital convenience! 📦✨**
