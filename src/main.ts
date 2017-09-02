import 'source-map-support/register';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as req from 'request-promise';
import * as state from './state';
import * as config from './config';
import { app, ipcMain, Tray, Menu } from 'electron';
import { getPassword } from 'keytar';
import { setAppSettings } from './app-settings';
import { IAppData } from '../@types';
import * as reload from 'electron-reload';

app.setName('TeamCity Notififer');

reload(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
});

export let appTray: Electron.Tray;

async function shouldLogin(): Promise<boolean> {
    const data: IAppData = await fs.readJson(config.dataPath);

    const existingPassword = await getPassword(app.getName(), data.username);

    if (existingPassword) {
        setAppSettings(data, existingPassword);
        return false;
    }

    setAppSettings(data);

    return true;
}

async function init() {
    let doLogin = true;

    try {
        doLogin = await shouldLogin();
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }

    appTray = new Tray(config.iconPath);
    appTray.setToolTip('TeamCity Notifier');

    state.init(doLogin);
}

app.on('ready', async function() {
    const mainMenu = Menu.buildFromTemplate([
        {
            label: app.getName(),
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    role: 'selectall'
                },
                {
                    label: 'Copy',
                    role: 'copy',
                    accelerator: 'Command+C'
                },
                {
                    label: 'Paste',
                    role: 'paste',
                    accelerator: 'Command+V'
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(mainMenu);

    try {
        await init();
    } catch (e) {
        console.error(e);
        // todo: open error window
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('authenticate', async function(event: Electron.IpcMessageEvent, data: any) {
    const { url, username, password } = data;

    let success = false;

    try {
        await req({
            uri: `https://${url}/httpAuth/app/rest/latest`,
            auth: {
                user: username,
                pass: password
            }
        });

        success = true;
    } catch (e) {
        let message = 'There was an error contacting the server.';

        switch (e.statusCode) {
            case 401:
                message = 'Invalid Username/Password.';
                break;
        }

        event.sender.send('authenticate-error', message);
    }

    if (success) {
        state.setLoggedIn(url, username, password);
    }
});
