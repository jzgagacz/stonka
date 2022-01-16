//https://stackoverflow.com/questions/46140764/polling-api-every-x-seconds-with-react/60498111#60498111
import React, { useState, useEffect, useRef } from 'react';
import { idb } from "./idb"
import { getAllAlerts, getAllFollowed, getAllSettings, getIntradayCrypto, getTimestamps, postAllAlerts, postAllFollowed, postAllSettings } from "./api"
import { useAuth0 } from "@auth0/auth0-react";

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
    let newdata = await getIntradayCrypto(name, "full", 0);
    console.log(newdata)
    if (newdata == null) {
      return data
    }
    data = newdata;
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
        let newdata = await getIntradayCrypto(name, "compact", lastRefreshed.getTime());
        if (newdata == null) {
          return data
        }
        data = splicedata(data, newdata);
        (await idb.db).put("intradaycrypto", data, name);
        console.log("fetch and splice")
      } else {
        let newdata = await getIntradayCrypto(name, "full", lastRefreshed.getTime());
        if (newdata == null) {
          return data
        }
        data = newdata;
        (await idb.db).put("intradaycrypto", data, name);
        console.log("fetch all")
      }
    }
  }
  return data
}

export async function deleteAlert(alertid){
  let db = await idb.db
  if (db == null) {
    db = idb.open('db')
  }
  await db.delete("alerts", alertid);
}

export async function performSettingsSync() {
  let db = await idb.db
  if (db == null) {
    db = idb.open('db')
  }
  const accessToken = await db.get('token', 'accessToken')
  if (!await (db.get('settings', 'syncSettings'))) {
    return
  }
  if (accessToken != null) {
    let timestamps = await getTimestamps(accessToken)
    if (timestamps['settings'] == null) {
      timestamps['settings'] = 0
    }
    if (timestamps['followed'] == null) {
      timestamps['followed'] = 0
    }
    if (timestamps['alerts'] == null) {
      timestamps['alerts'] = 0
    }
    console.log(timestamps)
    let followedTimestamp = await db.get('timestamps', 'followed')
    let alertsTimestamp = await db.get('timestamps', 'alerts')
    let settingsTimestamp = await db.get('timestamps', 'settings')
    if (followedTimestamp == null) {
      followedTimestamp = 0
    }
    if (alertsTimestamp == null) {
      alertsTimestamp = 0
    }
    if (settingsTimestamp == null) {
      settingsTimestamp = 0
    }
    if (followedTimestamp > timestamps['followed']) {
      //put followed
      let timestamp = await db.get("timestamps", 'followed');
      let followed = await db.getAll("followed");
      await postAllFollowed({ symbols: followed, timestamp: timestamp }, accessToken)
    } else if (followedTimestamp < timestamps['followed']) {
      //get followed
      let res = await getAllFollowed(accessToken)
      await db.clear("followed")
      for (const symbol of res['symbols']) {
        await db.put("followed", symbol, symbol)
      }
      await db.put("timestamps", res['timestamp'], 'followed')
    }
    if (alertsTimestamp > timestamps['alerts']) {
      //put alerts
      let timestamp = await db.get("timestamps", 'alerts');
      let alerts = await db.getAll("alerts");
      await postAllAlerts({ alerts: alerts, timestamp: timestamp }, accessToken)

      alerts = await getAllAlerts(accessToken)
      await db.clear("alerts")
      for (const alert of alerts['alerts']) {
        await db.put("alerts", alert, alert.id)
      }
      await db.put("timestamps", alerts['timestamp'], 'alerts')
    } else if (alertsTimestamp < timestamps['alerts']) {
      //get alerts
      let alerts = await getAllAlerts(accessToken)
      await db.clear("alerts")
      for (const alert of alerts['alerts']) {
        await db.put("alerts", alert, alert.id)
      }
      await db.put("timestamps", alerts['timestamp'], 'alerts')
    }
    if (settingsTimestamp > timestamps['settings']) {
      //put settings
      let timestamp = await db.get("timestamps", 'settings');
      let color = await db.get("settings", 'chartColor');
      let settings = { chartColor: color, timestamp: timestamp }
      await postAllSettings(settings, accessToken)
    } else if (settingsTimestamp < timestamps['settings']) {
      //get settings
      let settings = await getAllSettings(accessToken)
      await db.put("settings", settings.chartColor, 'chartColor')
      await db.put("timestamps", settings['timestamp'], 'settings')
    }
  }
}
