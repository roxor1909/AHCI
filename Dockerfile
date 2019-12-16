FROM python:3.7.5

WORKDIR /usr/src/app

ENV AHCI_DEV=true \
    AHCI_PORT=8080 \
    AHCI_USE_RELOADER=true

COPY app/requirements.txt ./
RUN pip install -r requirements.txt

COPY app/ ./

EXPOSE 8080

ENTRYPOINT [ "python", "main.py" ]