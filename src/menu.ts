import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
  dialog,
} from 'electron';
import settings from 'electron-settings';
import path from 'path';
import sendAsync from './DatabaseSQLite';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    // this.setupContextMenu();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupContextMenu(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }
  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Electron',
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/master/docs#readme'
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      // {
      //   label: '&File',
      //   submenu: [
      //     {
      //       label: '&Config',
      //       click: () => {
      //         // console.log(config.get('tags'));
      //         // let configWindow: BrowserWindow | null = null;
      //         // configWindow = new BrowserWindow({
      //         //   show: false,
      //         //   width: 1024,
      //         //   height: 768,
      //         //   // titleBarStyle: 'hidden',
      //         //   // frame: false,
      //         //   webPreferences: {
      //         //     nodeIntegration: true,
      //         //     enableRemoteModule: true,
      //         //   },
      //         // });
      //         // configWindow.loadURL(`file://${__dirname}/indexConfig.html`);
      //         // configWindow.webContents.on('did-finish-load', () => {
      //         //   if (!configWindow) {
      //         //     throw new Error('"mainWindow" is not defined');
      //         //   }
      //         //   if (process.env.START_MINIMIZED) {
      //         //     configWindow.minimize();
      //         //   } else {
      //         //     configWindow.show();
      //         //     configWindow.focus();
      //         //   }
      //         // });
      //         // configWindow.show();
      //         // dialog.showMessageBox(this.mainWindow, {
      //         //   buttons: ['OK'],
      //         //   title: 'Config',
      //         //   message: 'WIP',
      //         //   type: 'info',
      //         // });
      //       },
      //     },
      //     {
      //       label: '&Close',
      //       accelerator: 'Ctrl+W',
      //       click: () => {
      //         this.mainWindow.close();
      //       },
      //     },
      //   ],
      // },
      {
        label: 'Debug',
        submenu: [
          {
            label: 'Open Dev Tools',
            click: () => {
              this.mainWindow.webContents.openDevTools();
            },
          },
          {
            label: 'Open installation directory',
            click: async () => {
              shell.showItemInFolder(process.execPath);

              // const response = await sendAsync('SELECT * FROM files');
              // console.log(response);
              // this.mainWindow.webContents.openDevTools();
            },
          },
          {
            label: 'Open assets directory',
            click: async () => {
              shell.showItemInFolder(
                path.join(process.resourcesPath, 'assets', 'public.db')
              );
            },
          },
          {
            label: 'Open settings directory',
            click: async () => {
              shell.showItemInFolder(settings.file());
            },
          },
        ],
      },
      // {
      //   label: 'Help',
      //   submenu: [
      //     {
      //       label: 'Learn More',
      //       click() {
      //         shell.openExternal('https://electronjs.org');
      //       },
      //     },
      //     {
      //       label: 'Documentation',
      //       click() {
      //         shell.openExternal(
      //           'https://github.com/electron/electron/tree/master/docs#readme'
      //         );
      //       },
      //     },
      //     {
      //       label: 'Community Discussions',
      //       click() {
      //         shell.openExternal('https://www.electronjs.org/community');
      //       },
      //     },
      //     {
      //       label: 'Search Issues',
      //       click() {
      //         shell.openExternal('https://github.com/electron/electron/issues');
      //       },
      //     },
      //   ],
      // },
    ];

    return templateDefault;
  }
}
