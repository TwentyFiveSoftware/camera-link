import React, { createRef } from 'react';
import { rtcConnection } from '../App';

const PageHome = () => {
    const videoRef = createRef<HTMLVideoElement>();

    const createConnection = async () => {
        const stream = new MediaStream();
        if (videoRef.current) videoRef.current.srcObject = stream;

        const id = await rtcConnection.offer(stream);
        console.log('Connection ID:', id);
    };

    return (
        <div>
            <h1>Camera-Link</h1>
            <button onClick={() => createConnection()}>Create Connection</button>

            <video ref={videoRef} muted={true} autoPlay={true} playsInline={true} />
        </div>
    );
};

export default PageHome;
