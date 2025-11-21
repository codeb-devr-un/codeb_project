require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getDatabase, ref, push, set } = require('firebase/database')

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

async function addTestActivity() {
  const projectId = '-OVaMZnQMa-vvSJVyhAO'
  
  try {
    const activityRef = ref(db, `projectActivities/${projectId}`)
    const newActivityRef = push(activityRef)
    
    await set(newActivityRef, {
      type: 'test',
      message: '테스트 활동 로그를 추가했습니다',
      user: '시스템',
      timestamp: new Date().toISOString(),
      icon: '🧪'
    })
    
    console.log('✅ 테스트 활동 로그가 추가되었습니다.')
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
  
  process.exit(0)
}

addTestActivity()