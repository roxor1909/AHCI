# AHCI

## Development

### Docker

```bash
docker build -t ahci .
docker run -p 8080:8080 ahci
```

### Native

1. Install Python 3.7.5 and Pip (or simply install Anaconda).

2. Install all dependencies:

   ```bash
   cd ./app/
   pip install -r requirements.txt
   ```

3. Run your app:

   ```bash
   FLASK_APP=main.py \
       FLASK_ENV=development \
       FLASK_RUN_PORT=8080 \
       flask run
   ```