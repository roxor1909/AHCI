#!/usr/bin/env bash

docker rm -f ahci
docker run -d --name ahci -p 8080:8080 philenius/ahci-smart-mirror-project:arm-raspi-v2

sleep 60

while true; do
        echo "start chromium"
	/usr/bin/chromium-browser --kiosk --disable-translate "http://localhost:8080" --use-fake-ui-for-media-stream --test-type --force-device-scale-factor=1.0
        echo "chromium stopped"
done