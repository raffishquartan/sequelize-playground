#!/bin/bash
cd ${0%/*}

source ../config.sh
DB_NAME="s07"

# 0) Create database
echo "DROP DATABASE IF EXISTS $DB_NAME;"
mysql --user="$DB_USER" --password="$DB_PW" -e "DROP DATABASE IF EXISTS $DB_NAME;"
echo "CREATE DATABASE $DB_NAME;"
mysql --user="$DB_USER" --password="$DB_PW" -e "CREATE DATABASE $DB_NAME;"

# 1) Export schema and data
printf "\n\n\n\n######################## WORKING IN NODE ########################\n"
node 01-populate-db-with-sequelize.js
printf "######################### END NODE WORK #########################\n\n\n\n\n"
