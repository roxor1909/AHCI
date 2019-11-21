FROM python:3.7.5

WORKDIR /usr/src/app
# TODO: Check that
# not necessary anymore i think
ENV FLASK_APP=main.py \
    FLASK_ENV=development \
    FLASK_RUN_PORT=8080

COPY app/requirements.txt ./
RUN pip install -r requirements.txt

COPY app/ ./

EXPOSE 8080

ENTRYPOINT [ "python", "main.go", "--host=0.0.0.0" ]