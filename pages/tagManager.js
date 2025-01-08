const { expect } = require('@playwright/test');

exports.TagManagerPage = class TagManagerPage {
	constructor(page) {
		this.page = page;
		this.openTagManager = page.locator('//button[text()= "Tags"]');
		this.createTag = page.getByRole('button', { name: 'Create New Tag' });
		this.tagNameInputCreateModal = page.locator('.tagNameInput [aria-label="Tag Name"]');
		this.createButtonCreateTagModal = page.locator('//*[contains(@role,"dialog")]//button[2]');
		this.createTagModal = page.locator('.-modalDialog');
		this.closeTagManagerButton = page.getByLabel('Close Tag Manager');
	}

	async visitTagManager() {
		await expect(this.openTagManager).toBeVisible();
		await this.openTagManager.click();
	}

	async openCreateTagModal() {
		await expect(this.createTag).toBeVisible();
		await this.createTag.click();
	}

	async inputTagNameOnCreateModal(name) {
		await expect(this.tagNameInputCreateModal).toBeVisible();
		await this.tagNameInputCreateModal.fill(name);
	}

	async clickCreateButtonOnCreateTagModal() {
		await expect(this.createButtonCreateTagModal).toBeVisible();
		await this.createButtonCreateTagModal.click();
	}

	async waitForCreateTagModalToClose() {
		await expect(this.createTagModal).not.toBeVisible();
	}

	async closeTagManager() {
		await expect(this.closeTagManagerButton).toBeVisible();
		await this.closeTagManagerButton.click();
		await expect(this.closeTagManagerButton).not.toBeVisible();
	}

};
