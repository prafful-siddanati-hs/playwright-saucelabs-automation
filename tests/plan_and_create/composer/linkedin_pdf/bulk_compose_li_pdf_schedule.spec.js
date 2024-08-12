/* Test to upload pdf to linkedin via bulk composer */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const createUser = require('../../../../custom-commands/createUser');
const { LoginPage } = require('../../../../pages/login');
const { BulkComposePage } = require('../../../../pages/planandcreate/bulkCompose');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName } = require('../../../../globals');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Upload PDF to LinkedIn via bulk composer', async ({ page }) => {
	const messageText = `--attached #PDF ${Math.floor(Math.random() * 1000)} `;
	const addFixture = new getFixture();
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const bulkComposePage = new BulkComposePage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await createNewUser.command('bulk_composer_li_pdf', 'team3s');
		await addFixture.command('li_pdf_bulk_compose', 'linkedin', true, 300);
	});

	await test.step('Login as teams user', async () => {
		await loginPage.signIn('bulk_composer_li_pdf');
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

	await test.step('Verify linkedin is selected', async () => {
		await bulkComposePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'li_pdf_bulk_compose').username);
	});

	await test.step('Review the posts', async () => {
		await expect(bulkComposePage.reviewPostsButton).toBeEnabled();
		await bulkComposePage.reviewPostsButton.click();
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

	await test.step('Attach a PDF to the message', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
	});

	await test.step('Verify pdf is attached', async () => {
		await expect(composePage.pdfRemoveButton).toBeVisible();
	});

	await test.step('Update message text', async () => {
		await bulkComposePage.writeMessage(messageText, {delay: 100});
	});

	await test.step('Schedule the first message', async () => {
		await bulkComposePage.schedule();
	});
});
