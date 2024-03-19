#!groovy

@Library('hootsuite@6') _

slackChannel = "#publisher-web-alerts"

jenkinsUrl = "<https://jenkins.build.hootops.com/job/Dashboard/job/Playwright_Composer_Smoke_Tests/${env.BUILD_NUMBER}/testReport|Build #${env.BUILD_NUMBER}>"

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

def configFileParam = ".sauce/composer_smoke.config.yml"

pod {
    execWrapper {
        stage ('Run test suites via saucelabs') {
            try {
                //Refer to https://github.hootops.com/hootsuite/jenkins-shared-libraries/blob/6/vars/runPlaywrightTestsViaSaucelabs.groovy for usage directions
                def optionalParams = [suiteName: "Composer_Smoke - Chrome"]
                def configFile = ["${configFileParam}"]
                runPlaywrightTestsViaSaucelabs(optionalParams, configFile)
            }
            catch(err) {
                echo "BUILD FAILURE"
                println(err.toString())
                def sauceUrl = "<${getSaucelabsBuildUrl()}| Saucelabs URL>"
                slackSend color: '#C85960', channel: slackChannel,
                        message: " :playwright-logo: *[Playwright tests]*\n *Suite Name:* _Composer_Smoke - Chrome_ - Failed! :warning: \n" +
                            " Jenkins URL: ${jenkinsUrl} \n" + " ${sauceUrl} :saucelabs_new:"
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
