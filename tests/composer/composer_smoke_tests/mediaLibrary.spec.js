const {test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName, plan_create } = require('../../../globals');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const {PlannerPage} = require('../../../pages/planandcreate/planner');
let twitterAccount, fbAccount, memberId;

/* Test to schedule a message using media library upload */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Schedule with image from media library', async ({page}) => {
	const mediaText = `${plan_create.getComposeMessage()} ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('mediaLibrary_schedule', 'pro_user_composer', true, 300);
		twitterAccount = getObjectByName(global.fixture, 'mediaLibrary_schedule').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'mediaLibrary_schedule').facebookPage.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('mediaLibrary_schedule');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter & facebook from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twitterAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyGenericPreview(mediaText);
	});

	await test.step('Upload an image from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.searchMediaLibrary(plan_create.mediaSearchTerms());
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
	});

	await test.step('Verify image preview', async () => {
		await composePage.verifyGenericImagePreview();
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

});
