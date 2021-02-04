# salesforce-cli-scripts
Collection of Salesforce scripts written with TypeScript and powered by JSForce

## Setting up
* `nvm use`
	* Make sure you have [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) installed
* `npm install`
* Create `.env` file like this
	```
	SF_URL=https://login.salesforce.com
	SF_USER=your.username@something.com
	SF_PASS=YOUR_PASSWORD_AND_SECURITY_TOKEN
	```
* Run desired script
	* Abort list of BULK API jobs (update jobList at abort.ts before running command)
		* `npm run abort`
	* Do BULK API update
		* `npm run bulk-update`
