/* Test to verify professional user cannot upload PDFs to linkedin */
const { test, expect} = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');

const PDF_UNSUPPORTED_ERROR = 'You can\'t upload files of this type.';
let proUserLinkedin, enterpriseUserLinkedin;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify professional user cannot upload PDFs to linkedin', async ({page}) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();

	let orgName = 'pdf_entitlement_' + Math.floor(Math.random() * 10000);
	let accounts = {
		linkedin: ['ent_li_account'],
	};

	await test.step('Setup an enterprise user', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'li_pdf_entitlement_enterprise', accounts);
		enterpriseUserLinkedin = getObjectByName(global.fixture, 'ent_li_account').socialProfile.username;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('li_pdf_entitlement_enterprise');
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Select new compose', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Verify ${enterpriseUserLinkedin} account is selected`, async () => {
		await composePage.verifySocialProfileSelected(enterpriseUserLinkedin);
	});

	await test.step('Upload PDF & check no error', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
		await expect(page.getByRole('heading', { name: PDF_UNSUPPORTED_ERROR})).not.toBeVisible();
	});

	await test.step('Logout from enterprise user', async () => {
		await loginPage.logout();
	});

	await test.step('Setup pro user & accounts', async () => {
		await addFixture.command('li_pdf_entitlement_pro', 'pro_user_composer', true, 300);
		proUserLinkedin = getObjectByName(global.fixture, 'li_pdf_entitlement_pro').linkedinProfile.username;
	});

	await test.step('Login as professional user', async () => {
		await loginPage.signIn('li_pdf_entitlement_pro');
	});

	await test.step('Select new compose for pro user', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Select ${proUserLinkedin} account`, async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(proUserLinkedin);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
	});

	await test.step('Verify PDF unsupported error', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
		await expect(page.getByRole('heading', { name: PDF_UNSUPPORTED_ERROR})).toBeVisible();
	});
});
