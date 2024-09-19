import { app, Menu, ipcMain, BrowserWindow } from 'electron';
import path from 'path';
const mov = require('./js/db.js').movies;
const movRet = require('./js/movieRetriever.js').getMovie;

process.env.NODE_ENV = 'production';
const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV != 'production';

let win: BrowserWindow;
function createWindow() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        },
        minWidth: 250,
        minHeight: 200,
        frame: isDev
    });
    win.loadFile(path.join(__dirname, '../src/renderer/html/index.html'));

    //Load previous list
    mov.sync();

    // Insert Menu
    Menu.setApplicationMenu(createMenu());
}

function createMenu() {
    const menu: Electron.MenuItemConstructorOptions[] = [
        {
            label: app.name,
            submenu: [
                {
                    label: 'Clear Items',
                    accelerator: isMac ? 'Alt+C' : 'Alt+C',
                    click() {
                        win.webContents.send('item:clear');
                    }
                },
                {
                    label: 'Quit',
                    accelerator: isMac ? 'Command+Q' : 'Ctrl+Q',
                    click() {
                        app.quit();
                    }
                }
            ]
        }
    ];
    // Add developer tools item if not in prod
    if (isDev) {
        menu.push({
            label: 'Developer Tools',
            submenu: [
                {
                    label: 'Toggle DevTools',
                    accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                    click() { win.webContents.openDevTools(); }
                },
                { role: 'reload' }]
        });
    }

    return Menu.buildFromTemplate(menu);
}

// Listen for app to be ready
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (!isMac)
        app.quit()
})


// Basic window functions
ipcMain.on('win:min', () => {
    win.minimize()
})

ipcMain.on('win:max', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize()
})

ipcMain.on('win:close', () => {
    win.close()
})


//Movie api handlers
ipcMain.handle('mov:load', async function () {
    type Movie = { dataValues: { name: string, release_year: number, image: string } }
    let a: Movie[] = await mov.findAll({ attributes: ['name', 'release_year', 'image'] });
    let b = a.map((m) => ({ name: m.dataValues.name, year: m.dataValues.release_year, image: m.dataValues.image }))
    return b;
})

//Catch search:movie
ipcMain.handle('mov:search', async function (_, title: string) {
    try {
        const search = await movRet(title);
        if (search.Response == 'True') {
            let mv = search.Search[0];
            mov.create({ name: mv.Title, release_year: mv.Year, type: mv.Type, image: mv.Poster });
            return { name: mv.Title, year: mv.Year, image: mv.Poster }
        } else
            console.log(`No movies found - ${title}`);
    }
    catch (error) {
        console.log((error as Error).message);
    }
    return undefined
});

ipcMain.on('mov:remove', function (_, title: string, year: number) {
    mov.destroy({ where: { name: title, release_year: year } });
});
