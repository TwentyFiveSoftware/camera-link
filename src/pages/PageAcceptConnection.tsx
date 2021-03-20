import React, { createRef } from 'react';
import { useParams } from 'react-router-dom';
import { rtcConnection } from '../App';
import styles from '../styles/PageAcceptConnection.module.scss';
import Button from '../components/Button';

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
        <main className={styles.page}>
            <section className={styles.container}>
                <Button onClick={() => acceptConnection(connectionId)}>Accept Connection</Button>
            </section>

            <video ref={videoRef} muted={true} autoPlay={true} playsInline={true} className={styles.video} />
        </main>
    );
};

export default PageAcceptConnection;
