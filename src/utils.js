//https://stackoverflow.com/questions/46140764/polling-api-every-x-seconds-with-react/60498111#60498111
import React, { useState, useEffect, useRef } from 'react';
import { idb } from "./idb"
import { getIntradayCrypto } from "./api"

export const useInterval = (callback, delay) => {

    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);


    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

function splicedata(data, newdata) {
    var spliced = Object.assign({}, newdata["Time Series Crypto (1min)"], data["Time Series Crypto (1min)"])
    newdata["Time Series Crypto (1min)"] = spliced
    return newdata
}

export async function getIntradayCryptoData(name) {
    console.log("getting data")
    let val = await (await idb.db).get("intradaycrypto", name)
    let data = val;
    if (!navigator.onLine) {
        console.log("offline")
        if (val === undefined) {
            return null
        }
        return val
    }
    if (val === undefined) {
        data = await getIntradayCrypto(name, "full");
        (await idb.db).put("intradaycrypto", data, name);
        console.log("fetched")
    } else {
        if (val["Meta Data"] === undefined) {
            return val
        }
        let lastRefreshed = new Date(Date.parse(val["Meta Data"]["6. Last Refreshed"] + "+0000"))
        let lastDate = new Date(Date.now())
        let minDate = lastDate
        minDate.setMinutes(minDate.getMinutes() - 1)
        if (lastRefreshed < minDate) {
            lastDate.setMinutes(lastDate.getMinutes() - 90)
            if (lastRefreshed > lastDate) {
                let newdata = await getIntradayCrypto(name, "compact");
                data = splicedata(data, newdata);
                (await idb.db).put("intradaycrypto", data, name);
                console.log("fetch and splice")
            } else {
                data = await getIntradayCrypto(name, "full");
                (await idb.db).put("intradaycrypto", data, name);
                console.log("fetch all")
            }
        }
    }
    return data
}