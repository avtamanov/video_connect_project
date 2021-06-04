import React from "react";


const Room = ({setUser, room, plugin, setRoomJoinedJanus, setUsers, joinRoom, userInfo}) => {

    console.log(room)
    const onJoin = () => {
        joinRoom(room, plugin, userInfo.nickname);
    };

    return <div style={{padding: '5px 5px 5px 5px',
        border: '1px solid black',
        margin: '2px 2px 2px 2px'}}>
        <div>ID {room.roomid}</div>
        <div>{room.description}</div>
        {room.pin_required && <p>pin required</p>}
        <button onClick={onJoin}>join</button>
    </div>
}

const RoomsList = ({rooms, videoPlugin, setRoomJoinedJanus, setUserID, joinRoom, userInfo}) => {
    return <div>
        <p>Available Rooms</p>
        <div>
            {rooms && rooms.map(r => <Room key={r.roomid}
                                           room={r}
                                           plugin={videoPlugin.current}
                                           setRoomJoinedJanus={setRoomJoinedJanus}
                                           setUser={setUserID}
                                           joinRoom={joinRoom}
                                           userInfo={userInfo}
            />)}
        </div>
    </div>
}

export default RoomsList;