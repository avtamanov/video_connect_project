import './JoinRoom.css';
import React, {useEffect, useRef, useState} from "react";
import HomeHeader from "../../Home/HomeHeader/HomeHeader";
import HomeFooter from "../../Home/HomeFooter/HomeFooter";
import Janus from "janus-gateway-js";
import VideoComponent from "../components/VideoComponent/VideoComponent";
import ChatContainer from "../components/ChatContainer/ChatContainer";
import BoardContainer from "../components/BoardContainer/BoardContainer";
import RoomJoined from "../components/RoomJoined/RoomJoined";
import RoomsList from "../components/RoomsList/RoomsList";
import io from "socket.io-client";
import axios from "axios";


const JoinRoom = ({sRoutes, userInfo, token, authApi, serverRoutes}) => {


    
    // janus session data
    const [userID, setUserID] = useState(undefined);
    const sessionID = '12345678';
    const connection = useRef(null);
    const session = useRef(null);
    const videoPlugin = useRef(null);
    const [userStream, setUserStream] = useState(null);
    const dataChannel = useRef(null);
    // janus server data
    const [janusRooms, setJanusRooms] = useState(null);
    // socket server data
    const [socketRooms, setSocketRooms] = useState([]);
    const [chatSocket, setChatSocket] = useState(null);

    // rooms data
    const [roomJoinedJanus, setRoomJoinedJanus] = useState(false); // janus room id
    const [roomJoinedSocket, setRoomJoinedSocket] = useState(null); // {id, users}
    const [publishers, setPublishers] = useState([]);
    const [socketUsers, setSocketUsers] = useState([]);

    // get janus rooms
    const getJanusRooms = (plugin) => {
        if(plugin){
            plugin.sendWithTransaction({
                body: {
                    "request" : "list"
                }
            }).then(res => {
                console.log(res.getPluginData().list)
                setJanusRooms(res.getPluginData().list)
            })
                .catch(err => console.log(err))
        }
    };
    // publish audio, video
    const publishMedia = () => {
        const plugin = videoPlugin.current;
        if(!plugin){ console.log('plugin ',plugin); return; }

        plugin.getUserMedia({ video: true, audio: true })
            .then(function (stream) {
                console.log(stream)
                console.log('HERE')
                let pc = plugin.createPeerConnection();

                dataChannel.current = pc.createDataChannel("events");
                dataChannel.current.onmessage = function (e) {
                    console.log(e);
                };

                stream.getTracks().forEach(function (track) {
                    plugin.addTrack(track, stream);
                });

                setUserStream(stream);
            })
            .then(function () {
                return plugin.createOffer();
            })
            .then(function (jsep) {
                console.log(jsep)
                return plugin.sendWithTransaction({
                    body: {
                        request: 'publish',
                        audio: true,
                        video: true,
                        data: true,
                    },
                    jsep: jsep,
                });
            })
            .then(function (response) {
                const jsep = response.get("jsep");
                if (jsep) {
                    plugin.setRemoteSDP(jsep);
                    return jsep;
                }
            });
    }
    // unpublish audio, video
    const unpublishMedia = () => {
        const plugin = videoPlugin.current;
        if(!plugin){ console.log('plugin ',plugin); return; }

        plugin.sendWithTransaction({
            body: {
                request: 'unpublish'
            },
        }).then(res => {
            console.log(res)
            setUserStream(null)
        })
    }
    // janus tracks users in room
    const curUsers = [];


    // TODO HERE
    // JOIN ROOM
    const joinRoom = (room, plugin) => {
        joinSocketRoom(room);
        joinJanusRoom(room, plugin);
    }

    const joinSocketRoom = (room) => {
        setRoomJoinedSocket(socketRooms.find(r => r.roomid === room.roomid));
        chatSocket.emit('join room', {roomid: room.roomid, userInfo: userInfo});
    }
    const joinJanusRoom = (room, plugin) => {
        plugin.sendWithTransaction({
            body: {
                request: 'join',
                ptype: 'publisher',
                room : room.roomid,
                display: userInfo.nickname
            }
        }).then(res => {
            console.log(res.getPluginData())
            setRoomJoinedJanus(room.room);
            setUserID(res.getPluginData().id);
        })
            .catch(err => console.log(err))
    }


    // LEAVE ROOM
    const leaveJanusRoom = () => {

    }


    // leave socket room
    const leaveSocketRoom = (roomID) => {
        setRoomJoinedSocket(null);
        chatSocket.emit('leave room', {roomid: roomID, userInfo: userInfo})
    }

    // janus init
    // create connection, session, plugin
    useEffect(()=>{
        const janus = new Janus.Client('ws://localhost:8188', {
            token: '',
            apisecret: '',
            keepalive: 'true'
        });

        janus.createConnection(sessionID).then(function(con) {
            connection.current = con;
            con.createSession().then(function(ses) {

                session.current = ses;

                ses.attachPlugin('janus.plugin.videoroom').then(function(plugin) {
                    videoPlugin.current = plugin;
                    getJanusRooms(plugin);

                    plugin.on('message', (message) => {
                        console.log(message);
                        // если это event
                        if (message.getPluginData()) {
                            const data = message.getPluginData();
                            console.log('data: ', data)
                            //console.log('janusUsers: ', janusUsers);
                            // если кто-то публикует media
                            if (data.publishers && data.publishers.length) {
                                //console.log('someone published');
                                //console.log(data.publishers);
                                data.publishers.map(user => curUsers.push(user));
                                //console.log('console.log(curUsers): ',curUsers)
                                setPublishers(curUsers)
                            }
                            if (data.unpublished) {
                                //console.log('someone UNpublished')
                                //console.log(data.unpublished)
                                console.log(curUsers)
                                // curUsers.filter(user => user.id !== data.unpublished);
                                const unpub = curUsers.find(user => user.id === data.unpublished);
                                const unpubIndex = curUsers.indexOf(unpub);
                                if(unpubIndex !== -1) {
                                    //console.log('SPLICE')
                                    curUsers.splice(unpubIndex, 1);
                                }
                                setPublishers(curUsers);
                            }
                        }
                    });
                });
            });
        });
    },[]);

    // socket init
    // init check users in room were changed
    useEffect(()=>{
        if(token && userInfo)
        {
            const socket = io.connect(sRoutes.HOST);
            socket.on('room users check', ({roomid, users}) => {
                setSocketUsers(users);
            })
            setChatSocket(socket);
            axios.get(sRoutes.HOST + sRoutes.getRooms, {
                headers: {
                    authorization: 'Bearer ' + token
                }
            })
                .then(res => {
                    console.log(res.data)
                    setSocketRooms(res.data.rooms);
                })
                .catch(err => console.log(err))
        }
    }, [token,userInfo]);


    return <div className='join-video-room'>

        {!roomJoinedSocket && <RoomsList rooms={socketRooms}
                                         videoPlugin={videoPlugin}
                                         userInfo={userInfo}
                                         setUserID={setUserID}
                                         joinRoom={joinRoom}/>}
        {roomJoinedSocket && <RoomJoined room={socketRooms.find(r => r.roomid === roomJoinedSocket.roomid)}
                                         session={session.current}
                                         plugin={videoPlugin.current}
                                         setJoined={setRoomJoinedJanus}
                                         userID={userID}
                                         publishMedia={publishMedia}
                                         unpublishMedia={unpublishMedia}
                                         userStream={userStream}
                                         userInfo={userInfo}
                                         socket={chatSocket}
                                         socketUsers={socketUsers}
                                         publishers={publishers}

        />
        }
    </div>
}

export default JoinRoom;