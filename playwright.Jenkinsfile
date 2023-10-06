#!groovy
import hootsuite.jsl.pipeline.General

@Library('hootsuite@PUB-30482-test') _

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
            sh 'rm -rf playwright && git clone --branch PUB-30482 --single-branch git@github.hootops.com:hootsuite/playwright.git playwright --depth=1'
            sh 'yarn install'
            sh 'npm install saucectl'
            sh 'npx saucectl -v'
            sh "ls -la ${pwd()}"

            if (stashRepo) {
                stash includes: 'playwright/**', name: 'playwright'
                }
            }
            stage ('Run tests via saucelabs') {
                try {
                    def general = new General()
                    general.saucelabsVaultSetup{
                        if (stashRepo){
                            unstash 'playwright'
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
