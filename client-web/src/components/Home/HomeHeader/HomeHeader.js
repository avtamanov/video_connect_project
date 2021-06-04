import React, {useEffect} from "react";
import * as cookie from "react-cookies";

import {Link} from "react-router-dom";
import "./HomeHeader.css"
import search from "../../../icons/search.svg";
import profile from "../../../icons/profile.svg";
import logo from "../../../icons/logo_main.png"

const HomeHeaderSearch = ()=> {
    return <div>
        <img className="ic_search" src={search} alt="Search"/>
        <input className="field_search"/>
        {/*<img className="ic_underline" src={underline}/>*/}
    </div>
}

const HomeHeader = ({routes, login, authApi}) => {
    useEffect(()=>{
        cookie.remove("token", {path: "/"});
    })

    return <div className="home_bar_container">
        <img className="ic_logo" src={logo}/>
        <Link className="home-link" to={routes.home}>Home</Link>
        <HomeHeaderSearch/>
        {login && <Link className="my-account" to={routes.profile}>My Account</Link>}
        {login && <img className="ic_profile" src={profile}/>}
        {login && <input
            className={"premium_button"}
            type="submit"
            value="Log out"
            onClick={authApi.onLogOut}
        />}
        {!login && <input
            className={"premium_button"}
            type="submit"
            value="Log In"
            onClick={()=>{authApi.setShowLogin(true)}}
        />}
        {!login && <input
            className={"premium_button"}
            type="submit"
            value="Sign Up"
            onClick={()=>{authApi.setShowRegister(true)}}
        />}
    </div>
}
export default HomeHeader;