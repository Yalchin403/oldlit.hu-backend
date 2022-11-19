from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import (
    Book,
    User
)
from datetime import datetime  
from datetime import timedelta
from .models import BookIsActiveWorkerTracker
from .tasks import send_email_from_template
import os


DOMAIN = os.getenv("DOMAIN")


@receiver(pre_save, sender=Book)
def save_end_active_time(sender, instance, **kwargs):
    previous_ins = Book.objects.values("isactive", "userid").get(id=instance.id)

    if previous_ins["isactive"] == False and instance.isactive == True:
        #TODO:
        # log state changed from inactive to active
        # create another task to check this table to make is_active=False
        # this task needs to be running each 6 hours or so
        current_time = datetime.now()
        ending_time = current_time + timedelta(days=30)

        worker_exists = BookIsActiveWorkerTracker.objects.filter(book=instance).exists()

        if not worker_exists:

            BookIsActiveWorkerTracker.objects.create(
                book=instance,
                ending_time=ending_time
            )

            user_obj = User.objects.get(id=previous_ins["userid"])
            book_absolute_url = f"{DOMAIN}/books/{instance.id}/" #TODO: replace id with slug
            send_email_from_template.delay(
                "django_admin/ad-verified.html",
                user_obj.email,
                "Your add is verified",
                first_name=user_obj.firstname,
                book_absolute_url=book_absolute_url,
                domain=DOMAIN,
            )

        else:
            BookIsActiveWorkerTracker.objects.get(book=instance).ending_time = ending_time
