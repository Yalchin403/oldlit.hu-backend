from django.db import models

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Book(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=2000)
    price = models.IntegerField()
    hitcounter = models.IntegerField(db_column='hitCounter')  # Field name made lowercase.
    userid = models.ForeignKey('User', models.DO_NOTHING, db_column='userId')  # Field name made lowercase.
    isactive = models.BooleanField(db_column='isActive')  # Field name made lowercase.
    ispremiumactive = models.BooleanField(db_column='isPremiumActive')  # Field name made lowercase.
    contactinfoid = models.OneToOneField('ContactInfo', models.DO_NOTHING, db_column='contactInfoId')  # Field name made lowercase.
    issold = models.BooleanField(db_column='isSold')  # Field name made lowercase.
    isdeleted = models.BooleanField(db_column='isDeleted')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'book'

    def __str__(self) -> str:
        return f"{self.name} - price - {self.price}"


class BookCategoriesCategory(models.Model):
    bookid = models.OneToOneField(Book, models.DO_NOTHING, db_column='bookId', primary_key=True)  # Field name made lowercase.
    categoryid = models.ForeignKey('Category', models.DO_NOTHING, db_column='categoryId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'book_categories_category'
        unique_together = (('bookid', 'categoryid'),)
        verbose_name = 'Book & Category Join'

    def __str__(self) -> str:
        return f"Book id - {self.bookid}, Category id - {self.categoryid}"


class Category(models.Model):
    name = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'category'

    def __str__(self) -> str:
        return self.name

class ContactInfo(models.Model):
    phonenumber = models.CharField(db_column='phoneNumber', max_length=50, blank=True, null=True)  # Field name made lowercase.
    isdeliverable = models.BooleanField(db_column='isDeliverable', blank=True, null=True)  # Field name made lowercase.
    notes = models.CharField(max_length=2000, blank=True, null=True)
    fromaddress = models.CharField(db_column='fromAddress', max_length=100)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'contact_info'

    def __str__(self) -> str:
        if self.phonenumber:
            return f"{self.phonenumber}"
        
        if self.isdeliverable:
            return self.notes[:20]
        
        return f"Can be taken from {self.fromaddress}"


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Review(models.Model):
    stars = models.IntegerField()
    description = models.CharField(max_length=2000, blank=True, null=True)
    bookid = models.ForeignKey(Book, models.DO_NOTHING, db_column='bookId')  # Field name made lowercase.
    userid = models.ForeignKey('User', models.DO_NOTHING, db_column='userId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'review'

    def __str__(self) -> str:
        if not self.description:
            return f"{self.stars} stars"


class User(models.Model):
    firstname = models.CharField(db_column='firstName', max_length=50)  # Field name made lowercase.
    lastname = models.CharField(db_column='lastName', max_length=50)  # Field name made lowercase.
    email = models.CharField(unique=True, max_length=50)
    password = models.CharField(max_length=200)
    issuperuser = models.BooleanField(db_column='isSuperUser')  # Field name made lowercase.
    datejoined = models.DateTimeField(db_column='dateJoined')  # Field name made lowercase.
    isemailverified = models.BooleanField(db_column='isEmailVerified')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'user'

    def __str__(self) -> str:
        return f"{self.firstname} {self.lastname}"


class BookIsActiveWorkerTracker(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="activity_tracker")
    ending_time = models.DateTimeField()

    def __str__(self) -> str:
        return f"{self.book.id} - {self.ending_time}"