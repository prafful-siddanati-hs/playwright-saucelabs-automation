const { expect } = require('@playwright/test');

const customApprovalModalTile = 'Edit Custom Approval';
const firstModalApprovalTitle = '1st approver';
const defaultAssigneeName = 'Any Editor or Admin';
let firstAssignee = defaultAssigneeName;
let secondAssignee = defaultAssigneeName;
const secondModalApprovalTitle = 'Add a 2nd approver';
const secondApprovalTitle = '2nd approver';
const enabledModalDialogTitle = 'Custom Approval Enabled!';

exports.SnProfilesSettingPage = class SnProfilesSettingPage {
	constructor(page) {
		this.page = page;
		this.selectSocialNetworksBtn = page.locator('//button[text()= "Social Networks"]');
		this.selectProfileSettingsTab = page.locator('._tabs ._tab._tab_settings');
		this.selectTeamTab = page.locator('._tabs ._tab._tab_teams');
		this.addTeamPlusIcon = page.locator('._drillDownContent li._plusAction span.icon-19');
		this.selectTeamFromMenuDropDown = page.locator('.menu-dropdown span.title');
		this.selectEnableButton = page.locator('.-button .-enableButton');
		this.firstInputTeamMember = page.locator('.-approvals>div:nth-child(1) .rc-TextInput');
		this.secondInputTeamMember = page.locator('.-approvals>div:nth-child(2) .rc-TextInput');
		this.saveButton = page.locator('button.-saveButton.rc-Button.x-primary');
		this.doneButton = page.locator('button.-doneButton.rc-Button.x-primary');
		this.menuTrigger = page.locator('.rc-CustomApproval button.-menuTrigger');
		this.firstApprovalTitle = page.locator('.-approvals>div:nth-child(1) p.-approvalTitle.-enabled');
		this.secondApprovalTitle = page.locator('.-approvals>div:nth-child(2) p.-approvalTitle.-enabled');
		this.firstAssigneeName = page.locator('.rc-CustomApproval .-approvals>div:nth-child(1) span.-name');
		this.secondAssigneeName = page.locator('.rc-CustomApproval .-approvals>div:nth-child(2) span.-name');
		this.disableApproval = page.locator('.rc-SimpleMenu li.rc-MenuItem:nth-child(3)');
		this.disableModalTitle = page.locator('.custom-approval-disable-modal .-content span.-title');
		this.disableModalBody = page.locator('.-customApprovalDisableModalBody p.-description');
		this.disableCancelButton = page.locator('button.-cancelButton');
		this.disableDisableButton = page.locator('button.-disableButton');
		this.customApprovalModalTitle = page.locator('.custom-approval-modal .-title');
		this.firstModalApprovalTitle = page.locator('.-approvals>div:nth-child(1) .-approvalTop');
		this.secondModalApprovalTitle = page.locator('.-approvals>div:nth-child(2) .-approvalTop');
		this.firstDisableModalBody = page.locator('.-customApprovalDisableModalBody p.-description:nth-child(1)');
		this.secondDisableModalBody = page.locator('.-customApprovalDisableModalBody p.-description:nth-child(2)');
		this.selectPlusSign = page.locator('.-approvals span.-orderNumber p.-plusSign');
		this.enabledModalDialogTitle = page.locator('.-modalDialog .-title');
		this.editCustomApprovalButton = page.locator('//div[contains(@class, "tether-element")]//li[contains(@class, "rc-MenuItem")]//button[contains(text(), "Edit Custom Approval")]');
		this.contextMenu = page.locator('//button[contains(@class, "_contextmenu")]');
		this.deleteSocialNetworkOption = page.locator('//div[contains(@class, "menu-dropdown")]//span[contains(text(),"Delete Social Network")]');
		this.deleteSocialNetworkOnModalDialog = page.locator('//button[contains(text(),"Remove account")]');
		this.okButtonOnModalDialog = page.locator('//div[contains(@class, "-content")]//button[contains(text(),"Okay")]');
		this.firstApprovalOnModal = page.locator('(//p[contains(@class, "-approvalTitle -enabled") and contains(text(), "1st approver")])[1]');
	}

	async openSnProfileSettingsTab() {
		await expect(this.selectProfileSettingsTab).toBeVisible();
		await this.selectProfileSettingsTab.click();
	}

	async verifyDefaultCustomApprovals() {
		await expect(this.menuTrigger).toBeVisible();
		await expect(this.firstApprovalTitle).toHaveText(firstModalApprovalTitle);
		await expect(this.firstAssigneeName).toHaveText(defaultAssigneeName);
	}

	async selectEditCustomApprovalButton() {
		await expect(this.menuTrigger).toBeVisible();
		await this.menuTrigger.click();
		await expect(this.editCustomApprovalButton).toBeVisible();
		await this.editCustomApprovalButton.click();
	}

	async verifyDefaultCAOnModalDialog() {
		await expect(this.customApprovalModalTitle).toBeVisible();
		await expect(this.customApprovalModalTitle).toHaveText(customApprovalModalTile);
		await expect(this.firstApprovalOnModal).toBeVisible();
		await expect(this.secondModalApprovalTitle).toHaveText(secondModalApprovalTitle);
	}

	/**
   *
   * Adding 1st level custom approval for social network
   *
   * @param assignee the type of the assignee For ex:- Admin,Team or single user
   */
	async addFirstLevelCustomApproval(assignee) {
		firstAssignee = assignee;
		const selector = '//div[contains(@class, "rc-ApprovalComponent")]//div[contains(@class, "rc-SearchSelectedAssignee")]//*[text()="Any Editor or Admin"]';
		const assigneeItem = `(//*[@class=\'-approvals\']//*//*[@class=\'-dropdown\'])[1]//span[contains(text(),'${assignee}')]`;

		await expect(this.page.locator(selector)).toBeVisible();
		await this.page.locator(selector).click();
		await expect(this.page.locator(assigneeItem)).toBeVisible();
		await this.page.locator(assigneeItem).click();
	}

	/**
   *
   * Adding 2nd level custom approval for social network
   *
   * @param assignee the type of the assignee For ex:- Admin,Team or single user
   */
	async addSecondLevelCustomApproval(assignee) {
		secondAssignee = assignee;
		const assigneeItem = `(//*[@class=\'-approvals\']//*//*[@class=\'-dropdown\'])[2]//span[contains(text(),'${secondAssignee}')]`;

		await expect(this.selectPlusSign).toBeVisible();
		await this.selectPlusSign.click();
		await expect(this.secondInputTeamMember).toBeVisible();
		await this.secondInputTeamMember.click();
		await expect(this.page.locator(assigneeItem)).toBeVisible();
		await this.page.locator(assigneeItem).click();
	}

	/**
   *
   * Saving 1st level custom approval changes
   *
   */
	async saveFirstLevelCustomApproval() {
		await expect(this.saveButton).toBeVisible();
		await this.saveButton.click();
		await expect(this.doneButton).toBeVisible();
		await expect(this.enabledModalDialogTitle).toHaveText(enabledModalDialogTitle);
		await this.doneButton.click();
		await expect(this.firstApprovalTitle).toHaveText(firstModalApprovalTitle);
		await expect(this.firstAssigneeName).toHaveText(firstAssignee);
	}

	/**
   *
   * Saving 2nd level custom approval changes
   *
   */
	async saveSecondLevelCustomApproval() {
		await expect(this.saveButton).toBeVisible();
		await this.saveButton.click();
		await expect(this.enabledModalDialogTitle).toHaveText(enabledModalDialogTitle);
		await expect(this.doneButton).toBeVisible();
		await this.doneButton.click();
		await expect(this.firstApprovalTitle).toHaveText(firstModalApprovalTitle);
		await expect(this.secondApprovalTitle).toHaveText(secondApprovalTitle);
		await expect(this.firstAssigneeName).toHaveText(firstAssignee);
		await this.page.waitForTimeout(1000);
		await expect(this.secondAssigneeName).toHaveText(secondAssignee);
	}

	async deleteSocialNetwork(name) {
		const selector = `//ul[contains(@class, "deck-list")]//strong[contains(@class, "_filterable") and contains(text(), "${name}")]`;

		await expect(this.contextMenu).toBeVisible();
		await this.contextMenu.click();
		await expect(this.deleteSocialNetworkOption).toBeVisible();
		await this.deleteSocialNetworkOption.click();
		await expect(this.deleteSocialNetworkOnModalDialog).toBeVisible();
		await this.deleteSocialNetworkOnModalDialog.click();
		await expect(this.page.locator(selector)).toBeVisible();
		await this.page.locator(selector).click();
	}

};
