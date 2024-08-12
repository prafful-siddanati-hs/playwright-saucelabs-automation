/* Test to check LinkedIn PDF post is rejected by one time reviewer */
const { test,expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const tearDown = require('../../../../custom-commands/tearDown');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addDays } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');

const scheduleDate = addDays(new Date(), 1);
let adminMemberId, limitedUserMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Reject LinkedIn PDF post by one time reviewer : ', async ({ page }) => {
	let orgName = 'pw_li_pdf_reject_' + Math.floor(Math.random() * 10000);
	const pdfText = 'Reject with PDF ' + Math.floor(Math.random() * 1000);
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const updateSNPermissions = new modifySocialProfilePermissions();

	let accounts = {
		linkedin: []
	};
	accounts.linkedin.push('pw_li_pdf_ca_reject');

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'li_pdf_admin_user', accounts);
		await createNewUser.command('pw_reject_limited_user');
		await addUserToNewOrg.command('pw_reject_limited_user', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'pw_li_pdf_ca_reject', 'pw_reject_limited_user');
		limitedUserMemberId = global.member[1].memberId;
		adminMemberId = global.member[0].memberId;
	});

	await test.step('Login as admin user', async () => {
		await loginPage.signInSkipOnboarding('li_pdf_admin_user');
	});

	await test.step('Schedule a LinkedIn PDF post with one time reviewer', async () => {
		await plannerPage.scheduleMessageWithPDF(
			limitedUserMemberId,
			getObjectByName(global.fixture, 'pw_li_pdf_ca_reject').socialProfile.socialProfileId,
			pdfText,
			formatISO(scheduleDate),
			adminMemberId
		);
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(adminMemberId);
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

	await test.step('Verify Pending approval status and approval history', async () => {
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Pending approval from ${(global.member[0].username)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});

	await test.step('Reject the LinkedIn PDF post', async () => {
		await expect(plannerPage.previewPaneRejectButton).toBeVisible();
		await plannerPage.previewPaneRejectButton.click();
		await expect(plannerPage.rejectModalInput).toBeVisible();
		await plannerPage.rejectModalInput.fill('Wrong PDF');
		await expect(plannerPage.rejectModalRejectButton).toBeVisible();
		await plannerPage.rejectModalRejectButton.click();
		await expect(composePage.feCallOuts).toBeVisible();
	});

	await test.step('Logout from admin user', async () => {
		await loginPage.logout();
	});

	await test.step('Login as limited user', async () => {
		await loginPage.signIn('pw_reject_limited_user');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(limitedUserMemberId);
		await plannerPage.hideRecommendedTimes(limitedUserMemberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify rejected message in planner preview pane', async () => {
		await expect(plannerPage.pdfCardIcon).toBeVisible();
		await plannerPage.showPreviewPane(pdfText);
		await plannerPage.verifyTextInPreviewPane(pdfText);
		await plannerPage.verifyPDFInPreviewPane();
	});

	await test.step('Verify status and approval history', async () => {
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Rejected');
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.locator('#modalDialog').getByText(`Rejected by ${(global.member[0].username)}`, { exact: true })).toBeVisible();
	});
});
