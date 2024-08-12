/* Test to schedule a LinkedIn PDF post */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Schedule LinkedIn PDF post', async ({page}) => {
	let orgName = 'pw_schedule_li_pdf_' + Math.floor(Math.random() * 10000);
	const pdfText = 'Schedule with PDF '+ + Math.floor(Math.random() * 1000);

	let accounts = {
		linkedin: []
	};
	accounts.linkedin.push('pw_li_pdf'); //Push no.of LinkedIn accounts to enterprise user

	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'pw_schedule_li_pdf', accounts);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_schedule_li_pdf');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify LinkedIn profile is selected', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, `${accounts.linkedin}`).username);
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(pdfText);
	});

	await test.step('Upload PDF file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
	});

	await test.step('Verify LinkedIn PDF preview', async () => {
		await composePage.verifyLinkedInPdfPreview();
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.pdfCardIcon).toBeVisible();
		await plannerPage.verifyTextInPreviewPane(pdfText);
		await plannerPage.verifyPDFInPreviewPane();
	});
});
