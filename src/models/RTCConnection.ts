import firebase from 'firebase/app';
import 'firebase/firestore';

if (!firebase.apps.length)
    firebase.initializeApp({
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_APP_ID,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
    });

const CONFIGURATION = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
    iceCandidatePoolSize: 10,
};

export default class RTCConnection {
    private connection: RTCPeerConnection;
    private connectionsCollectionRef: firebase.firestore.CollectionReference;

    constructor() {
        // create a new connection
        this.connection = new RTCPeerConnection(CONFIGURATION);

        // create refs for the firebase collections
        this.connectionsCollectionRef = firebase.firestore().collection('connections');
    }

    /**
     * @return returns the connection id
     */
    public async offer(): Promise<string> {
        // create a SDP offer and set as local connection description
        const offer = await this.connection.createOffer({ offerToReceiveVideo: true });
        await this.connection.setLocalDescription(offer);

        // store the SDP offer in a firestore document
        const doc = { offer: { type: offer.type, sdp: offer.sdp } };
        const connectionDocRef = await this.connectionsCollectionRef.add(doc);

        // listen for an answer
        connectionDocRef.onSnapshot(async snapshot => {
            const data = snapshot.data();

            // return if the connection has already been answered or if the document snapshot doesn't contain an answer
            if (this.connection.currentRemoteDescription || !data?.answer) return;

            // create a SDP answer from the firestore document and set it as the remote description
            const answer = new RTCSessionDescription(data.answer);
            await this.connection.setRemoteDescription(answer);
        });

        // listen for ICE candidates
        this.listenForIceCandidates(connectionDocRef.collection('candidates'));

        // return the connection id
        return connectionDocRef.id;
    }

    /**
     * @return returns whether the answer was successful
     */
    public async answer(connectionId: string): Promise<boolean> {
        const connectionDocRef = this.connectionsCollectionRef.doc(connectionId);
        const connectionDoc = await connectionDocRef.get();

        if (!connectionDoc.exists) return false;

        // get the SDP offer from the firestore document and set it as remote description
        const offer = connectionDoc.data()?.offer;
        await this.connection.setRemoteDescription(new RTCSessionDescription(offer));

        // create an SDP answer to the offer and set it as local description
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);

        // add the answer to the firestore document
        await connectionDocRef.update({ answer: { type: answer.type, sdp: answer.sdp } });

        // listen for ICE candidates
        this.listenForIceCandidates(connectionDocRef.collection('candidates'));

        return true;
    }

    private listenForIceCandidates(candidatesCollectionRef: firebase.firestore.CollectionReference): void {
        // listen for ICE candidates
        this.connection.addEventListener('icecandidate', async e => {
            if (!e.candidate) return;

            // add the candidate to the firebase connection document
            await candidatesCollectionRef.add(e.candidate.toJSON());
        });

        // listen for changes on the ICE candidate list in the firebase connection document
        candidatesCollectionRef.onSnapshot(snapshot => {
            snapshot
                .docChanges()
                .filter(change => change.type === 'added')
                .forEach(async change => {
                    // add new candidates to the connection
                    const data = change.doc.data();
                    await this.connection.addIceCandidate(new RTCIceCandidate(data));
                });
        });
    }
}
