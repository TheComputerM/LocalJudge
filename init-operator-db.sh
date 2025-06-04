#!/bin/bash
set -e

echo "Creating PostgreSQL database for Operator..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE $POSTGRES_OPERATOR_DB;
EOSQL