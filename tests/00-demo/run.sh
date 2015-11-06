#!/bin/bash
cd ${0%/*}

source ../config.sh
DB_SCHEMA="s00"

# 0) Create schema
sudo -u postgres psql -c "DROP SCHEMA IF EXISTS $DB_SCHEMA CASCADE" "$DB_NAME"
sudo -u postgres psql -c "CREATE SCHEMA $DB_SCHEMA AUTHORIZATION $DB_USER;" "$DB_NAME"
sudo -u postgres psql -c "CREATE EXTENSION \"uuid-ossp\" SCHEMA $DB_SCHEMA;" "$DB_NAME"

# 1) Export schema and data
printf "\n\n\n\n######################## WORKING IN NODE ########################\n"
node 01-populate-db.js
printf "######################### END NODE WORK #########################\n\n\n\n\n"

# 2) Create indexes
sudo -u postgres psql -c "CREATE INDEX entry_tag_entry_ndx ON $DB_SCHEMA.entry_tag (entry_id);" "$DB_NAME"
sudo -u postgres psql -c "CREATE INDEX entry_tag_tag_ndx ON $DB_SCHEMA.entry_tag (tag_id);" "$DB_NAME"
