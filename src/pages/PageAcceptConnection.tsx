import React, { createRef } from 'react';
import { useParams } from 'react-router-dom';
import { rtcConnection } from '../App';

const PageAcceptConnection = () => {
    const videoRef = createRef<HTMLVideoElement>();
    const { connectionId } = useParams<{ connectionId: string }>();

    const acceptConnection = async (connectionId: string) => {
        const stream = await navigator.mediaDevices
            .getUserMedia({ video: true })
            .catch(e => console.log('Error accessing camera!', e));

        if (!stream) return;
        if (videoRef.current) videoRef.current.srcObject = stream;

        const successful = await rtcConnection.answer(connectionId, stream);
        console.log(successful);
    };

    return (
        <div>
            <button onClick={() => acceptConnection(connectionId)}>Accept Connection</button>
            <video ref={videoRef} muted={true} autoPlay={true} playsInline={true} />
        </div>
    );
};

export default PageAcceptConnection;
