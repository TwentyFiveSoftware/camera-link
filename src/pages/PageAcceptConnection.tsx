import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { rtcConnection } from '../App';
import styles from '../styles/PageAcceptConnection.module.scss';
import Button from '../components/Button';

const PageAcceptConnection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { connectionId } = useParams<{ connectionId: string }>();
    const [currentCameraDeviceIndex, setCurrentCameraDeviceIndex] = useState<number>(0);
    const [currentStream, setCurrentStream] = useState<MediaStream>(new MediaStream());

    const streamCamera = async (deviceIndex: number = currentCameraDeviceIndex) => {
        const deviceId = (await navigator.mediaDevices.enumerateDevices())
            .filter(device => device.kind === 'videoinput')
            .reverse()[deviceIndex].deviceId;

        currentStream.getTracks().forEach(track => track.stop());

        const stream = await navigator.mediaDevices
            .getUserMedia({ video: { deviceId } })
            .catch((e: Error) => alert(`Error accessing camera!\n(${e.name}: ${e.message})`));

        if (!stream) return;

        setCurrentStream(stream);

        if (rtcConnection.isConnectionEstablished()) {
            await rtcConnection.changeTracks(stream);
            return;
        }

        const successful = await rtcConnection.answer(connectionId, stream);
        if (!successful) alert('Something went wrong!');
    };

    const cycleCamera = async () => {
        const devices = (await navigator.mediaDevices.enumerateDevices())
            .reverse()
            .filter(device => device.kind === 'videoinput')
            .map(device => device.deviceId);

        if (devices.length <= 1) return;

        const newIndex = (currentCameraDeviceIndex + 1) % devices.length;
        setCurrentCameraDeviceIndex(newIndex);
        await streamCamera(newIndex);
    };

    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = currentStream;
    }, [currentStream, videoRef]);

    return (
        <main className={styles.page}>
            {currentStream.getTracks().length === 0 ? (
                <section className={styles.container}>
                    <Button onClick={() => streamCamera()}>STREAM CAMERA</Button>
                </section>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        muted={true}
                        autoPlay={true}
                        playsInline={true}
                        className={styles.video}
                        onClick={cycleCamera}
                    />
                </>
            )}
        </main>
    );
};

export default PageAcceptConnection;
