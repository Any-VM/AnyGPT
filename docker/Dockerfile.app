### Build stage
FROM python:3.11-alpine as build

ENV PIP_DEFAULT_TIMEOUT=100 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.8.3

WORKDIR /app
COPY pyproject.toml poetry.lock ./

RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev \
    && pip install "poetry==$POETRY_VERSION" \
    && poetry export -f requirements.txt -o requirements.txt

### Final stage
FROM python:3.11-alpine as final

WORKDIR /app

COPY --from=build /app/requirements.txt .

RUN set -ex \
    && addgroup -S -g 1001 appgroup \
    && adduser -S -u 1001 -G appgroup appuser \
    && apk add --no-cache libffi \
    && pip install -r requirements.txt

COPY . .

EXPOSE 80

CMD ["litestar", "run", "--port", "80", "--host", "0.0.0.0"]

USER appuser