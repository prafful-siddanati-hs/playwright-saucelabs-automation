/* Test to schedule Linkedin pdf from a draft  */
const { test, expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Schedule a LinkedIn PDF post from draft', async ({ page }) => {
	const pdfDraftText = 'Unscheduled draft PDF ' + Math.floor(Math.random() * 1000);
	const editedPdfDraftText = pdfDraftText.concat(' --edited');
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_li_pdf_draft', 'team3s');
		await addFixture.command('li_pdf_draft', 'linkedin', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('pw_li_pdf_draft');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Delete residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Create an unscheduled draft with PDF', async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				memberId,
				null,
				getObjectByName(global.fixture, 'li_pdf_draft').socialProfile.socialProfileId,
				pdfDraftText,
				'LINKEDIN'
			);
		} catch (error) {
			throw new Error(`Failed to create unscheduled draft: ${error}`);
		}
	});

	await test.step('Navigate to drafts', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(1);
	});

	await test.step('Edit the draft', async () => {
		await draftsPage.editDraftByContent(pdfDraftText);
		await composePage.updateDraft(editedPdfDraftText);
	});

	await test.step('Schedule the draft', async () => {
		await draftsPage.showPreviewPane(editedPdfDraftText);
		await composePage.schedule();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await expect(plannerPage.exitOnboardingPopover).toBeVisible();
		await plannerPage.exitOnboardingPopover.click();
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyTextInPreviewPane(editedPdfDraftText);
		await plannerPage.verifyPDFInPreviewPane();
	});
});
