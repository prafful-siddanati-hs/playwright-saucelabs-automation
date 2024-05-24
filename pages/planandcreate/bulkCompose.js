const { expect } = require('@playwright/test');

exports.BulkComposePage = class BulkComposePage {
	constructor(page) {
		this.page = page;
		this.bulkComposer = page.locator('#bulkComposerMountPoint .rc-BulkComposer .vk-ComposerModal');
		this.csvUploadButton = page.locator('.vk-FileSelector button');
		this.csvRemoveButton = page.getByLabel('Remove file', { exact: true });
		this.profileDropDown = page.locator('[aria-label="Select a social account (required)"]');
		this.snContentItems = page.locator('.vk-ComposerModal .vk-ContentItems');
		this.profileListItemTitle = page.locator('.vk-ComposerModal .vk-ProfileListItemTitle');
		this.pageHeading = page.getByRole('heading', { name: 'Bulk Composer'}, { exact: true });
		this.reviewPostsButton = page.getByRole('button', { name: 'Review posts' });
		this.messageDashboard = page.locator('.rc-MessageDashboard');
		this.messageEditArea = page.getByTestId('MessageEditArea').locator('div').first();
		this.bulkComposerError = page.locator('.rc-BulkComposer [data-testid="MessageEditArea"] h2');
		this.firstMessageItem = page.getByTestId('messageItemTop').first();
		this.messageArea = page.getByTestId('MessageEditArea').getByLabel('Text');
		this.scheduleButton = page.getByRole('button', { name: 'Schedule', exact: true });
		this.feCallOuts = page.locator('#fe-lib-async-callouts-container>div>div>div>div[type="success"]');
	}

	async setDarkLaunchCookies() {
		const url = this.page.url();
		await this.page.context().addCookies([
			{
				name: 'PUB_BULK_COMPOSER',
				value: '1',
				url: url,
			}
		]);
	}

	async visit() {
		await this.page.goto('/dashboard#/publisher/bulkcomposer');
		await expect(this.bulkComposer, 'should navigate to bulk composer').toBeVisible();
	}

	async selectSocialProfile(name) {
		const profileSelectorItem = this.page.getByTitle(`${name}`).first();
		await profileSelectorItem.click();
	}

	async verifySocialProfileSelected(name) {
		const pillText = this.page.locator(`//*[contains(@class, "vk-PillText") and text()="${name}"]`);
		await expect(pillText, 'Social network is not selected').toBeVisible();
		await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
	}

	async uploadCsvFile(csvFilePath) {
		try {
			await this.page.setInputFiles('.vk-FileSelector input[type="file"]', csvFilePath);
		} catch (csvUploadError) {
			console.error('Error uploading csv file: ', csvUploadError);
		}
	}

	async countOfPostsOnBulkComposer(num) {
		const postCountHeader = this.page.locator('div').filter({ hasText: new RegExp(` ${num} posts$`)});
		await postCountHeader.isVisible();
	}

	async writeMessage(message) {
		await this.page.keyboard.press('Escape');
		await this.messageArea.click();
		await this.page.keyboard.type(message);
		await expect(this.page.locator('.vk-Loader')).toHaveCount(0);
	}

	async verifyFacebookPreview(message) {
		const facebookPreview = this.page.locator(`//div[contains(@class, "rc-MessageEditText")] //div[contains(@class, "public-DraftEditor-content")]//span[contains(text(), '${message}')]`);

		await expect(facebookPreview, 'Facebook preview is not updated with text message on BC').toBeVisible();
	}

	async verifyTwitterPreview(message) {
		const twitterPreview = this.page.locator(`//div[contains(@class, "rc-MessageEditText")] //div[contains(@class, "public-DraftEditor-content")]//span[contains(text(), '${message}')]`);

		await expect(twitterPreview, 'Twitter preview is not updated with text message on BC').toBeVisible();
	}

	async schedule() {
		await expect(this.scheduleButton).toBeVisible();
		await this.scheduleButton.hover();
		await this.scheduleButton.click();
		await expect(this.scheduleButton, 'Schedule message failed from BC').not.toBeVisible();
		await expect(this.feCallOuts).toHaveCount(1);
	}
};
