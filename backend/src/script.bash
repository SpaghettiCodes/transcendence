#! /bin/bash
python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser --email=abc@abc.com --noinput

# so that admin page doesnt look like ass
python manage.py collectstatic --noinput

# generate SSL Cert
if [[ ! -f "/sslcert/ssl.key" && ! -f "/sslcert/ssl.crt" ]]; then
	echo "Generating SSL Certificate ... "
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /sslcert/ssl.key -out /sslcert/ssl.crt -subj "/C=MY/ST=Selangor/L=ShahAlam/O=ApongUs/OU=IDK/CN=apongus.com" # 2> /dev/null
	echo "Done!"
else
	echo "SSL Cert found"
fi

# run gunicorn
exec gunicorn --bind 0.0.0.0:443 backend.asgi:application -k uvicorn.workers.UvicornWorker --certfile=/sslcert/ssl.crt --keyfile=/sslcert/ssl.key
