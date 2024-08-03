#! /bin/bash

# script to generate ssl cert and CA
# generate SSL Cert

mkdir -p ./sslcert
cd ./sslcert

if [[ ! -f "./ssl.key" && ! -f "./ssl.crt" ]]; then
	# echo "Generate CA Cert ... "

	# openssl genrsa -out CAPrivate.key 2048

	# openssl req -x509 -new -nodes -key CAPrivate.key -sha256 -days 365 -out CAPrivate.pem -subj "/C=MY/ST=Selangor/L=ShahAlam/O=ApongUs/OU=IDK/CN=apongus.com"

	# echo "Done!"

	# echo "Generating SSL Certificate ... "

	# openssl genrsa -out ssl.key 2048
	# openssl req -new -key ssl.key -out ssl.csr -subj "/C=MY/ST=Selangor/L=ShahAlam/O=ApongUs/OU=IDK/CN=apongus.com"
	# openssl x509 -req -in ssl.csr -CA CAPrivate.pem -CAkey CAPrivate.key -CAcreateserial -out ssl.crt -days 365 -sha256 

	echo "Generating SSL Certificate ... "

	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout ./ssl.key \
	-out ./ssl.crt \
	-subj "/C=MY/ST=Selangor/L=ShahAlam/O=ApongUs/OU=IDK/CN=localhost" \
	2> /dev/null

	# i dont fucking know what am i doing

	chmod 555 ssl.key ssl.crt
	echo "Done!"
else
	echo "SSL Cert found"
fi
