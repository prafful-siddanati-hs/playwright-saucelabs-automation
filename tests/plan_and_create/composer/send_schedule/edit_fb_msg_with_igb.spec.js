//This test is to validate edit facebook message along with instagram business account without media
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const {addHours, formatISO} = require('date-fns');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
let igbAccount, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit scheduled facebook message along with instagram without media', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const scheduleTime = addHours(new Date(), 1);
	const plannerPage = new PlannerPage(page);
	const addFixture = new getFixture();
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('fb_igb_media', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'fb_igb_media').instagramBusiness.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('fb_igb_media');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Schedule facebook message via API', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'fb_igb_media').facebookPage.id),
						text: composeBasicText,
						scheduledSendTime: formatISO(scheduleTime),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(composeBasicText);
		await plannerPage.verifyTextInPreviewPane(composeBasicText);
	});

	await test.step('Edit facebook scheduled message from side pane', async () => {
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Verify facebook preview on composer and select instagram account from social network dropdown', async () => {
		await composePage.verifyFacebookPreview(composeBasicText);
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await composePage.verifyInstagramPreview(composeBasicText);
	});

	await test.step('Update message and save changes', async () => {
		await composePage.writeMessage(' updated');
		await composePage.verifyInstagramPreview('updated');
		await composePage.verifyFacebookPreview('updated');
		await composePage.saveEditsButton.click();
	});

	await test.step('Verify media missing error message for instagram', async () => {
		await expect(page.locator('[role = "alert"] strong')).toHaveText('Oops! You haven\'t added any media');
	});

});
