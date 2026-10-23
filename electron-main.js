const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PRODUCT_NAME = 'مولا جیم';
// This is the issued offline key for this installation.  The comparison uses
// a hash so the key is not stored plainly in the activation file.
const LICENSE_KEY = 'MGM-AFG-2026-7X4P-9K2D-L8QF';
const LICENSE_HASH = crypto.createHash('sha256').update(LICENSE_KEY).digest('hex');

let mainWindow;
let licenseWindow;

function licensePath() {
  return path.join(app.getPath('userData'), 'license.json');
}

function isActivated() {
  try {
    const saved = JSON.parse(fs.readFileSync(licensePath(), 'utf8'));
    return typeof saved.keyHash === 'string' && crypto.timingSafeEqual(Buffer.from(saved.keyHash), Buffer.from(LICENSE_HASH));
  } catch (_) {
    return false;
  }
}

function createMainWindow() {
  if (mainWindow) return;
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: PRODUCT_NAME,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.loadURL('http://127.0.0.1:4000');
  mainWindow.on('close', (event) => {
    if (app.isQuitting) return;
    event.preventDefault();
    const result = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      title: 'خروج از سیستم',
      message: 'قبل از خروج، آیا می‌خواهید یک فایل بیک اپ ذخیره شود؟',
      buttons: ['بیک اپ او وتل', 'بیدون بیک آپ', 'خروج'],
      defaultId: 0,
      cancelId: 2,
      noLink: true
    });

    if (result === 2) return;

    if (result === 0) {
      backupThenQuit();
    } else {
      app.isQuitting = true;
      app.quit();
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

async function backupThenQuit() {
  try {
    await fetch('http://127.0.0.1:4000/api/backup/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
  } catch (error) {
    console.error('Backup on close failed:', error.message);
  }
  app.isQuitting = true;
  app.quit();
}

function createLicenseWindow() {
  licenseWindow = new BrowserWindow({
    width: 480,
    height: 570,
    resizable: false,
    maximizable: false,
    title: 'فعال‌سازی ' + PRODUCT_NAME,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: path.join(__dirname, 'preload.js') }
  });
  licenseWindow.loadFile(path.join(__dirname, 'license.html'));
  licenseWindow.on('closed', () => { licenseWindow = null; if (!mainWindow) app.quit(); });
}

ipcMain.handle('license:activate', (_, input) => {
  const suppliedHash = crypto.createHash('sha256').update(String(input || '').trim().toUpperCase()).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(suppliedHash), Buffer.from(LICENSE_HASH))) {
    return { ok: false, message: 'لایسنس کی درست نیست.' };
  }
  fs.writeFileSync(licensePath(), JSON.stringify({ keyHash: LICENSE_HASH, activatedAt: new Date().toISOString() }, null, 2));
  createMainWindow();
  if (licenseWindow) licenseWindow.close();
  return { ok: true };
});

app.whenReady().then(async () => {
  process.env.GYM_DATA_DIR = app.getPath('userData');
  process.env.GYM_DOCUMENTS_DIR = app.getPath('documents');
  const { startServer } = require('./server');
  await startServer(4000);
  if (isActivated()) createMainWindow();
  else createLicenseWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) (isActivated() ? createMainWindow : createLicenseWindow)(); });
