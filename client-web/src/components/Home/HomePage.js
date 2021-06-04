import React, {useEffect, useState} from "react";
import HomeHeader from "./components/HomeHeader/HomeHeader";

import "./HomePage.css";
import {Breakpoint} from "react-socks";
import HomeFooter from "./components/HomeFooter/HomeFooter";
import axios from "axios";
import HomeActions from "./components/HomeActions/HomeActions";

const HomePage = ({routes, login, authApi}) => {
    console.log({routes, login, authApi})
    return <div className="home-catalog">
            <Breakpoint medium up>
                <HomeHeader routes={routes} login={login} authApi={authApi}/>
                <HomeActions routes={routes}/>
                <HomeFooter/>
            </Breakpoint>
            <Breakpoint small down>
                <HomeHeader routes={routes} login={login} authApi={authApi}/>
                <HomeActions routes={routes}/>
                <HomeFooter/>
            </Breakpoint>
    </div>
}

export default HomePage;