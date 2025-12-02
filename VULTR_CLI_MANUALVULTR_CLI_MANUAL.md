# Vultr CLI 사용 매뉴얼

CodeB Platform 서버 관리를 위한 Vultr CLI 가이드

## 목차
1. [설치 및 설정](#설치-및-설정)
2. [인증 설정](#인증-설정)
3. [서버 관리 명령어](#서버-관리-명령어)
4. [대역폭 및 모니터링](#대역폭-및-모니터링)
5. [방화벽 관리](#방화벽-관리)
6. [유용한 명령어 모음](#유용한-명령어-모음)

---

## 설치 및 설정

### macOS 설치
```bash
brew install vultr-cli
```

### Ubuntu/Debian 설치
```bash
# Download latest release
wget https://github.com/vultr/vultr-cli/releases/latest/download/vultr-cli_linux_amd64.tar.gz

# Extract
tar -xvf vultr-cli_linux_amd64.tar.gz

# Move to bin
sudo mv vultr-cli /usr/local/bin/

# Verify installation
vultr-cli version
```

### 설치 확인
```bash
which vultr-cli
vultr-cli version
```

---

## 인증 설정

### API 키 정보
- **API 키**: `*USGBQ` (codeb)
- **관리 페이지**: https://my.vultr.com/settings/#settingsapi

### 환경 변수 설정

#### 임시 설정 (현재 세션만)
```bash
export VULTR_API_KEY="*USGBQ"
```

#### 영구 설정 (권장)

**macOS (zsh)**:
```bash
echo 'export VULTR_API_KEY="*USGBQ"' >> ~/.zshrc
source ~/.zshrc
```

**Linux (bash)**:
```bash
echo 'export VULTR_API_KEY="*USGBQ"' >> ~/.bashrc
source ~/.bashrc
```

### 인증 테스트
```bash
vultr-cli account
```

---

## 서버 관리 명령어

### 서버 목록 조회
```bash
# 모든 인스턴스 목록
vultr-cli instance list

# 상세 정보 포함
vultr-cli instance list -o json
```

### 서버 상세 정보
```bash
# CodeB Platform 서버 정보
vultr-cli instance get 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4

# JSON 형식으로
vultr-cli instance get 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4 -o json
```

**서버 ID**: `0c099e4d-29f0-4c54-b60f-4cdd375ac2d4`
**IP**: `141.164.60.51`

### 서버 제어

#### 재시작
```bash
vultr-cli instance restart 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
```

#### 중지
```bash
vultr-cli instance halt 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
```

#### 시작
```bash
vultr-cli instance start 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
```

### 서버 사양 정보
```bash
# 사용 가능한 플랜 목록
vultr-cli plans list --region icn

# 현재 플랜 정보
# voc-m-2c-16gb-200s-amd
# - 2 vCPU (AMD)
# - 16GB RAM
# - 200GB SSD
# - 5TB Bandwidth
```

---

## 대역폭 및 모니터링

### 대역폭 사용량 조회
```bash
# 월별 대역폭 사용량
vultr-cli instance bandwidth 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4

# JSON 형식
vultr-cli instance bandwidth 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4 -o json
```

### 대역폭 정보
- **할당량**: 5TB (5037GB)
- **현재 사용량**: ~10GB/month
- **여유 공간**: 4990GB+

### IPv4 정보 조회
```bash
vultr-cli instance ipv4 list 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
```

### 백업 목록
```bash
vultr-cli instance backup list 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
```

---

## 방화벽 관리

### 방화벽 그룹 목록
```bash
vultr-cli firewall group list
```

### 방화벽 규칙 조회
```bash
vultr-cli firewall rule list <FIREWALL_GROUP_ID>
```

### 방화벽 규칙 생성
```bash
# SMTP 포트 25 허용 (TCP)
vultr-cli firewall rule create \
  --group <FIREWALL_GROUP_ID> \
  --protocol tcp \
  --port 25 \
  --subnet "0.0.0.0/0" \
  --notes "SMTP"

# SMTP Submission 포트 587 허용
vultr-cli firewall rule create \
  --group <FIREWALL_GROUP_ID> \
  --protocol tcp \
  --port 587 \
  --subnet "0.0.0.0/0" \
  --notes "SMTP Submission"

# SMTPS 포트 465 허용
vultr-cli firewall rule create \
  --group <FIREWALL_GROUP_ID> \
  --protocol tcp \
  --port 465 \
  --subnet "0.0.0.0/0" \
  --notes "SMTPS"
```

---

## 유용한 명령어 모음

### 빠른 서버 상태 확인
```bash
# 별칭 설정 (zshrc or bashrc에 추가)
alias codeb-server="vultr-cli instance get 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4"
alias codeb-bandwidth="vultr-cli instance bandwidth 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4"
alias codeb-restart="vultr-cli instance restart 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4"

# 사용
codeb-server
codeb-bandwidth
```

### 원라인 스크립트

#### 서버 상태 요약
```bash
vultr-cli instance get 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4 | grep -E '(STATUS|POWER|RAM|VCPU|BANDWIDTH)'
```

#### 대역폭 총 사용량 계산
```bash
vultr-cli instance bandwidth 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4 -o json | \
  jq '.bandwidth | map(.incoming_bytes + .outgoing_bytes) | add' | \
  numfmt --to=iec-i --suffix=B
```

### SSH 연결
```bash
# 직접 연결
ssh root@141.164.60.51

# 별칭 사용
alias codeb-ssh="ssh root@141.164.60.51"
codeb-ssh
```

---

## 스냅샷 및 백업

### 스냅샷 생성
```bash
vultr-cli snapshot create \
  --instance-id 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4 \
  --description "CodeB Platform - Mail Server Setup - $(date +%Y-%m-%d)"
```

### 스냅샷 목록
```bash
vultr-cli snapshot list
```

### 스냅샷에서 복원
```bash
vultr-cli instance create \
  --region icn \
  --plan voc-m-2c-16gb-200s-amd \
  --snapshot <SNAPSHOT_ID> \
  --label "codeb-restored"
```

---

## DNS 관리

### DNS 도메인 목록
```bash
vultr-cli dns domain list
```

### DNS 레코드 조회
```bash
vultr-cli dns record list workb.net
```

### DNS 레코드 추가
```bash
# A 레코드 추가
vultr-cli dns record create workb.net \
  --type A \
  --name mail \
  --data 141.164.60.51 \
  --ttl 3600

# MX 레코드 추가
vultr-cli dns record create workb.net \
  --type MX \
  --name @ \
  --data "mail.workb.net" \
  --priority 10 \
  --ttl 3600

# TXT 레코드 추가 (SPF)
vultr-cli dns record create workb.net \
  --type TXT \
  --name @ \
  --data "v=spf1 mx ip4:141.164.60.51 ~all" \
  --ttl 3600
```

---

## 계정 정보

### 계정 정보 조회
```bash
vultr-cli account
```

### 결제 정보
```bash
# 청구 내역
vultr-cli billing history

# 현재 잔액
vultr-cli account | grep BALANCE
```

---

## 지역 및 가용성

### 사용 가능한 지역 목록
```bash
vultr-cli regions list
```

### Seoul (icn) 지역 정보
```bash
vultr-cli regions list | grep icn
```

**지역 코드**: `icn` (Seoul, South Korea)

---

## 트러블슈팅

### API 키 오류
```bash
# 환경 변수 확인
echo $VULTR_API_KEY

# 재설정
export VULTR_API_KEY="*USGBQ"
```

### 명령어 실행 오류
```bash
# 최신 버전으로 업데이트
brew upgrade vultr-cli  # macOS

# 또는 최신 버전 다운로드
wget https://github.com/vultr/vultr-cli/releases/latest/download/vultr-cli_linux_amd64.tar.gz
```

### 인스턴스 ID 찾기
```bash
# IP로 검색
vultr-cli instance list | grep 141.164.60.51
```

---

## 자동화 스크립트 예제

### 서버 헬스 체크 스크립트
```bash
#!/bin/bash
# codeb-health-check.sh

export VULTR_API_KEY="*USGBQ"
INSTANCE_ID="0c099e4d-29f0-4c54-b60f-4cdd375ac2d4"

echo "=== CodeB Server Health Check ==="
echo ""

# 서버 상태
echo "Server Status:"
vultr-cli instance get $INSTANCE_ID | grep -E '(POWER STATUS|STATUS|RAM|VCPU)'
echo ""

# 대역폭
echo "Bandwidth Usage (Last 7 days):"
vultr-cli instance bandwidth $INSTANCE_ID | tail -7
echo ""

# SSH 연결 테스트
echo "SSH Connection Test:"
ssh -o ConnectTimeout=5 root@141.164.60.51 "uptime" && echo "✅ SSH OK" || echo "❌ SSH Failed"
echo ""

echo "=== Health Check Complete ==="
```

### 대역폭 모니터링 스크립트
```bash
#!/bin/bash
# codeb-bandwidth-monitor.sh

export VULTR_API_KEY="*USGBQ"
INSTANCE_ID="0c099e4d-29f0-4c54-b60f-4cdd375ac2d4"

# 오늘 날짜
TODAY=$(date +%Y-%m-%d)

echo "Bandwidth usage for $TODAY:"
vultr-cli instance bandwidth $INSTANCE_ID -o json | \
  jq ".bandwidth[] | select(.date == \"$TODAY\") | {
    date: .date,
    incoming: (.incoming_bytes / 1024 / 1024 | floor),
    outgoing: (.outgoing_bytes / 1024 / 1024 | floor),
    total: ((.incoming_bytes + .outgoing_bytes) / 1024 / 1024 | floor)
  }"
```

---

## 참고 자료

### 공식 문서
- **Vultr CLI GitHub**: https://github.com/vultr/vultr-cli
- **Vultr API Documentation**: https://www.vultr.com/api/
- **Vultr Dashboard**: https://my.vultr.com/

### CodeB Platform 서버 정보
- **Instance ID**: `0c099e4d-29f0-4c54-b60f-4cdd375ac2d4`
- **IP Address**: `141.164.60.51`
- **Region**: Seoul (icn)
- **OS**: Ubuntu 22.04 x64
- **Specs**: 2 vCPU, 16GB RAM, 200GB SSD, 5TB Bandwidth

### 관련 문서
- [mail-server-setup.sh](mail-server-setup.sh) - 메일 서버 설치 스크립트
- [DNS_CONFIGURATION.md](DNS_CONFIGURATION.md) - DNS 설정 가이드
- [VULTR_PORT25_REQUEST.md](VULTR_PORT25_REQUEST.md) - 포트 25 해제 요청 템플릿

---

**작성일**: 2025-11-24
**버전**: 1.0.0
**작성자**: CodeB Development Team
