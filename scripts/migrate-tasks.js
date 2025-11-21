require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getDatabase, ref, get, set, remove } = require('firebase/database')

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

async function migrateTasks() {
  const projectId = '-OVaMZnQMa-vvSJVyhAO'
  
  try {
    console.log('태스크 마이그레이션 시작...\n')
    
    // 1. 기존 경로에서 태스크 가져오기
    const oldTasksSnapshot = await get(ref(db, `tasks/${projectId}`))
    if (!oldTasksSnapshot.exists()) {
      console.log('기존 경로에 태스크가 없습니다.')
      return
    }
    
    const oldTasks = oldTasksSnapshot.val()
    console.log(`기존 경로에서 ${Object.keys(oldTasks).length}개의 태스크를 발견했습니다.`)
    
    // 2. 새로운 경로의 기존 데이터 삭제
    await remove(ref(db, `projects/${projectId}/tasks`))
    console.log('새로운 경로의 기존 데이터를 삭제했습니다.')
    
    // 3. 태스크를 새로운 경로로 복사
    const tasksRef = ref(db, `projects/${projectId}/tasks`)
    await set(tasksRef, oldTasks)
    console.log(`${Object.keys(oldTasks).length}개의 태스크를 새로운 경로로 복사했습니다.`)
    
    // 4. 검증
    const newTasksSnapshot = await get(ref(db, `projects/${projectId}/tasks`))
    if (newTasksSnapshot.exists()) {
      const newTasks = Object.values(newTasksSnapshot.val())
      console.log('\n✅ 마이그레이션 완료!')
      console.log('첫 번째 태스크 예시:', newTasks[0])
    }
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
  
  process.exit(0)
}

migrateTasks()