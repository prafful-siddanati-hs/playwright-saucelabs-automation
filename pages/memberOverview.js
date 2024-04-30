const { expect } = require('@playwright/test');

exports.MemberOverViewPage = class MemberOverViewPage {
	constructor(page) {
		this.page = page;
		this.linkSettingsButton = page.getByRole('button', { name: 'Link Settings' });
	}

	async  visitMember() {
		await this.page.goto('/dashboard#/member');
		await this.page.waitForLoadState();
	}

	async selectLinkSettingButton(){
		await expect(this.linkSettingsButton, 'Link setting button is not visible on member page').toHaveCount(1);
		await this.linkSettingsButton.click();
	}
};
