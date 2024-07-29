#! /bin/bash

# generates the ssl certificate and key
# its placed here instead of in the Dockerfile because if the cert expires, you need to rebuild the entire thing
# its better to just put it here and let it make a new cert whenever you run it, instead of rebuilding the entire container

echo "Generating SSL Certificate ... "
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj "/C=$country/ST=$state/L=$city/O=$org/OU=$position/CN=$domain_name" 2> /dev/null
echo "Done!"

echo "Nginx web server is runnning now!"
exec nginx -g 'daemon off;';