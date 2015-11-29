# sequelize-playground

*A collection of Sequelize tests and experiments, along with scripts to make it easy to create new ones*

Each test exists in its own pg schema. After the test has been run for the first time future runs should be idempotent.

## How to use run a test with pg

1. Clone this repository
2. Run `tests/setup.sh` (sudo's to the postgres user)
3. Run `tests/xx-test-dir/run.sh` (sudo's to drop if exists and then create the test schema)

## How to add a pg test to sequelize-playground

Pull requests are always welcome. When writing a new test:

1. Create a directory, incrementing the test number and giving it a short description
2. In the test's package.json specify its name, description and any npm packages that it uses
3. Using an existing test's `run.sh` and `*.js` files as a base, modify the schema and make any changes necessary. Typically:
  - `run.sh` sources the DB user name, DB user password and DB name from `tests/config.sh`
  - `run.sh` calls out to node to execute any JS scripts associated with the test, these scripts may need to specify the schema as well

## How to use sequelize-playground with another backing store

sequelize-playground is configured to use pg as a backing store. To change it to use another one instead or as well, modify and re-run `tests/setup.sh` so that future tests using the other backing store can execute independently of each other. Re-running an unmodified `tests/setup.sh` will delete all existing test results in the PG database.
