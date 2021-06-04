import './OtherPublisherContainer.css';
import React, {useEffect, useRef, useState} from 'react';
import VideoComponent from "../VideoComponent/VideoComponent";

const OtherPublisherContainer = ({user, session, room}) => {


    const videoPlugin = useRef(null);
    const [publisher, setPublisher] = useState({
        name: user.nickname,
        id: user.id,
        muted: false,
        stream: null,
        streaming: false,
        data: null,
        volume: 1
    });

    const onJoinExistedRoom = (response) => {
        let plugin = videoPlugin.current;

        console.log(response)
        console.log(response.getPluginData())


        if (response.getPluginData()["videoroom"] === "attached") {
            let jsep = response.get("jsep");
            console.log(jsep);
            if (jsep) {
                const pc = plugin.createPeerConnection();
                pc.ontrack = (obj) => {
                    const stream = obj.streams[0];
                    setPublisher(state => ({
                        ...state,
                        stream: stream,
                        streaming: true
                    }))
                }

                pc.ondatachannel = function (obj) {
                    setPublisher(e => {
                        obj.channel.send({"request":true})

                        obj.channel.onmessage = (event) => {
                            var data = JSON.parse(event["data"])
                            setPublisher(b => ({
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
                            console.log('here')
                        }
                    })
                });

            }
        }
    }


    useEffect(()=>{
        if (session && user) {
            console.log('OtherPublisherContainer effect');
            console.log(user);
            setPublisher({
                name: user.nickname,
                id: user.id,
                muted: false,
                stream: null,
                streaming: false,
                data: null,
                volume: 1
            });

            session.attachPlugin('janus.plugin.videoroom')
                .then(plugin => {
                    videoPlugin.current = plugin;
                    if(room.pin) {
                        plugin.sendWithTransaction({
                            body: {
                                "request": "join",
                                "room": room.id,
                                "ptype": "subscriber",
                                "feed": user.id,
                                "data": true,
                                "pin": room.pin
                            }
                        }).then(onJoinExistedRoom)
                    } else {
                        plugin.sendWithTransaction({
                            body: {
                                "request": "join",
                                "room": room.id,
                                "ptype": "subscriber",
                                "feed": user.id,
                                "data": true
                            }
                        }).then(onJoinExistedRoom)
                    }
                })
                .catch(err => console.log(err));
        }
    }, [user, session, room]);

    const showPublisher = () => {
        console.log(publisher)
    }

    return <div className='publishers-container'>
        Other User
        <VideoComponent userId={publisher.id}
                        stream={publisher.stream}
                        muted={publisher.muted}
                        streaming={publisher.streaming}/>
        <button onClick={showPublisher}>show publisher</button>
    </div>
};

export default OtherPublisherContainer;