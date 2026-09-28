import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_otp_email(to_email: str, otp_code: str, purpose: str = "register") -> bool:
    """
    Sends an OTP verification email to the user via SMTP.
    If SMTP credentials are not configured, prints the OTP safely to the console.
    """
    if purpose == "forgot_password":
        subject = f"Your BudgetBuddy Password Reset Code: {otp_code}"
        action_title = "Password Reset Request"
        action_description = "We received a request to reset your BudgetBuddy account password. Use the verification code below to set a new password."
    else:
        subject = f"Your BudgetBuddy Verification Code: {otp_code}"
        action_title = "Verify Your Email Address"
        action_description = "Thank you for creating an account with BudgetBuddy! Please use the 6-digit verification code below to activate your account."

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="background-color: #065f46; padding: 28px 36px; text-align: left;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">BudgetBuddy</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 36px 36px 24px 36px;">
            <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 600;">{action_title}</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">{action_description}</p>
            
            <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #166534;">{otp_code}</span>
            </div>

            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 16px 0 0 0;">
              This code will expire in <strong>10 minutes</strong>. If you did not make this request, please safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; 2026 BudgetBuddy &bull; Student Financial Management Platform
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    plain_content = f"""
BudgetBuddy - {action_title}

{action_description}

Verification Code: {otp_code}

This code will expire in 10 minutes. If you did not request this, please ignore this email.
"""

    # Check if SMTP is configured
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"[BudgetBuddy Auth] SMTP not configured. OTP for {to_email} ({purpose}): {otp_code}")
        return False

    sender_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    sender_name = settings.SMTP_FROM_NAME or "BudgetBuddy"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to_email

    msg.attach(MIMEText(plain_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            if settings.SMTP_TLS:
                server.starttls()

        if settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(sender_email, [to_email], msg.as_string())
        server.quit()
        print(f"[BudgetBuddy Auth] Email sent successfully to {to_email}")
        return True
    except Exception as exc:
        print(f"[BudgetBuddy Auth] Failed to send email via SMTP: {exc}. Fallback OTP: {otp_code}")
        return False
