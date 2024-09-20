/* Test to duplicate a scheduled draft with linkedin pdf */
const { test, expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
let profileName, userName, memberId;
const draftScheduleTime = addHours(new Date() , 1);

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Duplicate a scheduled draft with LinkedIn PDF', async ({ page }) => {
	const pdfDraftText = 'Scheduled draft PDF duplicate ' + Math.floor(Math.random() * 1000);
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_li_pdf_duplicate_draft', 'team3s');
		await addFixture.command('li_pdf_scheduled_draft', 'linkedin', true, 300);
		profileName = getObjectByName(global.fixture, 'li_pdf_scheduled_draft').socialProfile.username;
		memberId = global.member[0].memberId;
		userName = global.member[0].name;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('pw_li_pdf_duplicate_draft');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			hs.memberActionHistory.postScheduledOrSent = true;
			hs.memberActionHistory.hasDismissedPlannerRecommendedTimesFirstRunPopover = true;
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Deleting residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Create a scheduled draft with PDF', async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				memberId,
				null,
				getObjectByName(global.fixture, 'li_pdf_scheduled_draft').socialProfile.socialProfileId,
				pdfDraftText,
				'LINKEDIN',
				formatISO(draftScheduleTime),
			);
		} catch (error) {
			throw new Error(`Error creating draft: ${error}`);
		}
	});

	await test.step('Navigate to drafts page', async () => {
		await draftsPage.visit();
	});

	await test.step('Verify scheduled draft message', async () => {
		await draftsPage.verifyDraftMessage(profileName, pdfDraftText, userName);
		await expect(plannerPage.pdfCardIcon).toBeVisible();
		await draftsPage.showPreviewPane(pdfDraftText);
	});

	await test.step('Duplicate the scheduled post', async () => {
		await page.waitForTimeout(2000);
		await plannerPage.duplicateFromPreviewPane();
	});

	await test.step('Verify message in composer', async () => {
		await composePage.verifyLinkedInPdfPreview();
	});

	await test.step('Update the draft', async () => {
		await composePage.writeMessage('--Duplicated');
		await composePage.verifyLinkedInPreview(pdfDraftText.concat('--Duplicated'));
	});

	await test.step('Schedule the draft', async () => {
		await composePage.scheduleDuplicateMessage();
	});

	await test.step('Verify scheduled message in planner', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.calendarTab).toBeVisible();
		await plannerPage.calendarTab.click();
		await plannerPage.showPreviewPane(pdfDraftText.concat('--Duplicated'));
		await plannerPage.verifyTextInPreviewPane(pdfDraftText.concat('--Duplicated'));
		await plannerPage.verifyPDFInPreviewPane();
	});
});
