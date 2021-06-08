import React, {useEffect, useRef, useState} from "react";
import './PublishersContainer.css';

const PublishersContainer = ({publishers, session, roomID}) => {

    return <div>
        {publishers.map(user => <PublisherVideo key={user.id}
                                                publisher={user}
                                                session={session}
                                                roomID={roomID}/>)}
    </div>
};

const PublisherVideo = ({publisher, session, roomID}) => {

    const [isPublished, setIsPublished] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [user, setUser] = useState({
        nickname: publisher.display,
        id: publisher.id,
        muted: false,
        stream: null,
        streaming: false,
        data: null,
        volume: 1,
        audioStreamId: -1,
        videoStreamId: -1
    })

    const getMedia = ()=>{
        console.log('publisher video session', session);
        setIsPublished(true);
        if(session && roomID){
            session.attachPlugin('janus.plugin.videoroom').then((plugin) => {
                function onRoomAsSubJoin(response) {
                    if (response.getPluginData()["videoroom"] === "attached") {
                        console.log(response.getPluginData())
                        console.log(response)
                        var streams = response.getPluginData()["streams"]

                        if(streams) {
                            streams.forEach(element => {
                                if(element["type"] == "audio") {
                                    setUser(e => ({
                                        ...e,
                                        audioStreamId: element["feed_mid"]
                                    }))
                                }

                                if(element["type"] == "video") {
                                    setUser(e => ({
                                        ...e,
                                        videoStreamId: element["feed_mid"]
                                    }))
                                }

                            });
                        }


                        var jsep = response.get("jsep");
                        if (jsep) {
                            var pc = plugin.createPeerConnection();
                            pc.ontrack = function (obj) {
                                const stream = obj.streams[0];
                                setUser(e => ({
                                    ...e,
                                    stream: stream,
                                    streaming: true
                                }))
                            }

                            pc.ondatachannel = function (obj) {
                                setUser(e => {
                                    obj.channel.send({"request":true})

                                    obj.channel.onmessage = (event) => {
                                        var data = JSON.parse(event["data"])
                                        setUser(b => ({
                                            ...b,
                                            muted: data["muted"],
                                            streaming: data["streaming"]
                                        }))
                                    }

                                    return {
                                        ...e,
                                        data: obj.channel
                                    }
                                })
                            }

                            pc.createDataChannel("events")

                            plugin.createAnswer(jsep).then(function (jsep) {
                                plugin.sendWithTransaction({ jsep: jsep, body: { request: "start" } }).then(function (response) {
                                    if (response.getPluginData()["started"] === "ok") {

                                    }
                                })
                            });
                        }
                    }
                }

                plugin.sendWithTransaction({ body:
                        {
                            "request": "join",
                            "room": parseInt(roomID),
                            "ptype": "subscriber",
                            "feed": publisher.id,
                            "data": true
                        }
                }).then(onRoomAsSubJoin);
            })
        }
    }

    const deleteMedia = () => {
        ref.current.srcObject = null;
        setIsPublished(false);
    }

    const onMute = () => {
        setIsMuted(!isMuted);
    }

    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            console.log(user.streaming);
            console.log(user.stream);
            ref.current.volume = user.volume;
            ref.current.muted = user.muted;
            ref.current.autoplay = true;
            ref.current.playsInline = true;

            if (!ref.current.srcObject) {
                ref.current.srcObject = user.stream
            }
        }
    }, [user.streaming, user.volume, user.stream]);


    return <div className='publisher-component'>
        <div className='nickname-user'>{publisher.display || publisher.id}</div>
        <video className={'video-user ' + publisher.id} ref={ref}/>
        <div className={'video-user-buttons ' + publisher.id}>
            {isPublished && <div className='user-button' onClick={deleteMedia}>Clear Media</div>}
            {!isPublished && <div className='user-button' onClick={getMedia}>Get Media</div>}
            {isMuted && <div className='user-button' onClick={onMute}>Unmute</div>}
            {!isMuted && <div className='user-button' onClick={onMute}>Mute</div>}
        </div>
    </div>
}

export default PublishersContainer;
