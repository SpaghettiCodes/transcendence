#! /bin/bash
python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser --email=abc@abc.com --noinput

# temp
exec python manage.py runserver 0.0.0.0:8000 --verbosity 3