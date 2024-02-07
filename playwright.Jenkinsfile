#!groovy

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
            string(name: 'SUITE_NAME', defaultValue: 'Composer Chrome Tests', description: 'Composer tests'),
            string(name: 'SUITE_NAME', defaultValue: 'Planner Chrome Tests', description: 'Planner tests'),
        ]),
        pipelineTriggers(
            [parameterizedCron('''
                30 15,17,21,23 * * 1-4 %SUITE_NAME=Composer Chrome Tests
                20 13,15,21,23 * * 1-4 %SUITE_NAME=Planner Chrome Tests
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
        stage ('Run test suites via saucelabs') {
            try {
                //Refer to https://github.hootops.com/hootsuite/jenkins-shared-libraries/blob/6/vars/runPlaywrightTestsViaSaucelabs.groovy for usage directions
                def optionalParam = [:]
                def suiteNamesList = ["${suiteNameParam}"]
                runPlaywrightTestsViaSaucelabs(optionalParam, suiteNamesList)
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
    archiveArtifacts artifacts: '**/*.png', allowEmptyArchive: true
    archiveArtifacts artifacts: '**/sauce-test-report.json', allowEmptyArchive: true
  }
}
