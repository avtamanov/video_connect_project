import React, {useEffect, useRef, useState} from 'react';
import './TestRoom.css'
import ChatContainer from "../components/ChatContainer/ChatContainer";
import axios from "axios";
import io from 'socket.io-client';
import DocumentContainer from "../components/DocumentContainer/DocumentContainer";
import BoardContainer from "../components/BoardContainer/BoardContainer";

const RoomItem = ({roomID, joinChatRoom, description}) => {
    return <div className='rooms-item'>
        <p>Room-{roomID}</p>
        <p>{description}</p>
        <button onClick={joinChatRoom.bind(null, roomID)}>join</button>
    </div>
}

const RoomsList = ({rooms, joinChatRoom}) => {
    return <div className='rooms-list'>
        {rooms.map(r => <RoomItem key={r.roomid}
                                  roomID={r.roomid}
                                  description={r.description}
                                  joinChatRoom={joinChatRoom}/>)}
    </div>
}

const UsersList = ({users}) => {
    console.log('users: ', users);
    return <div className='users-list'>
        <p>Users list:</p>
        {users && users.map(user => user.nickname + ', ')}
    </div>
};

const TestRoom = ({routes, userInfo, token, authApi, sRoutes}) => {

    const [rooms, setRooms] = useState([]);
    const [roomJoined, setRoomJoined] = useState(null); // {id, users}
    const [chatSocket, setChatSocket] = useState(null);
    const [socketUsers, setSocketUsers] = useState([]);

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
                    setRooms(res.data.rooms);
                })
                .catch(err => console.log(err))
        }
    }, [token,userInfo]);

    const joinChatRoom = (roomID) => {
        setRoomJoined(rooms.find(r => r.roomid === roomID));
        chatSocket.emit('join room', {roomid: roomID, userInfo: userInfo});
    }

    const leaveChatRoom = (roomID) => {
        setRoomJoined(null);
        chatSocket.emit('leave room', {roomid: roomID, userInfo: userInfo})
    }

    return <div>
        {!userInfo.email && <div>Return to Home page or login.</div>}
        {userInfo.email && <div>
            <p>TestRoom</p>
            {!roomJoined && <RoomsList rooms={rooms} joinChatRoom={joinChatRoom}/>}
            {roomJoined && <div>
                <UsersList users={socketUsers}/>
                <ChatContainer room={roomJoined}
                               socket={chatSocket}
                               sRoutes={sRoutes}
                               nickname={userInfo.nickname}
                               leaveRoom={leaveChatRoom}/>
                <BoardContainer room={roomJoined}
                                socket={chatSocket}
                                nickname={userInfo.nickname}/>
            </div>}
        </div>}
    </div>
}

export default TestRoom;