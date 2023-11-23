import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, addDoc, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup, getAuth, getAdditionalUserInfo, setPersistence, browserLocalPersistence, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { functions } from "/assets/js/functions.mjs"

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDLpChEYY5dCFNZmfLVmdaG_sY6FRb8zSU",
    authDomain: "ashcode-cfc1b.firebaseapp.com",
    projectId: "ashcode-cfc1b",
    storageBucket: "ashcode-cfc1b.appspot.com",
    messagingSenderId: "98541478011",
    appId: "1:98541478011:web:cc94bc4a49705d035582de"
};
var user = null
const app = initializeApp(firebaseConfig);
initializeApp(firebaseConfig);
var db = getFirestore(app);
const auth = getAuth();
onAuthStateChanged(auth, newuser => {
    if (newuser !== null) {
        console.log("YIPIIE !!!!!", newuser)
        user = newuser;
        document.querySelector('#googleSignIn').classList.add("disabled")
        document.querySelector('#googleSignOut').classList.remove("disabled")
        functions.showToast(`Signed in as: ${user.displayName}`, 2500)
    }
})
document.querySelector('#googleSignIn').addEventListener('click', function () {
    const provider = new GoogleAuthProvider();
    setPersistence(auth, browserLocalPersistence)
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            user = result.user;
            console.log(user)
            functions.showToast(`<img src="${user.photoURL}"> Signed in as: ${user.displayName}`, 5000)
            document.querySelector('#googleSignIn').classList.add("disabled")
            document.querySelector('#googleSignOut').classList.remove("disabled")
        }).catch((error) => {
            console.error(error)
        });
})
document.querySelector('#googleSignOut').addEventListener('click', () => {
    signOut(auth);
    functions.showToast("Signed Out!", 2500)
    document.querySelector('#googleSignIn').classList.remove("disabled")
    document.querySelector('#googleSignOut').classList.add("disabled")
})
export async function getCloudStore() {
    console.log(user.email)
    if (typeof user == "undefined") {
        functions.showToast("Not Signed In!", 3000);
        return "error"
    }
    const ref = doc(db, "cloud", user.email)
    const snap = await getDoc(ref)
    return snap.data()
}
export async function uploadCloudStore (data) {
    if (typeof user == "undefined") {
        functions.showToast("Not Signed In!", 3000);
        return
    }
    const ref = doc(db, "cloud", user.email)
    setDoc(ref, data).catch(error => {
        functions.showToast(error)
    })
    functions.showToast("Data Uploaded!")
    return
}