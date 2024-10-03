//This test is to validate edit LinkedIn message with link customization
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const {addHours, formatISO} = require('date-fns');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const {SetUpEnterpriseUser} = require('../../../../custom-commands/setUpEnterpriseUser');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit scheduled linkedin message with link customization', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const userSetUp = new SetUpEnterpriseUser();
	const scheduleTime = addHours(new Date(), 1);
	const plannerPage = new PlannerPage(page);
	const url = 'slack.com';
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000)) + ' '}`;
	let accounts = {
		linkedin: []
	};
	accounts.linkedin.push('li_msg');

	await test.step('Setup user & accounts', async () => {
		await userSetUp.setUpEnterpriseUser('Test_li_org','edit_link_cus', accounts);
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('edit_link_cus');
	});

	await test.step('Schedule linkedin message via API', async () => {
		await createScheduleMessage.command(
			parseInt(global.member[0].memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.linkedin}`).socialProfile.socialProfileId,
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
		await composePage.verifyLinkedInPreview(composeBasicText);
	});

	await test.step('Edit link customization and upload gif as link preview', async () => {
		const mediaUploadButtonLocator = '#message-edit-content-linkedIn .mediaUploadContainer > div > input';

		await composePage.writeMessage(url + ' ');
		await composePage.verifyLinkInLinkedInPreview(url);
		await page.waitForTimeout(1000);
		await expect(composePage.editLinkPreviewButton).toBeVisible();
		await composePage.editLinkPreviewButton.hover();
		await composePage.editLinkPreviewButton.click();
		await expect(composePage.removeLinkPreviewImage).toBeVisible();
		await composePage.removeLinkPreviewImage.click();
		await page.setInputFiles(mediaUploadButtonLocator, 'test_data/publisher/giphy/stay_cool.gif');
		await expect(composePage.linkPreviewThumbnail).toBeVisible();
		await expect(composePage.linkPreviewSaveButton).toBeVisible();
		await composePage.linkPreviewSaveButton.click();
	});

	await test.step('Verify the updated link customization', async () => {
		await composePage.verifyLinkedInPreview(composeBasicText);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkInLinkedInPreview(url);
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify update message in planner preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(composeBasicText + url);
		await expect(plannerPage.linkedinLinkPreviewMedia).toBeVisible();
	});

});
