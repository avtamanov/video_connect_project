import React, {useEffect, useRef, useState} from "react";

const PublishersContainer = ({publishers, session, roomID}) => {

    return <div>
        {publishers.map(user => <PublisherVideo key={user.id}
                                                publisher={user}
                                                session={session}
                                                roomID={roomID}/>)}
    </div>
};

const PublisherVideo = ({publisher, session, roomID}) => {

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


    return <div>
        <div>
            <p>{publisher.display || publisher.id}</p>
            <button onClick={getMedia}>getMedia</button>
        </div>
        <video className={'video-user-'+publisher.id} ref={ref}/>
        {/*<button onClick={()=>{
            let videoElement = document.getElementsByClassName('video-user-'+publisher.id)[0];
            console.log(videoElement.srcObject);
        }}>media?</button>*/}
    </div>
}

export default PublishersContainer;
