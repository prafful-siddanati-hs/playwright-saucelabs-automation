# Playwright
UI Test Automation

# Prerequisites

If you are setting on brand new laptop, you will need to setup below items which are prerequisites for most projects at Hootsuite

A version of bash >= v4
Setup your github SSH keys
Homebrew package manager
Install hs-opskit
Credentials for Artifactory
yarn & node 16 or higher (or use nvm)

# Installation

```
git clone git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git
cd playwirght-saucelabs-automation
make install
```

To run your tests on Saucelabs via local
- Make sure to install saucectl. Follow the instructions [here](https://docs.saucelabs.com/dev/cli/saucectl/#installing-saucectl/)
- Use the command `npx saucectl run` on terminal to see the results on SL UI
- If you want to run tests inside a specific suite, then use `npx saucectl run --select-suite="Suite Name" `. Refer to the [Jenkinsfile](https://github.hootops.com/hootsuite/playwright-saucelabs-automation/blob/master/playwright.Jenkinsfile) for an example.


### Vault Setup 
***required if tests use getFixture()***

Playwright tests use DynamoDB. In order to run the tests locally you must first
set up your local machine to be able to connect to the DynamoDB database on the dev AWS account if any fixtures (accounts) are used in your test.

***Note: vaultlogin required every 8 hours, dynamodb-setup-local-dev required every 1 hour***
```bash
# The JSL uses yarn so it is recommended to use yarn locally too
# in order to ensure the same lock file is used
yarn install
# First, you will need to connect to the vault role from dev vault
# Connect to DynamoDB
vaultlogin dev

#This generates a temporary aws session which expires after 60 minutes that has permission only on the dev dynamodb used for test accounts
make dynamodb-setup-local-dev

#Once the time has expired, re-run to create a new session
```

To check what tests are currently locked:

```bash
# This also allows removing a locked test if it is not releasing,
# Remove locked test if it is not releasing, this can happen if a test is existed early and fails to run the lock release. The accounts used by tests in your repo will contains the corresponding name as the TestType.
# If not deleted manually, it will eventually time out.
make dynamodb-browse-locks
```