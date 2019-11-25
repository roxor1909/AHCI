#!/bin/sh
export FLASK_APP=main.py
export FLASK_ENV=development
export FLASK_RUN_PORT=8080

export AHCI_DEV=true
export AHCI_PORT=8080
export AHCI_USE_RELOADER=true

python ./app/main.py