# Docker Setup for Local Development

This project includes a Docker Compose configuration to run PostgreSQL 17 for local development.

## Prerequisites

- Docker and Docker Compose installed on your system
- Node.js and npm/pnpm/bun for running the application

## Quick Start

1. **Start the PostgreSQL container:**

   ```bash
   docker-compose up -d
   ```

2. **Set up your environment variables:**
   Create a `.env` file in the root directory with:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wieczorny_szept"
   ```

3. **Run database migrations:**

   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Container Details

- **PostgreSQL Version:** 17 (Alpine)
- **Port:** 5432
- **Database:** wieczorny_szept
- **Username:** postgres
- **Password:** postgres
- **Container Name:** wieczorny_szept_postgres

## Useful Commands

**Start the database:**

```bash
docker-compose up -d
```

**Stop the database:**

```bash
docker-compose down
```

**View logs:**

```bash
docker-compose logs postgres
```

**Reset the database (removes all data):**

```bash
docker-compose down -v
docker-compose up -d
```

**Access PostgreSQL directly:**

```bash
docker exec -it wieczorny_szept_postgres psql -U postgres -d wieczorny_szept
```

## Health Check

The container includes a health check that verifies the database is ready to accept connections. You can check the status with:

```bash
docker-compose ps
```

## Data Persistence

Database data is persisted in a Docker volume named `postgres_data`. This means your data will survive container restarts and recreations.

## Troubleshooting

If you encounter connection issues:

1. Ensure the container is running: `docker-compose ps`
2. Check the logs: `docker-compose logs postgres`
3. Verify the port isn't already in use: `lsof -i :5432`
4. Make sure your `.env` file has the correct `DATABASE_URL`
