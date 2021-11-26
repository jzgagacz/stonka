const key = "VYZMJXNFCX44O3WC"
//const key = "WTR68XUKVL5NYVDG"
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export async function getIntraday(name, outputsize) {
    const res = await fetch(`${BACKEND_URL}/api/stock/intraday?name=${name}&outputsize=${outputsize}`)
    return res.json()
}

export async function getDaily(name, outputsize) {
    const res = await fetch(`${BACKEND_URL}/api/stock/daily?name=${name}&outputsize=${outputsize}`)
    return res.json()
}

export async function getSearches(keywords) {
    const res = await fetch(`${BACKEND_URL}/api/stock/search?keywords=${keywords}`)
    return res.json()
}

export async function getInfo(name) {
    const res = await fetch(`${BACKEND_URL}/api/stock/info?name=${name}`)
    return res.json()
}

export async function getIntradayCrypto(name, outputsize) {
    const res = await fetch(`${BACKEND_URL}/api/crypto/intraday?name=${name}&outputsize=${outputsize}`)
    return res.json()
}

export async function postSubscribe(sub) {
    const res = await fetch(`${BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sub)
    })
    return res.json()
}