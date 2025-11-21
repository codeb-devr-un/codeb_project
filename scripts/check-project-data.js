require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getDatabase, ref, get, update } = require('firebase/database')

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

async function checkProjectData() {
  const projectId = '-OVaMZnQMa-vvSJVyhAO'
  
  try {
    console.log(`프로젝트 ID ${projectId} 데이터 확인 중...`)
    
    // 프로젝트 기본 정보 확인
    const projectSnapshot = await get(ref(db, `projects/${projectId}`))
    if (projectSnapshot.exists()) {
      console.log('\n✅ 프로젝트 정보:')
      const projectData = projectSnapshot.val()
      console.log('- 이름:', projectData.name)
      console.log('- 상태:', projectData.status)
      console.log('- 시작일:', projectData.startDate)
      console.log('- 종료일:', projectData.endDate)
      console.log('- 진행률:', projectData.progress + '%')
      console.log('- 팀원:', projectData.team?.join(', '))
    } else {
      console.log('❌ 프로젝트를 찾을 수 없습니다.')
      return
    }
    
    // 태스크 확인
    const tasksSnapshot = await get(ref(db, `tasks/${projectId}`))
    if (tasksSnapshot.exists()) {
      const tasks = Object.values(tasksSnapshot.val())
      console.log(`\n✅ 태스크: ${tasks.length}개`)
      const tasksByStatus = {}
      tasks.forEach(task => {
        tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1
      })
      console.log('- 상태별:', JSON.stringify(tasksByStatus, null, 2))
    } else {
      console.log('\n❌ 태스크가 없습니다.')
    }
    
    // 칸반 컬럼 확인
    const kanbanSnapshot = await get(ref(db, `kanban/${projectId}/columns`))
    if (kanbanSnapshot.exists()) {
      const columns = kanbanSnapshot.val()
      console.log(`\n✅ 칸반 컬럼: ${columns.length}개`)
      columns.forEach(col => console.log(`- ${col.title} (${col.id})`))
    } else {
      console.log('\n❌ 칸반 컬럼이 없습니다.')
    }
    
    // 마일스톤 확인
    const milestonesSnapshot = await get(ref(db, `projects/${projectId}/milestones`))
    if (milestonesSnapshot.exists()) {
      const milestones = Object.values(milestonesSnapshot.val())
      console.log(`\n✅ 마일스톤: ${milestones.length}개`)
      milestones.forEach(m => console.log(`- ${m.title} (${m.date})`))
    } else {
      console.log('\n❌ 마일스톤이 없습니다.')
    }
    
    // 활동 로그 확인
    const activitiesSnapshot = await get(ref(db, `activities/${projectId}`))
    if (activitiesSnapshot.exists()) {
      const activities = Object.values(activitiesSnapshot.val())
      console.log(`\n✅ 활동 로그: ${activities.length}개`)
    } else {
      console.log('\n❌ 활동 로그가 없습니다.')
    }
    
  } catch (error) {
    console.error('오류 발생:', error)
  }
  
  process.exit(0)
}

checkProjectData()