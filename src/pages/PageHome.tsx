import React, { createRef, useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
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

    useEffect(() => {
        rtcConnection.setDisconnectCallback(() => {
            console.log('Connection closed!');
            window.location.reload();
        });
    }, []);

    const url = `${window.location.href}${connectionId}`;

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <h1 className={styles.headline}>CAMERA-LINK</h1>
                {connectionId === '' ? (
                    <Button onClick={createConnection}>CREATE CONNECTION</Button>
                ) : (
                    <>
                        <QRCode value={url} size={250} bgColor={'#00000000'} fgColor={'#83A868'} />
                        <p className={styles.idText}>{connectionId}</p>
                        <a className={styles.link} href={url}>
                            {url}
                        </a>
                    </>
                )}
            </section>

            <video ref={videoRef} muted={true} autoPlay={true} playsInline={true} className={styles.video} />
        </main>
    );
};

export default PageHome;
