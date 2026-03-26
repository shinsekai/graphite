set dotenv-load

# ── Development ──────────────────────────────────────
dev:
    bunx turbo dev

install:
    bun install

check:
    bunx turbo check

test:
    bunx turbo test

typecheck:
    bunx turbo typecheck

build:
    bunx turbo build

# ── Docker Compose (full local stack) ────────────────
up:
    docker compose up -d

up-build:
    docker compose build --no-cache app && docker compose up -d

down:
    docker compose down

stop:
    docker compose stop

logs:
    docker compose logs -f app

restart:
    docker compose build --no-cache app && docker compose up -d

# ── Database ─────────────────────────────────────────
db-migrate:
    bunx turbo db:migrate

db-generate:
    bunx drizzle-kit generate

db-studio:
    bunx drizzle-kit studio

# ── Docker (standalone image) ────────────────────────
docker-build:
    docker build --no-cache -f Dockerfile -t graphite:local .

docker-run:
    docker run --env-file .env -p 3000:3000 graphite:local

# ── Infrastructure ───────────────────────────────────
infra-preview:
    cd infra && pulumi preview

infra-up:
    cd infra && pulumi up

deploy:
    ./infra/scripts/deploy.sh

# ── Utilities ────────────────────────────────────────
clean:
    rm -rf node_modules .turbo apps/*/{node_modules,.turbo,dist} packages/*/{node_modules,.turbo,dist}

format:
    bunx biome format --write .
