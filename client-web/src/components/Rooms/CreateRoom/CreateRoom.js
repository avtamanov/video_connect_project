import './CreateRoom.css';
import HomeHeader from "../../Home/HomeHeader/HomeHeader";
import React, {useEffect, useRef, useState} from "react";
import HomeFooter from "../../Home/HomeFooter/HomeFooter";
import '../../../videoroomPlugin';
import axios from "axios";
import Janus from "janus-gateway-js";
import {TextField} from "@material-ui/core";

const CreateRoom = ({routes, userInfo, userToken, authApi, serverRoutes}) => {

    const connection = useRef(null);
    const session = useRef(null);
    const videoPlugin = useRef(null);

    const logMessage = (message) => {
        if(!message.getPluginData) return;

        const data = message.getPluginData();
        console.log(data);
    };

    // create connection, session, plugin
    const janusInit = () => {
        const janus = new Janus.Client('ws://localhost:8188', {
            token: '',
            apisecret: '',
            keepalive: 'true'
        });

        janus.createConnection('123').then(function(con) {
            connection.current = con;
            con.createSession().then(function(ses) {

                session.current = ses;

                ses.attachPlugin('janus.plugin.videoroom').then(function(plugin) {
                    videoPlugin.current = plugin;

                    plugin.on('message', (message) => {
                        console.log(message);
                        // если это event
                        if (message.getPluginData()) {
                            const data = message.getPluginData();
                            console.log('data: ', data)
                        }
                    });
                });
            });
        });
    }

    const createRoom = (room) => {
        console.log(room); //{roomid,description,publishers,pin,interactive,secret,isPrivateRoom}
        createJanusRoom(room);
        createSocketRoom(room);
    }

    const createJanusRoom = (roomInstance) => {
        const plugin = videoPlugin.current

        if(plugin){
            console.log(roomInstance.pin)
            if(roomInstance.pin){
                plugin.sendWithTransaction({
                    body: {
                        request: "create",
                        room: roomInstance.roomid,
                        permanent: false,
                        description: roomInstance.description,
                        secret: roomInstance.secret,
                        pin: roomInstance.pin,
                        is_private: roomInstance.isPrivateRoom,
                        bitrate: 128000
                    }
                }).then(res => console.log(res))
                    .catch(err => console.log(err))
            } else {
                plugin.sendWithTransaction({
                    body: {
                        request: "create",
                        room: roomInstance.roomid,
                        permanent: false,
                        description: roomInstance.description,
                        secret: roomInstance.secret,
                        is_private: roomInstance.isPrivateRoom,
                        bitrate: 128000
                    }
                }).then(res => console.log(res))
                    .catch(err => console.log(err))
            }

        }
    }

    const createSocketRoom = (roomInstance) => {
        //{roomid,description,publishers,pin,interactive,secret, isPrivateRoom}
        axios.post(serverRoutes.HOST+serverRoutes.createRoom, {
            room: {...roomInstance, ownerEmail: userInfo.email}
        }, {
            headers: {
                authorization: 'Bearer '+userToken
            }
        }).then(res => {
            console.log(res)
        }).catch(err => console.log(err));
    }

    useEffect(()=>{
        janusInit();
    }, [])

    return <div className='create-video-room'>
        <HomeHeader routes={routes} login={userInfo.email} authApi={authApi}/>
        {!userInfo.email && <div>For room creating you should login or register first.</div>}
        {userInfo.email && <RoomCreationForm createRoom={createRoom} routes={routes}/>}
        <HomeFooter/>
    </div>
}



// -------------------------------------------- CREATE FORM -------------------------------------------

const RoomCreationForm = ({createRoom, routes}) => {

    const getRandomInt = () => {
        return parseInt(''+(Math.random() * 1000000000));
    }

    const [ID, setID] = useState('');
    const [description, setDescription] = useState('');
    const [publishers, setPublishers] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [pin, setPin] = useState('');
    const [isPrivateRoom,setPrivateRoom] = useState(true);
    // ['video','chat','board','doc'] - max amount
    const [checkVideo, setCheckVideo] = useState(true);
    const [checkChat, setCheckChat] = useState(false);
    const [checkBoard, setCheckBoard] = useState(false);
    const [checkDoc, setCheckDoc] = useState(false);

    const [showError, setShowError] = useState('disabled');
    const ErrorMessage = 'Description, publishers and at least one interactive component - required fields'

    const isButtonActive = () => {
        const anyInteractive = checkBoard || checkChat || checkDoc || checkVideo;
        if(description && publishers && anyInteractive) return '';
        return 'disabled';
    }
    const getInteractive = () => {
        let str = '';
        str+= checkVideo ? 'video,' : '';
        str+= checkChat ? 'chat,' : '';
        str+= checkBoard ? 'board,' : '';
        str+= checkDoc ? 'doc,' : '';
        return str;
    }
    const bindedCreateRoom = createRoom.bind(null, {
        roomid: isNaN(parseInt(ID)) ? getRandomInt() : parseInt(ID),
        description: description,
        publishers: parseInt(publishers),
        pin: pin,
        interactive: getInteractive(), // TODO select
        secret: ''+getRandomInt(),
        isPrivateRoom: isPrivateRoom,
    });
    const onCreateRoom = () => {
        bindedCreateRoom();
        window.location = 'http://' + routes.HOST + routes.joinVideoRoom;
        setID('');
        setDescription('');
        setPublishers('');
        setShowPin(false);
        setPin('')
        setCheckVideo(true);
        setCheckChat(false);
        setCheckBoard(false);
        setCheckDoc(false);
        setPrivateRoom(true);
    }

    useEffect(()=>{
        setShowError(isButtonActive());
    }, [ID, description, publishers, checkBoard, checkChat, checkDoc, checkVideo]);

    return <div className='create-room-form'>
        <p className='create-form-header'>Create room</p>
        <div><input className='create-form-input'
                    value={ID}
                    onChange={e=> setID(e.target.value)}
                    placeholder='Room ID...'/></div>
        <div><input className='create-form-input'
                    value={description}
                    onChange={e=> setDescription(e.target.value)}
                    placeholder='Room description...'/></div>
        <div><input className='create-form-input'
                    value={publishers}
                    onChange={e=> setPublishers(e.target.value)}
                    placeholder='Number of publishers...'/></div>
        <div>
            <div className='create-form-subheader'>
                <p>Add password?</p>
                <input type="checkbox"
                       checked={showPin}
                       onChange={e=>setShowPin(showPin ? '' : 'checked')}/>
            </div>
        </div>
        {showPin && <div><input className='create-form-input'
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                placeholder='Enter password...'/></div>}
        <div>
            <p className='create-form-subheader'>Add interactive</p>
            <div className='interactive-checkbox'>
                <input type="checkbox"
                       checked={checkVideo}
                       onChange={e => setCheckVideo(checkVideo ? '' : 'checked')}/>
                <p>Video</p>
            </div>
            <div className='interactive-checkbox'>
                <input type="checkbox"
                       checked={checkChat}
                       onChange={e => setCheckChat(checkChat ? '' : 'checked')}/>
                <p>Chat</p>
            </div>
            <div className='interactive-checkbox'>
                <input type="checkbox"
                       checked={checkBoard}
                       onChange={e => setCheckBoard(checkBoard ? '' : 'checked')}/>
                <p>Board</p>
            </div>
            <div className='interactive-checkbox'>
                <input type="checkbox"
                       checked={checkDoc}
                       onChange={e => setCheckDoc(checkDoc ? '' : 'checked')}/>
                <p>Doc</p>
            </div>
        </div>
        <div>
            <div className='create-form-subheader'>
                <p>Is room private?</p>
                <input type="checkbox"
                       checked={isPrivateRoom ? 'checked' : ''}
                       onChange={e=>setPrivateRoom(!isPrivateRoom)}/>
            </div>
            <p>(If room private, it will be not showing in Search rooms list)</p>
        </div>
        {!showError && <button className='create-room-button' disabled={showError}
                               onClick={onCreateRoom}>Create room</button>}
        {showError && <p className='create-form-error'>{ErrorMessage}</p>}
    </div>
}

export default CreateRoom;