export class Trade {
    private price: number;
    private quantity: number;
    private symbol: string;
    private timeStamp: Date;

    /**
     * Creates a trade.
     * 
     * @param tradeJson JSON representation of the trade from
     * the API.
     */
    constructor(tradeJson) {
        if (tradeJson == null) {
            console.log(tradeJson);
            throw 'tradeJson is null';
        } else if (!tradeJson.hasOwnProperty('price')) {
            console.log(tradeJson);
            throw "tradeJson doesn't have 'price'";
        } else if (typeof(tradeJson.price) != 'number') {
            console.log(tradeJson);
            throw "tradeJson.price is not a 'number'";
        } else if (isNaN(tradeJson.price)) {
            console.log(tradeJson);
            throw "tradeJson.price is NaN";
        } else if (tradeJson.price <= 0) {
            console.log(tradeJson);
            throw "tradeJson.price <= 0";
        } else if (!tradeJson.hasOwnProperty('quantity')) {
            console.log(tradeJson);
            throw "tradeJson doesn't have 'quantity'";
        } else if (typeof(tradeJson.quantity) != 'number') {
            console.log(tradeJson);
            throw "tradeJson.quantity is not a 'number'";
        } else if (!Number.isInteger(tradeJson.quantity)) {
            console.log(tradeJson);
            throw 'tradeJson.quantity must be an integer';
        } else if (tradeJson.quantity <= 0) {
            console.log(tradeJson);
            throw 'tradeJson.quantity <= 0';
        } else if (!tradeJson.hasOwnProperty('symbol')) {
            console.log(tradeJson);
            throw "tradeJson doesn't have 'symbol'";
        } else if (typeof(tradeJson.symbol) != 'string') {
            console.log(tradeJson);
            throw "tradeJson.symbol is not a 'string'";
        } else if (tradeJson.symbol === '') {
            console.log(tradeJson);
            throw "tradeJson.symbol must be non-empty string";
        } else if (!tradeJson.hasOwnProperty('timeStamp')) {
            console.log(tradeJson);
            throw "tradeJson doesn't have 'timeStamp'";
        } else if(isNaN(Date.parse(tradeJson.timeStamp))) {
            console.log(tradeJson);
            throw "tradeJson.timeStamp is not a 'Date'";
        }

        this.price = tradeJson.price;
        this.quantity = tradeJson.quantity;
        this.symbol = tradeJson.symbol;
        this.timeStamp = tradeJson.timeStamp;
    }

    /**
     * Gets the price that each share was traded for
     * in this trade.
     * @return Price of each share in the trade.
     */
    public getPrice() : number {
        return this.price;
    }

    /**
     * Gets the quantity of shares that were traded for
     * in this trade.
     * @return The quantity of shares traded.
     */
    public getQuantity() : number {
        return this.quantity;
    }

    /**
     * Gets the symbol of the shares traded.
     * @return The symbol of the shares traded.
     */
    public getSymbol() : string {
        return this.symbol;
    }

    /**
     * Gets the time that the trade occurred.
     * @return Time that the trade occurred.
     */
    public getTimeStamp() : Date {
        return this.timeStamp;
    }
}