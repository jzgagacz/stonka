import { List, ListItem, ListItemText } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { idb } from "../idb"


function Followed() {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchFollowed(){
            let val = await (await idb.db).getAll("followed")
            setData(val)
            console.log(val)
        }
        fetchFollowed()
    }, []);

    function ListItemLink(props) {
        return <ListItem button component="a" {...props} />;
    }

    return (
        <div>
            <List>
                {data.map((e, idx) => (
                    <ListItemLink key={idx} href={`/stock/${e}`} info={e}>
                        <ListItemText primary={e} />
                    </ListItemLink>))}
            </List>
        </div>
    );
}

export default Followed;
