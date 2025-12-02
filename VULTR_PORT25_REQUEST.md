# Vultr Port 25 Unblock Request

## Server Information
- **Instance ID**: 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
- **IP Address**: 141.164.60.51
- **Region**: Seoul (icn)
- **Plan**: voc-m-2c-16gb-200s-amd
- **OS**: Ubuntu 22.04 x64

## Mail Server Configuration
- **Domain**: workb.net
- **Mail Hostname**: mail.workb.net
- **Mail Server**: Postfix + Dovecot (via Docker Mailserver)
- **Container**: codeb-mail-server (Podman)

## DNS Records Configured
✅ A Record: mail.workb.net → 141.164.60.51
✅ MX Record: workb.net → mail.workb.net (priority 10)
✅ SPF Record: v=spf1 mx ip4:141.164.60.51 ~all
✅ DKIM Record: Public key configured
✅ DMARC Record: v=DMARC1; p=none; rua=mailto:postmaster@workb.net

## Bandwidth Usage
- **Allocated**: 5TB (5037GB)
- **Current Usage**: ~10GB/month
- **Remaining**: 4990GB+ available

## Purpose
CodeB Platform - Enterprise Project Management SaaS
- Sending invitation emails to workspace members
- Transactional emails (notifications, password resets, etc.)
- Expected volume: Up to 100,000 invitation emails
- Legitimate business use with proper SPF/DKIM/DMARC configuration

## Support Ticket Request Template

---

**Subject**: Request to Remove Port 25 Restriction for Mail Server

**Message**:

Hello Vultr Support Team,

I am requesting to remove the port 25 outbound restriction for my VPS instance.

**Instance Details:**
- Instance ID: 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4
- IP Address: 141.164.60.51
- Region: Seoul (icn)

**Purpose:**
I am running a legitimate mail server for CodeB Platform, an enterprise project management SaaS application. The mail server is used for:
- Sending workspace invitation emails
- Transactional notifications
- Password reset emails
- System alerts

**Mail Server Configuration:**
- Mail Server: Postfix + Dovecot (Docker Mailserver)
- Domain: workb.net
- Hostname: mail.workb.net
- DNS Records: Properly configured with SPF, DKIM, and DMARC
- Anti-spam measures: Fail2ban, rate limiting, authentication required

**DNS Records Configured:**
- A Record: mail.workb.net → 141.164.60.51
- MX Record: workb.net → mail.workb.net
- SPF: v=spf1 mx ip4:141.164.60.51 ~all
- DKIM: Public key configured
- DMARC: v=DMARC1; p=none

**Commitment:**
- I will monitor the mail server to prevent abuse
- I will maintain proper SPF, DKIM, and DMARC records
- I will implement rate limiting and authentication
- I will comply with anti-spam best practices

I understand that any abuse of this service may result in the restriction being reinstated.

Thank you for your assistance.

Best regards,
CodeB Platform Team

---

## How to Submit Ticket

### Option 1: Vultr CLI
```bash
# Note: Vultr CLI doesn't support ticket creation yet
# Use web dashboard instead
```

### Option 2: Web Dashboard (Recommended)
1. Go to https://my.vultr.com/support/
2. Click "Open Ticket"
3. Subject: "Request to Remove Port 25 Restriction for Mail Server"
4. Category: "Instance Related"
5. Paste the message template above
6. Attach this document if needed

### Option 3: Email Support
Send to: support@vultr.com
Subject: Request to Remove Port 25 Restriction - Instance 0c099e4d-29f0-4c54-b60f-4cdd375ac2d4

## Alternative Solution (If Port 25 Cannot Be Unblocked)

If Vultr cannot remove the port 25 restriction, we can use SMTP relay services:

### Option A: SendGrid (Free tier: 100 emails/day)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<SendGrid API Key>
```

### Option B: Amazon SES (Free tier: 62,000 emails/month)
```env
SMTP_HOST=email-smtp.ap-northeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=<SMTP Username>
SMTP_PASS=<SMTP Password>
```

### Option C: Mailgun (Free tier: 5,000 emails/month)
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=<Mailgun SMTP Username>
SMTP_PASS=<Mailgun SMTP Password>
```

## Current Status

- ✅ Mail server installed and configured
- ✅ DNS records configured (A, MX, SPF, DKIM, DMARC)
- ✅ Firewall rules configured (ports 25, 587, 465 open)
- ❌ Port 25 outbound blocked by Vultr (ISP level)
- ⏳ Waiting for Vultr support response

## Test Results

```bash
# Telnet test to Gmail SMTP
$ telnet gmail-smtp-in.l.google.com 25
# Result: Connection timed out (Port 25 blocked)

# Mail queue status
$ podman exec codeb-mail-server postqueue -p
# Result: 2 emails in queue, waiting for delivery
# Error: "Connection timed out" to Gmail MX servers
```

## Next Steps

1. **Submit support ticket** to Vultr requesting port 25 unblock
2. **Wait for response** (typically 1-3 business days)
3. **Test email delivery** once port is unblocked
4. **If denied**, implement SMTP relay service (SendGrid/SES/Mailgun)
5. **Document** final configuration in project README

## Contact Information

- **Project**: CodeB Platform
- **Domain**: workb.net
- **Server IP**: 141.164.60.51
- **Admin Email**: admin@workb.net (or cheon43@gmail.com for support)
