import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('movieAPI', {
    getList: () => ipcRenderer.invoke('mov:load'),
    searchMovie: (title: string) => ipcRenderer.invoke('mov:search', title),
    removeMovie: (title: string, year: number) => ipcRenderer.send('mov:remove', title, year)
})

contextBridge.exposeInMainWorld('app', {
    minimize: () => ipcRenderer.send('win:min'),
    maximize: () => ipcRenderer.send('win:max'),
    close: () => ipcRenderer.send('win:close')
})
