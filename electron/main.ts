import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let overlayWin: BrowserWindow | null
let wss: WebSocketServer | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0B0E0F',
    titleBarStyle: 'hidden', // Custom title bar style if desired
    titleBarOverlay: {
      color: '#0B0E0F',
      symbolColor: '#53FC18',
      height: 30
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Necessary to load local resources (img/sound) from disk
    },
  })

  // Control Panel
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  // Overlay Window (Transparent)
  overlayWin = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    focusable: false, // Click-through
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
  })
  
  const overlayUrl = process.env.VITE_DEV_SERVER_URL 
    ? `${process.env.VITE_DEV_SERVER_URL}#/overlay`
    : `file://${path.join(process.env.DIST, 'index.html')}#/overlay`
    
  overlayWin.loadURL(overlayUrl)
  overlayWin.setIgnoreMouseEvents(true, { forward: true })
}

function startServer(port: number) {
  if (wss) wss.close();
  
  try {
    wss = new WebSocketServer({ port });
    console.log(`KickBonk WS Server running on port ${port}`);
    
    wss.on('connection', (ws) => {
      ws.on('message', (message) => { });
    });
  } catch (e) {
    console.error("Failed to start WS server", e);
  }
}

app.whenReady().then(() => {
  createWindow()
  startServer(8080);
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('bonk', (_, data) => {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
})

ipcMain.on('update-config', (_, config) => {
  if (config.portThrower) startServer(config.portThrower);
})
