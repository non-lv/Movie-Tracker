const {contextBridge, ipcRenderer} = require('electron/renderer')

contextBridge.exposeInMainWorld('movieAPI', {
    getList: () => ipcRenderer.invoke('mov:load'),
    searchMovie: (title) => ipcRenderer.invoke('mov:search', title),
    removeMovie: (title, year) => ipcRenderer.send('mov:remove', title, year)
})

contextBridge.exposeInMainWorld('app', {
    minimize: () => ipcRenderer.send('win:min'),
    maximize: () => ipcRenderer.send('win:max'),
    close: () => ipcRenderer.send('win:close')
})
