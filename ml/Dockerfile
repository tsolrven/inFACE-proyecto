FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# uso: docker compose run --rm ml entrenar_clusters.py   |   ... ml evaluar.py
ENTRYPOINT ["python"]
CMD ["entrenar_clusters.py"]