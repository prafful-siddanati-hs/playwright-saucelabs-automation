/* Edit a LinkedIn Pdf post with a different text & network */
const { test, expect } = require('@playwright/test');
const createUser = require('../../../custom-commands/createUser');
const getFixture = require('../../../custom-commands/getFixture');
const tearDown = require('../../../custom-commands/tearDown');
const { getObjectByName, plan_create } = require('../../../globals');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../pages/planandcreate/planner');
const scheduleDate = addHours(new Date(), 1);
let liAccount1, liAccount2, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit a LinkedIn PDF post', async ({ page }) => {
	const pdfText = 'Edit this text ' + Math.floor(Math.random() * 1000);
	const newPdfText = pdfText.concat(`--edited with url https://www.${plan_create.getRandomUrl()} `);
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_li_pdf_edit', 'team3s');
		await addFixture.command('linkedin_sn_1', 'linkedin', true, 300);
		await addFixture.command('linkedin_sn_2', 'linkedin', true, 300);
		liAccount1 = getObjectByName(global.fixture, 'linkedin_sn_1').socialProfile.username;
		liAccount2 = getObjectByName(global.fixture, 'linkedin_sn_2').socialProfile.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('pw_li_pdf_edit');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Schedule a LinkedIn PDF post', async () => {
		await plannerPage.scheduleMessageWithPDF(
			memberId,
			getObjectByName(global.fixture, 'linkedin_sn_1').socialProfile.socialProfileId,
			pdfText,
			formatISO(scheduleDate)
		);
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
		await composePage.messageArea.click();
		await composePage.messageArea.fill(`${newPdfText}`);
	});

	await test.step('Select a different linkedin account', async () => {
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
		await plannerPage.verifyScheduledMessage(newPdfText);
		await plannerPage.showPreviewPane(newPdfText);
	});
});
