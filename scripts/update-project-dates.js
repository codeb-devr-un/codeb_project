require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getDatabase, ref, update } = require('firebase/database')

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

async function updateProjectDates() {
  const projectId = '-OVaMZnQMa-vvSJVyhAO'
  
  try {
    console.log('프로젝트 날짜 업데이트 중...')
    
    // 프로젝트 기본 정보 업데이트
    await update(ref(db, `projects/${projectId}`), {
      startDate: '2025-07-03',
      createdAt: '2025-07-11T09:00:00Z'
    })
    
    console.log('✅ 프로젝트 날짜가 업데이트되었습니다.')
    console.log('- 시작일: 2025-07-03')
    console.log('- 생성일: 2025-07-11')
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
  
  process.exit(0)
}

updateProjectDates()