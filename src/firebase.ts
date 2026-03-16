import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDGafx2ezzpIp1XuLPHf4TvQ-DgarR3Ssg",
  authDomain: "psychometric-assesement.firebaseapp.com",
  projectId: "psychometric-assesement",
  messagingSenderId: "1039915055675",
  appId: "1:1039915055675:web:f3dc4824db8a3008ccba1e"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)