import './DocumentContainer.css';
import React, {useEffect, useState} from 'react';
import axios from "axios";
import etherpad_api from 'etherpad-lite-client';

const DocumentContainer = () => {

    const padHost = 'http://0.0.0.0:9001/';
    const [etherpad, setEtherpad] = useState(null)
    const [groupID, setGroupID] = useState(undefined);

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

    return <div>
        <p>Online doc</p>
        <p>Doc {etherpad ? 'connected' : 'not connected'}</p>
    </div>
}

export default DocumentContainer;