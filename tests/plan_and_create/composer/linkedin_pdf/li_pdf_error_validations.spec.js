/* Test to verify appropriate error validations are displayed while PDF & other media types are attached to LinkedIn post. */
const { test, expect} = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

const LINKEDIN_MIXED_MEDIA_ERROR = 'LinkedIn posts can\'t include different media types. You can attach images, a video, or a PDF.';
const LINKEDIN_MULTIPLE_PDFS_ERROR = 'LinkedIn doesn\'t support multiple PDFs';
const TW_UNSUPPORTED_FILE_TYPE_ERROR = 'This file type isn\'t supported for Tweets';
const TW_SUPPORTED_FILE_TYPES_INFO = 'Upload an image or video instead';
let liAccount, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify error validations for LinkedIn PDF post', async ({page}) => {
	const pdfText = 'Check PDF validations '+ + Math.floor(Math.random() * 1000);

	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createNewUser = new createUser();
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_li_pdf_error_validations', 'team3s');
		await addFixture.command('tw_pdf_validations','twitter', true, 300);
		await addFixture.command('li_pdf_validations','linkedin', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_pdf_validations').socialProfile.username;
		twAccount = getObjectByName(global.fixture, 'tw_pdf_validations').socialProfile.username;
	});

	await test.step('Login as teams user', async () => {
		await loginPage.signInAsProUser('pw_li_pdf_error_validations');
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(pdfText);
	});

	await test.step('Select linkedin account from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Attach first PDF', async () => {
		let filePath = 'test_data/publisher/pdfs/multi_page.pdf';
		await composePage.uploadMediaFile('test_data/publisher/pdfs', filePath);
	});

	await test.step('Verify there are no thumbnail actions for PDF', async () => {
		await expect(composePage.altTextButton).not.toBeVisible();
		await expect(composePage.editImageButton).not.toBeVisible();
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step('Verify LinkedIn PDF preview', async () => {
		await composePage.verifyLinkedInPdfPreview();
		await expect(composePage.linkedMultipageIndicator).toHaveCount(5);
	});

	await test.step('Verify page navigators for pdf are displayed in preview', async () => {
		await expect(composePage.pdfNextPageButton).toBeVisible();
		await composePage.pdfNextPageButton.click();
		await expect(composePage.pdfPreviosPageButton).toBeVisible();
	});

	await test.step('Attach an image', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await page.waitForTimeout(1000);
	});

	await test.step('Verify media type error & remove the image', async () => {
		await expect(page.getByText(LINKEDIN_MIXED_MEDIA_ERROR)).toBeVisible();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.mediaDeleteAnimation).toBeVisible();
	});

	await test.step('Attach second PDF', async () => {
		let filePath = 'test_data/publisher/pdfs/single_page.pdf';
		await expect(composePage.mediaDeleteAnimation).not.toBeVisible();
		await composePage.uploadMediaFile('test_data/publisher/pdfs', filePath);
		await expect(composePage.mediaLoadingAnimation).not.toBeVisible();
		await expect(composePage.mediaOverLay).toHaveCount(2);
	});

	await test.step('Verify multiple pdfs error is displayed', async () => {
		await expect(page.getByText(LINKEDIN_MULTIPLE_PDFS_ERROR)).toBeVisible();
	});

	await test.step('Remove a pdf and verify no errors remain', async () => {
		await expect(composePage.pdfRemoveButton.first()).toBeVisible();
		await composePage.pdfRemoveButton.first().click();
		await expect(page.getByRole('heading', { name: LINKEDIN_MIXED_MEDIA_ERROR })).not.toBeVisible();
		await expect(page.getByRole('heading', { name: LINKEDIN_MULTIPLE_PDFS_ERROR })).not.toBeVisible();
	});

	await test.step('Select twitter account and verify error validations', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.getByText(TW_UNSUPPORTED_FILE_TYPE_ERROR)).toBeVisible();
		await expect(page.getByText(TW_SUPPORTED_FILE_TYPES_INFO)).toBeVisible();
	});

	await test.step('Remove twitter account and verify no errors remain', async () => {
		await page.getByLabel('Clear selection '.concat(twAccount)).click();
		await expect(page.getByText(TW_UNSUPPORTED_FILE_TYPE_ERROR)).not.toBeVisible();
		await expect(page.getByText(TW_SUPPORTED_FILE_TYPES_INFO)).not.toBeVisible();
	});
});
