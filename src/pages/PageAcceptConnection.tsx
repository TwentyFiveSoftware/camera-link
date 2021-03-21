import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { rtcConnection } from '../App';
import styles from '../styles/PageAcceptConnection.module.scss';
import Button from '../components/Button';

type Resolution = {
    width: { ideal: number };
    height: { ideal: number };
};

const RESOLUTION = {
    UHD: { width: { ideal: 3840 }, height: { ideal: 2160 } },
    WQHD: { width: { ideal: 2560 }, height: { ideal: 1440 } },
    FHD: { width: { ideal: 1920 }, height: { ideal: 1080 } },
    HD: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

const PageAcceptConnection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { connectionId } = useParams<{ connectionId: string }>();
    const [currentCameraDeviceIndex, setCurrentCameraDeviceIndex] = useState<number>(0);
    const [currentStream, setCurrentStream] = useState<MediaStream>(new MediaStream());
    const [currentResolution, setCurrentResolution] = useState<Resolution>(RESOLUTION.HD);

    const streamCamera = async (
        resolution: Resolution = currentResolution,
        deviceIndex: number = currentCameraDeviceIndex,
    ) => {
        if (currentResolution !== resolution) setCurrentResolution(resolution);
        console.log('Resolution:', resolution);

        const deviceId = (await navigator.mediaDevices.enumerateDevices())
            .filter(device => device.kind === 'videoinput')
            .reverse()[deviceIndex]?.deviceId;

        currentStream.getTracks().forEach(track => track.stop());

        const stream = await navigator.mediaDevices
            .getUserMedia({ video: { deviceId, ...resolution } })
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
        await streamCamera(currentResolution, newIndex);
    };

    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = currentStream;
    }, [currentStream, videoRef]);

    return (
        <main className={styles.page}>
            {currentStream.getTracks().length === 0 ? (
                <section className={styles.container}>
                    <Button onClick={() => streamCamera(RESOLUTION.UHD)}>STREAM CAMERA (UHD / 4k)</Button>
                    <Button onClick={() => streamCamera(RESOLUTION.WQHD)}>STREAM CAMERA (WQHD)</Button>
                    <Button onClick={() => streamCamera(RESOLUTION.FHD)}>STREAM CAMERA (Full HD)</Button>
                    <Button onClick={() => streamCamera(RESOLUTION.HD)}>STREAM CAMERA (HD)</Button>
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
