const { test, expect } = require('@playwright/test');
const getFixture = require('../../../custom-commands/getFixture');
const tearDown = require('../../../custom-commands/tearDown');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName, plan_create } = require('../../../globals');
const { BulkComposePage } = require('../../../pages/planandcreate/bulkCompose');
let fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Schedule a message using bulk composer', async ({ page }) => {
	const messageText = ` ${plan_create.getComposeMessage()} ${Math.floor(Math.random() * 100)} http://bit.ly/2SHqglm `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const bulkComposePage = new BulkComposePage(page);

	await test.step('Setup pro user & account', async () => {
		await addFixture.command('bulk_composer_basic', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'bulk_composer_basic').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('bulk_composer_basic');
	});

	await test.step('Set dark launch cookies', async () => {
		await bulkComposePage.setDarkLaunchCookies();
	});

	await test.step('Open bulk composer', async () => {
		await bulkComposePage.visit();
	});

	await test.step('Upload csv file', async () => {
		await expect(bulkComposePage.csvUploadButton).toBeVisible();
		await bulkComposePage.uploadCsvFile('test_data/publisher/csv/bulk_upload.csv');
		await expect(bulkComposePage.csvRemoveButton).toBeVisible();
	});

	await test.step('Select a social profile', async () => {
		await bulkComposePage.profileDropDown.click();
		await expect(bulkComposePage.snContentItems).toBeVisible();
		await bulkComposePage.selectSocialProfile(fbAccount);
		await bulkComposePage.pageHeading.click();
		await expect(bulkComposePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Review the posts', async () => {
		await expect(bulkComposePage.reviewPostsButton).toBeEnabled();
		await bulkComposePage.reviewPostsButton.click();
	});

	await test.step('Verify message dashboard & edit area are displayed', async () => {
		await expect(bulkComposePage.messageDashboard).toBeVisible();
		await expect(bulkComposePage.messageEditArea).toBeVisible();
	});

	await test.step('Verify the count of posts on message dashboard', async () => {
		await bulkComposePage.countOfPostsOnBulkComposer(7);
	});

	await test.step('Verify there are no errors on message dashboard', async () => {
		await expect(bulkComposePage.bulkComposerError).not.toBeVisible();
	});

	await test.step('Select the first message to edit', async () => {
		await expect(bulkComposePage.firstMessageItem).toBeVisible();
		bulkComposePage.firstMessageItem.click();
	});

	await test.step('Edit and verify preview', async () => {
		await bulkComposePage.messageArea.fill('');
		await page.waitForTimeout(2000);
		await bulkComposePage.writeMessage(messageText);
		await bulkComposePage.verifyFacebookPreview(messageText);
		await page.waitForTimeout(2000);
	});

	await test.step('Schedule the first message', async () => {
		await bulkComposePage.schedule();
	});

	await test.step('Verify the count of posts is updated', async () => {
		await bulkComposePage.countOfPostsOnBulkComposer(6);
	});
});
