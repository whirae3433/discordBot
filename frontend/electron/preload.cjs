const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('muyeong', {
  isDesktopApp: true,

  onGlobalKey: (cb) => ipcRenderer.on('global-key', (_, payload) => cb(payload)),

  // hotkey 제어
  hotkeyGet: () => ipcRenderer.invoke('hotkey:get'),
  hotkeySet: (accelerator) => ipcRenderer.invoke('hotkey:set', accelerator),
  hotkeyEnable: () => ipcRenderer.invoke('hotkey:enable'),
  hotkeyDisable: () => ipcRenderer.invoke('hotkey:disable'),
});