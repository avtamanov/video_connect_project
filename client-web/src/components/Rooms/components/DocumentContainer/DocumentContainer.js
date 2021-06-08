import './DocumentContainer.css';
import React, {useEffect, useState} from 'react';
import axios from "axios";
import etherpad_api from 'etherpad-lite-client';

const DocumentContainer = ({room, routes}) => {

    const padHost = 'http://0.0.0.0:9001/';
    const [etherpad, setEtherpad] = useState(null)
    const [groupID, setGroupID] = useState(undefined);
    const [showDoc, setShowDoc] = useState(true);

    useEffect(()=>{
        setEtherpad(etherpadInit());
    }, [])

    useEffect(()=>{
        if(etherpad){
            etherpad.createGroup((error, data) => {
                if(error) console.error('Error creating group: ' + error.message)
                else console.log('New group created: ' + data.groupID)
            });

        }
    }, [etherpad])

    const etherpadInit = () => {
        const etherpad = etherpad_api.connect({
            apikey: 'apikey',
            host: 'localhost',
            port: 9001,
        });
        console.log(etherpad)
        return etherpad;
    }

    const onDocConnect = () => {
        console.log(room)
        window.open('http://'+routes.HOST + routes.docs + '/p/' + room.roomid);
    }

    return <div>
        <p onClick={()=>{setShowDoc(!showDoc)}}>Online doc: {showDoc ? 'hide' : 'show'}</p>
        {showDoc && <div style={{display: 'flex', alignItems: 'center'}}>
            <p>Doc {etherpad ? 'connected' : 'not connected'}</p>
            <button style={{marginLeft: '5px'}} onClick={onDocConnect}>Go to Etherpad</button>
        </div>}
    </div>
}

export default DocumentContainer;