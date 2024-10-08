/* Test to verify that alt-text is successfully applied to multiple images */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../../globals');

let twAccount, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that alt-text is successfully applied to multiple images', async ({page}) => {
	const twMsg = 'Check planner preview for multiple alt text\'s';
	const firstAltText = 'Painting of a valley';
	const secondAltText = 'Photo of a beach';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('alt_text_multiple_images', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'alt_text_multiple_images').twitter.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('alt_text_multiple_images');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Select ${twAccount} account from profile picker`, async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.messageArea.click();
		await composePage.writeMessage(twMsg);
	});

	await test.step('Upload multiple image files', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/Art.png');
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/beach.jpg');
		await composePage.verifyTwitterPreview(twMsg);
		await expect(composePage.twitterPreviewMediaContainer).toHaveCount(2);
	});

	await test.step('Add alt-text to the first image', async () => {
		await page.getByLabel('Art.png').hover();
		await page.waitForTimeout(1000);
		await composePage.altTextButton.first().click();
		await composePage.writeAltText(firstAltText);
	});

	await test.step('Add alt-text to the second image', async () => {
		await page.getByLabel('beach.jpg').hover();
		await page.waitForTimeout(1000);
		await composePage.altTextButton.last().click();
		await composePage.writeAltText(secondAltText);
	});

	await test.step('Schedule the post', async () => {
		await composePage.schedule();
	});

	await test.step('Verify scheduled message in planner preview', async () => {
		await plannerPage.verifyTextInPreviewPane(twMsg);
	});

	await test.step('Verify alt-text for both images in preview pane', async () => {
		await plannerPage.checkAltText(`${firstAltText} / ${secondAltText}`);
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});
});
