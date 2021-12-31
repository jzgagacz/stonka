import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@material-ui/core"
import { idb } from "../idb"
import { getIntraday, getDaily, getInfo, postFollowed, deleteFollowed } from "../api"
import { useParams } from 'react-router';
import { useAuth0 } from "@auth0/auth0-react";


function Stock(props) {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [data, setData] = useState();
  const [intradayData, setIntradayData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [followedState, setFollowedState] = useState(false);
  const [info, setInfo] = useState();
  let { stockid } = useParams();

  useEffect(() => {
    getIntradayData(stockid).then((data) => setIntradayData(data))
    getDailyData(stockid).then((data) => setDailyData(data))
    getCompInfo(stockid).then((data) => setInfo(data))
    getFollowedState()
  }, [stockid]);  // eslint-disable-line react-hooks/exhaustive-deps

  function formatMinutes(minutes) {
    if (minutes < 10) {
      minutes = "0" + minutes
    }
    return (minutes)
  }

  async function getFollowedState() {
    let val = await (await idb.db).getAllKeys("followed")
    if (val.includes(stockid)) {
      setFollowedState(true)
    }
  }

  async function getCompInfo(name) {
    let val = await (await idb.db).get("compinfo", name)
    let data = val;
    if (val === undefined) {
      let newdata = await getInfo(name);
      if (newdata == null) {
        return data
      }
      data = newdata;
      (await idb.db).put("compinfo", data, name);
    }
    console.log(data)
    return data
  }

  function splicedataintraday(data, newdata) {
    var spliced = Object.assign({}, newdata["Time Series (5min)"], data["Time Series (5min)"])
    newdata["Time Series (5min)"] = spliced
    return newdata
  }

  function splicedatadaily(data, newdata) {
    var spliced = Object.assign({}, newdata["Time Series (Daily)"], data["Time Series (Daily)"])
    newdata["Time Series (Daily)"] = spliced
    return newdata
  }

  async function getIntradayData(name) {
    let val = await (await idb.db).get("intradaystocks", name)
    let data = val;
    if (!navigator.onLine) {
      if (val === undefined) {
        return null
      }
      return val
    }
    if (val === undefined) {
      let newdata = await getIntraday(name, "full", 0);
      if (newdata == null) {
        return data
      }
      data = newdata;
      (await idb.db).put("intradaystocks", data, name);
      console.log("fetched intraday")
    } else {
      if (val["Meta Data"] === undefined) {
        return val
      }
      let lastRefreshed = new Date(Date.parse(val["Meta Data"]["3. Last Refreshed"] + "-0400"))
      let lastDate = new Date(Date.now())
      let minDate = lastDate
      minDate.setMinutes(minDate.getMinutes() - 5)
      if (lastRefreshed < minDate) {
        lastDate.setHours(lastDate.getHours() - 6)
        if (lastRefreshed > lastDate) {
          let newdata = await getIntraday(name, "compact", lastRefreshed.getTime());
          if (newdata == null) {
            return data
          }
          data = splicedataintraday(data, newdata);
          (await idb.db).put("intradaystocks", data, name);
          console.log("fetch and splice intraday")
        } else {
          let newdata = await getIntraday(name, "full", lastRefreshed.getTime());
          if (newdata == null) {
            return data
          }
          data = newdata;
          (await idb.db).put("intradaystocks", data, name);
          console.log("fetch all intraday")
        }
      }
    }
    return data;
  }

  async function getDailyData(name) {
    let val = await (await idb.db).get("dailystocks", name)
    let data = val
    if (!navigator.onLine) {
      if (val === undefined) {
        return null
      }
      return val
    }
    if (val === undefined) {
      let newdata = await getDaily(name, "full", 0);
      if (newdata == null) {
        return data
      }
      data = newdata;
      (await idb.db).put("dailystocks", data, name);
      console.log("fetched daily")
    } else {
      if (val["Meta Data"] === undefined) {
        return val
      }
      let lastRefreshed = new Date(Date.parse(val["Meta Data"]["3. Last Refreshed"]))
      let lastDate = new Date(Date.now())
      let nowDate = new Date(Date.now())
      let weekendDate = new Date(Date.now())
      weekendDate.setDate(nowDate.getDate() - 6)
      let minDate = lastDate
      minDate.setDate(minDate.getDate() - 1)
      if (lastRefreshed < minDate && !(lastRefreshed.getDay() === 5 && (nowDate.getDay() === 0 || nowDate.getDay() === 6) && lastRefreshed > weekendDate)) {
        lastDate.setDate(lastDate.getDate() - 90)
        if (lastRefreshed > lastDate) {
          let newdata = await getDaily(name, "compact", lastRefreshed.getTime());
          if (newdata == null) {
            return data
          }
          data = splicedatadaily(data, newdata);
          (await idb.db).put("dailystocks", data, name);
          console.log("fetch and splice daily")
        } else {
          let newdata = await getDaily(name, "full", lastRefreshed.getTime());
          if (newdata == null) {
            return data
          }
          data = newdata;
          (await idb.db).put("dailystocks", data, name);
          console.log("fetch all daily")
        }
      }
    }
    return data
  }

  function setDayData(range) {
    let newdata = []
    if (intradayData["Meta Data"] === undefined) {
      alert("Dane niedostępne")
      return
    }
    let refreshDate = new Date(Date.parse(intradayData["Meta Data"]["3. Last Refreshed"] + "-0400"))
    let stopDate = refreshDate
    if (range === "1D") {
      stopDate.setDate(refreshDate.getDate() - 1);
    }
    else if (range === "1W") {
      stopDate.setDate(refreshDate.getDate() - 7);
    }
    for (const i in intradayData["Time Series (5min)"]) {
      let date = new Date(Date.parse(i + "-0400"))
      if (date < stopDate) {
        break;
      }
      newdata.push({ name: `${date.getDate()}-${date.getMonth() + 1} ${date.getHours()}:${formatMinutes(date.getMinutes())}`, value: parseFloat(intradayData["Time Series (5min)"][i]["4. close"]) })
    }
    newdata.reverse();
    setData(newdata);
  };

  function setMonthData(range) {
    let newdata = []
    if (dailyData["Meta Data"] === undefined) {
      alert("Dane niedostępne")
      return
    }
    let refreshDate = new Date(Date.parse(dailyData["Meta Data"]["3. Last Refreshed"]))
    let stopDate = refreshDate
    if (range === "1M") {
      stopDate.setMonth(refreshDate.getMonth() - 1)
    }
    else if (range === "3M") {
      stopDate.setMonth(refreshDate.getMonth() - 3)
    }
    else if (range === "1Y") {
      stopDate.setFullYear(refreshDate.getFullYear() - 1)
    }
    else if (range === "3Y") {
      stopDate.setFullYear(refreshDate.getFullYear() - 3)
    }
    for (const i in dailyData["Time Series (Daily)"]) {
      let date = new Date(Date.parse(i))
      if (date < stopDate) {
        break;
      }
      newdata.push({ name: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`, value: parseFloat(dailyData["Time Series (Daily)"][i]["4. close"]) })
    }
    newdata.reverse();
    setData(newdata);
  };

  async function onFollowClick() {
    let val = await (await idb.db).get("followed", stockid)
    const timestamp = + new Date();
    await (await idb.db).put("timestamps", timestamp, 'followed');
    if (val !== undefined) {
      (await idb.db).delete("followed", stockid)
      setFollowedState(false)
      if (!isLoading && isAuthenticated && await (await idb.db).get("settings", 'syncSettings')) {
        let s = { symbol: stockid, timestamp: timestamp }
        const accessToken = await getAccessTokenSilently();
        await deleteFollowed(s, accessToken);
      }
    } else {
      (await idb.db).put("followed", stockid, stockid);
      setFollowedState(true)
      if (!isLoading && isAuthenticated && await (await idb.db).get("settings", 'syncSettings')) {
        let s = { symbol: stockid, timestamp: timestamp }
        const accessToken = await getAccessTokenSilently();
        await postFollowed(s, accessToken);
      }
    }
  };

  if (intradayData === null || dailyData === null) {
    return null
  } else {
    return (
      <div>
        <h2>{stockid} {info === undefined ? "(USD)" : `(${info["Currency"]})`}</h2>
        <h3>{info === undefined ? "" : `${info["Name"]}`}</h3>
        <ResponsiveContainer width="90%" height={400}>
          <LineChart data={data}>
            <Line type="linear" dataKey="value" stroke="#8884d8" dot={false} />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis domain={['dataMin', 'dataMax']} allowDataOverflow={true} />
            <Tooltip />]
          </LineChart>
        </ResponsiveContainer>
        <Button variant="outlined" color="primary" onClick={() => { setMonthData("3Y") }}>3 lata</Button>
        <Button variant="outlined" color="primary" onClick={() => { setMonthData("1Y") }}>rok</Button>
        <Button variant="outlined" color="primary" onClick={() => { setMonthData("3M") }}>3 miesiące</Button>
        <Button variant="outlined" color="primary" onClick={() => { setMonthData("1M") }}>miesiąc</Button>
        <Button variant="outlined" color="primary" onClick={() => { setDayData("1W") }}>tydzień</Button>
        <Button variant="outlined" color="primary" onClick={() => { setDayData("1D") }}>dzień</Button>
        <br />
        <Button variant="contained" color="primary" onClick={() => onFollowClick()}>{followedState ? "Przestań obserwować" : "Obserwuj"}</Button>
      </div>
    );
  }
}

export default Stock;
