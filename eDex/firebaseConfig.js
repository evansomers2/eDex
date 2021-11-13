import * as firebase from 'firebase';
import '@firebase/firestore';

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBN_MNmu9C-gE5EUX0Ni81iCHseASAOrk4",
    authDomain: "edex-evansomers.firebaseapp.com",
    databaseURL: "https://edex-evansomers-default-rtdb.firebaseio.com/",
    projectId: "edex-evansomers",
    storageBucket: "edex-evansomers.appspot.com",
    messagingSenderId: "720018002669",
    appId: "1:720018002669:web:50f77ca202db87eaac32e4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let app;
if (!firebase.apps.length) {
    app = firebase.initializeApp({});
} else {
    app = firebase.app(); // if already initialized, use that one
}

export const db = app.database();
export const firestore = firebase.firestore(app);
export const auth = app.auth();