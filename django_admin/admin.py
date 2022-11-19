from django.contrib import admin
from .models import (
    User,
    Review,
    ContactInfo,
    Category,
    BookCategoriesCategory,
    Book,
    BookIsActiveWorkerTracker,
)


admin.site.register([
    User,
    Review,
    ContactInfo,
    Category,
    BookCategoriesCategory,
    Book,
    BookIsActiveWorkerTracker,
])