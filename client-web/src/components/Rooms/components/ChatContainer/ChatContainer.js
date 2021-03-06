import React, {useEffect, useRef, useState} from 'react';
import './ChatContainer.css'
import io from 'socket.io-client';

const MessageBox = ({message}) => {
    return <div className='message-box'>
        <div className='message-header'>
            <p className='message-nick'>{message.nickname}</p>
            <p className='message-time'>{message.time}</p>
        </div>
        <div className='message-value'>{message.value}</div>
    </div>
}

const ChatContainer = ({socket, room, nickname}) => {

    const [showChat, setShowChat] = useState(true);

    const [messageValue, setMessageValue] = useState('');
    const messageID = useRef(0);
    const [messages, setMessages] = useState([]);

    // socket init
    useEffect(()=>{
        if(!socket){
            console.log('no chat connection')
        } else {
            console.log('chat connected')
        }
    }, [socket]);

    // socket behaviour + /*EnterButton init*/
    useEffect(()=>{
        if(socket){
            /*document.onkeydown = (e) => {
                if(e.key === 'Enter'){
                    onSendMessage();
                }
            }*/

            socket.on('add message', ({message}) => { // message = {nickname, time, value}
                setMessages([...messages, message])
            })
        }
    }, [socket, messages])

    const onSendMessage = () => {
        let extraMsg;
        if(!messageValue) {
            extraMsg = document.getElementsByClassName('chat-textarea')[0].value;
            if(!extraMsg){
                console.log('tried send empty message')
                return;
            }
        }
        const date = new Date();
        const timeHours = date.getHours();
        const timeMinutes = date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes();
        const timeSeconds = date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds();
        let timeStr = timeHours + ':' + timeMinutes + ':' + timeSeconds;
        const msg = {
            nickname: nickname ? nickname : 'NoName',
            time: timeStr,
            value: messageValue ? messageValue : extraMsg
        }

        // server behaviour
        socket.emit('send message', {roomid: room.roomid, message: msg});
        // local behaviour
        setMessageValue('');
    }

    return <div className='chat-container'>
        <p onClick={()=>{setShowChat(!showChat)}}>Chat: {showChat ? 'hide' : 'show'}</p>
        {showChat && <div>
            <input className='chat-textarea'
                   value={messageValue}
                   placeholder={'?????????????? ??????????????????...'}
                   onChange={(e) => {
                       setMessageValue(e.target.value);
                   }}/>
            <button className='chat-send'
                    onClick={onSendMessage}>Send
            </button>
        </div>}
        {showChat && <div className='messages-container'>
            {messages.map(msg => <MessageBox key={messageID.current++}
                                             message={msg}/>)}
        </div>}
    </div>
}

export default ChatContainer;