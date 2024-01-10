# Playwright
This is Playwright UI Test Automation repository for Hootsuite, which integrates with SauceLabs & enables cross-browser testing along with test reports,trends and video recordings of builds that can help teams to monitor and debug any failing tests.

# Running Tests On Your Laptop

## Prerequisites
If you are setting up a brand new laptop, you will need to configure the following items, which are required for most projects at Hootsuite.

- A version of bash >= v4
- [Setup your github SSH keys](https://docs.github.com/en/enterprise-server@3.3/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- [Homebrew package manager](https://brew.sh/)
- [Install hs-opskit](https://hootsuite.atlassian.net/wiki/spaces/POD/pages/898785/OpsKit+Help+Page)
- [Setup credentials for Artifactory](https://hootsuite.atlassian.net/wiki/spaces/POD/pages/899658/Artifactory+Home)
- yarn & node 16 or higher (or use nvm)

## Installation
If you have already completed the preceding setup (for example, for another Hootsuite project), you will only need to

```
git clone git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git
cd playwirght-saucelabs-automation
make install
```

### Vault Setup 
***Required when tests use custom commands like getFxiture() etc***

Playwright tests use DynamoDB. In order to run the tests locally you must first
set up your local machine to be able to connect to the DynamoDB database on the dev AWS account if any fixtures (accounts) are used in your test.

***Note: vaultlogin is required every 8 hours, dynamodb-setup-local-dev & dynamodb-setup-for-saucelabs is required every 1 hour***
```bash
# The JSL uses yarn so it is recommended to use yarn locally too
# in order to ensure the same lock file is used
yarn install
# First, you will need to connect to the vault role from dev vault
# Connect to DynamoDB
vaultlogin dev

# This generates a temporary aws session which expires after 60 minutes that has permission only on the dev dynamodb used for test accounts
make dynamodb-setup-local-dev

# This creates necessary saucelabs config for the aws profile
# The credentials are saved locally and are NEVER uploaded to Saucelabs
make dynamodb-setup-for-saucelabs

#Once the time has expired, re-run to create a new session
```

To check what tests are currently locked:

```bash
# This also allows removing a locked test if it is not releasing,
# Remove locked test if it is not releasing, this can happen if a test is existed early and fails to run the lock release. The accounts used by tests in your repo will contains the corresponding name as the TestType.
# If not deleted manually, it will eventually time out.
make dynamodb-browse-locks
```

### Run tests on Saucelabs

- Make sure to install saucectl. Follow the instructions [here](https://docs.saucelabs.com/dev/cli/saucectl/#installing-saucectl/)
- Use the command `npx saucectl run` on terminal to see the results on SL UI
- To view test recording in SauceLabs, You can access SauceLabs through Okta. Test results can be found at https://app.saucelabs.com/dashboard/tests/vdc
- If you want to run tests inside a specific suite, then use `make run-test SUITE_NAME="[Select suite name from .sauce/config.yml]"` or `npx saucectl run --select-suite="Suite Name" `.
- Use the option `--show-console-log` to view the test log in terminal, else the log can also be found under console.log option under Logs tab of SL UI
Refer to the [Jenkinsfile](https://github.hootops.com/hootsuite/playwright-saucelabs-automation/blob/master/playwright.Jenkinsfile) for an example.


### Run tests on local machine

To have faster debugging feedback, you can run test against local browser. Here is a example you can run locally

```bash
npx playwright test tests/testName.js --headed
```

Some of the other most frequently used options are:
-  `--debug` : Runs in debug mode with [playwright inspector](https://playwright.dev/docs/debug).
-  `--ui` : Run tests in interactive UI mode, with a built-in watch mode.
Complete set of command line options can be found in [playwright documents](https://playwright.dev/docs/test-cli#reference).

# Jenkins Job
Jenkins job for this repository can be found at [Dashboard/Playwright_PlanCreate](https://jenkins.build.hootops.com/job/Dashboard/job/Playwright_PlanCreate/)