/* Test to verify internal comments is available only for ICP (Enterprise) customers */
const { test, expect} = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');

const scheduleDate = addHours(new Date(), 2);
let enterpriseUserMemberId, proUserMemberId, proUserFacebookPageId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify internal comments is available only for ICP (Enterprise) customers', async ({page}) => {
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const addFixture = new getFixture();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createScheduleMessage = new scheduleV3Message();

	let accounts = {
		plan_create_facebookpage: ['fb_internal_comments_enterprise']
	};
	let orgName = 'internal_comments_org_' + Math.floor(Math.random() * 10000);
	const scheduledText = 'Post to check internal comments entitlement for ';

	await test.step('Setup an enterprise user', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'internal_comments_enterprise', accounts);
		enterpriseUserMemberId = global.member[0].memberId;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('internal_comments_enterprise');
	});

	await test.step('Dismiss enterprise user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(enterpriseUserMemberId);
		await plannerPage.hideRecommendedTimes(enterpriseUserMemberId);
	});

	await test.step('Schedule a post for enterprise user', async () => {
		await createScheduleMessage.command(
			parseInt(enterpriseUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'fb_internal_comments_enterprise').socialProfile.socialProfileId,
						text: scheduledText.concat('enterprise user'),
						scheduledSendTime: formatISO(scheduleDate),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify internal comments is available for enterprise user', async () => {
		await plannerPage.showPreviewPane(scheduledText);
		await plannerPage.verifyTextInPreviewPane(scheduledText);
		await expect(plannerPage.internalCommentsTab).toBeVisible();
		await plannerPage.internalCommentsTab.click();
		await expect(page.getByText('Comments will only be seen by you and your teammates. They won\'t be published.')).toBeVisible();
	});

	await test.step('Logout from enterprise user', async () => {
		await loginPage.logout();
	});

	await test.step('Setup professional user & accounts', async () => {
		await addFixture.command('internal_comments_pro_user', 'pro_user_composer');
		proUserMemberId = global.fixture[2].memberId;
		proUserFacebookPageId = global.fixture[2].facebookPage.id;
	});

	await test.step('Login as professional user', async () => {
		await loginPage.signIn('internal_comments_pro_user');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(proUserMemberId);
	});

	await test.step('Schedule a post for pro user', async () => {
		await createScheduleMessage.command(
			parseInt(proUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(proUserFacebookPageId, 10),
						text: scheduledText.concat('pro user'),
						scheduledSendTime: formatISO(scheduleDate),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify internal comments is not available for pro user', async () => {
		await plannerPage.showPreviewPane(scheduledText);
		await plannerPage.verifyTextInPreviewPane(scheduledText);
		await expect(plannerPage.internalCommentsTab).not.toBeVisible();
	});
});
