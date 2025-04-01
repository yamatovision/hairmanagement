/**
 * メール送信ユーティリティ
 * 環境設定に応じて適切なメール送信サービスを使用
 */

// メール送信オプションのインターフェース
interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: any;
    contentType?: string;
  }>;
}

/**
 * メール送信関数
 * 現在はコンソールに出力するだけのモック実装
 * 実際のプロダクション環境では、SendGridやNodemailerなどを使用
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const { to, subject, text, html, from, attachments } = options;

  // 環境変数から送信設定を取得
  const emailEnabled = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
  const emailService = process.env.EMAIL_SERVICE;
  const emailFrom = from || process.env.EMAIL_FROM || 'noreply@example.com';

  // メール送信が無効な場合はコンソールに出力して終了
  if (!emailEnabled) {
    console.log('Email sending is disabled. Would have sent:');
    console.log(`From: ${emailFrom}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text.substring(0, 100)}...`);
    return;
  }

  // 各メールサービスの実装（実際の実装時にはコメントを解除）
  switch (emailService) {
    case 'sendgrid':
      // SendGrid
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.EMAIL_API_KEY);
      await sgMail.send({
        to,
        from: emailFrom,
        subject,
        text,
        html: html || text,
        attachments
      });
      */
      break;
      
    case 'smtp':
      // Nodemailer SMTP
      /*
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text,
        html: html || undefined,
        attachments
      });
      */
      break;

    default:
      // デフォルトはログ出力
      console.log(`[Email Service] Sending email to ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text.substring(0, 150)}...`);
      break;
  }
};