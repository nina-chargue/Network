#!/bin/sh
set -e

gunicorn project4.wsgi:application --bind 0.0.0.0:8080 
# --workers 2 --threads 3 --timeout 120
