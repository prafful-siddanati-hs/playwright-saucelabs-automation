#!groovy

@Library('hootsuite@6') _

slackChannel = "#publisher-automation"

jenkinsUrl = "<https://jenkins.build.hootops.com/job/Dashboard/job/PnC_Playwright_By_Product_Area/${env.BUILD_NUMBER}/testReport|Build #${env.BUILD_NUMBER}>"

properties(
    [
        buildDiscarder(
            logRotator(
                numToKeepStr: '100'
            )
        ),
        parameters([
            choice(name: 'SUITE_NAME', choices: ['Composer_Smoke - Chrome', 'Composer_Smoke - Safari', 'Planner_Regression - Chrome', 'Planner_Regression - Safari'], description: 'Select a suite to run'),
            choice(name: 'FEATURE', choices: ['composer_smoke','composer_regression', 'planner_regression'], description: 'Select product feature'),
        ]),
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

def configFileParam = ".sauce/${params.FEATURE}.config.yml"
def suiteNameParam = params.SUITE_NAME

echo "Running: ${suiteNameParam}, with config file: ${configFileParam}"

pod {
    execWrapper {
        stage ('Run test suites via saucelabs') {
            try {
                //Refer to https://github.hootops.com/hootsuite/jenkins-shared-libraries/blob/6/vars/runPlaywrightTestsViaSaucelabs.groovy for usage directions
                def optionalParams = [suiteName: "${suiteNameParam}"]
                def configFile = ["${configFileParam}"]
                runPlaywrightTestsViaSaucelabs(optionalParams, configFile)
            }
            catch(err) {
                echo "BUILD FAILURE"
                println(err.toString())
                def sauceUrl = "<${getSaucelabsBuildUrl()}| Saucelabs URL>"
                slackSend color: '#C85960', channel: slackChannel,
                        message: " :playwright-logo: *[P&C Playwright tests]*\n *Suite Name:* _${suiteNameParam}_ - Failed! :warning: \n" +
                            " Jenkins URL: ${jenkinsUrl} \n" + " ${sauceUrl} :saucelabs_new:"
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
