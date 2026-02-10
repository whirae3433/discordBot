const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let win;
let currentHotkey = '[';
let isActive = false; // 실행 모드 여부
let isRegistered = false; // 실제 등록 성공 여부

function registerHotkey() {
  if (!win || win.isDestroyed()) return;

  globalShortcut.unregisterAll();


  const ok = globalShortcut.register(currentHotkey, () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('global-key', {
        key: currentHotkey,
        at: Date.now(),
      });
    }
  });

  isRegistered = ok;
  if (!ok) console.log('[globalShortcut] register failed:', currentHotkey);
  return ok;
}

function unregisterHotkey() {
  globalShortcut.unregisterAll();
  isRegistered = false;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.ELECTRON_DEV_URL || 'http://localhost:3000';
  win.loadURL(`${devUrl}/others`);

  win.webContents.openDevTools({ mode: 'detach' });
}

// ✅ React에서 요청할 IPC 채널
ipcMain.handle('hotkey:set', (_, accelerator) => {
  currentHotkey = accelerator || '[';

  if (isActive) {
    return registerHotkey();
  }
  return true;
});

ipcMain.handle('hotkey:disable', () => {
  isActive = false;
  unregisterHotkey();
  return true;
});

ipcMain.handle('hotkey:get', () => {
  return {
    accelerator: currentHotkey,
    enabled: isActive,
    registered: isRegistered,
  };
});

ipcMain.handle('hotkey:enable', () => {
  isActive = true;
  return registerHotkey();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
