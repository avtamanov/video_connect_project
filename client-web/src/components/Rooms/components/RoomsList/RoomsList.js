import React, {useState} from "react";
import './RoomsList.css';


const Room = ({setUser, room, plugin, setRoomJoinedJanus, setUsers, joinRoom, userInfo}) => {

    const [pin, setPin] = useState('');
    const [showError, setShowError] = useState(false);
    const errorMessage = 'Invalid pin, try again.'

    const onJoin = () => {
        if(room.pin){
            if(room.pin === pin){
                console.log('here')
                joinRoom(room, plugin, pin);
            } else {
                setShowError(true);
            }
        }
        else{
            joinRoom(room, plugin, pin);
        }
    };

    return <div className='room-item'>
        <div>ID {room.roomid}</div>
        <div>{room.description}</div>
        <div className='join-pad'>
            {room.pin && <input className='pin-field'
                                value={pin}
                                placeholder={'Pin required...'}
                                onChange={(e) => {
                                    setPin(e.target.value);
                                }}/>}
            <button onClick={onJoin}>join</button>
            {showError && <p className='pin-error'>{errorMessage}</p>}
        </div>
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