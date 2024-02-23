const { test } = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {getObjectByName} = require('../../globals');
const scheduleV3Message = require('../../custom-commands/scheduleV3Message');
const { formatISO, addHours } = require('date-fns');
const {PlannerPage} = require('../../pages/planandcreate/planner');
const {SetUpEnterpriseUser} = require('../../custom-commands/setUpEnterpriseUser');
const {LoginPage} = require('../../pages/login');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify scheduled message in week view', async ({ page }) => {
	let orgName = 'planner_basic_org_' + Math.floor(Math.random() * 10000);
	const message = `Planner New Compose Message! ${Date.now()}`;
	const scheduleTime = addHours(new Date(), 1);
	let accounts = {
		twitter: []
	};
	accounts.twitter.push('twitter_msg'); //Push no.of Twitter accounts to enterprise user

	const createScheduleMessage = new scheduleV3Message();
	const userSetUp = new SetUpEnterpriseUser();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);

	await userSetUp.setUpEnterpriseUser(orgName,'pw_planner', accounts);
	await loginPage.signInSkipOnboarding('pw_planner');

	/* Create a scheduled message */
	await createScheduleMessage.command(
		parseInt(global.member[0].memberId, 10),
		{
			messages: [
				{
					socialProfileId: getObjectByName(global.fixture, `${accounts.twitter}`).socialProfile.socialProfileId,
					text: message,
					scheduledSendTime: formatISO(scheduleTime)
				}
			]
		}
	);

	await plannerPage.visit();
	await plannerPage.verifyScheduledMessage(message, scheduleTime.getHours());
	await plannerPage.showPreviewPane(message);
});

