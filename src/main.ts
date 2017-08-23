import 'source-map-support/register';
import * as path from 'path';
import * as url from 'url';
import { ipcMain } from 'electron';
import * as req from 'request-promise';
import { app, BrowserWindow } from 'electron';
import { IWindows } from '../@types/index';

if (!process.env.NODE_ENV) {
    const reload = require('electron-reload');

    reload(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
    });
}

const windows: IWindows = {
    login: null
};

function createWindow() {
    windows.login = new BrowserWindow({
        width: 600,
        height: 600,
        center: true,
        resizable: false,
        fullscreenable: false,
        minimizable: false
    });

    windows.login.loadURL(
        url.format({
            pathname: path.join(__dirname, 'login.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    windows.login.on('closed', () => {
        windows.login = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.login === null) {
        createWindow();
    }
});

ipcMain.on('authenticate', async function(event: Electron.IpcMessageEvent, data: any) {
    const { url, username, password } = data;

    try {
        await req({
            uri: `https://${url}/httpAuth/app/rest/latest`,
            auth: {
                user: username,
                pass: password
            }
        });
    } catch (e) {
        let message = 'There was an error contacting the server.';

        switch (e.statusCode) {
            case 401:
                message = 'Invalid Username/Password.';
                break;
        }

        event.sender.send('authenticate-error', message);
    }
});
