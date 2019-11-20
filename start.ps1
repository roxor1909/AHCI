# Quick and dirty

$env:FLASK_APP="main.py"
$env:FLASK_ENV="development"
$env:FLASK_RUN_PORT=8080
Set-Location .\app
flask run