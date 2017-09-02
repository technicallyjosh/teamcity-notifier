import { app } from 'electron';
import * as path from 'path';

export const dataPath = path.join(app.getPath('userData'), 'teamcity-notifier.json');
export const iconPath = path.join(__dirname, 'images', 'teamcity-icon.png');
export const imagePath = path.join(__dirname, 'images', 'teamcity.png');
