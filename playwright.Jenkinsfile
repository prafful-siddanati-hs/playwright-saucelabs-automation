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
    execWrapper {
        stage ('Setup playwright') {     
            checkout scm
            sh 'rm -rf playwright-saucelabs-automation && git clone --branch fix-PUB-30790 --single-branch git@github.hootops.com:hootsuite/playwright-saucelabs-automation.git playwright-saucelabs-automation --depth=1'
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
                echo "BUILD FAILURE"
                println(err.toString())
                slackSend color: '#C85960', channel: slackChannel, 
                        message: " :playwright-logo: *[P&C Playwright tests]*\n *Suite Name:* _${suiteNameParam}_ - Failed! :warning: \n" +
                            " *Jenkins URL:* ${jenkinsUrl} \n"
                currentBuild.result = "FAILURE"
                throw err            
            }
        }
    }
}

def execWrapper(Closure c) {
    try {
        c()
        echo "Build Completed"
    } 
    catch (e) {
        throw e
  }
  finally {
    archiveArtifacts artifacts: 'artifacts/**/*.png', allowEmptyArchive: true
    archiveArtifacts artifacts: 'artifacts/**/sauce-test-report.json', allowEmptyArchive: true
  }
}
