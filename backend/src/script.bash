#! /bin/bash
python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser --email=abc@abc.com --noinput

# so that admin page doesnt look like ass
python manage.py collectstatic --noinput

# run gunicorn
exec gunicorn --bind 0.0.0.0:443 backend.asgi:application -k uvicorn.workers.UvicornWorker --certfile=/sslcert/ssl.crt --keyfile=/sslcert/ssl.key
