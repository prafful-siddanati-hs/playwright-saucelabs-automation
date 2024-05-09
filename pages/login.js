const { expect } = require('@playwright/test');
const {getObjectByName} = require('../globals');

exports.LoginPage = class LoginPage {
	constructor(page) {
		this.page = page;
		this.cookie = [];
		this.emailAddress = page.locator('#loginEmailInput');
		this.password = page.locator('#loginPasswordInput');
		this.loginSubmit = page.getByRole('button', { name: 'Sign in', exact: true });
		this.streamsView = page.locator('#stream-migration-root');
		this.welcomeSelector = page.locator('.homepage-widget-announcements');
		this.homeLoginButton = page.locator('//*[@data-button-type="primary"]//*[contains(text(), "Log In")]', {locationStrategy: 'xpath'});
	}

	async visit() {
		await this.page.goto('login?lang=en');
	}

	async signIn(member) {
		let user;
		let hsUsers = global.member;

		if (typeof member === 'string') {
			user = getObjectByName(hsUsers, member);
		} else if (hsUsers.size() > 0) {
			user = hsUsers.get()[hsUsers.size() - 1];
		} else if (member) {
			user = member;
		} else {
			console.log('No Hootsuite User found.');
		}

		await this.page.goto('/login?lang=en');
		await expect(this.page).toHaveTitle(/Hootsuite - Login/);
		await this.emailAddress.fill(user.email);
		await this.password.fill(user.password);
		await this.loginSubmit.click();
		await expect(this.emailAddress, 'Login into Hootsuite failed').not.toBeVisible();
		await this.page.waitForLoadState();
	}

	async login(email, password) {
		await this.page.goto('/login?lang=en');
		await expect(this.page).toHaveTitle(/Hootsuite - Login/);
		await this.emailAddress.fill(email);
		await this.password.fill(password);
		await this.loginSubmit.click();
		await expect(this.emailAddress, 'Login into Hootsuite failed').not.toBeVisible();
		await this.page.waitForLoadState();
	}

	async logout() {
		// await this.page.context().addCookies([
		// 	{
		// 		name: '_SID_STAGE_TRUNK',
		// 		value: '',
		// 		domain: '*.staging.hootsuite.com',
		// 		path: '/',
		// 		expires: Date.now() / 1000 // Set expiration date to the current time to expire the cookie immediately
		// 	}
		// ]);
		// console.log('Deleting cookies to force a logout. See PLAT-10602 for more details.');
		await this.page.goto('/logout');
		await expect(this.homeLoginButton).toBeVisible();
	}

	// Redirect to dashboard home after login to skip any onboarding
	async signInSkipOnboarding(member) {
		await this.signIn(member);
		await this.page.goto('/dashboard#/home');
	}

	async signInAsProUser(member) {
		await this.signIn(member);

		const isViewVisible = await Promise.race([
			this.streamsView.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			this.welcomeSelector.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isViewVisible).toBeTruthy();
	}

	async verifySocialNetwork(name) {
		await expect(this.page.locator(`//*[contains(@id, "social-profiles-tab")]//*[text()="${name}"]`)).toBeVisible();
	}
};
