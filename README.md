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
cd playwright-saucelabs-automation
make install
```

### Vault Setup 
***Required when tests use custom commands like getFixture() etc***

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
#### Your Laptop to (SauceLabs Browsers)

Export your Saucelabs username and key in your laptop. Username and key can be found at https://app.saucelabs.com/user-settings
```bash
export SAUCE_ACCESS_KEY=your_sl_key
export SAUCE_USERNAME=your_sl_name
```

Open a new terminal window and initiate a local tunnel to execute tests on SauceLabs.
```bash
make start-tunnel-local
```

### Run tests on Saucelabs

- Make sure to install saucectl. Follow the instructions [here](https://docs.saucelabs.com/dev/cli/saucectl/#installing-saucectl/)
- Use the command `npx saucectl run` on terminal to see the results on SL UI
- To view test recording in SauceLabs, You can access SauceLabs through Okta. Test results can be found at https://app.saucelabs.com/dashboard/tests/vdc
- If you want to run tests inside a specific suite, then use `make run-test SUITE_NAME="[Select suite name from .sauce/config.yml]"` or `npx saucectl run --select-suite="Suite Name" `.
- Use the option `--show-console-log` to view the test log in terminal, else the log can also be found under console.log option under Logs tab of SL UI
Refer to the [Jenkinsfile](https://github.hootops.com/hootsuite/playwright-saucelabs-automation/blob/master/playwright.Jenkinsfile) for an example.


### Run tests on local machine

To have faster debugging feedback, you can run test against local Chrome browser. Here is a example you can run locally

```bash
npx playwright test -c playwright.config.js tests/testName.js --headed --project chromium
```

Some of the other most frequently used options are:
-  `--debug` : Runs in debug mode with [playwright inspector](https://playwright.dev/docs/debug).
-  `--ui` : Run tests in interactive UI mode, with a built-in watch mode.
Complete set of command line options can be found in [playwright documents](https://playwright.dev/docs/test-cli#reference).

# Jenkins Job
Jenkins job for this repository can be found at [Dashboard/Playwright_PlanCreate](https://jenkins.build.hootops.com/job/Dashboard/job/Playwright_PlanCreate/)

# Writing playwright tests / Code Practices

## Structure

All tests should be written in the format `tests/{PortofolioFolder}/{testFileName}.js/ts`. Reusable test commands (such as `login()`) and selectors of elements (such as `#loginEmailInput`) should be added to the `pages` directory. Lastly, reusable functions to validate, command, and assert in tests should be added to the [Playwright-Custom-Commands](https://github.hootops.com/hootsuite/playwright-saucelabs-automation/tree/master/custom-commands).

## Naming of test files, page objects files

(TBD)

## Running lint checker

This playwright repository is configured with [eslint](https://github.hootops.com/hootsuite/playwright-saucelabs-automation/blob/master/.eslintrc.js) to check and enforce certain coding standards.
You can run eslint for whole project using `yarn lint` or alternatively for individual test files using `npx eslint tests/testFolder/testFileName.js`. To fix any warnings and errors run `yarn lint-fix`.
