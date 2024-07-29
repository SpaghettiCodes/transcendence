#! /bin/bash

# generates the ssl certificate and key
if [[ ! -f "/sslcert/ssl.key" && ! -f "/sslcert/ssl.crt" ]]; then
	echo "Generating SSL Certificate ... "
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /sslcert/ssl.key -out /sslcert/ssl.crt -subj "/C=MY/ST=Selangor/L=ShahAlam/O=ApongUs/OU=IDK/CN=apongus.com" # 2> /dev/null
	echo "Done!"
else
	echo "SSL Cert found"
fi

echo "Nginx web server is runnning now!"
exec nginx -g 'daemon off;';