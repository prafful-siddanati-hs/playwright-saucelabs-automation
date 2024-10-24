/* Test to edit facebook scheduled message with new target audience values and remove existing */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create } = require('../../../../globals');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { formatISO, addHours} = require('date-fns');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');

let memberId;
const scheduleTime = addHours(new Date(), 1);

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify remove and add new target audience value to facebook scheduled message', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const scheduleText = plan_create.getComposeMessage() + ` ${Math.floor(Math.random() * 100)}`;
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('edit_remove_fb_target_audience', 'pro_user_composer', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('edit_remove_fb_target_audience');
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
						socialProfileId: parseInt(getObjectByName(global.fixture, 'edit_remove_fb_target_audience').facebookPage.id),
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleTime),
						targeting: {facebookPage: {countries: [{k: 'Canada', v: 'CA'}]}}
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
		await expect(plannerPage.tagContainerText).toHaveText('Countries: Canada;');
	});

	await test.step('Edit scheduled message', async () => {
		await page.waitForTimeout(500);
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Verify facebook preview on composer', async () => {
		await composePage.verifyFacebookPreview(scheduleText);
		await expect(composePage.appliedTargetValue).toContainText('Countries: Canada;');
	});

	await test.step('Add new and remove existing FB target audience', async () => {
		await composePage.selectAddFBTargetAudienceButton();
		await composePage.setFBAgeTargetAudience('18+');
		await expect(composePage.removeTargetAudiencePill).toBeVisible();
		await composePage.removeTargetAudiencePill.click();
		await composePage.selectApplyTargetAudienceButton();
		await expect(composePage.appliedTargetValue).not.toContainText('Countries: Canada;');
		await expect(composePage.appliedTargetValue).toContainText('Ages: 18+;');
	});

	await test.step('Save edit changes', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify updated message in planner preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await expect(plannerPage.tagContainerText).toHaveText('Minimum age: 18;');
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
		await page.waitForTimeout(500);
	});
});
