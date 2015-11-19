#!/bin/bash
cd ${0%/*}

source ../config.sh
MYSQL_DB_NAME="s09"
DB_SCHEMA="s09"

# 0) Create database - mysql
mysql --user="$DB_USER" --password="$DB_PW" -e "DROP DATABASE IF EXISTS $MYSQL_DB_NAME;"
mysql --user="$DB_USER" --password="$DB_PW" -e "CREATE DATABASE $MYSQL_DB_NAME;"

# 1) Create schema - postgres
sudo -u postgres psql -c "DROP SCHEMA IF EXISTS $DB_SCHEMA CASCADE" "$DB_NAME"
sudo -u postgres psql -c "CREATE SCHEMA $DB_SCHEMA AUTHORIZATION $DB_USER;" "$DB_NAME"
sudo -u postgres psql -c "CREATE EXTENSION \"uuid-ossp\" SCHEMA $DB_SCHEMA;" "$DB_NAME"

# 2) Do stuff in Node
printf "\n\n############################# MySQL #############################\n"
node 01-mysql-demo.js
printf "#################################################################\n\n\n"

printf "\n\n############################ Postgres ###########################\n"
node 02-pg-demo.js
printf "#################################################################\n\n\n"
