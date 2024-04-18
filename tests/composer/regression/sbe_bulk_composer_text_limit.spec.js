/**
 * [https://hootsuite.atlassian.net/browse/SBE-6357]
 * Test to verify that the text limit can be adjusted while using bulk composer.
 */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../custom-commands/getFixture');
const tearDown = require('../../../custom-commands/tearDown');
const createUser = require('../../../custom-commands/createUser');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName } = require('../../../globals');
const { BulkComposePage } = require('../../../pages/planandcreate/bulkCompose');
const { ComposePage } = require('../../../pages/planandcreate/compose');
let twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Adjust text limit in bulk composer', async ({ page }) => {
	const messageText = `Message within limit ${Math.floor(Math.random() * 100)} `;
	const addFixture = new getFixture();
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const bulkComposePage = new BulkComposePage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await createNewUser.command('bulk_composer_text_limit', 'professional');
		await addFixture.command('tw_bc_text_limit','twitter', true, 300);
		twAccount = getObjectByName(global.fixture, 'tw_bc_text_limit').socialProfile.username;
		console.log('twAccount:', twAccount);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('bulk_composer_text_limit');
	});

	await test.step('Set dark launch cookies', async () => {
		await bulkComposePage.setDarkLaunchCookies();
	});

	await test.step('Open bulk composer', async () => {
		await bulkComposePage.visit();
	});

	await test.step('Upload csv file', async () => {
		await expect(bulkComposePage.csvUploadButton).toBeVisible();
		await bulkComposePage.uploadCsvFile('test_data/publisher/csv/bulk_upload_long_text.csv');
		await expect(bulkComposePage.csvRemoveButton).toBeVisible();
	});

	await test.step('Verify a social profile', async () => {
		await bulkComposePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'tw_bc_text_limit').username);
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
		await bulkComposePage.countOfPostsOnBulkComposer(3);
	});

	await test.step('Verify errors is diplayed on message dashboard', async () => {
		await expect(bulkComposePage.bulkComposerError).toBeVisible();
	});

	await test.step('Select the first message to edit', async () => {
		await expect(bulkComposePage.firstMessageItem).toBeVisible();
		bulkComposePage.firstMessageItem.click();
	});

	await test.step('Verify the text limit is displayed', async () => {
		await expect(composePage.twitterCharacterLimitError).toBeVisible();
	});

	await test.step('Edit and verify preview', async () => {
		await bulkComposePage.messageArea.fill('');
		await page.waitForTimeout(2000);
		await bulkComposePage.writeMessage(messageText);
		await bulkComposePage.verifyTwitterPreview(messageText);
		await page.waitForTimeout(1500);
	});
});
