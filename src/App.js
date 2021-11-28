import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import Stock from "./components/Stock"
import Search from "./components/Search"
import Followed from "./components/Followed"
import CryptoList from "./components/CryptoList"
import CryptoId from "./components/CryptoId"
import './App.css';
import { Drawer, IconButton, List, Toolbar, ListItem, ListItemText, Card, CardContent, Typography, Button, Grid, Item } from '@material-ui/core';
import { Menu } from '@material-ui/icons'
import Logo from './logo.png'
import { useInterval, getIntradayCryptoData } from './utils';
import { idb } from "./idb"
import { postSubscribe } from './api'
import Alerts from './components/Alerts';
import { useAuth0 } from "@auth0/auth0-react";
import Settings from './components/Settings';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isLoading, isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();


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
      if (isLoading || !isAuthenticated) {
        return
      }
      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.getSubscription();
      if (sub === null) {
        const newsub = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BHT6CRkl2uFMHDUBDPVdQUBe24nkrvmG4AYTeUW3-aYEHAVpMvWvAKINb54lnCzXx362FfWlfG-g3Zt9Tuhlhik'
        });
        console.log(newsub)
        const accessToken = await getAccessTokenSilently();
        const res = await postSubscribe(newsub, accessToken);
        console.log(res)
      }
    }
    getAlerts()
  }, [isLoading, isAuthenticated])

  function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  return (
    <div className="App">
      <Toolbar>
        <Grid justify="space-between" container spacing={3} alignItems="center">
          <Grid item>
            <div>
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
                  <ListItemLink href="/settings">
                    <ListItemText primary="USTAWIENIA" />
                  </ListItemLink>
                </List>
              </Drawer>
            </div>
          </Grid>

          <Grid item>
            <Grid container direction="row" alignItems="center">
              <Grid item>
                <img src={Logo} alt="" height={64} />
              </Grid>
              <Grid item>
                <h2>stonka</h2>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <div>
              {isLoading ? <div></div> : (isAuthenticated ?
                <div>
                  {user.name}
                  <Button onClick={() => logout({ returnTo: window.location.origin })}>
                    Wyloguj się
                  </Button>
                </div> :
                <div>
                  <Button onClick={() => loginWithRedirect()}>Zaloguj się</Button>
                </div>)}
            </div>
          </Grid>
        </Grid>
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
          <Route path="/settings" component={Settings} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
