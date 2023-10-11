#!groovy
import hootsuite.jsl.pipeline.General

@Library('hootsuite@PUB-30428-test') _

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
        boolean stashRepo = true
            stage ('Setup playwright') {     
                checkout scm
                sh 'rm -rf playwright-saucelabs-automation && git clone --branch PUB-30428 --single-branch git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git playwright-saucelabs-automation --depth=1'
                sh 'yarn install'
                sh 'npm install saucectl'

                if (stashRepo) {
                    stash includes: 'playwright-saucelabs-automation/**', name: 'playwright-saucelabs-automation'
                }
            }
            stage ('Run tests via saucelabs') {
                try {
                    def general = new General()
                    general.saucelabsVaultSetup{
                        if (stashRepo){
                            unstash 'playwright-saucelabs-automation'
                            echo 'Running saucectl... '
                            sh 'npx saucectl run'
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
