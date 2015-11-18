#!/bin/bash
cd ${0%/*}

source ../config.sh
DB_NAME="s08"

# 0) Create database
echo "DROP DATABASE IF EXISTS $DB_NAME;"
mysql --user="$DB_USER" --password="$DB_PW" -e "DROP DATABASE IF EXISTS $DB_NAME;"
echo "CREATE DATABASE $DB_NAME;"
mysql --user="$DB_USER" --password="$DB_PW" -e "CREATE DATABASE $DB_NAME;"

# 1) Export schema and data
printf "\n\n######################## WORKING IN NODE ########################\n"
node 01-create-schema-and-upsert.js
printf "######################### END NODE WORK #########################\n\n\n"

