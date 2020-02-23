# AHCI

- [AHCI](#ahci)
  - [Production](#production)
  - [Development](#development)
    - [Docker](#docker)
    - [Native](#native)
      - [For bash](#for-bash)
      - [For powershell (Windows 🎉)](#for-powershell-windows-%f0%9f%8e%89)
  - [Notes](#notes)

## Production

1. Install [Docker on the Raspberry Pi](https://www.docker.com/blog/happy-pi-day-docker-raspberry-pi/).

2. Ideally, connect the official Raspberry Pi Camera Module and [configure it](https://desertbot.io/blog/how-to-stream-the-picamera). Alternatively, every USB webcam should work.

3. Build the Docker image or pull the ready to run image from Docker Hub:

   ```bash
   # build:
   docker build -t philenius/ahci-smart-mirror-project:arm-raspi-v2 -f DockerfileRaspberryPi .

   # or pull:
   docker pull philenius/ahci-smart-mirror-project:arm-raspi-v2
   ```

4. Copy the startup script `start-smart-mirror` to `/home/pi/`. This startup script starts the Docker container and opens Chromium with every reboot of the Raspberry Pi.

5. Add a cronjob to execute the startup script on every system reboot.
   ```bash
   crontab -e
   ```
   Add the following line:
   ```
   @reboot DISPLAY=:0 /home/pi/start-smart-mirror.sh > /home/pi/cron.log 2>&1
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


## Notes

* All SVG graphics were edited with [Gravit Designer](https://www.designer.io/).
* Attention: the SVG graphics were manually edited after exporting them from Gravit Designer in order to integrate fonts. This steps is required because the fonts used inside the SVG files do not represent standard fonts and are therefore not installed on most systems.
* Color Palette:
  * Bright green: `#40e5ad`
  * Dark green: `#19bfa9`
  * Bright red: `#e4281d`
  * Dark red: `#b5060d`
