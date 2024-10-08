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
	}

	async selectEditTagsButton() {
		await expect(this.editTagsButton).toBeVisible();
		await this.editTagsButton.click();
		await expect(this.tagInputArea).toBeVisible();
		await this.tagInputArea.click();
	}

	async selectTag(tag) {
		const tagSelector = `//div[contains(@class, "rc-TagArea")]//div[contains(@class, "-tagEditArea")]//*[text()="${tag}"]`;

		await expect(this.page.locator(tagSelector)).toBeVisible();
		await this.page.locator(tagSelector).click();
		await expect(this.inputTag).toHaveText(tag);
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
};
