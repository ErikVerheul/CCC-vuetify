import { initializeApp } from 'firebase/app'
import { getDatabase, ref } from 'firebase/database'
// ... other firebase imports


// see https://jsmobiledev.com/article/hide-firebase-api/ on why it is not a security risk to expose these credentials
export const firebaseApp = initializeApp({
  // your application settings
  apiKey: "AIzaSyDxFrSzgD0jV1XQpql2n-6gmUI-ZMABZ4k",
  authDomain: "speelmee-app.firebaseapp.com",
  databaseURL: "https://speelmee-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "speelmee-app",
  storageBucket: "speelmee-app.appspot.com",
  messagingSenderId: "602830233476",
  appId: "1:602830233476:web:e81b5c6ca2b813816587d1"
})

export const db = getDatabase()
export const dbRef = ref(db)