import { Checkbox, Container, FormControlLabel, FormGroup, Typography, Button, NativeSelect, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { idb } from '../idb';
import { postAllFollowed, getAllFollowed, postAllSettings, getAllSettings, postSettings, getAllAlerts, postAllAlerts } from '../api';
import { useAuth0 } from "@auth0/auth0-react";

function Settings() {
    const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

    const [color, setColor] = useState("#8884d8")
    const [syncSettings, setSyncSettings] = useState(false)

    useEffect(() => {
        async function setVars() {
            let c = await (await idb.db).get("settings", 'chartColor')
            if (c != null)
                setColor(c);
            c = await (await idb.db).get("settings", 'syncSettings')
            if (c != null)
                setSyncSettings(c);
        }
        setVars();
    }, []);

    async function onSaveSettings() {
        const accessToken = await getAccessTokenSilently()

        let timestamp = await (await idb.db).get("timestamps", 'followed');
        let followed = await (await idb.db).getAll("followed");
        await postAllFollowed({ symbols: followed, timestamp: timestamp }, accessToken)

        timestamp = await (await idb.db).get("timestamps", 'settings');
        let settings = { chartColor: color, timestamp: timestamp }
        await postAllSettings(settings, accessToken)

        timestamp = await (await idb.db).get("timestamps", 'alerts');
        let alerts = await (await idb.db).getAll("alerts");
        await postAllAlerts({ alerts: alerts, timestamp: timestamp }, accessToken)

        alerts = await getAllAlerts(accessToken)
        await (await idb.db).clear("alerts")
        for (const alert of alerts['alerts']) {
            await (await idb.db).put("alerts", alert, alert.id)
        }
        await (await idb.db).put("timestamps", alerts['timestamp'], 'alerts')
    };

    async function onGetSettings() {
        const accessToken = await getAccessTokenSilently()

        let res = await getAllFollowed(accessToken)
        await (await idb.db).clear("followed")
        for (const symbol of res['symbols']) {
            await (await idb.db).put("followed", symbol, symbol)
        }
        await (await idb.db).put("timestamps", res['timestamp'], 'followed')

        let settings = await getAllSettings(accessToken)
        await (await idb.db).put("settings", settings.chartColor, 'chartColor')
        await (await idb.db).put("timestamps", settings['timestamp'], 'settings')
        setColor(settings.chartcolor);

        let alerts = await getAllAlerts(accessToken)
        await (await idb.db).clear("alerts")
        for (const alert of alerts['alerts']) {
            await (await idb.db).put("alerts", alert, alert.id)
        }
        await (await idb.db).put("timestamps", alerts['timestamp'], 'alerts')
    };

    async function handleChangeSettings() {
        await (await idb.db).put("settings", color, 'chartColor')
        const timestamp = + new Date();
        await (await idb.db).put("timestamps", timestamp, 'settings');
        if (isLoading || !isAuthenticated) {
            return
        }
        if (syncSettings) {
            let settings = { chartColor: color, timestamp: timestamp }
            const accessToken = await getAccessTokenSilently();
            await postSettings(settings, accessToken);
        }
    }

    return (
        <div>
            <Container align="left">
                <Typography>Ustawienia</Typography>
                {!isLoading && isAuthenticated ? <div>
                    <Typography>Ustawienia synchronizacji</Typography>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox checked={syncSettings} onChange={async (e) => { setSyncSettings(e.target.checked); await (await idb.db).put("settings", e.target.checked, 'syncSettings') }} />} label="Synchronizuj ustawienia aplikacji" />
                    </FormGroup>
                    <Button variant="contained" onClick={() => onSaveSettings()}>Zapisz dane do bazy</Button>
                    <Button variant="contained" onClick={() => onGetSettings()}>Pobierz dane z bazy</Button>
                </div> : <div></div>}
                <Typography>Ustawienia aplikacji</Typography>
                <FormGroup>
                    <FormControl>
                        <Typography>
                            Kolor wykresu:
                        </Typography>
                        <Select
                            value={color}
                            onChange={(e) => { setColor(e.target.value) }}
                        >
                            <MenuItem value={'#8884d8'}>Niebieski</MenuItem>
                            <MenuItem value={'#fa0000'}>Czerwony</MenuItem>
                        </Select>
                    </FormControl>
                </FormGroup>
                <br />
                <Button variant="contained" onClick={() => handleChangeSettings()}>Zapisz ustawienia aplikacji</Button>
            </Container>
        </div>
    );
}

export default Settings;
