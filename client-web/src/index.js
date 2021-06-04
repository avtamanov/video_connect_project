import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {BreakpointProvider} from "react-socks";
import {CustomRouter} from "./router";
import * as serviceWorker from './serviceWorker';
import './content/fonts/fonts.css'

ReactDOM.render(
    <BreakpointProvider>
        <CustomRouter/>
    </BreakpointProvider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorker.register();
