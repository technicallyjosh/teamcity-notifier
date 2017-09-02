import { Notification, nativeImage } from 'electron';
import * as config from './config';

const icon = nativeImage.createFromPath(config.imagePath);

const baseNotification = {
    icon,
    title: 'TeamCity Notifier',
    actions: []
};

export function loggedIn() {
    const n = new Notification({
        ...baseNotification,
        subtitle: 'Logged In',
        body: 'Successfully logged in.'
    });

    n.show();
}

export function loggedOut() {
    const n = new Notification({
        ...baseNotification,
        subtitle: 'Logged Out',
        body: 'Successfully logged out.'
    });

    n.show();
}
