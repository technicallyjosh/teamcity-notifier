import { IAppSettings, IAppData } from '../@types';

function encryptCreds(username: string, password: string): { username: string; password: string } {
    return {
        username,
        password: new Buffer(password).toString('base64')
    };
}

export const appSettings: IAppSettings = {
    url: null,
    username: null,
    creds: null
};

export function setAppSettings(data: IAppData, password?: string) {
    appSettings.url = data.url;
    appSettings.username = data.username;

    if (data.username && password) {
        appSettings.creds = encryptCreds(data.username, password);
    }
}

export function removeAppSettings() {
    appSettings.creds = null;
}
