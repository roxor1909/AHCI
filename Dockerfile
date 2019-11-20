FROM python:3.7.5

WORKDIR /usr/src/app
ENV FLASK_APP=main.py \
    FLASK_ENV=development \
    FLASK_RUN_PORT=8080

COPY app/requirements.txt ./
RUN pip install -r requirements.txt

COPY app/ ./

EXPOSE 8080

ENTRYPOINT [ "flask", "run", "--host=0.0.0.0" ]