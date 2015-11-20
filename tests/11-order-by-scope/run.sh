#!/bin/bash
cd ${0%/*}

source ../config.sh
DB_SCHEMA="s11"

# 0) Create schema
sudo -u postgres psql -c "DROP SCHEMA IF EXISTS $DB_SCHEMA CASCADE" "$DB_NAME"
sudo -u postgres psql -c "CREATE SCHEMA $DB_SCHEMA AUTHORIZATION $DB_USER;" "$DB_NAME"
sudo -u postgres psql -c "CREATE EXTENSION \"uuid-ossp\" SCHEMA $DB_SCHEMA;" "$DB_NAME"

# 1) Export schema and data
printf "\n\n\n\n######################## WORKING IN NODE ########################\n"
node 01-populate-db-and-find.js
printf "######################### END NODE WORK #########################\n\n\n\n\n"

