# AHCI

- [AHCI](#ahci)
  - [Development](#development)
    - [Docker](#docker)
    - [Native](#native)
      - [For bash](#for-bash)
      - [For powershell (Windows 🎉)](#for-powershell-windows-%f0%9f%8e%89)

## Production

1. Build the Docker image or pull the ready to run image from Docker Hub:

   ```bash
   # build:
   docker build -t philenius/ahci-smart-mirror-project:arm-raspi-v2 -f DockerfileRaspberryPi .

   # or pull:
   docker pull philenius/ahci-smart-mirror-project:arm-raspi-v2
   ```

2. On Raspberry Pi: copy the startup script `start-smart-mirror` to `/home/pi/`. This startup script starts the Docker container and opens Chromium.

3. On Raspberry Pi: add a cronjob to execute the startup script on every system reboot.
   ```bash
   crontab -e
   ```
   Add the following line:
   ```
   @reboot DISPLAY=:0 /home/pi/start-smart-mirror.sh > /home/pi/cron.log 2>&1
   ```

## AUI aspects

* Depending on the detected user, the UI changes its appearance (colors, change displayed name, change statistics).
* Depending on the users position in front of the screen / mirror, the panels of the UI are moved to another position.
* The UI classifies users into different personas: child, adult or senior. Depending on the persona, different UI elements are visualized.
* Design language of the UI is strongly inspired by the original user interfaces from the Star Wars movies. See

## SVG

* Use JS lib Snap.svg:
  * Built-in animations
  * Supports GIF and videos
  * Easily draw charts
* Create SVG files in Gravit Designer
* Manually integrate fonts into SVG files (base64 encoded because all other options didn't work)
* Color Palette:
  * Green bright: #40e5ad
  * Green dark: #19bfa9
  * Red bright: #e4281d
  * Red dark: #b5060d

* Ursprünglich mit Matploblib im Backend geplottet. Caching Problem
* Idee mit Persona: child, adult, senior

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
