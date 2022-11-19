from celery import shared_task
from django.core.mail import EmailMessage
from oldlithu_admin_panel.settings import EMAIL_HOST_USER
import os
import pathlib
import logging
from django.template.loader import render_to_string


LOGGER = logging.getLogger(__name__)


@shared_task
def send_email_from_template(template_name, receiver, subject, **kwargs):
    try:
        content = render_to_string(template_name, kwargs)
        msg = EmailMessage(
                subject,
                content,
                EMAIL_HOST_USER,
                [receiver]
            )
        msg.content_subtype = "html"
        msg.send()

    except:
        LOGGER.exception(f"Couldn't send the email")