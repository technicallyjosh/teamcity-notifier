import 'electron';

export interface IWindows {
    login: Electron.BrowserWindow | null;
}

export interface ICreds {
    username: string;
    password: string;
}

export interface IAppSettings {
    url: string | null;
    username: string | null;
    creds: ICreds | null;
}

export interface IAppData {
    url: string;
    username: string;
}
