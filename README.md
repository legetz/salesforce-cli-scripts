# salesforce-cli-scripts

Collection of Salesforce scripts written with TypeScript and powered by JSForce

## Setting up

- `nvm use`
  - Make sure you have [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) installed
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
  - Abort list of BULK API jobs (update jobList at abort.ts before running command)
    - `yarn run abort`
  - Do BULK API update
    - `yarn run bulk-update`
  - Export files related to certain SF records into export folder
    - `yarn run export-files`
  - Connect to local MongoDB docker container
    - `yarn script database-test`
