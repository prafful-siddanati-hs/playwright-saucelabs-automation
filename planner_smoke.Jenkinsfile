#!groovy

@Library('hootsuite@6') _

slackChannel = "#publisher-web-alerts"

jenkinsUrl = "<https://jenkins.build.hootops.com/job/Dashboard/job/Saucelabs_Planner_UI_Tests/${env.BUILD_NUMBER}/testReport|Jenkins Build #${env.BUILD_NUMBER}>"

def pod = declarePod {
    name = 'playwright'
    vault {}
    containerDefault = 'playwright'
    container {
        name = 'playwright'
        image = 'default/playwright-22-1.49'
        cpu = 6
        memory = '16Gi'
    }
}

def configFileParam = ".sauce/planner_smoke.config.yml"

pod {
    execWrapper {
        stage ('Run test suites via saucelabs') {
            try {
                //Refer to https://github.hootops.com/hootsuite/jenkins-shared-libraries/blob/6/vars/runPlaywrightTestsViaSaucelabs.groovy for usage directions
                def optionalParams = [suiteName: "Planner_Smoke - Chrome"]
                def configFile = ["${configFileParam}"]
                runPlaywrightTestsViaSaucelabs(optionalParams, configFile)
            }
            catch(err) {
                echo "BUILD FAILURE"
                println(err.toString())
                def sauceUrl = "<${getSaucelabsBuildUrl()}| Saucelabs URL>"
                slackSend color: '#FF4C46', channel: slackChannel,
                        message: " :playwright-logo: *hs-app-planner/master*\n _Planner Smoke Tests_ - Failed! :warning: \n" +
                            " :jenkins: ${jenkinsUrl} \n" + " :saucelabs_new: ${sauceUrl}"
                currentBuild.result = "FAILURE"
                throw err
            }
        }
    }
}

def execWrapper(closure) {
    try {
        closure()
        echo "Build Completed"
    } catch (err) {
        throw err
    }
    finally {
        archiveArtifacts artifacts: '**/*.png', allowEmptyArchive: true
        archiveArtifacts artifacts: '**/sauce-test-report.json', allowEmptyArchive: true
    }
}
