/* Test to schedule Linkedin pdf from a draft  */
const { test, expect } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName, plan_create } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');

let memberId, orgId, liAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Schedule a LinkedIn PDF post from draft', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();

	let orgName = 'edit_unscheduled_pdf_draft_' + Math.floor(Math.random() * 10000);
	let accounts = {
		linkedin: ['liAccount'],
	};
	const pdfDraftText = 'Unscheduled draft PDF ' + Math.floor(Math.random() * 1000);
	const editedPdfDraftText = pdfDraftText.concat(' --edited');

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'pw_li_pdf_draft', accounts);
		memberId = global.member[0].memberId;
		orgId = global.organization[0].id;
		liAccount = getObjectByName(global.fixture, 'liAccount').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('pw_li_pdf_draft');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Delete residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Create an unscheduled draft with PDF', async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				memberId,
				orgId,
				parseInt(getObjectByName(global.fixture, 'liAccount').socialProfile.socialProfileId, 10),
				pdfDraftText,
				'LINKEDIN',
				[plan_create.getRandomPDF()]
			);
		} catch (error) {
			throw new Error(`Failed to create unscheduled draft: ${error}`);
		}
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Navigate to drafts', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(1);
		await expect(plannerPage.pdfCardIcon).toBeVisible();
	});

	await test.step('Edit the draft', async () => {
		await draftsPage.editDraftByContent(pdfDraftText);
		await expect(page.getByTestId('preview-container').getByText(`${liAccount}`)).toBeVisible(); //Wait for preview to load
		await composePage.updateDraft(editedPdfDraftText);
		await composePage.verifyLinkedInPreview(editedPdfDraftText);
		await composePage.verifyLinkedInPdfPreview();
	});

	await test.step('Schedule the draft', async () => {
		await composePage.schedule();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Verify scheduled message in planner preview', async () => {
		await expect(plannerPage.calendarTab).toBeVisible();
		await plannerPage.calendarTab.click();
		await plannerPage.showPreviewPane(editedPdfDraftText);
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyTextInPreviewPane(editedPdfDraftText);
		await plannerPage.verifyPDFInPreviewPane();
	});
});
