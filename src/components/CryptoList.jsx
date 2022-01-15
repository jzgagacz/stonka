import { List, ListItem, ListItemText } from '@material-ui/core';
import React from 'react';


function CryptoList() {
  const cryptolist = ["BTC", "ETH"]

  function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  return (
    <div>
      <h2>Kryptowaluty:</h2>
      <List>
        {cryptolist.map((e, idx) => (
          <ListItemLink key={idx} href={`/crypto/${e}`}>
            <ListItemText primary={e} />
          </ListItemLink>))}
      </List>
    </div>
  );
}

export default CryptoList;
