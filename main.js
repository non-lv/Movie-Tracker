const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const mov = require('./resources/JS/db.js').movies;
const movRet = require('./resources/JS/movieRetriever.js').getMovie;

const isMac = process.platform ==='darwin';
const isDev = process.env.NODE_ENV != 'production';
// process.env.NODE_ENV = 'production';

let win;
function createWindow() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, './resources/JS/preload.js')
        },
        minWidth: 250,
        minHeight: 200,
        frame: true
    });
    win.loadFile(path.join(__dirname, './resources/HTML/mainWindow.html'));

    //Load previous list
    mov.sync();

    // Insert Menu
    Menu.setApplicationMenu(createMenu());
}

function createMenu() {
    const menu = [
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
            submenu: [{
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(_, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            { role: 'reload' }]
        });
    }

    return Menu.buildFromTemplate(menu);
}

// Listen for app to be ready
app.whenReady().then(() => {
    ipcMain.on('win:min', () => {
        win.minimize()
    })
    
    ipcMain.on('win:max', () => {
        win.maximize()
    })
    
    ipcMain.on('win:close', () => {
        win.close()
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
      })
})

app.on('window-all-closed', () =>{
    if(!isMac)
        app.quit()
})

ipcMain.handle('mov:load', async function () {
    let a = await mov.findAll({ attributes: ['name', 'release_year', 'image'] });
    b = a.map((m) => ({name: m.dataValues.name, year: m.dataValues.release_year, image: m.dataValues.image}))
    return b;
})

//Catch search:movie
ipcMain.handle('mov:search', async function (_, title) {
    try {
        const search = await movRet(title);
        if (search.Response == 'True') {
            let mv = search.Search[0];
            mov.create({ name: mv.Title, release_year: mv.Year, type: mv.Type, image: mv.Poster });
            return {name: mv.Title, year: mv.Year, image: mv.Poster}
        } else
            console.log(`No movies found - ${title}`);
    }
    catch (error) {
        console.log(error.message);
    }
    return undefined
});

ipcMain.on('mov:remove', function (e, title, year) {
    mov.destroy({ where: { name: title, release_year: year } });
});
