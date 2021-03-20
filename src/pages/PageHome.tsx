import React, { createRef, useState } from 'react';
import { rtcConnection } from '../App';
import styles from '../styles/PageHome.module.scss';
import Button from '../components/Button';

const PageHome = () => {
    const [connectionId, setConnectionId] = useState<string>('');
    const videoRef = createRef<HTMLVideoElement>();

    const createConnection = async () => {
        const stream = new MediaStream();
        if (videoRef.current) videoRef.current.srcObject = stream;

        const id = await rtcConnection.offer(stream);
        console.log('Connection ID:', id);
        setConnectionId(id);
    };

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <h1 className={styles.headline}>Camera-Link</h1>
                {connectionId === '' ? (
                    <Button onClick={createConnection}>CREATE CONNECTION</Button>
                ) : (
                    <>
                        <p className={styles.idText}>{connectionId}</p>
                        <a
                            className={styles.link}
                            href={`${window.location.href}${connectionId}`}
                        >{`${window.location.href}${connectionId}`}</a>
                    </>
                )}
            </section>

            <video ref={videoRef} muted={true} autoPlay={true} playsInline={true} className={styles.video} />
        </main>
    );
};

export default PageHome;
