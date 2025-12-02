# CodeB Platform 메일 서버 DNS 설정 가이드

## 메일 서버 정보
- **서버 IP**: 141.164.60.51
- **도메인**: workb.net
- **메일 호스트**: mail.workb.net
- **메일 주소**: noreply@workb.net

## 필수 DNS 레코드 설정

### 1. A 레코드
메일 서버의 IP 주소를 지정합니다.

```
Type: A
Name: mail
Value: 141.164.60.51
TTL: 3600
```

### 2. MX 레코드
메일을 수신할 서버를 지정합니다.

```
Type: MX
Name: @
Value: mail.workb.net
Priority: 10
TTL: 3600
```

### 3. SPF 레코드 (TXT)
발신 서버를 인증하여 스팸으로 분류되는 것을 방지합니다.

```
Type: TXT
Name: @
Value: v=spf1 mx ip4:141.164.60.51 ~all
TTL: 3600
```

**설명**:
- `v=spf1`: SPF 버전 1 사용
- `mx`: MX 레코드에 지정된 서버 허용
- `ip4:141.164.60.51`: 해당 IP에서 발송 허용
- `~all`: 다른 서버는 소프트 실패 (권장하지 않음)

### 4. DKIM 레코드 (TXT)
이메일 서명을 통한 인증을 제공합니다.

```
Type: TXT
Name: mail._domainkey
Value: v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvnX86C3Ki+oFdu6MdivudJE4mz+oYlLt4pTHa31b6p5uagwew7UOn+1SWCKcvIbh90Xml4JyQuOthp7j0G0XBEwefkOFRtjSCqtwCnYUPyAU9us5u9J5LMevwKsxAI8jrfQD9ufVO3RcrIEWM6iU8iAg/wA3xNMPahDYmxhEuOPkNLRNDh/gV3vh3V3FH/X4nnP8dWbQ2HK6jWHPXmUX5DLuH3qhWWW5YGZJSEygnhA/lrRGqBAyubeAZ1muxYhVjP7A/tYlUNrAMa4IdLaCe/aRRePphrhzRdtIJklv94Nikgg3BynOdILlPUZ28vOAQ2AghdXWLsyrjrsl25CWAwIDAQAB
TTL: 3600
```

**설명**:
- `v=DKIM1`: DKIM 버전 1
- `h=sha256`: SHA-256 해시 알고리즘 사용
- `k=rsa`: RSA 암호화 방식
- `p=...`: 공개키 (자동 생성됨)

### 5. DMARC 레코드 (TXT)
SPF와 DKIM 실패 시 처리 방법을 지정합니다.

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:postmaster@workb.net
TTL: 3600
```

**설명**:
- `v=DMARC1`: DMARC 버전 1
- `p=none`: 실패 시 특별한 조치 없음 (모니터링 모드)
- `rua=mailto:postmaster@workb.net`: 리포트를 받을 이메일 주소

### 6. PTR 레코드 (역방향 DNS) - 선택사항
IP 주소에서 도메인으로의 역방향 조회를 설정합니다.

**참고**: PTR 레코드는 보통 호스팅 업체에서 설정해야 합니다.

```
IP: 141.164.60.51
PTR: mail.workb.net
```

## DNS 설정 확인 방법

### 1. A 레코드 확인
```bash
dig A mail.workb.net
# 또는
nslookup mail.workb.net
```

### 2. MX 레코드 확인
```bash
dig MX workb.net
# 또는
nslookup -type=MX workb.net
```

### 3. SPF 레코드 확인
```bash
dig TXT workb.net
# 또는
nslookup -type=TXT workb.net
```

### 4. DKIM 레코드 확인
```bash
dig TXT mail._domainkey.workb.net
# 또는
nslookup -type=TXT mail._domainkey.workb.net
```

### 5. DMARC 레코드 확인
```bash
dig TXT _dmarc.workb.net
# 또는
nslookup -type=TXT _dmarc.workb.net
```

## 온라인 도구를 사용한 확인

다음 온라인 도구들을 사용하여 메일 서버 설정을 확인할 수 있습니다:

1. **MX Toolbox**: https://mxtoolbox.com/
   - SPF, DKIM, DMARC 검증
   - 블랙리스트 확인
   - 메일 서버 헬스 체크

2. **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/checkmx/
   - MX 레코드 확인
   - SPF 검증

3. **DKIM Validator**: https://dkimvalidator.com/
   - DKIM 서명 확인
   - 테스트 메일 발송

## DNS 설정 적용 시간

DNS 레코드 변경은 전파되는데 시간이 걸립니다:
- **최소**: 몇 분 ~ 1시간
- **일반적**: 1-24시간
- **최대**: 48시간

**팁**: TTL 값을 낮게 설정(예: 300초)하면 변경사항이 더 빨리 전파됩니다.

## 메일 발송 테스트

DNS 설정 완료 후 테스트 메일을 발송하여 확인:

```bash
# 서버에 SSH 접속
ssh root@141.164.60.51

# 컨테이너 내부에서 테스트 메일 발송
podman exec -it codeb-mail-server bash
echo "CodeB Platform 메일 서버 테스트" | mail -s "테스트 메일" cheon43@gmail.com
```

## 문제 해결

### 메일이 스팸함으로 가는 경우
1. SPF, DKIM, DMARC 레코드가 올바르게 설정되었는지 확인
2. PTR 레코드(역방향 DNS) 설정
3. IP 주소가 블랙리스트에 등록되어 있는지 확인: https://mxtoolbox.com/blacklists.aspx

### 메일 발송이 안 되는 경우
1. 방화벽에서 포트 25, 587, 465가 열려있는지 확인
2. DNS 레코드가 전파되었는지 확인 (dig 또는 nslookup 사용)
3. 메일 서버 로그 확인:
   ```bash
   podman logs codeb-mail-server
   ```

## 다음 단계

1. ✅ DNS 레코드 설정
2. ✅ 24시간 후 DNS 전파 확인
3. ✅ 테스트 메일 발송
4. ✅ Gmail, Outlook 등에서 메일 수신 확인
5. ✅ SPF, DKIM, DMARC 검증
6. ✅ Next.js 애플리케이션에 Nodemailer 통합
7. ✅ 초대 메일 템플릿 작성
8. ✅ 메일 발송 API 엔드포인트 구현

## 참고 자료

- **Docker Mailserver**: https://docker-mailserver.github.io/docker-mailserver/latest/
- **SPF 표준**: https://www.rfc-editor.org/rfc/rfc7208
- **DKIM 표준**: https://www.rfc-editor.org/rfc/rfc6376
- **DMARC 표준**: https://www.rfc-editor.org/rfc/rfc7489
