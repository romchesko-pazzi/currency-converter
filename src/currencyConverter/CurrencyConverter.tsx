// @ts-ignore
import DerivAPIBasic from "https://cdn.skypack.dev/@deriv/deriv-api/dist/DerivAPIBasic";

import React, {useEffect, useState} from 'react';
import s from './currencyConverter.module.scss';
import {
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from "@mui/material";
import {convertValue} from "./convertFunc";

export const CurrencyConverter = () => {
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [baseCurrency, setBaseCurrency] = useState('BTC');
    const [baseCurrencyValue, setBaseCurrencyValue] = useState<number>(1);
    const [exchangeRate, setExchangeRates] = useState({});
    const connection = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
    const api = new DerivAPIBasic({connection});

    useEffect(() => {
        if (currencies.length < 1) {
            api.send({
                "payout_currencies": 1,
            });
        }
        api.send({
            "exchange_rates": 1,
            "base_currency": baseCurrency,
            "req_id": 1
        });
    }, [baseCurrencyValue, baseCurrency]);

    useEffect(() => {
        connection.addEventListener('message', (res) => {
            const data = JSON.parse(res.data);
            if (data.msg_type === 'exchange_rates') {
                const convertedValue = convertValue(baseCurrencyValue, data.exchange_rates.rates);
                setExchangeRates(convertedValue)
            }
            if (data.msg_type === 'payout_currencies') {
                setCurrencies([...data.payout_currencies]);
            }
        })
    }, [connection])

    const changeCurrency = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBaseCurrency(event.target.value);
    }

    const changeInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBaseCurrencyValue(Number(event.currentTarget.value));
    }

    return (
        <div className={s.main}>
            <div className={s.fields}>
                <TextField
                    inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                    variant={'outlined'}
                    onChange={changeInputValue}
                    value={baseCurrencyValue}/>
                <TextField
                    select
                    value={baseCurrency}
                    onChange={changeCurrency}
                >
                    {currencies.map((m, index) => (
                        <MenuItem key={index} value={m}>
                            {m}
                        </MenuItem>
                    ))}
                </TextField>
            </div>
            <TableContainer sx={{height: 400}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Currency</TableCell>
                            <TableCell align="right">Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(exchangeRate).map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>
                                    {key}
                                </TableCell>
                                <TableCell align={'right'}>
                                    {value as number}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};