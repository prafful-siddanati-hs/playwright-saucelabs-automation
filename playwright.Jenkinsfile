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
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/planner_regression.config.yml', description: 'Planner tests on chrome '),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer_preview.config.yml', description: 'Composer Previews tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer_message_editor.config.yml', description: 'Composer message editor tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/linkedin_pdf.config.yml', description: 'Linkedin PDF tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/link_settings.config.yml', description: 'Link Settings tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/link_previews.config.yml', description: 'Link Previews tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/ig_first_comment.config.yml', description: 'IG First Comment tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer_regression.config.yml', description: 'Composer tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer_media_limitations.config.yml', description: 'Composer media limitations tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer_regression_media.config.yml', description: 'Composer regression media tests on chrome'),
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/composer_send.config.yml', description: 'Composer Send tests on chrome')
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/target_audience.config.yml', description: 'Target audience tests on chrome ')
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/one_time_approver.config.yml', description: 'Composer one time approver tests on chrome')
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/network_campaign_picker.config.yml', description: 'Composer network and campaign picker tests on chrome')
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/ig_collaborators.config.yml', description: 'Instagram Collaborators tests on chrome')
            string(name: 'CONFIG_FILE', defaultValue: '.sauce/drafts.config.yml', description: 'Drafts tests on chrome')
        ]),
        //Tests run only on chrome from 4.10AM - 8AM PST in 20 minute intervals
        pipelineTriggers(
            [parameterizedCron('''
                 10 12 * * 1-5 %CONFIG_FILE=.sauce/composer_regression_media.config.yml
                 30 12 * * 1-5 %CONFIG_FILE=.sauce/composer_media_limitations.config.yml
                 50 12 * * 1-5  %CONFIG_FILE=.sauce/composer_message_editor.config.yml
                 10 13 * * 1-5  %CONFIG_FILE=.sauce/composer_regression.config.yml
                 30 17 * * 1-5 %CONFIG_FILE=.sauce/composer_preview.config.yml
                 50 17 * * 1-5 %CONFIG_FILE=.sauce/linkedin_pdf.config.yml
                 10 18 * * 1-5 %CONFIG_FILE=.sauce/link_settings.config.yml
                 30 18 * * 1-5 %CONFIG_FILE=.sauce/link_previews.config.yml
                 50 18 * * 1-5 %CONFIG_FILE=.sauce/ig_first_comment.config.yml
                 10 20 * * 1-5  %CONFIG_FILE=.sauce/composer_send.config.yml
                 30 20 * * 1-5 %CONFIG_FILE=.sauce/planner_regression.config.yml
                 50 20 * * 1-5 %CONFIG_FILE=.sauce/target_audience.config.yml
                 10 21 * * 1-5 %CONFIG_FILE=.sauce/one_time_approver.config.yml
                 30 21 * * 1-5 %CONFIG_FILE=.sauce/network_campaign_picker.config.yml
                 50 21 * * 1-5 %CONFIG_FILE=.sauce/ig_collaborators.config.yml
                 10 22 * * 1-5 %CONFIG_FILE=.sauce/drafts.config.yml
                ''')]
        )
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

def configFileParam = params.CONFIG_FILE

pod {
    execWrapper {
        stage ('Run test suites via saucelabs') {
            try {
                //Refer to https://github.hootops.com/hootsuite/jenkins-shared-libraries/blob/6/vars/runPlaywrightTestsViaSaucelabs.groovy for usage directions
                def optionalParams = [:]
                def configFile = ["${configFileParam}"]
                runPlaywrightTestsViaSaucelabs(optionalParams, configFile)
            }
            catch(err) {
                echo "BUILD FAILURE"
                println(err.toString())
                def testList = configFileParam.split("/")[1].split("\\.")[0].split("_").collect { it.capitalize() }.join(" ")
                def sauceUrl = "<${getSaucelabsBuildUrl()}| Saucelabs URL>"
                slackSend color: '#C85960', channel: slackChannel,
                        message: " :playwright-logo: *[P&C Playwright tests]*\n _${testList}_ - Failed! :warning: \n" +
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
