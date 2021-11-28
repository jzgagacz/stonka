import { Checkbox, Container, FormControlLabel, FormGroup, Typography, Button, NativeSelect, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import React, { useState } from 'react';
import { idb } from '../idb';
import { postAllFollowed, getAllFollowed, postAllSettings, getAllSettings } from '../api';
import { useAuth0 } from "@auth0/auth0-react";

function Settings() {
    const { getAccessTokenSilently } = useAuth0();

    async function onSaveSettings() {
        let followed = await (await idb.db).getAll("followed");
        const accessToken = await getAccessTokenSilently()
        await postAllFollowed(followed, accessToken)
        let settings = {chartColor: color}
        await postAllSettings(settings, accessToken)
    };

    async function onGetSettings() {
        const accessToken = await getAccessTokenSilently()
        let res = await getAllFollowed(accessToken)
        await (await idb.db).clear("followed")
        for (const symbol of res) {
            await (await idb.db).put("followed", symbol, symbol)
        }
        let settings = await getAllSettings(accessToken)
        localStorage.setItem('chartColor', settings.chartcolor);
        setColor(settings.chartcolor);
    };

    const [color, setColor] = useState(localStorage.getItem('chartColor') === null ? '#8884d8' : localStorage.getItem('chartColor'))
    return (
        <div>
            <Container align="left">
                <Typography>Ustawienia</Typography>
                <Typography>Ustawienia synchronizacji</Typography>
                <FormGroup>
                    <FormControlLabel control={<Checkbox />} label="Synchronizuj obserwowane" />
                    <FormControlLabel control={<Checkbox />} label="Synchronizuj ustawienia aplikacji" />
                    <FormControlLabel control={<Checkbox />} label="Synchronizuj alerty" />
                </FormGroup>
                <Button variant="contained" onClick={() => onSaveSettings()}>Zapisz dane do bazy</Button>
                <Button variant="contained" onClick={() => onGetSettings()}>Pobierz dane z bazy</Button>
                <Typography>Ustawienia aplikacji</Typography>
                <FormControl>
                    <Typography>
                        Kolor wykresu:
                    </Typography>
                    <Select
                        value={color}
                        onChange={(e) => { localStorage.setItem('chartColor', e.target.value); setColor(e.target.value) }}
                    >
                        <MenuItem value={'#8884d8'}>Niebieski</MenuItem>
                        <MenuItem value={'#fa0000'}>Czerwony</MenuItem>
                    </Select>
                </FormControl>
            </Container>
        </div>
    );
}

export default Settings;
