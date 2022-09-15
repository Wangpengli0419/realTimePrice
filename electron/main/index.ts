import { app, BrowserWindow, shell, ipcMain, Tray, Menu, nativeImage, dialog } from 'electron'
import { release, homedir } from 'os'
import { join } from 'path'
import { Exchange as Ex } from "ccxt";
import { exchanges, getExchangeIns } from '../exchange/ExchangeManager';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

export const ROOT_PATH = {
    // /dist
    dist: join(__dirname, '../..'),
    // /dist or /public
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),

}


const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string



class Main {
    constructor() {
        // Windows 7 关闭GPU加速
        if (release().startsWith('6.1')) {
            app.disableHardwareAcceleration()
        }
        // 设置 Windows 10+ 通知应用名称
        if (process.platform === 'win32') {
            app.setAppUserModelId(app.getName())
        }
        // 获取单例应用锁
        if (!app.requestSingleInstanceLock()) {
            app.quit()
            process.exit(0)
        }
    }
    init() {
        app.whenReady().then(() => {
            this.createTray();
        })
        this.initEvent();
        setInterval(this.update.bind(this), 1000)
    }

    menuWin: BrowserWindow = null;
    trayIns = null;
    async createTray() {
        const icon = nativeImage.createFromPath('/Users/wangpengli/Desktop/coinTiker.png')
        let tray = this.trayIns = new Tray(icon)


        let menuWin = this.menuWin = new BrowserWindow({

            modal: true,
            autoHideMenuBar: true,
            disableAutoHideCursor: true,
            frame: false,
            show: false,
            width: 300,
            height: 560,
            webPreferences: {
                preload,
                // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
                // Consider using contextBridge.exposeInMainWorld
                // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
                nodeIntegration: true,
                contextIsolation: true,
            },
        });
        // menuWin.setAlwaysOnTop(true, 'torn-off-menu', 1)

        menuWin.loadURL(url); // 加载对应的菜单栏页面
        let menu = new Menu()
        Menu.setApplicationMenu(menu)

        menu.popup({ window: menuWin })
        let taryBounds = tray.getBounds()
        console.log(taryBounds);
        tray.setContextMenu(menu)
        menuWin.setAutoHideCursor(true)
        menuWin.setAutoHideMenuBar(true)
        menuWin.webContents.openDevTools()
        menuWin.webContents.on('did-finish-load', () => {
            menuWin.webContents.send('exchanges-name-loaded', exchanges)
        })
        tray.addListener('click', (event: Electron.KeyboardEvent, bounds: Electron.Rectangle, position: Electron.Point) => {
            // console.log(bounds);
            menuWin.setBounds({ x: bounds.x - 150 + 42, y: bounds.y - 500, width: 300, height: 560 });
            menuWin.isVisible() ? menuWin.hide() : menuWin.show();
        })

        tray.addListener('mouse-leave', (event: Electron.KeyboardEvent, position: Electron.Point) => {
            // menuWin.hide()
        })
        // tray.popUpContextMenu(menu, { x: 0, y: 0 })
        // const contextMenu = Menu.buildFromTemplate([
        //     {
        //         label: 'Item1', type: 'radio', click: () => {
        //             this.win.webContents.send('tray-item-set-title', 'Item1')
        //         }
        //     },
        //     {
        //         label: 'Item2', type: 'radio', click: async () => {
        //             this.win.webContents.send('fetch-sol-price', await this.fetchSolPrice())
        //         }
        //     },
        //     {
        //         label: 'Item3', type: 'radio', checked: true, click: () => {
        //             tray.setTitle('Item3')
        //         }
        //     },
        //     {
        //         label: 'Item4', type: 'radio', click: () => {
        //             tray.setTitle('Item4')
        //         }
        //     }
        // ])
        // tray.setContextMenu(contextMenu)
        // tray.setToolTip('SOL/USDT')
        tray.setTitle('Loading...')
        // while (true) {
        //     await wait(500);
        //     let price = await this.fetchSolPrice()
        //     tray.setTitle(`${price.ask} / ${price.bid}`)
        // }
    }

    initEvent() {
        ipcMain.on('vue-exchange-selected', this.onExchangeSelected.bind(this))

        ipcMain.on('vue-symbol-selected', this.onSymbolSelected.bind(this))

    }
    exchangeIns = null;
    async onExchangeSelected(event: Electron.IpcMainInvokeEvent, exchange: string) {
        this.symbolIns = null;
        this.exchangeIns = getExchangeIns(exchange)
        let symbols = await this.fetchExchangeSymbols(this.exchangeIns)
        this.menuWin.webContents.send('symbols-name-loaded', symbols)
        // console.log(this.fetchSymbolPrice);
        // await this.fetchSymbolPrice(exIns, 'SOL/USDT')

    }
    symbolIns = null;

    async onSymbolSelected(event: Electron.IpcMainInvokeEvent, symbol: string) {
        this.symbolIns = symbol;
    }




    async update() {
        if (this.exchangeIns && this.symbolIns) {
            let price = await this.fetchSymbolPrice(this.exchangeIns, this.symbolIns)
            this.trayIns.setTitle(`${price.ask} / ${price.bid}`)
        } else {
            this.trayIns.setTitle(`Fetching...`)
        }
    }



    async fetchExchangeSymbols(exIns: Ex) {
        await exIns.loadMarkets();
        return exIns.symbols;
    }

    async fetchSymbolPrice(exIns: Ex, solSymbol) {
        // const balance = await exIns.fetchBalance();
        // console.log(balance);
        // await exIns.loadMarkets();
        // console.log(exIns.symbols);

        let orderbook = await exIns.fetchOrderBook(solSymbol)
        let bid = orderbook.bids.length ? orderbook.bids[0][0] : undefined
        let ask = orderbook.asks.length ? orderbook.asks[0][0] : undefined
        let spread = (bid && ask) ? ask - bid : undefined
        // console.log(exIns.id, 'market price', { bid, ask, spread })
        return { bid, ask, spread };
    }
}

const main = new Main()
main.init();



