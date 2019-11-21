# Quick and dirty
$env:FLASK_APP="main.py"
$env:FLASK_ENV="development"
$env:FLASK_RUN_PORT=8080

$env:AHCI_DEV=$true
$env:AHCI_PORT=8080
$env:AHCI_USE_RELOADER=$true

python .\app\main.py