/* Test to duplicate facebook scheduled message with new target audience values */
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

test('Verify that the new target audience values are included when duplicating a scheduled Facebook message', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const scheduleText = plan_create.getComposeMessage() + ` ${Math.floor(Math.random() * 100)}`;
	const dupText = plan_create.getComposeMessage() + ` ${Math.floor(Math.random() * 100)}`;
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('dup_fb_target_audience', 'pro_user_composer', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('dup_fb_target_audience');
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
						socialProfileId: parseInt(getObjectByName(global.fixture, 'dup_fb_target_audience').facebookPage.id),
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

	await test.step('Duplicate scheduled message', async () => {
		await page.waitForTimeout(500);
		await plannerPage.duplicateFromPreviewPane();
	});

	await test.step('Verify facebook preview on composer', async () => {
		await composePage.verifyFacebookPreview(scheduleText);
		await expect(composePage.appliedTargetValue).toContainText('Countries: Canada;');
	});

	await test.step('Edit message text', async () => {
		await composePage.messageArea.fill(' ');
		await composePage.writeMessage(dupText);
		await composePage.verifyFacebookPreview(dupText);
	});

	await test.step('Add new FB target audience', async () => {
		await composePage.selectAddFBTargetAudienceButton();
		await composePage.setFBAgeTargetAudience('15+');
		await composePage.selectApplyTargetAudienceButton();
		await expect(composePage.appliedTargetValue).toContainText('Ages: 15+; Countries: Canada;');
	});

	await test.step('Schedule message', async () => {
		await composePage.scheduleButton.hover();
		await composePage.scheduleButton.click();
		await expect(composePage.scheduleButton, 'Schedule message failed from composer').not.toBeVisible();
		await expect(composePage.feCallOuts).toHaveCount(1);
	});

	await test.step('Verify original scheduled message in planner preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await expect(plannerPage.tagContainerText).toHaveText('Countries: Canada;');
	});

	await test.step('Verify duplicated scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(dupText);
		await plannerPage.verifyTextInPreviewPane(dupText);
		await expect(plannerPage.tagContainerText).toHaveText('Minimum age: 15; Countries: Canada;');
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
		await page.waitForTimeout(500);
	});
});
