import React, { useState } from 'react';
import RTCConnection from './models/RTCConnection';

const App = () => {
    const [rtcConnection] = useState<RTCConnection>(new RTCConnection());

    const createConnection = async () => {
        const id = await rtcConnection.offer();
        console.log('Connection ID:', id);
    };

    const acceptConnection = async (connectionId: string) => {
        const successful = await rtcConnection.answer(connectionId);
        console.log(successful);
    };

    return (
        <div>
            <h1>Camera-Link</h1>
            <button onClick={() => createConnection()}>Create Connection</button>
            <button onClick={() => acceptConnection(prompt('Connection ID') ?? '')}>Accept Connection</button>
        </div>
    );
};

export default App;
