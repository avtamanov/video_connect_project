import './Profile.css';
import React, {useEffect, useState} from 'react';
import axios from "axios";

const Profile = ({sRoutes, token, userInfo}) => {

    const [userData, setUserData] = useState(null);
    const [showChangeNick, setShowChangeNick] = useState(false);
    const [changeNick, setChangeNick] = useState('');
    const [showChangePass, setShowChangePass] = useState(false);
    const [changePass, setChangePass] = useState('');
    const [changePassRepeat, setChangePassRepeat] = useState('');

    useEffect(()=>{
        if(token) {
            getUserData();
        }
    }, [token])

    const getUserData = () => {
        axios.get(sRoutes.HOST+sRoutes.getUserInfo, {
            headers: {
                authorization: 'Bearer ' + token
            }
        }).then(res => {
            console.log(res);
            setUserData(res.data.user);
        }).catch(err => console.log(err));
    }

    const onChangeNickname = () => {
        if(changeNick.length < 3) {
            alert('Nickname length must be not less than 3.');
            return;
        }

        axios.post(sRoutes.HOST+sRoutes.updateUserInfo, {
            nickname: changeNick,
        }, {
            headers: {
                authorization: 'Bearer ' + token
            }
        }).then(res => {
            console.log(res);
            setUserData(res.data.user);
        }).catch(err => console.log(err));
        setShowChangeNick(false);
        setChangeNick('');
    }

    const onChangePassword = () => {
        if(changePass !== changePassRepeat){
            alert('Passwords doesn\'t match');
            return;
        }
        if(changePass.length < 8 || changePass.length > 16) {
            alert('Password length must be between 8 and 16 characters.');
            return;
        }
        const regExp = /^[a-zA-Z0-9_.@-]*$/;
        let match = changePass.match(regExp);
        if(!(match && match.index === 0)){
            alert('Password must contain only letters (A-z), numbers (0-9) and symbols ( _ . @ - ).');
            return;
        }

        axios.post(sRoutes.HOST+sRoutes.updateUserInfo, {
            password: changePass,
        }, {
            headers: {
                authorization: 'Bearer ' + token
            }
        }).then(res => {
            console.log(res);
            setUserData(res.data.user);
        }).catch(err => console.log(err));
        setShowChangePass(false);
        setChangePass('');
        setChangePassRepeat('');
    }

    const passwordShow = (pass) => {
        const passBegin = pass.slice(0,3);
        const passEnd = pass.slice(3);
        const passEndHidden = new Array(passEnd.length + 1).join('*');
        return passBegin + passEndHidden;
    }

    return <div>
        {!userInfo.email && <div>Return to Home page or login.</div>}
        {userInfo.email && <div className='profile-container'>
            <p>Profile</p>
            <p>-------</p>
            {userData && <div>
                <div>
                    <p>Your nickname: {userData.nickname}</p>
                    {!showChangeNick && <button onClick={() => {
                        setShowChangeNick(true)
                    }}>Change nickname</button>}
                    {showChangeNick && <div>
                        <button onClick={() => {
                            setShowChangeNick(false)
                        }}>Cancel
                        </button>
                        <input value={changeNick}
                               onChange={(e) => {
                                   setChangeNick(e.target.value)
                               }}
                               placeholder='Enter new nickname...'/>
                        <button onClick={onChangeNickname}>Send request</button>
                    </div>}
                </div>
                <p>Your email: {userData.email}</p>
                <div>
                    <p>Your password: {passwordShow(userData.password)}</p>
                    {!showChangePass && <button onClick={() => {
                        setShowChangePass(true)
                    }}>Change password</button>}
                    {showChangePass && <div>
                        <button onClick={() => {
                            setShowChangePass(false)
                        }}>Cancel
                        </button>
                        <input value={changePass}
                               onChange={(e) => {
                                   setChangePass(e.target.value)
                               }}
                               placeholder='Enter new password...'/>
                        <input value={changePassRepeat}
                               onChange={(e) => {
                                   setChangePassRepeat(e.target.value)
                               }}
                               placeholder='Repeat new password...'/>
                        <button onClick={onChangePassword}>Send request</button>
                    </div>}
                </div>
                <p>Your rules: {userData.rules}</p>
            </div>}
        </div>}

    </div>
}

export default Profile;