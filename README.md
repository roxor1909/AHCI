# AHCI

- [AHCI](#ahci)
  - [Development](#development)
    - [Docker](#docker)
    - [Native](#native)
      - [For bash](#for-bash)
      - [For powershell (Windows 🎉)](#for-powershell-windows-%f0%9f%8e%89)

## Development

### Docker

```bash
docker build -t ahci .
cd ./app/
docker run -p 8080:8080 -v $(pwd):/usr/src/app ahci
```

### Native

#### For bash

1. Install Python 3.7.5 and Pip (or simply install Anaconda).

2. Install all dependencies:

   ```bash
   cd ./app/
   pip install -r requirements.txt
   ```

3. Run your app:

   ```bash
   FLASK_APP="main.py" \
       FLASK_ENV="development" \
       FLASK_RUN_PORT=8080 \
       flask run
   ```

#### For powershell (Windows 🎉)

1. See 1. at [For bash](#for-bash)

2. See 2. at [For bash](#for-bash)

   ```powershell
       # within the app directory
       $env:FLASK_APP=main.py; $env:FLASK_ENV=development; $env:FLASK_RUN_PORT=8080; flask run
   ```

   > Or simply run the start.ps1 script
