const { test, expect, defineConfig} = require('@playwright/test');

exports.LoginPage = class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailAddress = page.locator('#loginEmailInput');
        this.password = page.locator('#loginPasswordInput');
        this.loginSubmit = page.getByRole('button', { name: 'Sign in', exact: true });
    }

    async visit() {
        await this.page.goto('https://staging.hootsuite.com/login?lang=en');
    }

    async login(email, password, defineConfig) {
        await this.page.goto('/login?lang=en');
        await expect(this.page).toHaveTitle(/Hootsuite - Login/);
        await this.emailAddress.fill(email);
        await this.password.fill(password);
        await this.loginSubmit.click();
        await expect(this.emailAddress).not.toBeVisible;
        await this.page.waitForLoadState();
    }
};
