import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogTitle, DialogContent, DialogContentText, InputLabel, Select, MenuItem, TextField, DialogActions, Button } from "@material-ui/core"
import { useParams } from 'react-router';
import { idb } from "../idb"
import { useInterval, getIntradayCryptoData } from '../utils';
import { postAlert } from '../api';
import { useAuth0 } from "@auth0/auth0-react";

function CryptoId() {
    const [data, setData] = useState();
    const [intradayData, setIntradayData] = useState(null);
    const [open, setOpen] = useState(false);
    const [moreless, setMoreLess] = useState("more");
    const [price, setPrice] = useState(0);
    const { getAccessTokenSilently } = useAuth0();
    let { cryptoid } = useParams();

    async function handleAlert(){
        console.log(moreless);
        console.log(price);
        const date = Date.now();
        console.log(date);
        let alert = {crypto: cryptoid, moreless: moreless, price:price, date:date};
        const accessToken = await getAccessTokenSilently();
        await postAlert(alert, accessToken);
        //(await idb.db).put("alerts", {symbol: cryptoid, moreless: moreless, price:price, date:date}, cryptoid);
        setOpen(false);
    }

    useInterval(() => {
        getIntradayData(cryptoid);
    }, 1000 * 30);

    useEffect(() => {
        getIntradayData(cryptoid)
    }, [cryptoid]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (intradayData !== null) {
            setDayData("1D")
        }
    }, [intradayData]); // eslint-disable-line react-hooks/exhaustive-deps

    function formatMinutes(minutes) {
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        return (minutes)
    }

    
    async function getIntradayData(name) {
        let data = await getIntradayCryptoData(name)
        setIntradayData(data)
        return data;
    }

    function setDayData(range) {
        let newdata = []
        if (intradayData["Meta Data"] === undefined) {
            alert("Dane niedostępne")
            return
        }
        let refreshDate = new Date(Date.parse(intradayData["Meta Data"]["6. Last Refreshed"] + "+0000"))
        let stopDate = refreshDate
        if (range === "1D") {
            stopDate.setHours(refreshDate.getHours() - 12);
        }
        for (const i in intradayData["Time Series Crypto (1min)"]) {
            let date = new Date(Date.parse(i + "+0000"))
            if (date < stopDate) {
                break;
            }
            newdata.push({ name: `${date.getDate()}-${date.getMonth() + 1} ${date.getHours()}:${formatMinutes(date.getMinutes())}`, value: parseFloat(intradayData["Time Series Crypto (1min)"][i]["4. close"]) })
        }
        newdata.reverse();
        setData(newdata);
    };

    if (intradayData === null) {
        return null
    } else {
        return (
            <div>
                <h2>{cryptoid}(USD)</h2>
                <ResponsiveContainer width="90%" height={400}>
                    <LineChart data={data}>
                        <Line type="linear" dataKey="value" stroke="#8884d8" dot={false} />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <XAxis dataKey="name" />
                        <YAxis domain={['dataMin', 'dataMax']} allowDataOverflow={true} />
                        <Tooltip />]
                    </LineChart>
                </ResponsiveContainer>
                <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Ustaw alert</Button>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Ustaw alert</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Ustaw alert jeśli cena zmieni się na:
                    </DialogContentText>
                        <InputLabel></InputLabel>
                        <Select
                            value={moreless}
                            onChange={(e) => setMoreLess(e.target.value)}
                            autoFocus
                        >
                            <MenuItem value={"more"}>powyżej</MenuItem>
                            <MenuItem value={"less"}>poniżej</MenuItem>
                        </Select><br />
                        <TextField
                            label="Cena (USD)"
                            value={price}
                            onChange={(e) => setPrice(parseInt(e.target.value))}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="primary">
                            Zamknij
                        </Button>
                        <Button onClick={() => handleAlert()} color="primary">
                            Ustaw
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default CryptoId;