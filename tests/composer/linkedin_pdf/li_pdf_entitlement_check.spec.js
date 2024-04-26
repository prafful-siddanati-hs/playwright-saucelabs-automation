/* Test to verify professional user cannot upload PDFs to linkedin */
const { test, expect} = require('@playwright/test');
const createUser = require('../../../custom-commands/createUser');
const getFixture = require('../../../custom-commands/getFixture');
const tearDown = require('../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../globals');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');

const PDF_UNSUPPORTED_ERROR = 'You can\'t upload files of this type.';
let proUserLinkedin, teamUserLinkedin;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify professional user cannot upload PDFs to linkedin', async ({page}) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createNewUser = new createUser();
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_li_pdf_pro_user', 'professional');
		await addFixture.command('li_pdf_entitlement_pro','linkedin', true, 300);
		proUserLinkedin = getObjectByName(global.fixture, 'li_pdf_entitlement_pro').socialProfile.username;
	});

	await test.step('Login as professional user', async () => {
		await loginPage.signInAsProUser('pw_li_pdf_pro_user');
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify linkedin account is selected', async () => {
		await composePage.verifySocialProfileSelected(proUserLinkedin);
	});

	await test.step('Verify PDF unsupported error', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
		await expect(page.getByRole('heading', { name: PDF_UNSUPPORTED_ERROR})).toBeVisible();
	});

	await test.step('Logout from professional user', async () => {
		await loginPage.logout();
		new tearDown().command();
	});

	await test.step('Create a teams user', async () => {
		await createNewUser.command('pw_li_pdf_team_user', 'team3s');
		await addFixture.command('li_pdf_entitlement_teams','linkedin', true, 300);
		teamUserLinkedin = getObjectByName(global.fixture, 'li_pdf_entitlement_teams').socialProfile.username;
	});

	await test.step('Login as teams user', async () => {
		await loginPage.signInAsProUser('pw_li_pdf_team_user');
	});

	await test.step('Dismiss team user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Select team user new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify account is selected', async () => {
		await composePage.verifySocialProfileSelected(teamUserLinkedin);
	});

	await test.step('Upload PDF & check no error', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
		await expect(page.getByRole('heading', { name: PDF_UNSUPPORTED_ERROR})).not.toBeVisible();
	});
});
