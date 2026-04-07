FROM python:3.11-slim AS model-downloader

WORKDIR /app
RUN pip install --no-cache-dir huggingface-hub==0.23.2

RUN mkdir -p /models/tomato-vit /models/maize-tf /models/rice-siglip

RUN python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='wellCh4n/tomato-leaf-disease-classification-vit', local_dir='/models/tomato-vit', ignore_patterns=['*.msgpack','*.h5','flax_model*','tf_model*','rust_model*']); print('Tomato ViT downloaded')"

RUN python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='eligapris/maize-diseases-detection', local_dir='/models/maize-tf'); print('Maize TF downloaded')"

RUN python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='prithivMLmods/Rice-Leaf-Disease', local_dir='/models/rice-siglip', ignore_patterns=['*.msgpack','*.h5','flax_model*','tf_model*']); print('Rice SigLIP2 downloaded')"

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 libglib2.0-0 libsm6 libxext6 libxrender-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=model-downloader /models /app/models

COPY . .

ENV MODELS_DIR=/app/models
ENV ENVIRONMENT=production
ENV LOG_LEVEL=INFO

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
