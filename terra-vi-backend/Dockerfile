# ── Stage 1: Model downloader ─────────────────────────────────────────────────
# Downloads models into /models at build time so they are BAKED INTO the image.
# No download at runtime. Container starts instantly.
FROM python:3.11-slim AS model-downloader

WORKDIR /app
RUN pip install --no-cache-dir huggingface-hub==0.23.2

# Download all three models — this layer is cached by Docker
# Re-runs only if model IDs change
RUN mkdir -p /models/tomato-vit /models/maize-tf /models/rice-siglip

# Tomato ViT (~350MB)
RUN python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='wellCh4n/tomato-leaf-disease-classification-vit',
    local_dir='/models/tomato-vit',
    ignore_patterns=['*.msgpack','*.h5','flax_model*','tf_model*','rust_model*'],
)
print('Tomato ViT downloaded')
"

# Maize TF SavedModel (~25MB)
RUN python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='eligapris/maize-diseases-detection',
    local_dir='/models/maize-tf',
)
print('Maize TF downloaded')
"

# Rice SigLIP2 (~93MB)
RUN python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='prithivMLmods/Rice-Leaf-Disease',
    local_dir='/models/rice-siglip',
    ignore_patterns=['*.msgpack','*.h5','flax_model*','tf_model*'],
)
print('Rice SigLIP2 downloaded')
"


# ── Stage 2: Runtime image ────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libglib2.0-0 libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy models from downloader stage
COPY --from=model-downloader /models /app/models

# Copy application code
COPY . .

# Set models directory to baked-in path
ENV MODELS_DIR=/app/models
ENV ENVIRONMENT=production
ENV LOG_LEVEL=INFO

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
