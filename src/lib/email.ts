import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

// Email template wrapper with consistent branding
function emailWrapper(content: string) {
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 24px; text-align: center;">
        <h1 style="color: #a3e635; margin: 0; font-size: 24px; font-weight: bold;">WorkB</h1>
      </div>
      <div style="padding: 32px;">
        ${content}
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} WorkB. All rights reserved.
        </p>
      </div>
    </div>
    `
}

export async function sendInviteEmail(to: string, inviteUrl: string, workspaceName: string, inviterName: string) {
    const content = `
      <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">워크스페이스 초대</h2>
      <p style="font-size: 16px; color: #475569; line-height: 1.6;">
        <strong>${inviterName}</strong>님이 귀하를 <strong style="color: #000;">${workspaceName}</strong> 워크스페이스에 초대했습니다.
      </p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${inviteUrl}" style="display: inline-block; background: #a3e635; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          초대 수락하기
        </a>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">
        또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
        <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
      </p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        이 초대 링크는 7일간 유효합니다.
      </p>
    `

    // CVE-CB-005: Silent fail for email sending
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"WorkB" <noreply@workb.net>',
            to,
            subject: `[WorkB] ${inviterName}님이 ${workspaceName} 워크스페이스에 초대했습니다`,
            html: emailWrapper(content),
        })
        return true
    } catch {
        // Silent fail - email errors handled gracefully
        return false
    }
}

// Generic email sending function for worker jobs
interface SendEmailOptions {
    to: string[]
    subject: string
    template: string
    data: Record<string, any>
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, template, data } = options

    // Build content based on template
    let content = ''

    switch (template) {
        case 'report-ready':
            content = `
                <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">리포트 생성 완료</h2>
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    요청하신 <strong>${data.reportType}</strong> 리포트가 생성되었습니다.
                </p>
                <div style="margin: 32px 0; text-align: center;">
                    <a href="${data.reportUrl}" style="display: inline-block; background: #a3e635; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                        리포트 다운로드
                    </a>
                </div>
            `
            break
        case 'notification':
            content = `
                <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">${data.title || '알림'}</h2>
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    ${data.message || ''}
                </p>
            `
            break
        default:
            content = `
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    ${JSON.stringify(data)}
                </p>
            `
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"WorkB" <noreply@workb.net>',
            to: to.join(', '),
            subject,
            html: emailWrapper(content),
        })
        return true
    } catch {
        return false
    }
}

export async function sendProjectInviteEmail(to: string, inviteUrl: string, projectName: string, inviterName: string) {
    const content = `
      <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">프로젝트 초대</h2>
      <p style="font-size: 16px; color: #475569; line-height: 1.6;">
        <strong>${inviterName}</strong>님이 귀하를 <strong style="color: #000;">${projectName}</strong> 프로젝트에 초대했습니다.
      </p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 24px 0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #a3e635; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">📁</span>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${projectName}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">프로젝트</p>
          </div>
        </div>
      </div>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${inviteUrl}" style="display: inline-block; background: #a3e635; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          프로젝트 참여하기
        </a>
      </div>
      <p style="font-size: 14px; color: #94a3b8;">
        또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
        <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
      </p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        이 초대 링크는 7일간 유효합니다.
      </p>
    `

    // CVE-CB-005: Silent fail for email sending
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"WorkB" <noreply@workb.net>',
            to,
            subject: `[WorkB] ${inviterName}님이 ${projectName} 프로젝트에 초대했습니다`,
            html: emailWrapper(content),
        })
        return true
    } catch {
        // Silent fail - email errors handled gracefully
        return false
    }
}
