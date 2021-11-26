import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import Stock from "./components/Stock"
import Search from "./components/Search"
import Followed from "./components/Followed"
import CryptoList from "./components/CryptoList"
import CryptoId from "./components/CryptoId"
import './App.css';
import { Drawer, IconButton, List, Toolbar, ListItem, ListItemText, Card, CardContent, Typography } from '@material-ui/core';
import { Menu } from '@material-ui/icons'
import Logo from './logo.png'
import { useInterval, getIntradayCryptoData } from './utils';
import { idb } from "./idb"
import { postSubscribe } from './api'
import Alerts from './components/Alerts';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);


  useEffect(() => {
    async function getAlerts() {
      if (!navigator.onLine) {
        console.log("offline")
        return
      }
      if (!("serviceWorker" in navigator && "PushManager" in window)) {
        console.log("no SW or PM")
        return
      }
      console.log("test")
      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.getSubscription();
      if(sub === null){
        const newsub = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BHT6CRkl2uFMHDUBDPVdQUBe24nkrvmG4AYTeUW3-aYEHAVpMvWvAKINb54lnCzXx362FfWlfG-g3Zt9Tuhlhik'
        });
        console.log(newsub)
        const res = await postSubscribe(newsub);
        console.log(res)
      }
    }
    getAlerts()
  }, [])

  /*
  async function getAlerts() {
    if (! navigator.onLine){
      return
    }
    
    let val = await (await idb.db).getAll("alerts")
    console.log(val)
    for (const a in val) {
      console.log(val[a])
      let data = await getIntradayCryptoData(val[a].symbol)
      console.log(data)
      let price = val[a].price
      let date = val[a].date
      if (val[a].moreless === "more") {
        for (const t in data["Time Series Crypto (1min)"]) {
          if (data["Time Series Crypto (1min)"][t]["4. close"] > price && Date.parse(t + "+0000") > date) {
            alert(`Cena ${val[a].symbol} przekroczyła ${price} USD`);
            (await idb.db).delete("alerts", val[a].symbol);
            break;
          }
        }
      } else {
        for (const t in data["Time Series Crypto (1min)"]) {
          if (data["Time Series Crypto (1min)"][t]["4. close"] < price && Date.parse(t + "+0000") > date) {
            alert(`Cena ${val[a].symbol} spadła poniżej ${price} USD`);
            (await idb.db).delete("alerts", val[a].symbol);
            break;
          }
        }
      }
    }
    
  }

  useInterval(() => {
    getAlerts();
  }, 1000 * 10);
  */

  function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  return (
    <div className="App">
      <Toolbar>
        <IconButton onClick={() => setDrawerOpen(true)}><Menu /></IconButton>
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <List>
            <ListItemLink href="/">
              <ListItemText primary="SZUKAJ" />
            </ListItemLink>
            <ListItemLink href="/followed">
              <ListItemText primary="OBSERWOWANE" />
            </ListItemLink>
            <ListItemLink href="/crypto">
              <ListItemText primary="KRYPTOWALUTY" />
            </ListItemLink>
            <ListItemLink href="/alerts">
              <ListItemText primary="ALERTY CENOWE" />
            </ListItemLink>
          </List>
        </Drawer>
        <img src={Logo} alt="" height={64} />
        <h2>stonka</h2>
      </Toolbar>
      {navigator.onLine ? <div></div> :
        <Card>
          <CardContent style={{ backgroundColor: "pink" }}>
            <Typography variant="h5" component="span">
              Brak połączenia z internetem
            </Typography>
          </CardContent>
        </Card>
      }
      <Router>
        <Switch>
          <Route exact path="/" component={Search} />
          <Route path="/stock/:stockid" component={Stock} />
          <Route path="/followed" component={Followed} />
          <Route exact path="/crypto" component={CryptoList} />
          <Route path="/crypto/:cryptoid" component={CryptoId} />
          <Route path="/alerts" component={Alerts} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
