import './VideoComponent.css';
import React, {useEffect, useRef, useState} from "react";
//import {useEffect, useRef, useState} from "react";
//import axios from 'axios';
//import Janus from 'janus-gateway-js';

const VideoComponent = ({userInfo, userId, stream, muted, streaming, publishMedia, unpublishMedia}) => {


    const videoRef = useRef(null);
    const [published,setPublished] = useState(false);
    const [paused,setPaused] = useState(false);

    const onPublish = () => {
        if(published){
            setPublished(false);
            unpublishMedia();
        } else {
            setPublished(true);
            publishMedia();
        }
    }

    const onPause = () => {
        if(paused){
            setPaused(false);
            playVideo();
        } else {
            setPaused(true);
            pauseVideo();
        }
    }

    const pauseVideo = () => {
        //const video = document.getElementsByClassName('user-video')[0];
        const video = videoRef.current
        video.pause();
    }

    const playVideo = () => {
        //const video = document.getElementsByClassName('user-video')[0];
        const video = videoRef.current
        const promise = video.play();
        promise.then(res => {})
            .catch(err => console.log(err))
    }

    useEffect(() => {
        //const video = document.getElementsByClassName('user-video')[0];
        const video = videoRef.current
        console.log('video-component effect')
        console.log(userId)
        console.log(stream);
        if(!stream){
            video.autoplay = true;
            video.playsInline = true;
            video.muted = muted;
            video.streaming = streaming;
            video.srcObject = null;
        }
        else {
            video.srcObject = stream;
        }
    }, [stream, muted, streaming])

    return <div className='video-component'>
        <div className='user-name'>{userInfo.nickname}-{userId}</div>
        <video className='user-video' ref={videoRef}/>
        <div className='user-video-buttons'>
            {published && <div className='user-button' onClick={onPublish}>Unpublish Media</div>}
            {!published && <div className='user-button' onClick={onPublish}>Publish Media</div>}
            {paused && <div className='user-button' onClick={onPause}>Unmute</div>}
            {!paused && <div className='user-button' onClick={onPause}>Mute</div>}
        </div>
    </div>
};

export default VideoComponent;