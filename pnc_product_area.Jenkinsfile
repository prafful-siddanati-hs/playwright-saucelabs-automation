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
            choice(name: 'SUITE_NAME', choices: ['Composer_Smoke - Chrome', 'Composer_Smoke - Safari', 'Composer_Preview - Chrome', 'Composer_Message_Editor - Chrome', 'Link_Previews - Chrome', 'Link_Settings - Chrome', 'Planner_Regression - Chrome', 'Planner_Regression - Safari', 'LinkedIn_PDF - Chrome', 'IG_First_Comment - Chrome', 'Composer_Regression - Chrome', 'Composer_Regression_Media - Chrome', 'Composer_Send_Now - Chrome', 'Drafts - Chrome', 'IG_Collaborators - Chrome', 'Composer_Network_Campaign_Picker - Chrome', 'One_Time_Approver - Chrome', 'Target_Audience - Chrome', 'Custom_Approvals - Chrome'], description: 'Select a suite to run'),
            choice(name: 'FEATURE', choices: ['composer_smoke', 'composer_preview', 'composer_message_editor', 'link_previews', 'link_settings', 'planner_regression', 'linkedin_pdf', 'ig_first_comment', 'composer_media_limitations', 'composer_regression', 'composer_regression_media', 'Composer_Send_Now', 'drafts', 'ig_collaborators', 'network_campaign_picker', 'one_time_approver', 'target_audience', 'custom_approvals'], description: 'Select product feature'),
        ]),
    ]
)

def pod = declarePod {
    name = 'playwright'
    vault {}
    containerDefault = 'playwright'
    container {
        name = 'playwright'
        image = 'default/playwright-20-1.41'
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
