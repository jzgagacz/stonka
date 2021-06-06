import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons'
import React, { useState, useEffect } from 'react';
import { idb } from "../idb"


function Alerts() {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function getAlerts() {
            let val = await (await idb.db).getAll("alerts")
            setData(val)
        }
        getAlerts()
    }, [])

    async function deleteAlert(name){
        (await idb.db).delete("alerts", name);
        let val = await (await idb.db).getAll("alerts")
        setData(val)
    }

    return (
        <div>
            <List>
                {data.map((e, idx) => (
                    <ListItem key={idx} >
                        <ListItemText primary={e.symbol} secondary={e.moreless === "more" ? `powyżej ${e.price} USD` : `poniżej ${e.price} USD`} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => deleteAlert(e.symbol)}>
                                <Delete/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>))}
            </List>
        </div>
    );
}

export default Alerts;