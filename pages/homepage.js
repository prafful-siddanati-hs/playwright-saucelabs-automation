const {expect} = require('@playwright/test');

exports.HomePage = class HomePage {
	constructor(page) {
		this.page = page;
		this.homePageGlobalNavButton = page.getByLabel('Home');
		this.homePageWidget = page.locator('.homepage-widget-inspirations');
		this.homePageCreateButton = page.locator('//*[contains(@class, "homepage-welcome-header")]//*[contains(text(), "Create a post")]', {locationStrategy: 'xpath'});
	}

	async visit() {
		await this.page.goto('/dashboard#/home');
		await this.page.waitForLoadState();
		await expect(this.homePageCreateButton).toBeVisible();
	}

	async selectCreatePostButton() {
		await expect(this.homePageCreateButton).toBeVisible();
		await this.homePageCreateButton.click();
	}
};
