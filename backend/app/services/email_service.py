import json
import urllib.request
import urllib.error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_smtp_fallback_email(to_email: str, otp_code: str) -> dict:
    """
    Sends email via SMTP server if RESEND sandbox limits external recipients.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[SMTP NOTICE] SMTP credentials not set. Logging OTP {otp_code} for {to_email}.")
        return {"status": "logged_only", "otp": otp_code, "to": to_email}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Verification OTP Code: {otp_code}"
        msg["From"] = settings.SMTP_USERNAME
        msg["To"] = to_email

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #FAF6F1; border-radius: 16px; border: 1px solid #E8E2D9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0F2C59; font-size: 22px; margin: 0; font-weight: 900; text-transform: uppercase;">AI Resume Analyzer</h1>
            <p style="color: #60534A; font-size: 12px; margin-top: 4px; font-weight: 600;">Email Verification System</p>
          </div>
          <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #E2D7CB; text-align: center;">
            <p style="color: #2B241F; font-size: 13px; font-weight: 700; margin-bottom: 12px;">Your 6-Digit Email Verification OTP Code:</p>
            <div style="font-family: monospace; font-size: 32px; font-weight: 900; color: #0047AB; letter-spacing: 6px; padding: 12px; background-color: #EFE7DE; border-radius: 8px; display: inline-block;">
              {otp_code}
            </div>
            <p style="color: #8C7E72; font-size: 11px; margin-top: 14px;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
          </div>
        </div>
        """
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
            print(f"[SMTP SUCCESS] Successfully sent OTP email via SMTP to {to_email}")
            return {"status": "sent_via_smtp", "to": to_email}
    except Exception as e:
        print(f"[SMTP FAILURE] Error sending via SMTP: {e}")
        return {"status": "smtp_failed", "otp": otp_code, "to": to_email, "error": str(e)}

def send_resend_otp_email(to_email: str, otp_code: str) -> dict:
    """
    Sends transactional email OTP verification via Resend REST API, falling back to SMTP if unverified domain restriction occurs.
    """
    api_key = settings.RESEND_API_KEY
    from_email = settings.RESEND_FROM_EMAIL or "AI Resume Analyzer <onboarding@resend.dev>"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #FAF6F1; border-radius: 16px; border: 1px solid #E8E2D9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0F2C59; font-size: 22px; margin: 0; font-weight: 900; text-transform: uppercase;">AI Resume Analyzer</h1>
        <p style="color: #60534A; font-size: 12px; margin-top: 4px; font-weight: 600;">Email Verification System</p>
      </div>

      <div style="background-color: #FFFFFF; padding: 20px; border-radius: 12px; border: 1px solid #E2D7CB; text-align: center;">
        <p style="color: #2B241F; font-size: 13px; font-weight: 700; margin-bottom: 12px;">Your 6-Digit Email Verification OTP Code:</p>
        <div style="font-family: monospace; font-size: 32px; font-weight: 900; color: #0047AB; letter-spacing: 6px; padding: 12px; background-color: #EFE7DE; border-radius: 8px; display: inline-block;">
          {otp_code}
        </div>
        <p style="color: #8C7E72; font-size: 11px; margin-top: 14px;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #8C7E72; font-size: 11px;">
        <p>© {settings.PROJECT_NAME}. Email Verification Service.</p>
      </div>
    </div>
    """

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": f"Your Verification OTP Code: {otp_code}",
        "html": html_content
    }

    if not api_key:
        return send_smtp_fallback_email(to_email, otp_code)

    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "AI-Resume-Analyzer/1.0"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"[RESEND SUCCESS] Successfully dispatched email OTP to {to_email}: {res_body}")
            return {"status": "sent", "resend_id": res_body.get("id"), "to": to_email}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"[RESEND API ERROR] Resend HTTP Error {e.code}: {err_body}")
        # If Resend blocks unverified recipient domain, try SMTP fallback
        return send_smtp_fallback_email(to_email, otp_code)
    except Exception as e:
        print(f"[RESEND NOTICE] Exception during email dispatch: {e}")
        return send_smtp_fallback_email(to_email, otp_code)
