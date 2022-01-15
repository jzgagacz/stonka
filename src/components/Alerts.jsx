import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons'
import React, { useState, useEffect } from 'react';
import { idb } from "../idb"
import { deleteAlert } from "../api"
import { useAuth0 } from "@auth0/auth0-react";


function Alerts() {
    const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

    const [data, setData] = useState([]);

    useEffect(() => {
        async function getAlerts() {
            let val = await (await idb.db).getAll("alerts")
            setData(val)
        }
        getAlerts()
    }, [])

    async function deleteAlertClick(id){
        if (isLoading || !isAuthenticated){
            return
        }
        const timestamp = + new Date();
        let alert = {id: id, timestamp:timestamp};
        const accessToken = await getAccessTokenSilently();
        const res = await deleteAlert(alert, accessToken);
        (await idb.db).delete("alerts", id);
        (await idb.db).put("timestamps", timestamp, 'alerts');
        let val = await (await idb.db).getAll("alerts")
        setData(val)
    }

    return (
        <div>
            <h2>Alerty cenowe:</h2>
            <List>
                {data.map((e, idx) => (
                    <ListItem key={idx} >
                        <ListItemText primary={e.symbol} secondary={e.moreless === "more" ? `powyżej ${e.price} USD` : `poniżej ${e.price} USD`} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => deleteAlertClick(e.id)}>
                                <Delete/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>))}
            </List>
        </div>
    );
}

export default Alerts;