'use strict'

const {
    app,
    BrowserWindow,
    Notification,
    shell,
    clipboard,
    globalShortcut,
    Menu,
    ipcMain,
    Tray
} = require('electron');
const screenshot = require('screenshot-desktop');
const { decodeQR } = require('./qr-utils');
const path = require('path');

let win;
let tray;
let running = false;

const createWindow = () => {
    win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            contextIsolation: true, 
            enableRemoteModule: false
        }
    });

    win.loadFile('index.html');

    win.on('close', e => {
        if (running) {
            e.preventDefault();
            win.hide();
        }
    })
}

// Control shortcut (prt sc)
const toggleShortcut = () => {
    if (running) {
        globalShortcut.register('PrintScreen', async () => {
            await handleScreenshot();
        });
    } else {
        globalShortcut.unregister('PrintScreen');
    }
}

// Capture a screenshot 
const handleScreenshot = async () => {
    try {

        const imgBuffer = await screenshot({ format: 'png' });
        const link = await decodeQR(imgBuffer);

        if (link) {
            const noti = new Notification({
                title: 'QR code detected',
                body: `Link: ${link}`,
                actions: [
                    { text: 'Open' },
                    { text: 'Copy' }
                ]
            });

            noti.on('action', (actId) => {
                if (actId == 0) {
                    shell.openExternal(link);
                } else if (actId == 1) {
                    clipboard.writeText(link);
                }
            })

            noti.show();
        }
    } catch (err) {
        console.log(err);
    }
}

const createTray = () => {
    tray = new Tray(path.join(__dirname, 'images/qrchecker_logo.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open',
            click: () => {
                if (!win) createWindow();
                win.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                running = false;
                app.quit();
            }
        }
    ])
    tray.setToolTip('QRchecker');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (!win) createWindow();
        win.show();
    })
}

// start app 
app.whenReady().then(() => {
    createWindow();
    createTray();

    toggleShortcut();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// handle ipc events 
ipcMain.on('toggle-running', (event, isRun) => {
    console.log('isRun: ' + isRun);
    running = isRun;
    toggleShortcut();

    if (win) {
        win.webContents.send('update-status', running);
    }

    console.log(`App is now ${running ? 'running' : 'stopped'}`);

})


// check if all windows are closed (Window & Linux)
app.on('window-all-closed', () => {
    if (!running && process.platform !== 'darwin') app.quit();
})

// clean up
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
})







