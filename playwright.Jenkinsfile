#!groovy
import hootsuite.jsl.pipeline.General

@Library('hootsuite@6') _

slackChannel = "#publisher-automation"

jenkinsUrl = "<https://jenkins.build.hootops.com/job/Dashboard/job/Playwright_PlanCreate/${env.BUILD_NUMBER}/testReport|Build #${env.BUILD_NUMBER}>"

properties(
    [
        buildDiscarder(
            logRotator(
                numToKeepStr: '100'
            )
        ),
        parameters([
            string(name: 'SUITE_NAME', defaultValue: '[Playwright] Composer Tests', description: 'Composer tests'),
            string(name: 'SUITE_NAME', defaultValue: '[Playwright] Planner Tests', description: 'Planner tests'),
            string(name: 'SUITE_NAME', defaultValue: '[Playwright] Schedule & Delete via API', description: 'API actions')
        ]),
        pipelineTriggers(
            [parameterizedCron('''
                30 15,17,21,23 * * 1-4 %SUITE_NAME=[Playwright] Composer Tests
                20 13,15,21,23 * * 1-4 %SUITE_NAME=[Playwright] Planner Tests
                10 14,16,20,23 * * 1-4 %SUITE_NAME=[Playwright] Schedule & Delete via API
                ''')] //Testing a few cron builds
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

def suiteNameParam = params.SUITE_NAME

pod {
    execWrapper(suiteNameParam) {
        stage ('Setup playwright') {     
            checkout scm
            sh 'rm -rf playwright-saucelabs-automation && git clone --branch master --single-branch git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git playwright-saucelabs-automation --depth=1'
            sh 'yarn install'
            sh 'npm install saucectl'
        }
        stage ('Run test suites via saucelabs') {
            try {
                def general = new General()
                general.saucelabsVaultSetup {
                    echo 'Run test suites via parameterized cron...'
                    sh "npx saucectl run --select-suite \"${suiteNameParam}\""
                }
            }
            catch(err) {
                println (err.toString())
            }
        }
    }
}

def execWrapper(String suiteNameParam, Closure c) {
    try {
        c()
        echo "Build Success"
        slackSend color: '#539E65', channel: slackChannel, message: " [P&C Playwright tests] Suite Name: ${suiteNameParam} - Passed \n" +
        " Jenkins URL: ${jenkinsUrl}"
    } 
    catch (e) {
        echo "BUILD FAILURE"
        slackSend color: '#C85960', channel: slackChannel, message: " [P&C Playwright tests] Suite Name: ${suiteNameParam} - Failed! \n" +
        " Jenkins URL: ${jenkinsUrl} \n"
        currentBuild.result = "FAILURE"
    throw e
  } 
  finally {
    archiveArtifacts artifacts: '**/test-results.json', allowEmptyArchive: true
  }
}
