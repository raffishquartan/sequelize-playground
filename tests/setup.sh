#!/bin/bash
# Run this script before running any tests to set up the database and user
cd ${0%/*}

source config.sh

# Postgres - create user and database
echo setup.sh will now prompt for sudo password to execute commands as postgres user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PW';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# MySQL - create user, no schemas so use one DB per test
echo setup.sh will now prompt 3 times for your mysql root user password
mysql -u root -p mysql -e "DROP USER '$DB_USER'@'localhost';" # no IF EXISTS in MySQL 5.5 or earlier
mysql -u root -p mysql -e "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PW';"
mysql -u root -p mysql -e "GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'localhost';"
