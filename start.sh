#!/bin/sh
cd ./app
FLASK_APP=main.py \
    FLASK_ENV=development \
    FLASK_RUN_PORT=8080 \
    flask run