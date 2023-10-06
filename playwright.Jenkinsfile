#!groovy
import hootsuite.jsl.pipeline.General

@Library('hootsuite@6') _

def pod = declarePod {
    name = 'playwright'
    dind {}
    vault {}
    containerDefault = 'playwright'
    container {
        name = 'playwright'
        image = 'docker-registry.hootops.com/playwright:v1.38.0-focal'
        cpu = 1
        memory = '4Gi'
    }
}

pod {
    execWrapper {
        boolean stashRepo = true
        stage ('Setup playwright') {
            sh 'rm -rf playwright-saucelabs-automation && git clone --branch master --single-branch git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git playwright --depth=1'
            sh 'yarn install'
            sh 'npm install saucectl'
            sh 'npx saucectl -v'
            sh "ls -la ${pwd()}"

            if (stashRepo) {
                stash includes: 'playwright/**', name: 'playwright-saucelabs-automation'
                }
            }
            stage ('Run tests via saucelabs') {
                try {
                    def general = new General()
                    general.saucelabsVaultSetup{
                        if (stashRepo){
                            unstash 'playwright-saucelabs-automation'
                            echo 'Running saucectl... '
                            sh 'saucectl run'
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
