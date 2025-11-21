require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getDatabase, ref, get } = require('firebase/database')

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

async function checkDBStructure() {
  const projectId = '-OVaMZnQMa-vvSJVyhAO'
  
  try {
    console.log('데이터베이스 구조 확인 중...\n')
    
    // 1. projects/${projectId}/tasks 확인
    const projectTasksSnapshot = await get(ref(db, `projects/${projectId}/tasks`))
    console.log(`1. projects/${projectId}/tasks: ${projectTasksSnapshot.exists() ? '존재 ✅' : '없음 ❌'}`)
    if (projectTasksSnapshot.exists()) {
      console.log(`   - 태스크 수: ${Object.keys(projectTasksSnapshot.val()).length}`)
    }
    
    // 2. tasks/${projectId} 확인
    const tasksSnapshot = await get(ref(db, `tasks/${projectId}`))
    console.log(`\n2. tasks/${projectId}: ${tasksSnapshot.exists() ? '존재 ✅' : '없음 ❌'}`)
    if (tasksSnapshot.exists()) {
      console.log(`   - 태스크 수: ${Object.keys(tasksSnapshot.val()).length}`)
      const firstTask = Object.values(tasksSnapshot.val())[0]
      console.log('   - 첫 번째 태스크 구조:', Object.keys(firstTask))
    }
    
    // 3. projects/${projectId}/kanbanColumns 확인
    const projectKanbanSnapshot = await get(ref(db, `projects/${projectId}/kanbanColumns`))
    console.log(`\n3. projects/${projectId}/kanbanColumns: ${projectKanbanSnapshot.exists() ? '존재 ✅' : '없음 ❌'}`)
    
    // 4. kanban/${projectId}/columns 확인
    const kanbanSnapshot = await get(ref(db, `kanban/${projectId}/columns`))
    console.log(`\n4. kanban/${projectId}/columns: ${kanbanSnapshot.exists() ? '존재 ✅' : '없음 ❌'}`)
    if (kanbanSnapshot.exists()) {
      const columns = kanbanSnapshot.val()
      console.log(`   - 컬럼 수: ${Array.isArray(columns) ? columns.length : Object.keys(columns).length}`)
      console.log('   - 컬럼 구조:', columns)
    }
    
    // 5. activities/${projectId} 확인
    const activitiesSnapshot = await get(ref(db, `activities/${projectId}`))
    console.log(`\n5. activities/${projectId}: ${activitiesSnapshot.exists() ? '존재 ✅' : '없음 ❌'}`)
    
    // 6. projectActivities/${projectId} 확인
    const projectActivitiesSnapshot = await get(ref(db, `projectActivities/${projectId}`))
    console.log(`\n6. projectActivities/${projectId}: ${projectActivitiesSnapshot.exists() ? '존재 ✅' : '없음 ❌'}`)
    
    console.log('\n\n💡 권장사항:')
    console.log('- 태스크: tasks/${projectId} → projects/${projectId}/tasks로 이동')
    console.log('- 칸반: kanban/${projectId}/columns → projects/${projectId}/kanbanColumns로 이동')
    console.log('- 활동: activities/${projectId} → projectActivities/${projectId}로 이동')
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
  
  process.exit(0)
}

checkDBStructure()