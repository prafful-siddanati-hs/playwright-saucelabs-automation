const { expect } = require('@playwright/test');

exports.TagComponentPage = class TagComponentPage {
	constructor(page) {
		this.page = page;
		this.editTagsButton = page.locator('.rc-TagArea button');
		this.tagInputArea =  page.locator('.-tagEditArea .-tagInputArea');
		this.inputTag = page.locator('.rc-TagArea .-tagEditArea .vk-PillWrapper');
		this.applyTagButton =  page.locator('//div[contains(@class, "-tagEditArea")]//div[contains(@class, "vk-TagEditAreaFooter")]//button[contains(text(), "Add")]');
		this.tagDisplayArea = page.locator('.rc-TagArea .-tagDisplayArea');
		this.tagAreaTitle = page.locator('.rc-TagArea h3');
		this.manageTagsButton = page.locator('//div[contains(@class, "-tagEditArea")]//button[contains(text(), "Manage tags")] | //*[contains(@class, "-tagPopover")]//*[contains(@class, "-manageTagArea")]//*[text()="Manage Tags"]');
		this.createTag = page.getByRole('button', { name: 'Create New Tag' });
		this.createTagModal = page.locator('.-modalDialog');
		this.tagNameInput = page.getByPlaceholder('Choose a tag name');
		this.tagModalCreateButton = page.getByRole('button', { name: 'Create', exact: true });
		this.closeTagManagerButton = page.getByLabel('Close Tag Manager');
		this.addFirstTagButton = page.locator('.-tagEditArea button[aria-label="Add tags"]');
		this.tagPillsInputBox = page.locator('.rc-TagArea .rc-TagInputSelector input, .rc-TagArea .vk-PillsInputBoxWrapper input');
	}

	async selectEditTagsButton() {
		await expect(this.editTagsButton).toBeVisible();
		await this.editTagsButton.click();
		await expect(this.tagInputArea).toBeVisible();
		await this.tagInputArea.click();
	}

	async selectManageTagsButton() {
		await expect(this.manageTagsButton).toBeVisible();
		await this.manageTagsButton.click();
	}

	async openCreateTagModal() {
		await expect(this.createTag).toBeVisible();
		await this.createTag.click();
	}

	async enterTagName(tagName) {
		await expect(this.tagNameInput).toBeVisible();
		await this.tagNameInput.fill(tagName);
	}

	async clickTagModalCreateButton() {
		await expect(this.tagModalCreateButton).toBeVisible();
		await this.tagModalCreateButton.click();
		await expect(this.tagModalCreateButton).not.toBeVisible();
		await expect(this.tagNameInput).not.toBeVisible();
		await expect(this.createTagModal).not.toBeVisible();
	}

	async closeTagManager() {
		await expect(this.closeTagManagerButton).toBeVisible();
		await this.closeTagManagerButton.click();
		await expect(this.closeTagManagerButton).not.toBeVisible();
	}

	async selectTag(tag) {
		const tagSelector = `//div[contains(@class, "rc-TagArea")]//div[contains(@class, "-tagEditArea")]//*[text()="${tag}"]`;

		await expect(this.page.locator(tagSelector)).toBeVisible();
		await this.page.locator(tagSelector).click();
	}

	async dismissTagPopoverList() {
		await expect(this.tagAreaTitle).toBeVisible();
		await this.tagAreaTitle.click();
		await expect(this.manageTagsButton).not.toBeVisible();
	}

	async selectApplyTagButton() {
		await expect(this.applyTagButton).toBeVisible();
		await this.applyTagButton.click();
		await expect(this.applyTagButton).not.toBeVisible();
	}

	async clickAddTagButton() {
		await expect(this.addFirstTagButton).toBeVisible();
		await this.addFirstTagButton.click();
	}

	async clickTagInputButton() {
		await expect(this.tagPillsInputBox).toBeVisible();
		await this.tagPillsInputBox.click();
	}

	async selectTagOnCampaignPage(name) {
		const tag = `//*[@data-testid="tag-area-edit"]//*[@data-testid="list-item-clickable"]//*[text()="${name}"]`;

		await expect(this.page.locator(tag)).toBeVisible();
		await this.page.locator(tag).hover();
		await this.page.locator(tag).click();
	}

	async removeTagOnCampaignPage(name) {
		const tag = `//*[contains(@class, "-tagEditArea")]//*[contains(@class, "vk-PillsInputWrapper")]//*[text()="${name}"]/following::div[contains(@class, "vk-RemovePillButton")][1]`;

		await expect(this.page.locator(tag)).toBeVisible();
		await this.page.locator(tag).click();
	}

};
