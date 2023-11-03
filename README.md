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
