export class Security {
    private _id: string;
    private account: string;
    private authentication: string;
    private email: string;
    private hashPass: string;
    private passChange: string;
    private salt: string;

    /**
     * Creates a Security.
     * 
     * @param securityJson JSON representation of the security
     * from the API.
     */
    constructor(securityJson) {
        if (securityJson == null || !securityJson.hasOwnProperty('_id') || typeof(securityJson._id) !== 'string' ||
            securityJson._id === '' || !securityJson.hasOwnProperty('account') || !securityJson.hasOwnProperty('email') ||
            typeof(securityJson.email) !== 'string' || securityJson.email === '' || !securityJson.hasOwnProperty('hashPass') ||
            typeof(securityJson.hashPass) !== 'string' || securityJson.hashPass === '' ||
            !securityJson.hasOwnProperty('passChange') || typeof(securityJson.passChange) !== 'string' || 
            !securityJson.hasOwnProperty('salt') || typeof(securityJson.salt) !== 'string' || securityJson.salt === '') {
            throw 'securityJson = ' + securityJson;
        }

        this._id = securityJson._id;
        this.account = securityJson.account;
        this.email = securityJson.email;
        this.hashPass = securityJson.hashPass;
        this.passChange = securityJson.passChange;
        this.salt = securityJson.salt;
    }

    /**
     * Gets this security's ID.
     * @return ID of this security.
     */
    public get_id() : string {
        return this._id;
    }

    /**
     * Gets the ID of the account associated with
     * this security.
     * @return ID of the account associated with the security.
     */
    public getAccount() : string {
        return this.account;
    }

    /**
     * Sets the account of the security.
     * @param account ID of the account.
     */
    public setAccount(account: string) : void {
        this.account = account;
    }

    /**
     * Gets the authentication code for the user. If
     * it is an empty-string, the user has already been authenticated.
     * @return The authentication code.
     */
    public getAuthentication() : string {
        return this.authentication;
    }

    /**
     * Gets the email of the user.
     * @return Email of this security.
     */
    public getEmail() : string {
        return this.email;
    }

    /**
     * Gets the hashed password of the user.
     * @return Hashed passowrd of the user.
     */
    public getHashPass() : string {
        return this.hashPass;
    }

    /**
     * Gets the hash of the password
     * the user would like to change to. Empty string if
     * the user is not trying to change their password.
     * @return Hash of the password the user would
     * like to change to.
     */
    public getPassChange() : string {
        return this.passChange;
    }

    /**
     * Gets the salt used to hash the user's
     * passwords.
     * @return Salt used to hash the user's passwords.
     */
    public getSalt() : string {
        return this.salt;
    }
}