const electron = require('electron');
const url = require('url');
const path = require('path');
const mov = require('./resources/JS/db.js').movies;
const movRet = require('./resources/JS/movieRetriever.js').getMovie;

const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET EVN
// process.env.NODE_ENV = 'production';

let mainWindow;

// Listen for app to be ready
app.on('ready', function () {
    mov.sync();
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        minWidth: 250,
        minHeight: 200,
        frame: false
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './resources/HTML/mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    });
    //Load previous list
    mainWindow.webContents.on('did-finish-load', () => {
        loadMov();
    });
    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//Load previous movies into ui
async function loadMov() {
    const movies = await mov.findAll({ attributes: ['name', 'release_year', 'image'] });
    // console.log(movies);
    for (m of movies)
        mainWindow.webContents.send('item:add', m.name, m.release_year, m.image);
}

//Catch search:movie
ipcMain.on('search:movie', async function (e, title) {
    try {
        const search = await movRet(title);
        if (search.Response == 'True') {
            let mv = search.Search[0];
            mainWindow.webContents.send('item:add', mv.Title, mv.Year, mv.Poster);
            mov.create({ name: mv.Title, release_year: mv.Year, type: mv.Type, image: mv.Poster });
        } else
            console.log(`No movies found - ${title}`);
    }
    catch (error) {
        console.log(error.message);
    }
});

ipcMain.on('item:remove', function (e, title, year) {
    mov.destroy({ where: { name: title, release_year: year } });
});

//Catch item:add
ipcMain.on('item:add', async function (e, item, year, image) {
    mainWindow.webContents.send('item:add', item, year, image);
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Alt+C' : 'Alt+C',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
            label: 'Toggle DevTools',
            accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
            click(item, focusedWindow) {
                focusedWindow.toggleDevTools();
            }
        },
        {
            role: 'reload'
        }
        ]
    });
}