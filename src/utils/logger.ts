/**
 * 중앙 집중식 로깅 시스템
 * 프로덕션 환경에서는 console.log를 비활성화하고
 * 개발 환경에서만 로깅을 수행합니다.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data
    };

    // 로그 히스토리에 추가
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // 개발 환경에서만 콘솔 출력
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : '';
      const timestamp = new Date().toISOString();
      
      switch (level) {
        case 'debug':
          console.debug(`[DEBUG] ${timestamp} ${prefix}`, message, data || '');
          break;
        case 'info':
          console.info(`[INFO] ${timestamp} ${prefix}`, message, data || '');
          break;
        case 'warn':
          console.warn(`[WARN] ${timestamp} ${prefix}`, message, data || '');
          break;
        case 'error':
          console.error(`[ERROR] ${timestamp} ${prefix}`, message, data || '');
          break;
      }
    }

    // 프로덕션 환경에서는 에러만 외부 서비스로 전송
    if (!this.isDevelopment && level === 'error') {
      this.sendToErrorTracking(entry);
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any) {
    this.log('error', message, context, data);
  }

  // 로그 히스토리 조회
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  // 로그 히스토리 초기화
  clearHistory() {
    this.logHistory = [];
  }

  // 프로덕션 환경에서 에러 추적 서비스로 전송
  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Sentry, LogRocket 등의 에러 추적 서비스 연동
    // 현재는 플레이스홀더로 남겨둠
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(entry.message), {
        level: 'error',
        extra: {
          context: entry.context,
          data: entry.data,
          timestamp: entry.timestamp
        }
      });
    }
  }
}

// 싱글톤 인스턴스
const logger = new Logger();

export default logger;