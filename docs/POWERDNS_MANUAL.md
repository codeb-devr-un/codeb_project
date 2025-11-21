# PowerDNS 운영 매뉴얼

## 📋 목차
1. [서버 정보](#서버-정보)
2. [기본 명령어](#기본-명령어)
3. [DNS 레코드 관리](#dns-레코드-관리)
4. [도메인 관리](#도메인-관리)
5. [문제 해결](#문제-해결)
6. [보안 설정](#보안-설정)

## 서버 정보

### 접속 정보
```bash
# SSH 접속
ssh root@141.164.60.51

# 서버 사양
- OS: Ubuntu 22.04.5 LTS
- PowerDNS Version: 4.7.5
- Backend: PostgreSQL
- API Port: 8081
- DNS Port: 53
```

### PowerDNS 설정 파일
```bash
# 메인 설정 파일
/etc/powerdns/pdns.conf

# 주요 설정 내용
- Database: powerdns
- DB User: powerdns
- API Key: 20a89ca50a07cc62fa383091ac551e057ab1044dd247480002b5c4a40092eed5
- Web Server: http://141.164.60.51:8081
```

## 기본 명령어

### 서비스 관리
```bash
# 서비스 상태 확인
systemctl status pdns

# 서비스 시작/중지/재시작
systemctl start pdns
systemctl stop pdns
systemctl restart pdns

# 설정 다시 로드 (PowerDNS는 reload 미지원, restart 필요)
systemctl restart pdns
```

### PowerDNS 제어 명령어
```bash
# 버전 확인
pdns_control version

# 캐시 비우기 (특정 도메인)
pdns_control purge example.com

# 전체 캐시 비우기
pdns_control purge-cache

# Zone 알림
pdns_control notify domain.com

# 통계 확인
pdns_control show *
```

## DNS 레코드 관리

### PostgreSQL 직접 접속
```bash
# PostgreSQL 접속
sudo -u postgres psql powerdns
```

### 레코드 조회

#### 모든 도메인 목록 보기
```sql
SELECT * FROM domains;
```

#### 특정 도메인의 모든 레코드 보기
```sql
-- one-q.kr 도메인의 모든 레코드
SELECT * FROM records 
WHERE domain_id = (SELECT id FROM domains WHERE name='one-q.kr') 
ORDER BY type, name;

-- one-q.xyz 도메인의 모든 레코드
SELECT * FROM records 
WHERE domain_id = (SELECT id FROM domains WHERE name='one-q.xyz') 
ORDER BY type, name;
```

### 레코드 추가

#### A 레코드 추가
```sql
-- subdomain.one-q.xyz -> IP 주소
INSERT INTO records (domain_id, name, type, content, ttl, auth) 
VALUES (
    (SELECT id FROM domains WHERE name='one-q.xyz'),
    'subdomain.one-q.xyz',
    'A',
    '123.456.789.0',
    300,
    't'
);
```

#### CNAME 레코드 추가
```sql
-- project.one-q.xyz -> Vercel 도메인
INSERT INTO records (domain_id, name, type, content, ttl, auth) 
VALUES (
    (SELECT id FROM domains WHERE name='one-q.xyz'),
    'project.one-q.xyz',
    'CNAME',
    '1d798ef91ecf2159.vercel-dns-016.com',
    300,
    't'
);
```

#### TXT 레코드 추가
```sql
-- 도메인 검증용 TXT 레코드
INSERT INTO records (domain_id, name, type, content, ttl, auth) 
VALUES (
    (SELECT id FROM domains WHERE name='one-q.xyz'),
    '_verification.one-q.xyz',
    'TXT',
    'verification-code-here',
    300,
    't'
);
```

#### MX 레코드 추가
```sql
-- 메일 서버 설정
INSERT INTO records (domain_id, name, type, content, ttl, prio, auth) 
VALUES (
    (SELECT id FROM domains WHERE name='one-q.xyz'),
    'one-q.xyz',
    'MX',
    'mail.one-q.xyz',
    3600,
    10,  -- Priority
    't'
);
```

### 레코드 수정

```sql
-- IP 주소 변경
UPDATE records 
SET content = '새로운.IP.주소' 
WHERE name = 'subdomain.one-q.xyz' AND type = 'A';

-- TTL 변경
UPDATE records 
SET ttl = 3600 
WHERE name = 'subdomain.one-q.xyz';
```

### 레코드 삭제

```sql
-- 특정 레코드 삭제
DELETE FROM records 
WHERE name = 'old-subdomain.one-q.xyz';

-- ID로 삭제
DELETE FROM records WHERE id = 17;
```

### 실제 사용 예시 (SSH 원라이너)

```bash
# A 레코드 추가
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"INSERT INTO records (domain_id, name, type, content, ttl, auth) VALUES ((SELECT id FROM domains WHERE name='one-q.xyz'), 'app.one-q.xyz', 'A', '123.456.789.0', 300, 't');\""

# CNAME 레코드 추가
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"INSERT INTO records (domain_id, name, type, content, ttl, auth) VALUES ((SELECT id FROM domains WHERE name='one-q.xyz'), 'blog.one-q.xyz', 'CNAME', 'myblog.vercel.app', 300, 't');\""

# 레코드 조회
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"SELECT * FROM records WHERE name LIKE '%.one-q.xyz' ORDER BY name;\""

# 레코드 삭제
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"DELETE FROM records WHERE name = 'test.one-q.xyz';\""
```

## 도메인 관리

### 새 도메인 추가

```sql
-- 새 도메인 추가
INSERT INTO domains (name, type) VALUES ('newdomain.com', 'NATIVE');

-- SOA 레코드 추가 (필수)
INSERT INTO records (domain_id, name, type, content, ttl, auth) 
VALUES (
    (SELECT id FROM domains WHERE name='newdomain.com'),
    'newdomain.com',
    'SOA',
    'ns1.newdomain.com hostmaster.newdomain.com 2024010101 10800 3600 604800 3600',
    86400,
    't'
);

-- NS 레코드 추가 (필수)
INSERT INTO records (domain_id, name, type, content, ttl, auth) 
VALUES 
    ((SELECT id FROM domains WHERE name='newdomain.com'), 'newdomain.com', 'NS', 'ns1.newdomain.com', 86400, 't'),
    ((SELECT id FROM domains WHERE name='newdomain.com'), 'newdomain.com', 'NS', 'ns2.newdomain.com', 86400, 't');
```

### 도메인 삭제

```sql
-- 도메인의 모든 레코드 삭제
DELETE FROM records WHERE domain_id = (SELECT id FROM domains WHERE name='olddomain.com');

-- 도메인 삭제
DELETE FROM domains WHERE name='olddomain.com';
```

## 문제 해결

### DNS 조회 테스트

```bash
# 로컬 DNS 서버에서 직접 조회
dig @141.164.60.51 subdomain.one-q.xyz

# 특정 레코드 타입 조회
dig @141.164.60.51 one-q.xyz MX
dig @141.164.60.51 one-q.xyz TXT
dig @141.164.60.51 subdomain.one-q.xyz A

# 짧은 출력
dig @141.164.60.51 subdomain.one-q.xyz +short
```

### 캐시 문제 해결

```bash
# 특정 도메인 캐시 제거
ssh root@141.164.60.51 "pdns_control purge subdomain.one-q.xyz"

# 전체 캐시 제거
ssh root@141.164.60.51 "pdns_control purge-cache"
```

### 로그 확인

```bash
# PowerDNS 로그 확인
ssh root@141.164.60.51 "journalctl -u pdns -f"

# 최근 100줄 로그
ssh root@141.164.60.51 "journalctl -u pdns -n 100"

# 오늘의 로그
ssh root@141.164.60.51 "journalctl -u pdns --since today"
```

### 일반적인 문제와 해결책

#### 1. DNS 변경사항이 반영되지 않을 때
```bash
# 1. 캐시 제거
pdns_control purge domain.com

# 2. 서비스 재시작
systemctl restart pdns

# 3. DNS 전파 대기 (TTL 시간만큼)
```

#### 2. 데이터베이스 연결 오류
```bash
# PostgreSQL 상태 확인
systemctl status postgresql

# 연결 테스트
sudo -u postgres psql -c "SELECT 1;"
```

#### 3. 포트 충돌
```bash
# 53번 포트 사용 확인
netstat -tulpn | grep :53

# 8081 포트 (API) 사용 확인
netstat -tulpn | grep :8081
```

## 보안 설정

### API 접근 제한
```bash
# /etc/powerdns/pdns.conf 수정
webserver-allow-from=127.0.0.1/8,10.0.0.0/8,::1,YOUR_IP

# 특정 IP만 허용
webserver-allow-from=127.0.0.1,123.456.789.0
```

### Zone Transfer 제한
```bash
# AXFR 비활성화
disable-axfr=yes

# 특정 IP만 허용
allow-axfr-ips=127.0.0.1,trusted.server.ip
```

### 방화벽 설정
```bash
# DNS 포트 (53) 열기
ufw allow 53/tcp
ufw allow 53/udp

# API 포트는 특정 IP만
ufw allow from YOUR_IP to any port 8081
```

## 유용한 SQL 쿼리 모음

### 통계 조회
```sql
-- 도메인별 레코드 수
SELECT d.name, COUNT(r.id) as record_count 
FROM domains d 
LEFT JOIN records r ON d.id = r.domain_id 
GROUP BY d.name;

-- 레코드 타입별 통계
SELECT type, COUNT(*) as count 
FROM records 
GROUP BY type 
ORDER BY count DESC;
```

### 일괄 작업
```sql
-- 특정 IP를 모두 변경
UPDATE records 
SET content = '새로운.IP.주소' 
WHERE type = 'A' AND content = '기존.IP.주소';

-- 모든 TTL을 3600으로 변경
UPDATE records SET ttl = 3600 WHERE ttl < 3600;
```

### 백업
```bash
# 전체 DNS 데이터 백업
ssh root@141.164.60.51 "sudo -u postgres pg_dump powerdns > /backup/powerdns_$(date +%Y%m%d).sql"

# 특정 도메인만 백업
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"COPY (SELECT * FROM records WHERE domain_id = (SELECT id FROM domains WHERE name='one-q.xyz')) TO '/tmp/one-q-xyz-backup.csv' CSV HEADER;\""
```

## 자주 사용하는 시나리오

### 1. Vercel 프로젝트 배포
```bash
# CNAME 레코드 추가
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"INSERT INTO records (domain_id, name, type, content, ttl, auth) VALUES ((SELECT id FROM domains WHERE name='one-q.xyz'), 'myapp.one-q.xyz', 'CNAME', 'cname.vercel-dns.com', 300, 't');\""
```

### 2. 서브도메인을 다른 서버로 연결
```bash
# A 레코드 추가
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"INSERT INTO records (domain_id, name, type, content, ttl, auth) VALUES ((SELECT id FROM domains WHERE name='one-q.xyz'), 'api.one-q.xyz', 'A', '새서버IP', 300, 't');\""
```

### 3. 이메일 서비스 설정
```bash
# MX 레코드 추가 (Google Workspace 예시)
ssh root@141.164.60.51 "sudo -u postgres psql powerdns -c \"
INSERT INTO records (domain_id, name, type, content, ttl, prio, auth) VALUES 
((SELECT id FROM domains WHERE name='one-q.xyz'), 'one-q.xyz', 'MX', 'aspmx.l.google.com', 3600, 1, 't'),
((SELECT id FROM domains WHERE name='one-q.xyz'), 'one-q.xyz', 'MX', 'alt1.aspmx.l.google.com', 3600, 5, 't'),
((SELECT id FROM domains WHERE name='one-q.xyz'), 'one-q.xyz', 'MX', 'alt2.aspmx.l.google.com', 3600, 5, 't');
\""
```

---

이 매뉴얼은 PowerDNS 운영에 필요한 기본적인 내용을 담고 있습니다. 추가 질문이나 특정 시나리오가 있으면 언제든 문의하세요.