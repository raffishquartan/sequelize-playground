#!/bin/bash
cd ${0%/*}

source ../config.sh
DB_SCHEMA="s15"
[[ "$DEBUG" = 1 ]] && NODE_COMMAND=node-debug || NODE_COMMAND=node

echo NODE COMMAND: $NODE_COMMAND

# 0) Create database - mysql
sudo -u postgres psql -c "DROP SCHEMA IF EXISTS $DB_SCHEMA CASCADE" "$DB_NAME"
sudo -u postgres psql -c "CREATE SCHEMA $DB_SCHEMA AUTHORIZATION $DB_USER;" "$DB_NAME"
sudo -u postgres psql -c "CREATE EXTENSION \"uuid-ossp\" SCHEMA $DB_SCHEMA;" "$DB_NAME"

# 1) Do stuff in Node
printf "\n\n############################# PGres #############################\n"
$NODE_COMMAND 01-populate.js
printf "#################################################################\n\n\n"
