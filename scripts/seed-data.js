const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set, push } = require('firebase/database');
require('dotenv').config({ path: '../.env.local' });

// Firebase 설정 - 환경 변수에서 가져오기
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 설정 검증
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error('Firebase 설정이 누락되었습니다. .env.local 파일을 확인해주세요.');
  console.error('필요한 환경 변수:');
  console.error('- NEXT_PUBLIC_FIREBASE_API_KEY');
  console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  console.error('- NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  process.exit(1);
}

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

async function seedData() {
  try {
    // 관리자로 로그인 - 환경 변수 사용
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@codeb.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('\n⚠️  관리자 비밀번호가 설정되지 않았습니다.');
      console.error('.env.local 파일에 다음을 추가해주세요:');
      console.error('SEED_ADMIN_EMAIL=admin@codeb.com');
      console.error('SEED_ADMIN_PASSWORD=your-secure-password\n');
      process.exit(1);
    }
    
    console.log(`Logging in as admin (${adminEmail})...`);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    // 샘플 프로젝트 데이터
    const projects = {
      'project1': {
        id: 'project1',
        name: '쇼핑몰 웹사이트 개발',
        description: '이커머스 플랫폼 구축 프로젝트',
        status: 'in_progress',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        budget: 50000000,
        progress: 45,
        completedTasks: 12,
        activeTasks: 8,
        totalTasks: 30,
        members: ['admin@codeb.com', 'developer@codeb.com'],
        createdAt: new Date().toISOString()
      },
      'project2': {
        id: 'project2',
        name: '모바일 앱 개발',
        description: 'iOS/Android 하이브리드 앱 개발',
        status: 'in_progress',
        startDate: '2025-02-01',
        endDate: '2025-05-31',
        budget: 35000000,
        progress: 20,
        completedTasks: 5,
        activeTasks: 10,
        totalTasks: 40,
        members: ['developer@codeb.com'],
        createdAt: new Date().toISOString()
      },
      'project3': {
        id: 'project3',
        name: 'CRM 시스템 구축',
        description: '고객 관리 시스템 개발',
        status: 'completed',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        budget: 60000000,
        progress: 100,
        completedTasks: 35,
        activeTasks: 0,
        totalTasks: 35,
        members: ['admin@codeb.com', 'developer@codeb.com'],
        createdAt: '2024-10-01T00:00:00.000Z'
      }
    };

    console.log('Creating sample projects...');
    await set(ref(database, 'projects'), projects);
    console.log('✅ Projects created');

    // 샘플 활동 데이터
    const activities = {};
    const activityTypes = [
      { type: 'project', icon: '📁', actions: ['생성했습니다', '업데이트했습니다', '완료했습니다'] },
      { type: 'task', icon: '✅', actions: ['작업을 시작했습니다', '작업을 완료했습니다', '작업을 할당했습니다'] },
      { type: 'message', icon: '💬', actions: ['메시지를 보냈습니다', '채팅방에 참여했습니다'] },
      { type: 'file', icon: '📎', actions: ['파일을 업로드했습니다', '파일을 다운로드했습니다'] }
    ];

    // 최근 활동 생성
    for (let i = 0; i < 20; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const action = activityType.actions[Math.floor(Math.random() * activityType.actions.length)];
      const activityId = `activity${i + 1}`;
      
      activities[activityId] = {
        id: activityId,
        type: activityType.type,
        icon: activityType.icon,
        title: `${activityType.type === 'project' ? '프로젝트' : 
                activityType.type === 'task' ? '작업' :
                activityType.type === 'message' ? '메시지' : '파일'} ${action}`,
        description: `${['쇼핑몰 웹사이트 개발', '모바일 앱 개발', 'CRM 시스템 구축'][Math.floor(Math.random() * 3)]}`,
        time: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        userId: auth.currentUser.uid
      };
    }

    console.log('Creating sample activities...');
    await set(ref(database, 'activities'), activities);
    console.log('✅ Activities created');

    // 샘플 알림 데이터
    const notifications = {};
    const notificationTemplates = [
      { type: 'info', title: '새로운 프로젝트', message: '새 프로젝트가 할당되었습니다' },
      { type: 'success', title: '작업 완료', message: '할당된 작업이 완료되었습니다' },
      { type: 'warning', title: '마감일 임박', message: '프로젝트 마감일이 3일 남았습니다' },
      { type: 'error', title: '예산 초과', message: '프로젝트 예산이 90%를 초과했습니다' },
      { type: 'info', title: '새 메시지', message: '읽지 않은 메시지가 있습니다' }
    ];

    for (let i = 0; i < 15; i++) {
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      const notificationId = `notification${i + 1}`;
      
      notifications[notificationId] = {
        id: notificationId,
        type: template.type,
        title: template.title,
        message: template.message,
        time: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)).toISOString(),
        read: Math.random() > 0.5
      };
    }

    console.log('Creating sample notifications...');
    await set(ref(database, `notifications/${auth.currentUser.uid}`), notifications);
    console.log('✅ Notifications created');

    // 샘플 재무 데이터
    const financialData = {
      totalRevenue: 145000000,
      monthlyRevenue: 25000000,
      yearlyRevenue: 145000000,
      expenses: 85000000,
      profit: 60000000,
      lastUpdated: new Date().toISOString()
    };

    console.log('Creating financial data...');
    await set(ref(database, 'financial'), financialData);
    console.log('✅ Financial data created');

    // 샘플 채팅방 데이터
    const chatRooms = {
      'room1': {
        id: 'room1',
        name: '일반 문의',
        participants: [auth.currentUser.uid],
        lastMessage: '안녕하세요, 도움이 필요하신가요?',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString()
      },
      'room2': {
        id: 'room2',
        name: '프로젝트 상담',
        participants: [auth.currentUser.uid],
        lastMessage: '프로젝트 진행 상황을 확인하고 싶습니다',
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 2,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    };

    console.log('Creating chat rooms...');
    await set(ref(database, 'chatRooms'), chatRooms);
    console.log('✅ Chat rooms created');

    // 샘플 메시지 데이터
    const messages = {
      'room1': {
        'msg1': {
          id: 'msg1',
          senderId: auth.currentUser.uid,
          senderName: '관리자',
          message: '안녕하세요, 도움이 필요하신가요?',
          timestamp: new Date().toISOString(),
          read: true
        }
      },
      'room2': {
        'msg1': {
          id: 'msg1',
          senderId: 'customer123',
          senderName: '고객님',
          message: '프로젝트 진행 상황을 확인하고 싶습니다',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        'msg2': {
          id: 'msg2',
          senderId: 'customer123',
          senderName: '고객님',
          message: '빠른 답변 부탁드립니다',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: false
        }
      }
    };

    console.log('Creating messages...');
    await set(ref(database, 'messages'), messages);
    console.log('✅ Messages created');

    console.log('\n🎉 All sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();