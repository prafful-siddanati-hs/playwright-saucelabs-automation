/* Duplicate a LinkedIn Pdf post from planner */
const { test, expect } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addDays } = require('date-fns');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const scheduleDate = addDays(new Date(), 1);
let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Duplicate a LinkedIn PDF post', async ({page}) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();

	let orgName = 'pw_duplicate_li_pdf_' + Math.floor(Math.random() * 10000);
	let accounts = {
		linkedin: ['pw_duplicate_pdf']
	};
	const pdfText = 'Duplicate PDF post '+ + Math.floor(Math.random() * 1000);

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'pw_duplicate_li_pdf', accounts);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as test enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_duplicate_li_pdf');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Schedule a LinkedIn PDF post', async () => {
		try {
			await plannerPage.scheduleMessageWithPDF(
				memberId,
				getObjectByName(global.fixture, 'pw_duplicate_pdf').socialProfile.socialProfileId,
				pdfText,
				formatISO(scheduleDate)
			);
		} catch (pdfScheduleError) {
			console.error('Error scheduling PDF post: ', pdfScheduleError);
			throw pdfScheduleError;
		}
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(pdfText);
		await plannerPage.verifyTextInPreviewPane(pdfText);
		await plannerPage.verifyPDFInPreviewPane();
	});

	await test.step('Duplicate the scheduled post', async () => {
		await plannerPage.duplicateFromPreviewPane();
	});

	await test.step('Update the message', async () => {
		await composePage.writeMessage('--Duplicated');
	});

	await test.step('Save the edited message', async () => {
		await composePage.scheduleDuplicateMessage();
	});

	await test.step('Verify edited message in preview pane', async () => {
		let newPdfText = pdfText.concat('--Duplicated');

		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.weekViewPostCountHeader(2); //Check count to ensure new post is added
		await plannerPage.showPreviewPane(newPdfText);
		await plannerPage.verifyTextInPreviewPane(newPdfText);
		await plannerPage.verifyPDFInPreviewPane();
	});
});
