# goofy django smpt only works ONCE
# WHAT

import os
import smtplib
from email.mime.text import MIMEText
from backend.settings import EMAIL_HOST_USER, EMAIL_HOST_PASSWORD

def send_email(subject, body, recipients):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = EMAIL_HOST_USER
    msg['To'] = ', '.join(recipients)
    with smtplib.SMTP('smtp.gmail.com', 587) as smtp_server:
        smtp_server.ehlo()
        smtp_server.starttls()
        smtp_server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        smtp_server.sendmail(EMAIL_HOST_USER, recipients, msg.as_string())
        smtp_server.close()
