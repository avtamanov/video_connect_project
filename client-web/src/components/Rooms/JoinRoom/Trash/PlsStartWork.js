import React, {useState} from 'react';
import axios from "axios";

const PlsStartWork = ({sRoutes, token}) => {
    const MY_STUN = 'stun:stun.voip.eutelia.it:3478';
    const [myPC, setMyPC] = useState(null);

    const getRooms = () => {
        axios.get(sRoutes.HOST+sRoutes.getRooms, {
            headers: {
                authorization: 'Bearer '+token
            }
        }).then(res => console.log(res)).catch(err => console.log(err));
    };

    const connectJanus = () => {
        console.log('connect to janus');

        axios.get(sRoutes.HOST+sRoutes.janusConnect)
            .then(res => console.log(res)).catch(err => console.log(err));
    };

    const attachJanusPlugin = () => {
        console.log('attach videoroom to janus');

        axios.post(sRoutes.HOST+sRoutes.janusAttachVideo)
            .then(res => console.log(res)).catch(err => console.log(err));
    };

    const createRoomJanus = () => {
        console.log('create videoroom on janus');

        axios.post(sRoutes.HOST+sRoutes.janusCreateRoom)
            .then(res => console.log(res)).catch(err => console.log(err));
    };



    // generateSdp().then(offerSdp => { console.log(offerSdp.sdp) })
    const generateSdp = () => {
        return new Promise((resolve, reject) => {
            let media = { audio: true, video: true };
            let audioSupport = media.audio;
            let height = 480;
            let width = 640;
            let videoSupport = {
                'height': { 'ideal': height },
                'width': { 'ideal': width }
            };
            const constraints = {
                audio: true,
                video: true
            };
            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => { streamsDone(media, stream).then(resolve, reject); })
                .catch(function (error) { reject(error); });
        })
    }

    const streamsDone = (media, stream) => {
        return new Promise((resolve, reject) => {
            // We're now capturing the new stream: check if we're updating or if it's a new thing
            const myStream = stream;
            // If we still need to create a PeerConnection, let's do that
            let iceServers = [{ urls: MY_STUN}];
            let pc_config = { "iceServers": iceServers };

            const localPC = new RTCPeerConnection(pc_config);
            setMyPC(localPC);
            localPC.oniceconnectionstatechange = function () {
                if (localPC)
                    console.log("Ice state changed", localPC.iceConnectionState);
            };
            /*localPC.onicecandidate = function (event) {
                //
                let candidate;
                if (event.candidate == null) {
                    // TODO "completed": true - вызовет обсёр очереди
                    candidate = {"completed": true}
                    if(myPublisherHandle) {
                        myPublisherHandle.trickle(candidate).then(result => console.log(result));
                    }
                    else{
                        setAwaitingTrickleCands([...awaitingTrickleCands, candidate]);
                    }
                } else {
                    candidate = {
                        "candidate": event.candidate.candidate,
                        "sdpMid": event.candidate.sdpMid,
                        "sdpMLineIndex": event.candidate.sdpMLineIndex,
                        "completed": false
                    };
                    if(myPublisherHandle) {
                        myPublisherHandle.trickle(candidate).then(result => console.log(result));
                    } else {
                        setAwaitingTrickleCands([...awaitingTrickleCands, candidate]);
                    }
                }
            }; */
            if (stream !== null && stream !== undefined) {
                console.log('Adding local stream');
                stream.getTracks().forEach(function (track) {
                    console.log('Adding local track:', track);
                    localPC.addTrack(track, stream);
                });
            }

            // If there's a new local stream, let's notify the application
            if (myStream) {
                let videoElement = document.getElementsByClassName('local-video')[0];
                videoElement.srcObject = myStream;
                videoElement.play();
            }
            // Create offer/answer now
            createOffer(localPC).then(resolve, reject);

        })
    }

    const createOffer = (pc) => {
        return new Promise((resolve, reject) => {
            let mediaConstraints = {};
            // because we send, not get
            mediaConstraints["offerToReceiveAudio"] = false;
            mediaConstraints["offerToReceiveVideo"] = false;
            pc.createOffer(
                function (offer) {
                    console.log(offer);
                    console.log("Setting local description");
                    pc.setLocalDescription(offer).then(result => console.log(result));
                    console.log("Offer ready");
                    let jsep = {
                        "type": offer.type,
                        "sdp": offer.sdp
                    };
                    resolve(jsep);
                }, reject, mediaConstraints).then();
        })
    }

    const sendJSEP = () => {
        generateSdp().then(offerSdp => {
            console.log(offerSdp)
            axios.post(sRoutes.HOST + sRoutes.janusPostJsep, {
                offerSdp
            })
                .then(res => console.log(res))
                .catch(err => console.log(err));
        })
    }

    const pauseVideo = () => {
        const video = document.getElementsByClassName('local-video')[0];
        video.pause();
    }

    return <div className='join-component'>
        <div>join</div>
        {/*<video className='local-video'/>
        <div><button onClick={getRooms}>Get rooms as logged user</button></div>
        <div><button onClick={connectJanus}>Connect to Janus</button></div>
        <div><button onClick={attachJanusPlugin}>Attach VideoRoom to Janus</button></div>
        <div><button onClick={createRoomJanus}>Create VideoRoom with plugin</button></div>
        <div><button onClick={pauseVideo}>Pause Video</button>
        <button onClick={generateSdp}>Generate SDP</button>
        <button onClick={sendJSEP}>Send JSEP</button></div>*/}
    </div>
}

export default PlsStartWork;