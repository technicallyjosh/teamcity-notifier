import * as config from './config';
import * as url from 'url';
import * as path from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import { setPassword, deletePassword } from 'keytar';
import { IAppData, IWindows } from '../@types';
import { writeJson } from 'fs-extra';
import { appSettings, setAppSettings } from './app-settings';
import { appTray } from './main';
import * as notify from './notifications';

enum TState {
    loggedOut,
    loggedIn
}

const windows: IWindows = {
    login: null
};

const menuBase = [{ label: 'About', click: () => {} }, { label: 'Quit', click: () => app.quit() }];
const menuLoggedOut = [{ label: 'Log In', click: openLoginWindow }].concat(menuBase);
const menuLoggedIn = [{ label: 'Log Out', click: logout }].concat(menuBase);

function openLoginWindow() {
    if (windows.login) {
        windows.login.focus();
        return;
    }

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

    windows.login.webContents.on('did-finish-load', () => {
        windows.login.webContents.send('app-settings', { url: appSettings.url, username: appSettings.username });
    });

    windows.login.on('closed', () => {
        windows.login = null;
    });

    app.dock.show();
}

function setMenu(state: TState) {
    switch (state) {
        case TState.loggedOut:
            appTray.setContextMenu(Menu.buildFromTemplate(menuLoggedOut));
            break;
        case TState.loggedIn:
            appTray.setContextMenu(Menu.buildFromTemplate(menuLoggedIn));
            break;
    }
}

export async function init(doLogin: boolean) {
    if (doLogin) {
        setMenu(TState.loggedOut);
        openLoginWindow();
    } else {
        app.dock.hide();
        setMenu(TState.loggedIn);
        notify.loggedIn();
    }
}

export async function setLoggedIn(url: string, username: string, password: string) {
    try {
        await setPassword(app.getName(), username, password);

        const data: IAppData = { url, username };

        await writeJson(config.dataPath, {
            url,
            username
        });

        setAppSettings(data, password);

        setMenu(TState.loggedIn);

        windows.login.close();

        app.dock.hide();

        notify.loggedIn();

        // todo: init service for checking etc
    } catch (e) {
        console.log(e);

        // todo: show error
    }
}

async function setLoggedOut() {
    try {
        if (appSettings.username) {
            await deletePassword(app.getName(), appSettings.username);
        }

        appSettings.creds = null;

        appTray.setContextMenu(Menu.buildFromTemplate(menuLoggedOut));

        notify.loggedOut();

        openLoginWindow();
    } catch (e) {
        console.log(e);
        // todo: show error
    }
}

function logout() {
    setLoggedOut();
}
