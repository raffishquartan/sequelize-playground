#!/bin/bash
cd ${0%/*}

source ../config.sh
MYSQL_DB_NAME="s13"

# 0) Create database - mysql
mysql --user="$DB_USER" --password="$DB_PW" -e "DROP DATABASE IF EXISTS $MYSQL_DB_NAME;"
mysql --user="$DB_USER" --password="$DB_PW" -e "CREATE DATABASE $MYSQL_DB_NAME;"

# 1) Do stuff in Node
printf "\n\n############################# MySQL #############################\n"
node 01-populate-insert-find.js
printf "#################################################################\n\n\n"
