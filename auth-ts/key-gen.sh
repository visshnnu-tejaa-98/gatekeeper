#!/bin/bash

CERT_DIR="certs"

mkdir -p "$CERT_DIR"

# Generate private key
openssl genpkey -algorithm RSA -out "$CERT_DIR/private-key.pem" -pkeyopt rsa_keygen_bits:2048

openssl rsa -in "$CERT_DIR/private-key.pem" -pubout -out "$CERT_DIR/public-key.pub"

echo "Keys generated in $CERT_DIR directory"