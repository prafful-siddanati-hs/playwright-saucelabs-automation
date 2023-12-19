const events = require('events');
const Som = require('hsapi').som;

const { som, defaultPassword } = require('../globals.js');

/**
 * Creates a new member object in member service, dashboard, and billing service and adds user to globals.
 *
 * @param {string}    name                      Name of the test, e.g. playwright_test_user
 * @param {string}    plan                      default plan: core, other options: professional, team3s
 * @param {function}  callback                  Use a callback to get the results
 *
 * @return {function} this                      Returning this allows commands to be chained
 */

class createUser extends events.EventEmitter {
    constructor() {
        super();
    }

    async command(name, plan = 'core', callback) {
        const planMap = {
            core: { productCode: '', makeAriaAccount: false },
            professional: { productCode: 'PROFESSIONAL_PLAN', makeAriaAccount: true },
            team3s: { productCode: 'TEAM3S', makeAriaAccount: true }
        };

        if (!(plan.toLowerCase() in planMap)) {
            throw new Error(`Key '${plan}' does not exist in the hash.`);
        }
        // retrieve respective productCode and aria flag base on plan
        const { productCode, makeAriaAccount } = planMap[plan.toLowerCase()];

        console.log(`Creating ${name} user with plan type: ${plan.toUpperCase()}`);

        let dashboard = new Som(som);
        let member = {
            name: name,
            accountType: productCode, // accountType is not populated by default, unlike with createUser
            fullName: name,
            email: `${name.replace(/\s+/g, '')}_${Date.now()}@playwright.ly`,
            password: defaultPassword,
            tearDown: true,
            emailChange: false
        };

        try {
            let data = await dashboard.createUserWithBilling(member.fullName, member.email, member.password, productCode, makeAriaAccount);
            console.log(data !== undefined, `${member.email} / ${member.password}`);

            // Updates member object, using the keys in data as defaults
            Object.assign(member, data);

            if (!member.memberId) {
                throw new Error(`Create user was unable to get a valid memberId. Response: ${JSON.stringify(data)}`);
            }

            if (typeof callback === 'function') {
                callback.call(this, member);
            }
        } catch (err) {
            console.assert(false, `Error creating user with billing. ${err}`);
        } finally {
            //Update global storage with member details so that functions like getFixture() can access it.
            if (!global.member) {
                global.member = []
            }
            global.member.push(member);
            this.emit('complete');
        }
        return this;
    }
}

module.exports = createUser;
