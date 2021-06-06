const key = "VYZMJXNFCX44O3WC"
//const key = "WTR68XUKVL5NYVDG"

export async function getIntraday(name, outputsize){
    const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${name}&interval=5min&outputsize=${outputsize}&apikey=${key}`)
    return res.json()
}

export async function getDaily(name, outputsize){
    const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${name}&interval=5min&outputsize=${outputsize}&apikey=${key}`)
    return res.json()
}

export async function getSearches(keywords){
    const res = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${key}`)
    return res.json()
}

export async function getInfo(name){
    const res = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${name}&apikey=${key}`)
    return res.json()
}

export async function getIntradayCrypto(name, outputsize){
    const res = await fetch(`https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=${name}&market=USD&interval=1min&outputsize=${outputsize}&apikey=${key}`)
    return res.json()
}