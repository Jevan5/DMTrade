export class Account {
    private _id: string;
    private firstName: string;
    private lastName:  string;
    private portfolios: Array<string>;
    private security: string;

    /**
     * Creates an Account.
     * 
     * @param accountJson JSON representation of the account
     * from the API.
     */
    constructor(accountJson) {
        if (accountJson == null || !accountJson.hasOwnProperty('_id') ||
            typeof(accountJson._id) !== 'string' || accountJson._id === '' ||
            !accountJson.hasOwnProperty('firstName') || typeof(accountJson.firstName) !== 'string' ||
            accountJson.firstName === '' || !accountJson.hasOwnProperty('lastName') ||
            typeof(accountJson.lastName) !== 'string' || accountJson.lastName === '' ||
            !accountJson.hasOwnProperty('portfolios') || accountJson.portfolios.constructor !== Array ||
            !accountJson.hasOwnProperty('security') || typeof(accountJson.security) !== 'string' ||
            accountJson.security === '') {
            throw 'accountJson = ' + accountJson;
        }
        this._id = accountJson._id;
        this.firstName = accountJson.firstName;
        this.lastName = accountJson.lastName;
        this.portfolios = accountJson.portfolios;
        this.security = accountJson.security;
    }

    /**
     * Gets this account's ID.
     * @return ID of the account.
     */
    public get_id() : string {
        return this._id;
    }

    /**
     * Gets this account's first name.
     * @return First name of the account.
     */
    public getFirstName() : string {
        return this.firstName;
    }

    /**
     * Gets this account's last name.
     * @return Last name of the account.
     */
    public getLastName() : string {
        return this.lastName;
    }

    /**
     * Gets the list IDs of the portfolios
     * that this account owns.
     * @return List of portfolio IDs that the account owns.
     */
    public getPortfolios() : Array<string> {
        return this.portfolios;
    }

    /**
     * Gets the ID of the security instance for the account.
     * @return ID of the security associated with this account.
     */
    public getSecurity() : string {
        return this.security;
    }
}