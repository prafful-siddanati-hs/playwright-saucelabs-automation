#!groovy

@Library('hootsuite@PUB-31661') _

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
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer.config.yml', description: 'Composer tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/planner.config.yml', description: 'Planner tests on chrome'),
        ]),
        pipelineTriggers(
            [parameterizedCron('''
                30 15,17,21,23 * * 1-4 %CONFIG_FILE=.sauce/composer.config.yml
                20 13,15,21,23 * * 1-4 %CONFIG_FILE=.sauce/planner.config.yml
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

def configFileParam = params.CONFIG_FILE

pod {
    execWrapper {
        stage ('Run test suites via saucelabs') {
            try {
                //Refer to https://github.hootops.com/hootsuite/jenkins-shared-libraries/blob/6/vars/runPlaywrightTestsViaSaucelabs.groovy for usage directions
                def optionalParam = [branch:"use_configFile", suiteName: "Planner Approvals - Chrome"]
                def configFile = ["${configFileParam}"]
                runPlaywrightTestsViaSaucelabs(optionalParam, configFile)
            }
            catch(err) {
                echo "BUILD FAILURE"
                println(err.toString())
                slackSend color: '#C85960', channel: slackChannel,
                        message: " :playwright-logo: *[P&C Playwright tests]*\n Failed! :warning: \n" +
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
