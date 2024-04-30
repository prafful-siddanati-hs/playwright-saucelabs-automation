const { expect } = require('@playwright/test');

exports.ContentLibraryPage = class ContentLibraryPage {
	constructor(page) {
		this.page = page;
		this.contentLibrarySection = page.locator('#publisherSection');
		this.createContentLibBtn = page.getByText('Create Content Library');
		this.libNameInput = page.getByRole('textbox');
		this.createBtn = page.getByRole('button', { name: 'Create' });
		this.uploadAssetsButton = page.getByRole('button', { name: 'Upload Assets'});
		this.createAssetPopup = page.locator('#createAsset');
		this.selectLibraryButton = page.locator('button').filter({ hasText: 'Select a Content Library…' });
		this.addAssetButton = page.getByRole('button', { name: 'Add new asset' });
		this.addTeamBtn = page.getByLabel('Create Library').getByRole('listitem').locator('div');
		this.librarySelectBtn = page.getByLabel('Select a library');
		this.editLibraryBtn = page.getByRole('option', { name: 'Edit Library...' });
		this.removeLibraryBtn = page.getByRole('button', { name: 'Remove' });
		this.firstCLCard = page.locator('.cardItem').first();
		this.composeWithTemplate = page.getByRole('button', { name: 'Compose', exact: true });
		this.clSuccessCallout = page.getByText('Saved to the Content Library');
	}

	async visit() {
		await this.page.goto('/dashboard#/publisher/contentlibrary');
		await expect(this.contentLibrarySection).toBeVisible();
		await this.page.waitForLoadState('networkidle');
	}

	async createContentLibrary(libraryName, teamName) {
		const selectTeam = this.page.getByRole('option', { name: `${teamName}` }).locator('div');
		await expect(this.createContentLibBtn, 'Create Content Library button is not visible').toBeVisible();
		await this.createContentLibBtn.hover();
		await this.createContentLibBtn.click();
		await expect(this.libNameInput, 'Content Library name input field is not visible').toBeVisible();
		await this.libNameInput.hover();
		await this.libNameInput.click();
		await this.libNameInput.fill(libraryName);
		await this.addTeamBtn.click();
		await selectTeam.click();
		await expect(this.createBtn, 'Content Library create button is not visible').toBeEnabled();
		await this.createBtn.click();
		await expect(this.uploadAssetsButton, 'Asset upload button is not visible').toBeVisible();
	}

	async createContentLibraryAsset(libraryName) {
		const libToSelect = this.page.getByRole('option', { name: `${libraryName}` }).locator('div');
		await expect(this.createAssetPopup, 'Content Library assert pop up is not visible').toBeVisible();
		await expect(this.selectLibraryButton, 'Select library button is not visible').toBeVisible();
		await this.selectLibraryButton.click();
		await libToSelect.click();
		await expect(this.addAssetButton, 'Add asset button is not visible').toBeEnabled();
		await this.addAssetButton.click();
		await expect(this.clSuccessCallout, 'Failed creating content library').toBeVisible();
		await expect(this.clSuccessCallout, 'Failed creating content library').toHaveCount(1);
	}

	async verifyContentLibraryTemplate(templateText) {
		const clTemplate = this.page.locator(`text=${templateText}`);
		await clTemplate.isVisible();
	}

	async deleteContentLibrary() {
		await expect(this.librarySelectBtn, 'Select content library button is not visible').toBeVisible();
		await this.librarySelectBtn.click();
		await this.editLibraryBtn.click();
		await expect(this.removeLibraryBtn, 'Remove content library button is not visible').toBeVisible();
		await this.removeLibraryBtn.click();
		this.page.on('dialog', async dialog => {
			await dialog.accept();
		});
		await this.removeLibraryBtn.click();
	}

	async selectContentLibraryTemplateToCompose(templateText) {
		await expect(this.page.getByText(templateText), 'Content library template name is not visible').toBeVisible();
		await expect(this.firstCLCard, 'Content library first card is not visible').toBeVisible();
		await this.firstCLCard.click();
		await expect(this.composeWithTemplate, 'Compose with template is not visible').toBeVisible();
		await this.composeWithTemplate.click();
	}
};
