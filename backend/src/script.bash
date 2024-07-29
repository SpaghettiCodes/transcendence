#! /bin/bash
python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser --email=abc@abc.com --noinput

# temp
exec python -m gunicorn --bind 0.0.0.0:8000 backend.asgi:application -k uvicorn.workers.UvicornWorker 
