import { initializeApp } from 'firebase/app'
import { getDatabase, ref } from 'firebase/database'
// ... other firebase imports

// see https://jsmobiledev.com/article/hide-firebase-api/ on why it is not a security risk to expose these credentials
export const firebaseApp = initializeApp({
  // your application settings
  apiKey: 'AIzaSyC12UR2W055s_YTiSN4Qq26_SkGeXY7l-o',
  authDomain: 'speelmee-bed3e.firebaseapp.com',
  databaseURL: 'https://speelmee-bed3e-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'speelmee-bed3e',
  storageBucket: 'speelmee-bed3e.appspot.com',
  messagingSenderId: '1092615279012',
  appId: '1:1092615279012:web:221ab82922c83c831d3131',
})

export const db = getDatabase()
export const dbRef = ref(db)
