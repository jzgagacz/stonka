const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

async function fetchWithTimeout(url, other, time = 5000) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), time)
    return fetch(url, { signal: controller.signal, ...other })
}

export async function getIntraday(name, outputsize, timestamp) {
    try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/stock/intraday?name=${name}&outputsize=${outputsize}&timestamp=${timestamp}`)
        return res.json()
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function getDaily(name, outputsize, timestamp) {
    try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/stock/daily?name=${name}&outputsize=${outputsize}&timestamp=${timestamp}`)
        return res.json()
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function getSearches(keywords) {
    try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/stock/search?keywords=${keywords}`)
        return res.json()
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function getInfo(name) {
    try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/stock/info?name=${name}`)
        return res.json()
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function getIntradayCrypto(name, outputsize, timestamp) {
    try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/crypto/intraday?name=${name}&outputsize=${outputsize}&timestamp=${timestamp}`)
        return res.json()
    } catch (e) {
        console.log(e)
        return null
    }
}

export async function postSubscribe(sub, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(sub)
    })
    return res.json()
}

export async function postAllFollowed(followed, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/followed`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(followed)
    })
    return res.json()
}

export async function getAllFollowed(accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/followed`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return res.json()
}

export async function postAlert(alert, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/alert`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(alert)
    })
    return res.json()
}

export async function deleteAlert(alert, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/alert`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(alert)
    })
    return res.json()
}

export async function postAllAlerts(alerts, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/alerts`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(alerts)
    })
    return res.json()
}

export async function getAllAlerts(accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/alerts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return res.json()
}

export async function postAllSettings(settings, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/settings`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(settings)
    })
    return res.json()
}

export async function getAllSettings(accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/settings`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return res.json()
}

export async function postSettings(settings, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(settings)
    })
    return res.json()
}

export async function postFollowed(followed, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/followed`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(followed)
    })
    return res.json()
}

export async function deleteFollowed(followed, accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/followed`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(followed)
    })
    return res.json()
}

export async function getTimestamps(accessToken) {
    const res = await fetch(`${BACKEND_URL}/api/user/timestamps`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return res.json()
}