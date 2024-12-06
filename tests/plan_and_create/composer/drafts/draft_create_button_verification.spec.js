/* Test to verify drafts create button on past, present and future dates */
const { test, expect} = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const { formatISO, addMonths, getDate } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const {DraftsPage} = require('../../../../pages/planandcreate/drafts');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, orgId, fbAccount, facebookPageId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify drafts create button on past, present and future dates', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const addSocialNetwork = new addSocialToOrg();
	const draftsPage = new DraftsPage(page);

	let orgName = 'DraftCreateButtonVerification_' + Math.floor(Math.random() * 10000);
	let draftText = 'Draft to verify create button across date range';
	const draftScheduleTime = addMonths(new Date(), 1);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('draft_create_button_verification', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_draft_createButton', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_draft_createButton');
		memberId = global.member[0].memberId;
		orgId = global.organization[0].id;
		fbAccount = getObjectByName(global.fixture, 'fb_draft_createButton').socialProfile.username;
		facebookPageId = getObjectByName(global.fixture, 'fb_draft_createButton').socialProfile.socialProfileId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('draft_create_button_verification');
	});

	await test.step('Delete residual draft messages via API', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step(`Create draft for next month for ${fbAccount}`, async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				memberId,
				orgId,
				facebookPageId,
				draftText,
				'FACEBOOKPAGE',
				[],
				formatISO(draftScheduleTime),
			);
		} catch (error) {
			throw new Error(`Failed to create unscheduled draft: ${error}`);
		}
	});

	await test.step('Verify there are no drafts', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(0);
	});

	await test.step('Verify create button is present for Today\'s date', async () => {
		await expect(draftsPage.createButton).toBeVisible();
	});

	await test.step('Verify create button is not present for past date', async () => {
		let todayDate = getDate(new Date());
		if (todayDate === '1') {
			await expect(plannerPage.prevButton).toBeVisible(); // If today is 1st of the month, then go to previous month
			await plannerPage.prevButton.click();
			await expect(draftsPage.createButton).not.toBeVisible();
			await expect(plannerPage.nextButton).toBeVisible(); // Go back to current month
			await plannerPage.nextButton.click();
		} else {
			await expect(draftsPage.pastDateOnPVG).toBeVisible();
			await draftsPage.pastDateOnPVG.click();
			await expect(draftsPage.createButton).not.toBeVisible();
		}
	});

	await test.step('Verify create button is present on next month', async () => {
		let draftPvg = page.locator('//*[contains(@data-testid,"PostCountBarGraph")]/ancestor::*[contains(@aria-label,"1 post on")]', { locateStrategy: 'xpath' });
		await expect(draftsPage.nextMonthNavigationButton).toBeVisible();
		await draftsPage.nextMonthNavigationButton.click();
		await expect(draftPvg).toBeVisible();
		await draftPvg.click();
		await expect(draftsPage.createButton).toBeVisible();
		await expect(draftsPage.createButton).toHaveCount(1);
	});

	await test.step('Verify the scheduled draft is visible', async () => {
		await expect(draftsPage.draftItem).toHaveCount(1);
		await draftsPage.verifyDraftMessage(fbAccount, draftText, global.member[0].username);
	});

	await test.step('Delete the scheduled draft', async () => {
		await draftsPage.showPreviewPane(draftText);
		await draftsPage.deleteDraft(draftText);
	});
});
