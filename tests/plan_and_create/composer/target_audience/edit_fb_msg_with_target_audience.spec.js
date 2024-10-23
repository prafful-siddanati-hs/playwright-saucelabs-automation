/* Test to edit facebook message with target audience */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create } = require('../../../../globals');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { formatISO, addHours} = require('date-fns');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');

let twProfile, memberId;
const scheduleTime = addHours(new Date(), 1);

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify target audience is persisted for edit facebook scheduled message', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const scheduleText = plan_create.getComposeMessage() + ` ${Math.floor(Math.random() * 100)}`;
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('fb_target_audience', 'pro_user_composer', true, 300);
		twProfile = getObjectByName(global.fixture, 'fb_target_audience').twitter.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('fb_target_audience');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Schedule facebook message with target audience', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'fb_target_audience').facebookPage.id),
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleTime),
						targeting: {facebookPage: {ageMin: 13}}
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await expect(plannerPage.tagContainerText).toHaveText('Minimum age: 13;');
	});

	await test.step('Edit scheduled message', async () => {
		await page.waitForTimeout(500);
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Verify the post in composer', async () => {
		await composePage.verifyFacebookPreview(scheduleText);
		await expect(composePage.appliedTargetValue).toContainText('Ages: 13+;');
	});

	await test.step('Select twitter from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await composePage.verifyFacebookPreview(scheduleText);
		await composePage.verifyTwitterPreview(scheduleText);
	});

	await test.step('Go to twitter tab and check target audience option is not visible', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.verifyTwitterPreview(scheduleText);
		await expect(composePage.appliedTargetValue).not.toBeVisible();
	});

	await test.step('Go to facebook tab and check target audience option', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(scheduleText);
		await expect(composePage.appliedTargetValue).toContainText('Ages: 13+;');
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
		await page.waitForTimeout(500);
	});
});
