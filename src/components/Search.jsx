import { Button, List, TextField, ListItem, ListItemText } from '@material-ui/core';
import React, { useState } from 'react';
import { getSearches } from "../api"


function Search() {
  const [searchFieldData, setSearchFieldData] = useState();
  const [data, setData] = useState([]);

  async function onSearchClick() {
    let apidata = await getSearches(searchFieldData)
    let newdata = apidata["bestMatches"].filter(x => x["3. type"] === "Equity")
    setData(newdata)
    console.log(newdata)
  };

  function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  return (
    <div>
      <TextField label="Szukaj" variant="outlined" onChange={(e) => setSearchFieldData(e.target.value)}></TextField><br />
      <Button variant="contained" color="primary" onClick={() => onSearchClick()}>Wyszukaj</Button>
      <List>
        {data.map((e, idx) => (
          <ListItemLink key={idx} href={`/stock/${e["1. symbol"]}`}>
            <ListItemText primary={e["1. symbol"]} secondary={e["2. name"]}/>
          </ListItemLink>))}
      </List>
    </div>
  );
}

export default Search;
