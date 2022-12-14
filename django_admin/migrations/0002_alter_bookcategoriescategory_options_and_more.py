# Generated by Django 4.0 on 2022-11-19 15:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('django_admin', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bookcategoriescategory',
            options={'managed': False, 'verbose_name': 'Book & Category Join'},
        ),
        migrations.CreateModel(
            name='BookIsActiveWorkerTracker',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ending_time', models.DateTimeField()),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activity_tracker', to='django_admin.book')),
            ],
        ),
    ]
