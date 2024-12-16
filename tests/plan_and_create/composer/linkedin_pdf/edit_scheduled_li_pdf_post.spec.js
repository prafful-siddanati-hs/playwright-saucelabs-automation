/* Edit a LinkedIn Pdf post with a different text & network */
const { test, expect } = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const { getObjectByName, plan_create } = require('../../../../globals');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const tearDown = require('../../../../custom-commands/tearDown');

const scheduleDate = addHours(new Date(), 1);
let liAccount1, liAccount2, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit a LinkedIn PDF post by changing the profile', async ({ page }) => {
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);

	let orgName = 'pw_edit_scheduled_li_pdf_post_' + Math.floor(Math.random() * 10000);
	let accounts = {
		linkedin: ['liAccount1', 'liAccount2'],
	};
	const pdfText = 'Edit this text ' + Math.floor(Math.random() * 1000);
	const newPdfText = `--edited with url https://www.${plan_create.getRandomUrl()} `;

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'pw_li_pdf_edit', accounts);
		memberId = global.member[0].memberId;
		liAccount1 = getObjectByName(global.fixture, 'liAccount1').socialProfile.username;
		liAccount2 = getObjectByName(global.fixture, 'liAccount2').socialProfile.username;

		if (liAccount1 === liAccount2) {
			throw new Error(`The same account '${liAccount1}' cannot be used for both liAccount1 and liAccount2`);
		}
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('pw_li_pdf_edit');
	});

	await test.step(`Schedule a PDF post for ${liAccount1}`, async () => {
		try {
			await plannerPage.scheduleMessageWithPDF(
				memberId,
				getObjectByName(global.fixture, 'liAccount1').socialProfile.socialProfileId,
				pdfText,
				formatISO(scheduleDate)
			);
		} catch (pdfScheduleError) {
			console.error('Error scheduling PDF post: ', pdfScheduleError);
			throw pdfScheduleError;
		}
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await expect(plannerPage.pdfCardIcon).toBeVisible();
		await plannerPage.showPreviewPane(pdfText);
		await plannerPage.verifyTextInPreviewPane(pdfText);
		await plannerPage.verifyPDFInPreviewPane();
	});

	await test.step('Edit scheduled message', async () => {
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Update the message', async () => {
		await expect(page.getByTestId('preview-container').getByText(`${liAccount1}`)).toBeVisible(); //Wait for preview to load
		await composePage.writeMessage(newPdfText);
		await composePage.verifyLinkedInPreview(pdfText.concat(newPdfText));
	});

	await test.step(`Select a different ${liAccount2} account`, async () => {
		await page.getByLabel('Clear selection '.concat(liAccount1)).click();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount2);
		await composePage.postToWrapper.click();
	});

	await test.step('Verify url does not generate a preview', async () => {
		await expect(composePage.linkedInMessageLink).toBeVisible();
		await expect(composePage.linkedinLinkPreviewTitle).not.toBeVisible();
		await expect(page.getByTestId('preview-container').getByText(`${liAccount2}`)).toBeVisible(); //Check account name is updated
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify edited message in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.weekViewPostCountHeader(1); //Check count to ensure original post is edited instead of creating a new post
		await plannerPage.verifyScheduledMessage(pdfText.concat(newPdfText));
		await plannerPage.showPreviewPane(pdfText.concat(newPdfText));
	});
});
