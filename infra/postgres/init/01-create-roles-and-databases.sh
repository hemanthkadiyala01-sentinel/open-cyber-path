#!/usr/bin/env bash
set -Eeuo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=keycloak_password="$KEYCLOAK_DB_PASSWORD" \
  --set=app_owner_password="$APP_OWNER_PASSWORD" \
  --set=app_runtime_password="$APP_RUNTIME_PASSWORD" <<'SQL'
CREATE ROLE keycloak LOGIN PASSWORD :'keycloak_password';
CREATE DATABASE keycloak OWNER keycloak;
CREATE ROLE opencyberpath_owner LOGIN PASSWORD :'app_owner_password';
CREATE DATABASE opencyberpath OWNER opencyberpath_owner;
CREATE ROLE opencyberpath_runtime LOGIN PASSWORD :'app_runtime_password';
GRANT CONNECT ON DATABASE opencyberpath TO opencyberpath_runtime;
SQL
