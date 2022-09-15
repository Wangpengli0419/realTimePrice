import Exchange, { Exchange as Ex } from "ccxt";
const ExchangeInsMap = new Map<string, Ex>();

const options = {
    enableRateLimit: true
}
export const exchanges = Exchange.exchanges;
export const getExchangeIns = (exchangeName: string) => {

    if (ExchangeInsMap.has(exchangeName)) {
        return ExchangeInsMap.get(exchangeName)
    } else {
        const exchangeIns = new Exchange[exchangeName](options);
        ExchangeInsMap.set(exchangeName, exchangeIns);
        return exchangeIns;
    }
}