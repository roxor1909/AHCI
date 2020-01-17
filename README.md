# AHCI

- [AHCI](#ahci)
  - [Development](#development)
    - [Docker](#docker)
    - [Native](#native)
      - [For bash](#for-bash)
      - [For powershell (Windows 🎉)](#for-powershell-windows-%f0%9f%8e%89)

## Production

### Docker

```bash
docker build -t ahci -f DockerfileRaspberryPi .
docker run -p 8080:8080 ahci
```

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
      export AHCI_DEV=true \
         AHCI_PORT=8080 \
         AHCI_USE_RELOADER=true
      python main.py
   ```

   > Or simply run the start.sh script

#### For powershell (Windows 🎉)

1. See 1. at [For bash](#for-bash)

2. See 2. at [For bash](#for-bash)

   ```powershell
      # within the app directory
      $env:AHCI_DEV=$true
      $env:AHCI_PORT=8080
      $env:AHCI_USE_RELOADER=$true
      python main.py
   ```

   > Or simply run the start.ps1 script
