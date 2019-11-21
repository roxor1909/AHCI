#!/bin/sh
FLASK_APP=main.py
FLASK_ENV=development
FLASK_RUN_PORT=8080

AHCI_DEV=true
AHCI_PORT=8080
AHCI_USE_RELOADER=true

python ./app/main.py