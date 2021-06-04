import React, {useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import HomePage from "./components/Home/HomePage";
import CreateRoom from "./components/Rooms/CreateRoom/CreateRoom";
import LoginForm from "./components/Authorisation/LoginForm";
import RegisterForm from "./components/Authorisation/RegisterForm";
import JoinRoom from "./components/Rooms/JoinRoom/JoinRoom";
import axios from "axios";
import Cookie from 'js-cookie';
import { createDecoder }from 'fast-jwt';
import TestRoom from "./components/Rooms/TestRoom/TestRoom";
import HomeHeader from "./components/Home/components/HomeHeader/HomeHeader";
import HomeFooter from "./components/Home/components/HomeFooter/HomeFooter";
import Profile from "./components/Profile/Profile";

export const CustomRouter = () => {
    const decoder = createDecoder();
    const EXPIRES = {
        '10sec': 1/8640,
        '1min': 1/1440,
        '15min': 1/96,
        '1hour': 1/24,
    }

    const routes = {
        HOST: 'localhost:3000',
        createVideoRoom: '/create-video-room',
        joinVideoRoom: '/join-video-room',
        testRoom: '/test-room',
        profile: '/profile',
        home: '/',
    };

    const serverRoutes = {
        HOST: 'http://localhost:8001',
        home: '/',
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        getUserInfo: '/api/get-user',
        updateUserInfo: '/api/update-user',
        deleteUserInfo: '/api/delete-user',
        getRooms: '/api/get-rooms',
        createRoom: '/api/create-room',
        janusConnect: '/janus/connect',
        janusAttachVideo: '/janus/attach-video',
        janusCreateRoom: '/janus/create-room',
        janusPostJsep: '/janus/post-jsep'
    };

    const [userInfo, setUserInfo] = useState({}); // {email, nickname}
    const [userToken, setUserToken] = useState(undefined)
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    useEffect(()=>{
        console.log('here')
        if(JSON.stringify(userInfo) === JSON.stringify({})){
            const userEmail = Cookie.get('email');
            const userNickname = Cookie.get('nickname');
            if(userEmail && userNickname){
                setUserInfo({
                    email: userEmail,
                    nickname: userNickname,
                });
            }
        }
        if(!userToken){

            const userTkn = Cookie.get('tkn');
            if(userTkn){
                console.log('here token')
                console.log(userTkn)
                setUserToken(userTkn);
            }
        }
    }, [])

    const onLogOut = ()=> {
        console.log('user log out');
        setUserInfo({});
        setUserToken('');
        Cookie.remove('email')
        Cookie.remove('nickname')
        Cookie.remove('tkn')
    };

    const onLogIn = (email, password)=> {
        console.log('user log in');
        axios.post(serverRoutes.HOST+serverRoutes.login, {
            email: email,
            password: password
        })
            .then(onSuccessEnter)
            .catch(err => console.log(err));
    };

    const onRegister = (email, password)=> {
        console.log('user register');
        axios.post(serverRoutes.HOST+serverRoutes.register, {
            email: email,
            password: password
        })
            .then(onSuccessEnter)
            .catch(err => console.log(err));
    };

    const onSuccessEnter = (res) => {
        console.log(res);
        const tkn = res.data.accessToken;
        Cookie.set('tkn', tkn, {expires: EXPIRES["1hour"]});
        setUserToken(tkn);

        const usr = decoder(res.data.accessToken);
        Cookie.set('email', usr.email, {expires: EXPIRES["1hour"]});
        Cookie.set('nickname', usr.nickname, {expires: EXPIRES["1hour"]});
        setUserInfo(usr);
    }

    const AuthAPI = {onLogOut, onLogIn, onRegister, setShowLogin, setShowRegister};


    return (
        <Router>
            <Switch>
                <Route path={routes.createVideoRoom}>
                    <CreateRoom routes={routes}
                                userInfo={userInfo}
                                userToken={userToken}
                                authApi={AuthAPI}
                                serverRoutes={serverRoutes}/>
                </Route>
                <Route path={routes.joinVideoRoom}>
                    <HomeHeader routes={routes} login={userInfo.nickname} authApi={AuthAPI}/>
                    <JoinRoom sRoutes={serverRoutes}
                              userInfo={userInfo}
                              token={userToken}
                              authApi={AuthAPI}
                              serverRoutes={serverRoutes}/>
                    <HomeFooter/>
                </Route>
                <Route path={routes.testRoom}>
                    <HomeHeader routes={routes}
                                login={userInfo.nickname}
                                authApi={AuthAPI}/>
                    <TestRoom routes={routes}
                              userInfo={userInfo}
                              token={userToken}
                              authApi={AuthAPI}
                              sRoutes={serverRoutes}/>
                    <HomeFooter/>
                </Route>
                <Route path={routes.profile}>
                    <HomeHeader routes={routes}
                                login={userInfo.nickname}
                                authApi={AuthAPI}/>
                    <Profile sRoutes={serverRoutes}
                             userInfo={userInfo}
                             token={userToken}/>
                    <HomeFooter/>
                </Route>
                <Route exact path={routes.home}>
                    <HomePage routes={routes} login={userInfo.nickname} authApi={AuthAPI}/>
                </Route>
            </Switch>
            {showLogin && <LoginForm active={showLogin}
                                     setActive={setShowLogin}
                                     authMethod={onLogIn}
                                     setShowRegister={setShowRegister}/>}
            {showRegister && <RegisterForm active={showRegister}
                                           setActive={setShowRegister}
                                           authMethod={onRegister}
                                           setShowLogin={setShowLogin}/>}
        </Router>
    );
}
