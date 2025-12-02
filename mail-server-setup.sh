#!/bin/bash

# CodeB Platform - Mail Server Setup Script
# 자체 메일 서버 (Postfix + Dovecot) Podman 컨테이너 설정
# 서버: 141.164.60.51
# 도메인: workb.net

set -e

echo "======================================"
echo "CodeB Mail Server Setup"
echo "======================================"

# 변수 설정
MAIL_DOMAIN="workb.net"
MAIL_HOSTNAME="mail.workb.net"
SERVER_IP="141.164.60.51"
MAIL_USER="noreply"
MAIL_PASSWORD="CodeB2025!Secure"
CONTAINER_NAME="codeb-mail-server"

echo "도메인: $MAIL_DOMAIN"
echo "호스트: $MAIL_HOSTNAME"
echo "서버 IP: $SERVER_IP"
echo ""

# Podman 설치 확인
if ! command -v podman &> /dev/null; then
    echo "Podman을 설치합니다..."
    apt-get update
    apt-get install -y podman
fi

echo "✅ Podman 설치 확인 완료"

# 기존 컨테이너 정리
if podman ps -a | grep -q $CONTAINER_NAME; then
    echo "기존 컨테이너를 정리합니다..."
    podman stop $CONTAINER_NAME 2>/dev/null || true
    podman rm $CONTAINER_NAME 2>/dev/null || true
fi

# 메일 서버 디렉토리 생성
mkdir -p /opt/codeb-mail/{mail,config,dkim}
chmod 755 /opt/codeb-mail
chmod 700 /opt/codeb-mail/mail

echo "✅ 디렉토리 생성 완료"

# Postfix 설정 파일 생성
cat > /opt/codeb-mail/config/main.cf <<EOF
# Postfix 기본 설정
myhostname = $MAIL_HOSTNAME
mydomain = $MAIL_DOMAIN
myorigin = \$mydomain
mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain
relayhost =
mynetworks = 127.0.0.0/8, $SERVER_IP/32
home_mailbox = Maildir/
inet_interfaces = all
inet_protocols = ipv4

# 메일박스 크기 제한 (100MB)
mailbox_size_limit = 104857600
message_size_limit = 20971520

# SMTP 인증
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = \$myhostname
broken_sasl_auth_clients = yes

# TLS 설정
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls = yes
smtpd_tls_security_level = may
smtp_tls_security_level = may

# 스팸 방지
smtpd_recipient_restrictions =
    permit_sasl_authenticated,
    permit_mynetworks,
    reject_unauth_destination

# 헤더 체크
smtpd_helo_required = yes
smtpd_helo_restrictions =
    permit_mynetworks,
    permit_sasl_authenticated,
    reject_invalid_helo_hostname,
    reject_non_fqdn_helo_hostname
EOF

echo "✅ Postfix 설정 파일 생성 완료"

# Dovecot 설정 파일 생성
cat > /opt/codeb-mail/config/dovecot.conf <<EOF
# Dovecot 기본 설정
protocols = imap pop3 lmtp
mail_location = maildir:~/Maildir
disable_plaintext_auth = no

# 인증
auth_mechanisms = plain login

# SSL 설정
ssl = no

# 메일박스 설정
namespace inbox {
  inbox = yes
  mailbox Drafts {
    special_use = \Drafts
  }
  mailbox Sent {
    special_use = \Sent
  }
  mailbox Trash {
    special_use = \Trash
  }
}

# Postfix 연동
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
}
EOF

echo "✅ Dovecot 설정 파일 생성 완료"

# Docker Compose 파일 생성 (Podman도 호환됨)
cat > /opt/codeb-mail/docker-compose.yml <<EOF
version: '3.8'

services:
  mailserver:
    image: docker.io/mailserver/docker-mailserver:latest
    container_name: $CONTAINER_NAME
    hostname: $MAIL_HOSTNAME
    domainname: $MAIL_DOMAIN
    ports:
      - "25:25"    # SMTP
      - "587:587"  # Submission
      - "465:465"  # SMTPS
      - "143:143"  # IMAP
      - "993:993"  # IMAPS
    volumes:
      - /opt/codeb-mail/mail:/var/mail
      - /opt/codeb-mail/config:/tmp/docker-mailserver
      - /opt/codeb-mail/dkim:/tmp/docker-mailserver/opendkim
    environment:
      - ENABLE_SPAMASSASSIN=0
      - ENABLE_CLAMAV=0
      - ENABLE_FAIL2BAN=1
      - ENABLE_POSTGREY=0
      - ONE_DIR=1
      - DMS_DEBUG=0
      - PERMIT_DOCKER=network
      - OVERRIDE_HOSTNAME=$MAIL_HOSTNAME
    cap_add:
      - NET_ADMIN
    restart: always
EOF

echo "✅ Docker Compose 파일 생성 완료"

# 방화벽 포트 오픈
echo "방화벽 포트를 오픈합니다..."
if command -v ufw &> /dev/null; then
    ufw allow 25/tcp comment 'SMTP'
    ufw allow 587/tcp comment 'SMTP Submission'
    ufw allow 465/tcp comment 'SMTPS'
    ufw allow 143/tcp comment 'IMAP'
    ufw allow 993/tcp comment 'IMAPS'
    ufw allow 110/tcp comment 'POP3'
    ufw allow 995/tcp comment 'POP3S'
    echo "✅ UFW 방화벽 설정 완료"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=smtp
    firewall-cmd --permanent --add-service=smtps
    firewall-cmd --permanent --add-service=imap
    firewall-cmd --permanent --add-service=imaps
    firewall-cmd --permanent --add-service=pop3
    firewall-cmd --permanent --add-service=pop3s
    firewall-cmd --reload
    echo "✅ firewalld 설정 완료"
fi

# 컨테이너 시작
echo "메일 서버 컨테이너를 시작합니다..."
cd /opt/codeb-mail
podman-compose up -d || podman compose up -d

echo ""
echo "======================================"
echo "✅ 메일 서버 설치 완료!"
echo "======================================"
echo ""
echo "다음 단계를 진행하세요:"
echo ""
echo "1. 메일 계정 생성:"
echo "   podman exec -it $CONTAINER_NAME setup email add $MAIL_USER@$MAIL_DOMAIN $MAIL_PASSWORD"
echo ""
echo "2. DKIM 키 생성:"
echo "   podman exec -it $CONTAINER_NAME setup config dkim"
echo "   cat /opt/codeb-mail/dkim/keys/$MAIL_DOMAIN/mail.txt"
echo ""
echo "3. DNS 레코드 설정:"
echo "   - MX: @ -> mail.$MAIL_DOMAIN (우선순위 10)"
echo "   - A: mail -> $SERVER_IP"
echo "   - TXT (SPF): @ -> \"v=spf1 mx ip4:$SERVER_IP ~all\""
echo "   - TXT (DKIM): 위에서 출력된 내용 사용"
echo "   - TXT (DMARC): _dmarc -> \"v=DMARC1; p=none; rua=mailto:postmaster@$MAIL_DOMAIN\""
echo ""
echo "4. 메일 서버 상태 확인:"
echo "   podman ps | grep $CONTAINER_NAME"
echo "   podman logs $CONTAINER_NAME"
echo ""
echo "5. 테스트 메일 발송:"
echo "   podman exec -it $CONTAINER_NAME bash"
echo "   echo 'Test email from CodeB' | mail -s 'Test' cheon43@gmail.com"
echo ""
echo "======================================"
