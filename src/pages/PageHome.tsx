import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import { rtcConnection } from '../App';
import styles from '../styles/PageHome.module.scss';

const PageHome = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentStream, setCurrentStream] = useState<MediaStream>(new MediaStream());
    const [connectionId, setConnectionId] = useState<string>('');

    useEffect(() => {
        const stream = new MediaStream();
        setCurrentStream(stream);

        rtcConnection.offer(stream).then(id => {
            console.log('Connection ID:', id);
            setConnectionId(id);
        });

        rtcConnection.setDisconnectCallback(() => {
            console.log('Connection closed!');
            window.location.reload();
        });
    }, []);

    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = currentStream;
    }, [currentStream, videoRef]);

    const url = `${window.location.href}${connectionId}`;

    return (
        <main className={styles.page}>
            <section className={styles.container}>
                <h1 className={styles.headline}>CAMERA-LINK</h1>
                {connectionId !== '' && (
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
