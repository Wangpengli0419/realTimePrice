export interface IElectronAPI {
    setTitle: (title: string) => {},
    openFile: () => string,
    trayItemSetTitle: (callback) => Promise<void>
    onMainMessage: (callback) => Promise<void>
    openChildBrowserWindow: () => {},
    onFetchSolPrice: (callback) => Promise<void>
    onExchangesLoaded: (callback) => Promise<void>
    exchangeSelected: (exchange: string) => string,

    onSymbolsLoaded: (callback) => Promise<void>
    symbolSelected: (symbol: string) => string,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}