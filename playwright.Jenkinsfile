#!groovy
import hootsuite.jsl.pipeline.General

@Library('hootsuite@6') _

slackChannel = "#blackhole"

jenkinsUrl = "<https://jenkins.build.hootops.com/job/Dashboard/job/Playwright_PlanCreate/${env.BUILD_NUMBER}/testReport|Build #${env.BUILD_NUMBER}>"

properties(
    [
        buildDiscarder(
            logRotator(
                numToKeepStr: '100'
            )
        ),
        pipelineTriggers(
            [cron('5 13,15,17,21,23 * * 2-4')] //Testing a few cron builds
        )
    ]
)

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
        stage ('Run test suites via saucelabs') {
            try {
                def config = readYaml(file: '.sauce/config.yml')
                def general = new General()
                general.saucelabsVaultSetup {
                    echo 'Running test suites via saucectl... '
                    for (suiteName in config.suites) {
                        sh "npx saucectl run --select-suite \"${suiteName.name}\""
                    }
                }
            }
            catch(err) {
                println (err.toString())
                catchError(stageResult: "FAILURE") {
                    build_ok = false
                    sh "exit 1"
                }
            }
        }
    }
}

def execWrapper(Closure c) {
    try {
        c()
        echo "Build Success"
        //TODO:Update slack channel and details
        slackSend color: '#138347', channel: slackChannel, message: " P&C Playwright tests - Passed"
    } 
    catch (e) {
        echo "BUILD FAILURE"
        slackSend color: '#FF0000', channel: slackChannel, message: " P&C Playwright tests - Failed! \n" +
        " Jenkins URL: ${jenkinsUrl} \n"
        currentBuild.result = "FAILURE"
    throw e
  } 
  finally {}
}
