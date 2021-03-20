import React, { createRef, useState } from 'react';
import RTCConnection from './models/RTCConnection';

const App = () => {
    const [rtcConnection] = useState<RTCConnection>(new RTCConnection());
    const videoRef = createRef<HTMLVideoElement>();

    const createConnection = async () => {
        const stream = new MediaStream();
        if (videoRef.current) videoRef.current.srcObject = stream;

        const id = await rtcConnection.offer(stream);
        console.log('Connection ID:', id);
    };

    const acceptConnection = async (connectionId: string) => {
        const stream = await navigator.mediaDevices
            .getUserMedia({ video: true })
            .catch(e => console.log('Error accessing camera!', e));

        if (!stream) return;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const successful = await rtcConnection.answer(connectionId, stream);
        console.log(successful);
    };

    console.log('RENDER');

    return (
        <div>
            <h1>Camera-Link</h1>
            <button onClick={() => createConnection()}>Create Connection</button>
            <button onClick={() => acceptConnection(prompt('Connection ID') ?? '')}>Accept Connection</button>

            <video ref={videoRef} muted={true} autoPlay={true} playsInline={true} />
        </div>
    );
};

export default App;
