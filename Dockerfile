FROM python:3.7.5

WORKDIR /usr/src/app

ENV AHCI_DEV=true \
    AHCI_PORT=8080 \
    AHCI_USE_RELOADER=true

RUN apt-get update && apt-get install -y \
    cmake \
 && rm -rf /var/lib/apt/lists/*

COPY app/requirements.txt ./
RUN pip install -r requirements.txt

COPY app/object_detection/pip_binaries/tflite_runtime-1.14.0-cp37-cp37m-linux_x86_64.whl ./
RUN pip install tflite_runtime-1.14.0-cp37-cp37m-linux_x86_64.whl
COPY app/ ./

EXPOSE 8080

ENTRYPOINT [ "python", "main.py" ]
