import React from 'react';
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
                        publishers}) => {

    return <div className='room-joined'>
        <div className='left-panel'>
            <div className='room-header'>
                <p>You joined to Room with ID:{room.roomid}</p>
                <p>Your video-server ID: {userID}</p>
                <button onClick={leaveRoom}>Leave Room</button>
            </div>
            <VideoComponent userId={userID}
                            userInfo={userInfo}
                            stream={userStream}
                            muted={false}
                            streaming={true}
                            publishMedia={publishMedia}
                            unpublishMedia={unpublishMedia}
            />

            <PublishersContainer publishers={publishers}
                                 roomID={room.roomid}
                                 session={session}/>
        </div>
        <div className='right-panel'>

            <BoardContainer socket={socket}
                            room={room}
                            nickname={userInfo.nickname}/>
            {/*<DocumentContainer/>*/}
            <div className='lower-panel'>
                <ChatContainer socket={socket}
                               room={room}
                               nickname={userInfo.nickname}/>
                <UsersList users={socketUsers}/>
            </div>

        </div>
    </div>
}

export default RoomJoined;