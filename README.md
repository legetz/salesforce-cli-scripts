# salesforce-cli-scripts

Collection of Salesforce scripts written with TypeScript and powered by JSForce

## Setting up

- `nvm use`
  - Make sure you have [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) installed
  - Node.js LTS Hydrogen is the required version (18.x)
- Install yarn package manager if you lack that
  - `npm install --global yarn`
- Install dependencies with yarn
  - `yarn install`
- Create `.env` file like this
  ```
  SF_URL=https://login.salesforce.com
  SF_USER=your.username@something.com
  SF_PASS=YOUR_PASSWORD_AND_SECURITY_TOKEN
  ```
- Run desired script
  - Export all files connected to accounts
    - `yarn run export-files`
    - Script can be easily modified so that files under another table are exported
      - For example, export cases: `const sfTableApiName = 'Case'`
  - Export SOQL results into export folder as CSV file
    - `yarn run export-data-csv`
    - Script can be easily modified so that another table is exported
      - For example, export opportunities: `const sfTableApiName = 'Opportunity'`
  - Import CSV file records into SQLite database using simple/automatic table schema
    - `yarn run import-csv-sqlite`
  - Import CSV file records into SQLite database while controlling table schema
    - `yarn run import-csv-sqlite-advanced`
  - Abort list of BULK API jobs
    - `yarn run abort`
  - Do BULK API update
    - `yarn run bulk-update`
  - Listen platform events
    - `yarn run platform-event-listener`
  - Empty certain case fields based on the cases.json file containing case ID's
    - `yarn run empty-fields`
  - Connect to local MongoDB docker container
    - `yarn run mongo-test`
