/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
// const contextMenu = require('electron-context-menu');
// const customTitlebar = require('custom-electron-titlebar');
// import PerfectScrollbar from 'perfect-scrollbar';
// const clipboardListener = require('clipboard-event');
// const ClipboardListener = require('clipboard-listener');
const clipboardy = require('clipboardy');
const clipboard = require('electron-clipboard-extended');
// const ClipboardListener = require('clipboard-listener');

// const navigator = require('Navigator');
const { ipcMain } = require('electron');
const sqlite3 = require('sqlite3');
// const listener = new ClipboardListener({
//   timeInterval: 100, // Default to 250
//   immediate: true, // Default to false
// });
let dbPath;
if (app.isPackaged) {
  console.log('PACKAGED!');
  dbPath = path.join(process.resourcesPath, 'assets', 'public.db');
} else {
  console.log('not packaged');
  dbPath = path.join(__dirname, '../assets', 'public.db');
}
console.log(dbPath);
const database = new sqlite3.Database(dbPath, (err) => {
  // const RESOURCES_PATH = app.isPackaged
  // ? path.join(process.resourcesPath, 'resources')
  // : path.join(__dirname, '../resources');

  // console.log('DIR:', __dirname);
  if (err) console.error('Database opening error: ', err);
});

ipcMain.on('asynchronous-message', (event, arg) => {
  const sql = arg;
  database.all(sql, (err, rows) => {
    event.reply('asynchronous-reply', (err && err.message) || rows);
  });
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // contextMenu({
  //   prepend: (defaultActions, params, browserWindow) => [
  //     {
  //       label: 'Rainbow',
  //       // Only show it when right-clicking images
  //       // visible: params.mediaType === 'image',
  //       click: () => {
  //         console.log(params);
  //         // mainWindow.inspectElement(props.x, props.y);
  //         document.elementFromPoint(params.x, params.y);
  //       },
  //       visible: true,
  //       // visible:params.
  //     },
  //     // {
  //     //   label: 'Search Google for “{selection}”',
  //     //   // Only show it when right-clicking text
  //     //   visible: params.selectionText.trim().length > 0,
  //     //   click: () => {
  //     //     shell.openExternal(
  //     //       `https://google.com/search?q=${encodeURIComponent(
  //     //         params.selectionText
  //     //       )}`
  //     //     );
  //     //   },
  //     // },
  //   ],
  // });
  // new customTitlebar.Titlebar({
  //   backgroundColor: customTitlebar.Color.fromHex('#444'),
  // });
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,

    titleBarStyle: 'hidden',
    icon: getAssetPath('icon.png'),
    frame: false,

    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  // const listener = new ClipboardListener();
  clipboard.startWatching();
  console.log('startListening');
  var lastClip = '';
  clipboard.on('text-changed', () => {
    // console.log('clipboardChanged');
    try {
      if (
        mainWindow != null &&
        typeof clipboard.readText() == 'string' &&
        lastClip != clipboard.readText()
      ) {
        mainWindow.webContents.send('clipboard', clipboard.readText());
        lastClip = clipboard.readText();
      } else {
        console.log('lastClip=' + lastClip);
      }
    } catch (err) {
      console.log(err);
    }
  });
  // clipboardListener.startListening();
  // console.log('startListening');

  // listener.on('change', () => {
  //   // if (lastClip != clipboardy.readSync() && mainWindow != null) { //UNCOMMENT THIS!!!!
  //   console.log('clipboardChanged');
  //   try {
  //     if (mainWindow != null && typeof clipboardy.readSync() == 'string') {
  //       mainWindow.webContents.send('clipboard', clipboardy.readSync());
  //       lastClip = clipboardy.readSync();
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // listener.on('change', (value) => {
  //   if (lastClip != clipboardy.readSync() && mainWindow != null) {
  //     mainWindow.webContents.send('clipboard', value);
  //     lastClip = clipboardy.readSync();
  //   }
  // });
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
