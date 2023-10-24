#!groovy
import hootsuite.jsl.pipeline.General

@Library('hootsuite@6') _

def pod = declarePod {
    name = 'playwright'
    vault {}
    containerDefault = 'playwright'
    container {
        name = 'playwright'
        image = 'default/playwright'
        cpu = 2
        memory = '8Gi'
    }
}

pod {
    execWrapper {
        stage ('Setup playwright') {     
            checkout scm
            sh 'rm -rf playwright-saucelabs-automation && git clone --branch PUB-30648 --single-branch git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git playwright-saucelabs-automation --depth=1'
            sh 'yarn install'
            sh 'npm install saucectl'
        }
        stage ('Run tests via saucelabs') {
            try {
                def suiteNames = ["[Playwright] Firefox", "[Playwright] Plan Create Tests"]
                def general = new General()
                general.saucelabsVaultSetup {
                    echo 'Running saucectl... '
                    for (suiteName in suiteNames) {
                        sh "npx saucectl run --select-suite \"${suiteName}\""
                    }
                }
            }
            catch(err) {
                println (err.toString())
            }
        }
    }
}

def execWrapper(Closure c) {
    try {
        c()
        echo "Build Success"
        //TODO:Update slack channel and details
        slackSend color: '#138347', channel: '#blackhole', message: " P&C Playwright tests - Passed"
    } 
    catch (e) {
        echo "BUILD FAILURE"
        slackSend color: '#FF0000', channel: '#blackhole', message: " P&C Playwright tests - Failed! \n"
        currentBuild.result = "FAILURE"
    throw e
  } 
  finally {}
}
