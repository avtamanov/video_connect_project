import React, {useEffect, useState} from 'react';
import './RoomJoined.css';
import VideoComponent from "../VideoComponent/VideoComponent";
import ChatContainer from "../ChatContainer/ChatContainer";
import BoardContainer from "../BoardContainer/BoardContainer";
import DocumentContainer from "../DocumentContainer/DocumentContainer";
import UsersList from "../UsersList/UsersList";
import PublishersContainer from "../PublishersContainer/PublishersContainer";

const RoomJoined = ({userInfo,
                        room,
                        plugin,
                        session,
                        setJoined,
                        userID,
                        publishMedia,
                        unpublishMedia,
                        userStream,
                        leaveRoom,
                        socket,
                        socketUsers,
                        publishers,
                        routes}) => {

    useEffect(()=>{
        console.log(room.interactive);
        if(room.interactive){
            setBoard(room.interactive.includes('board'));
            setChat(room.interactive.includes('chat'));
            setDoc(room.interactive.includes('doc'));
            setVideo(room.interactive.includes('video'));
        }
    }, []);

    useEffect(()=>{
        //leaveRoomBind = leaveRoom.bind(null, room, plugin)
    }, [room, plugin]);

    const [allowedBoard, setBoard] = useState(true);
    const [allowedChat, setChat] = useState(true);
    const [allowedDoc, setDoc] = useState(true);
    const [allowedVideo, setVideo] = useState(true);


    return <div className='room-joined'>
        <div className='left-panel'>
            <div className='room-header'>
                <p>You joined to Room with ID:{room.roomid}</p>
                <p>Your video-server ID: {userID}</p>
                <button onClick={()=>{leaveRoom(room)}}>Leave Room</button>
            </div>
            {allowedVideo && <VideoComponent userId={userID}
                             userInfo={userInfo}
                             stream={userStream}
                             muted={false}
                             streaming={true}
                             publishMedia={publishMedia}
                             unpublishMedia={unpublishMedia}
            />}
            {allowedVideo && <PublishersContainer publishers={publishers}
                                  roomID={room.roomid}
                                  session={session}/>}
        </div>
        <div className='right-panel'>

            {allowedBoard && <BoardContainer socket={socket}
                             room={room}
                             nickname={userInfo.nickname}/>}
            {allowedDoc && <DocumentContainer room={room}
                                routes={routes}/>}
            <div className='lower-panel'>
                {allowedChat && <ChatContainer socket={socket}
                                room={room}
                                nickname={userInfo.nickname}/>}
                <UsersList users={socketUsers}/>
            </div>

        </div>
    </div>
}

export default RoomJoined;