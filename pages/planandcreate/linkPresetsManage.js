exports.LinkPresetsManagePage = class LinkPresetsManagePage {
	constructor(page) {
		this.page = page;
		this.createNewLinkSettings = page.locator('.rc-LinkSettingsManagementArea .-createNewLinkSettings');
		this.createBitlyButton = page.getByRole('button', { name: 'Add new Bit.ly shortener' });
		this.shortenerInput = page.locator('.rc-TextInput input');
	}

	async  selectShortenerProvider(name) {
		const shortener = `//div[contains(@class, "-navigationBar")]//button[contains(@class, "fe-comp-sidebar-item") and contains(text(), "${name}")]`;

		await this.page.locator(shortener).click();
	}

	async createBitlyShortener(shortenerName) {
		await this.createNewLinkSettings.click();
		await this.shortenerInput.fill(shortenerName);
		const page1Promise = this.page.waitForEvent('popup');
		await this.createBitlyButton.click();
		const page1 = await page1Promise;
		await page1.getByRole('button', { name: 'Close' }).click();
		await page1.getByRole('link', { name: 'Sign in with your Bitly account' }).click();
		await page1.waitForLoadState('networkidle');
		await page1.getByLabel('Email').click();
		await page1.getByLabel('Email').fill('prafful.siddanati+testaccount@hootsuite.com');
		await page1.getByLabel('Password', { exact: true }).click();
		await page1.getByLabel('Password', { exact: true }).fill('tKq54RWaw362');
		await page1.getByRole('button', { name: 'Log in' }).click();
		await page1.getByRole('button', { name: 'Allow' }).click();
		await page1.close();
	}
};
