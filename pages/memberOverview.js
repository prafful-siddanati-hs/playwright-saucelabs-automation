const { expect } = require('@playwright/test');

exports.MemberOverViewPage = class MemberOverViewPage {
	constructor(page) {
		this.page = page;
		this.linkSettingsButton = page.getByRole('button', { name: 'Link Settings' });
		this.showTeamsBtn = page.locator('button[data-tracking-action="show_teams"]');
		this.addMemberDropDownBtn = page.locator('._plusAction._member');
		this.addNewMemberBtn = page.locator('._addNewMember');
		this.addMemberToOrgBtn = page.locator('#addMemberToOrgInputs');
		this.emailInput = page.locator('._email');
		this.inviteMessageInput = page.locator('._inviteIncludeMessage');
		this.addToTeamBtn = page.locator('._popupListTeam ._plusAction');
		this.createBtn = page.locator('//*[contains(@id, "inviteUserPopup")]//*[contains(@class,"btns-right")]//*[contains(@class,"_create")]');
		this.invitePopup = page.locator('#inviteUserPopup');
	}

	async  visitMember() {
		await this.page.goto('/dashboard#/member');
		await this.page.waitForLoadState();
	}

	async selectLinkSettingButton(){
		await expect(this.linkSettingsButton, 'Link setting button is not visible on member page').toHaveCount(1);
		await this.linkSettingsButton.click();
	}

	async teamSelector(teamName) {
		const selector = `//div[contains(@id, "popOverPane")]//div[contains(@class, "_scroll-list")]//span[contains(text(), "${teamName}")]`;
		await expect(this.page.locator(selector)).toBeVisible();
		await this.page.locator(selector).click();
	}
};
