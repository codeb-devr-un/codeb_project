import { storage, database } from '@/lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { ref as dbRef, push, set, get, remove, query, orderByChild, equalTo } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import logger from '@/utils/logger'

export interface FileMetadata {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
  projectId?: string
  uploadedBy: string
  uploadedByName: string
  category: 'document' | 'image' | 'video' | 'other'
  createdAt: string
}

class FileService {
  // 파일 카테고리 판별
  private getFileCategory(type: string): FileMetadata['category'] {
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document'
    return 'other'
  }

  // 파일 업로드
  async uploadFiles(
    files: File[], 
    userId: string, 
    userName: string,
    projectId?: string
  ): Promise<FileMetadata[]> {
    const uploadedFiles: FileMetadata[] = []

    for (const file of files) {
      try {
        // 고유한 파일명 생성
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = projectId 
          ? `projects/${projectId}/${fileName}`
          : `files/${userId}/${fileName}`

        // Firebase Storage에 업로드
        const fileRef = storageRef(storage, filePath)
        const snapshot = await uploadBytes(fileRef, file)
        
        // 다운로드 URL 가져오기
        const downloadURL = await getDownloadURL(snapshot.ref)

        // 파일 메타데이터 생성
        const metadata: Omit<FileMetadata, 'id'> = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          path: filePath,
          projectId,
          uploadedBy: userId,
          uploadedByName: userName,
          category: this.getFileCategory(file.type),
          createdAt: new Date().toISOString()
        }

        // Firebase Database에 메타데이터 저장
        const filesRef = dbRef(database, 'files')
        const newFileRef = push(filesRef)
        await set(newFileRef, metadata)

        uploadedFiles.push({
          id: newFileRef.key!,
          ...metadata
        })

        // 프로젝트가 있는 경우 프로젝트 활동에도 기록
        if (projectId) {
          const activityRef = dbRef(database, `projectActivities/${projectId}`)
          const newActivityRef = push(activityRef)
          await set(newActivityRef, {
            type: 'file',
            message: `${file.name} 파일을 업로드했습니다`,
            user: userName,
            timestamp: new Date().toISOString(),
            icon: '📎'
          })
        }
      } catch (error) {
        logger.error(`Error uploading file ${file.name}`, 'FileService', error)
        throw error
      }
    }

    return uploadedFiles
  }

  // 파일 목록 조회
  async getFiles(projectId?: string): Promise<FileMetadata[]> {
    const filesRef = dbRef(database, 'files')
    
    let snapshot
    if (projectId) {
      // 특정 프로젝트의 파일만 조회
      const projectQuery = query(filesRef, orderByChild('projectId'), equalTo(projectId))
      snapshot = await get(projectQuery)
    } else {
      // 전체 파일 조회
      snapshot = await get(filesRef)
    }

    if (!snapshot.exists()) return []

    const files: FileMetadata[] = []
    snapshot.forEach((child) => {
      files.push({
        id: child.key!,
        ...child.val()
      })
    })

    // 최신 순으로 정렬
    return files.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // 파일 삭제
  async deleteFile(fileId: string): Promise<void> {
    try {
      // 파일 메타데이터 조회
      const fileRef = dbRef(database, `files/${fileId}`)
      const snapshot = await get(fileRef)
      
      if (!snapshot.exists()) {
        throw new Error('파일을 찾을 수 없습니다.')
      }

      const fileData = snapshot.val() as FileMetadata
      
      // Storage에서 파일 삭제
      const storageFileRef = storageRef(storage, fileData.path)
      await deleteObject(storageFileRef)
      
      // Database에서 메타데이터 삭제
      await remove(fileRef)

      // 프로젝트 활동 기록
      if (fileData.projectId) {
        const activityRef = dbRef(database, `projectActivities/${fileData.projectId}`)
        const newActivityRef = push(activityRef)
        await set(newActivityRef, {
          type: 'file',
          message: `${fileData.name} 파일을 삭제했습니다`,
          user: fileData.uploadedByName,
          timestamp: new Date().toISOString(),
          icon: '🗑️'
        })
      }
    } catch (error) {
      logger.error('Error deleting file', 'FileService', error)
      throw error
    }
  }

  // 다운로드 이력 기록
  async recordDownload(fileId: string, userId: string, userName: string): Promise<void> {
    const downloadRef = dbRef(database, 'downloadHistory')
    const newDownloadRef = push(downloadRef)
    
    await set(newDownloadRef, {
      fileId,
      downloadedBy: userId,
      downloadedByName: userName,
      downloadedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }
}

export default new FileService()