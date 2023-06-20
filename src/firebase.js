import { initializeApp } from 'firebase/app'
import { getDatabase, ref } from 'firebase/database'
// ... other firebase imports


// see https://jsmobiledev.com/article/hide-firebase-api/ on why it is not a security risk to expose these credentials
export const firebaseApp = initializeApp({
  // your application settings
  apiKey: "AIzaSyBSLibHkymxkkXk2b1GdSUMfXPPW6ZyncA",
  authDomain: "ccc-app-efd90.firebaseapp.com",
  databaseURL: "https://ccc-app-efd90-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ccc-app-efd90",
  storageBucket: "ccc-app-efd90.appspot.com",
  messagingSenderId: "336065373302",
  appId: "1:336065373302:web:6dafcbb5dc724c3cdfab57"
})

export const db = getDatabase()
export const dbRef = ref(db)