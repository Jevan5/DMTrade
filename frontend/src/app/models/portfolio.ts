import { Trade } from './trade';
import { CompanyHistory } from '../services/market/market.service';
import { ArrayDeque } from '../../assets/data-structures/array-deque';

/**
 * Modal for the Portfolio object.
 * 
 * @author Joshua Evans
 */
export class Portfolio {
    private _id: string
    private account: string;
    private bidSymbols: Array<{
        symbol: string,
        bids: Array<Trade>
    }>;
    private askSymbols: Array<{
        symbol: string,
        asks: Array<Trade>
    }>;
    private name: string;

    /**
     * Creates a portfolio.
     * 
     * @param portfolioJson JSON representation of the portfolio
     * from the API.
     */
    constructor(portfolioJson) {
        if (portfolioJson == null || !portfolioJson.hasOwnProperty('_id') || typeof(portfolioJson._id) !== 'string' ||
            portfolioJson._id === '' || !portfolioJson.hasOwnProperty('account') || typeof(portfolioJson.account) !== 'string' ||
            portfolioJson.account === '' || !portfolioJson.hasOwnProperty('bidSymbols') ||
            portfolioJson.bidSymbols.constructor !== Array || !portfolioJson.hasOwnProperty('askSymbols') ||
            portfolioJson.askSymbols.constructor !== Array || !portfolioJson.hasOwnProperty('name') ||
            typeof(portfolioJson.name) !== 'string' || portfolioJson.name === ''){
            throw 'portfolioJson = ' + portfolioJson;
        }
        this._id = portfolioJson._id;
        this.account = portfolioJson.account;
        this.name = portfolioJson.name;

        this.bidSymbols = new Array<{symbol: string, bids: Array<Trade>}>();
        portfolioJson.bidSymbols.forEach((entry) => {
            if (!entry.hasOwnProperty('symbol') || typeof(entry.symbol) !== 'string' ||
                entry.symbol == '' || !entry.hasOwnProperty('bids') ||
                entry.bids.constructor !== Array) {
                throw 'entry = ' + entry;
            }

            let bids = new Array<Trade>();
            entry.bids.forEach((bid) => {
                bids.push(new Trade(bid));
            });
            this.bidSymbols.push({
                symbol: entry.symbol,
                bids: bids
            });
        });

        this.askSymbols = new Array<{symbol: string, asks: Array<Trade>}>();
        portfolioJson.askSymbols.forEach((entry) => {
            if (!entry.hasOwnProperty('symbol') || typeof(entry.symbol) !== 'string' ||
                entry.symbol == '' || !entry.hasOwnProperty('asks') ||
                entry.asks.constructor !== Array) {
                throw 'entry = ' + entry;
            }

            let asks = new Array<Trade>();
            entry.asks.forEach((ask) => {
                asks.push(new Trade(ask));
            });
            this.askSymbols.push({
                symbol: entry.symbol,
                asks: asks
            });
        })
    }

    /**
     * Gets this portfolio's ID.
     * @return Portfolio's ID.
     */
    public get_id() : string {
        return this._id;
    }

    /**
     * Gets the ID of the account that owns
     * this portfolio.
     * @return ID of the account.
     */
    public getAccount() : string {
        return this.account;
    }

    /**
     * Gets the symbols bid for by this portfolio and
     * the bids placed for each.
     * @return Symbols bid for and the bids placed for each.
     */
    public getBidSymbols() : Array<{symbol: string, bids: Array<Trade>}> {
        return this.bidSymbols;
    }

    /**
     * Gets the symbols asked for by this portfolio and
     * the asks placed for each.
     * @return Symbols asked for and the asks placed for each.
     */
    public getAskSymbols() : Array<{symbol: string, asks: Array<Trade>}> {
        return this.askSymbols;
    }

    /**
     * Gets the name of the portfolio.
     * @return Name of the portfolio.
     */
    public getName() : string {
        return this.name;
    }

    /**
     * Finds the number of shares owned by the portfolio
     * of each of the shares.
     * @param symbols Symbols to find how many shares
     * the portfolio currently owns of. If null,
     * finds shares for all symbols.
     * @return Mapping from symbol to the number of shares the
     * portfolio currently owns of it.
     */
    public getSharesOwned(symbols?: Set<string>) : Map<string, number> {
        if (symbols == null) {
            symbols = this.getSymbolsOwned();
        }

        var map = new Map<string, number>();

        // Start by assuming portfolio owns none of every symbol searched for
        symbols.forEach((symbol) => {
            map.set(symbol, 0);
        });

        // Count how many shares have been purchased
        this.bidSymbols.forEach((bidSymbol) => {
            if (symbols.has(bidSymbol.symbol)) {
                let shares = 0;
                bidSymbol.bids.forEach((trade) => {
                    shares += trade.getQuantity();
                });
                map.set(bidSymbol.symbol, shares);
            }
        });

        // Count how many shares have been sold
        this.askSymbols.forEach((askSymbol,) => {
            let shares = map.get(askSymbol.symbol);
            askSymbol.asks.forEach((trade) => {
                shares -= trade.getQuantity();
            });
            map.set(askSymbol.symbol, shares);
        });
        return map;
    }

    /**
     * Gets an array of trades made in this portfolio, sorted from oldest
     * to newest.
     * 
     * @return Array of trades, with the action specifying if it's a
     * 'bid' or an 'ask'
     */
    public getTrades() : Array<{action: string, trade: Trade}> {
        let trades = new Array<{action: string, trade: Trade}>();

        // Add all bids to the list of trades
        this.bidSymbols.forEach((bidSymbol) => {
            bidSymbol.bids.forEach((bid) => {
                trades.push({
                    action: 'bid',
                    trade: bid
                });
            });
        });

        // Add all asks to the list of trades
        this.askSymbols.forEach((askSymbol) => {
            askSymbol.asks.forEach((ask) => {
                trades.push({
                    action: 'ask',
                    trade: ask
                });
            });
        });
        // Sort the trades from oldest -> newest
        trades.sort((a, b) : number => {
            if (a.trade.getTimeStamp().valueOf() < b.trade.getTimeStamp().valueOf()) {
                return -1;
            } else if (a.trade.getTimeStamp().valueOf() > b.trade.getTimeStamp().valueOf()) {
                return 1;
            } else {
                return 0;
            }
        });

        return trades;
    }

    /**
     * Gets all symbols that the portfolio currently owns.
     * 
     * @return Set of all symbols currently owned.
     */
    public getSymbolsOwned() : Set<string> {
        let symbols = new Set<string>();

        let symbolShares = new Map<string, number>();

        // Count the shares purchased for each symbol
        this.bidSymbols.forEach((bidSymbol) => {
            let shares = 0;
            bidSymbol.bids.forEach((bid) => {
                shares += bid.getQuantity();
            });
            symbolShares.set(bidSymbol.symbol, shares);
        });

        // Remove the shares sold for each symbol
        this.askSymbols.forEach((askSymbol) => {
            let shares = symbolShares.get(askSymbol.symbol);
            askSymbol.asks.forEach((ask) => {
                shares -= ask.getQuantity();
            });
            symbolShares.set(askSymbol.symbol, shares);
        });

        // If the shares remaining for a symbol is greater than
        // 0, the portfolio owns that symbol
        symbolShares.forEach((shares, symbol) => {
            if (shares > 0) {
                symbols.add(symbol);
            }
        });

        return symbols;
    }

    /**
     * Determines how many shares are owned of the symbol
     * in each of the portfolios.
     * 
     * @param symbol Symbol to find shares owned of.
     * @param portfolios Portfolios to determine how many
     * shares are owned of the symbol.
     * @return Mapping from portfolio to how many shares are
     * owned of the symbol in the portfolio.
     */
    public static getSharesOwnedByPortfolios(symbol: string, portfolios: Set<Portfolio>) : Map<Portfolio, number> {
        if (symbol == null || portfolios == null) {
            throw 'symbol = ' + symbol + ", portfolios = " + portfolios;
        }
      
        symbol = symbol.toUpperCase();
        var portfoliosAndShares = new Map<Portfolio, number>();
        let symbolSet = new Set<string>([symbol]);
      
        // For each portfolio, find how many shares it owns of symbol
        portfolios.forEach((portfolio) => {
            let sharesOwnedByPortfolio = portfolio.getSharesOwned(symbolSet);
            portfoliosAndShares.set(portfolio, sharesOwnedByPortfolio.get(symbol));
        });
      
        return portfoliosAndShares;
    }
}

/**
 * Describes the value of a portfolio, in two ways:
 * owned shares at their bid price, and owned shares
 * at their current price.
 * 
 * @author Joshua Evans
 */
export class PortfolioValue {
    private portfolio: Portfolio;
	private atBid: {              // Values of shares owned by portfolio, at their purchased price
	    sumOfValues: number,
		values: Map<string, number> // Mapping from symbol -> value of shares owned of that symbol at their bid price
	};

	private atMoment: {           // Values of shares owned by portfolio, at their current price
		sumOfValues: number,
		values: Map<string, number> // Mapping from symbol -> value of shares owned of that symbol at current prices
    };

    /**
     * Initializes this PortfolioValue by seeing how much un-sold
     * bids were purchased for, and how much they are currently
     * worth in real-time.
     * 
     * @param portfolio Portfolio to calculate the
     * PortfolioValue of.
     * @param value Mapping from symbol ->
     * the current value of a share of that symbol.
     */
	constructor(portfolio: Portfolio, values: Map<string, number>){
        if (portfolio == null || values == null) {
            throw 'portfolio = ' + portfolio + ', values = ' + values;
        }

        this.portfolio = portfolio;

        this.atBid = {
            sumOfValues: 0,
            values: new Map<string, number>()
        };

        let remainingMap = new Map<string, number>();

        // Set each entry in remainingMap to be a symbol with
        // the number of shares sold of it (negative number)
        portfolio.getAskSymbols().forEach((askSymbol) => {
            let shares = 0;
            askSymbol.asks.forEach((ask) => {
                shares -= ask.getQuantity();
            });
            remainingMap.set(askSymbol.symbol, shares);
        });

        // Set each entry in the remainingMap to be a symbol
        // with the number of shares sold of it (negative number)
        // + the number of shares purchased of it (positive number).
        // Result is a positive number of remaining shares. While
        // iterating, when the shares for a symbol becomes
        // non-negative, start counting the value of the
        // remaining shares, at their bid prices
        portfolio.getBidSymbols().forEach((bidSymbol) => {
            let value;
            let shares;
            if (!remainingMap.has(bidSymbol.symbol)) {
                shares = 0;
            } else {
                shares = remainingMap.get(bidSymbol.symbol);
            }
            bidSymbol.bids.forEach((bid) => {
                if (shares >= 0) { // Already accounted for all asks
                    value += bid.getQuantity() * bid.getPrice();
                } else if (shares + bid.getQuantity() >= 0) { // This will finish accounting for all asks
                    value = (bid.getQuantity() + shares) * bid.getPrice();
                }
                shares += bid.getQuantity();
            });
            remainingMap.set(bidSymbol.symbol, shares);
            this.atBid.values.set(bidSymbol.symbol, value);
        });

        this.atMoment = {
            sumOfValues: 0,
            values: new Map<string, number>()
        };

        // Find the value of the portfolio at the moment by
        // multiplying the number of remaining shares for each
        // symbol by the price of a single share of the symbol
        remainingMap.forEach((shares, symbol) => {
            if (shares === 0) {
                remainingMap.delete(symbol);
                return;
            }
            this.atMoment.values.set(symbol, shares * values.get(symbol));
        });

        // Round everything to 2 decimal places
        this.atBid.values.forEach((value, symbol) => {
            // Don't include values of 0
            if (value === 0) {
                this.atBid.values.delete(symbol);
            } else {
                this.atBid.values.set(symbol, Math.round(value * 100) / 100);
                this.atBid.sumOfValues += this.atBid.values.get(symbol);
            }
        });

        this.atMoment.values.forEach((value, symbol) => {
            if (value === 0) {
                this.atMoment.values.delete(symbol);
            } else {
                this.atMoment.values.set(symbol, Math.round(value * 100) / 100);
                this.atMoment.sumOfValues += this.atMoment.values.get(symbol);
            }
        });
    }

    /**
     * Gets the portfolio that this portfolio revenue
     * represents.
     * 
     * @return The portfolio.
     */
    public getPortfolio() : Portfolio {
        return this.portfolio;
    }

    /**
     * Gets the value of the portfolio, valuing bids at
     * the prices they were purchased at.
     * 
     * @return The sum of the values of all owned shares
     * at their bid price, and a mapping from symbol ->
     * the value of all shares owned of the symbol at
     * their bid price.
     */
    public getAtBid() : { sumOfValues: number, values: Map<string, number> } {
        return this.atBid;
    }

    /**
     * Gets the value of the portfolio, valuing bids at
     * their current price.
     * 
     * @return The sum of the values of all owned shares
     * at their current price, and a mapping from symbol ->
     * the value of all shares owned of the symbol at
     * their current price.
     */
    public getAtMoment() : {sumOfValues: number, values: Map<string, number> } {
        return this.atMoment;
    }
}

/**
 * Describes the revenue of a portfolio, in two ways:
 * purchased and re-sold shares, and purchased and re-sold
 * shares as well as the change in price of currently owned
 * shares since purchase.
 * 
 * @author Joshua Evans
 */
export class PortfolioRevenue {
    private portfolio: Portfolio;
    private atAsk: {
        sumOfRevenues: number,
        revenues: Map<string, number>
    };
    private atMoment: {
        sumOfRevenues: number,
        revenues: Map<string, number>
    };

    /**
     * Initializes this PortfolioRevenue by seeing how much bids
     * were purchased and re-sold for, and how un-sold bids have
     * changed in price since their purchase.
     * 
     * @param portfolio Portfolio to calculate the revenue of.
     * @param values Mapping from symbol -> current price of the symbol.
     */
    constructor(portfolio: Portfolio, values: Map<string, number>) {
        if (portfolio == null || values == null) {
            throw 'portfolio = ' + portfolio + ', values = ' + values;
        }

        this.portfolio = portfolio;

        this.atAsk = {
            sumOfRevenues: 0,
            revenues: new Map<string, number>()
        };
        this.atMoment = {
            sumOfRevenues: 0,
            revenues: new Map<string, number>()
        };

        // How many shares of each symbol remain
        let remainingMap = new Map<string, number>();

        this.portfolio.getAskSymbols().forEach((askSymbol) => {
            // Revenue earned by selling shares. Increasing by selling
            let revenue = 0;
            // Shares remaining for this symbol. Decreasing by counting how many were sold
            let shares = 0;

            askSymbol.asks.forEach((ask) => {
                shares -= ask.getQuantity();
                revenue += ask.getQuantity() * ask.getPrice();
            });

            remainingMap.set(askSymbol.symbol, shares);
            this.atAsk.revenues.set(askSymbol.symbol, revenue);
            this.atMoment.revenues.set(askSymbol.symbol, revenue);
        });

        this.portfolio.getBidSymbols().forEach((bidSymbol) => {
            // Revenue earned by buying shares. Decreases by purchasing
            let revenue;
            // Shares remaining for this symbol. Increasing by counting how many were purchased
            let shares;
            // The total value of the shares that have not been sold. Increasing by counting
            let bidValue;

            if (!remainingMap.has(bidSymbol.symbol)) {
                shares = 0;
                revenue = 0;
            } else {
                shares = remainingMap.get(bidSymbol.symbol);
                revenue = this.atAsk.revenues.get(bidSymbol.symbol);
            }

            bidSymbol.bids.forEach((bid) => {
                if (shares >= 0) { // Accounted for all sold shares already
                    bidValue += bid.getQuantity() * bid.getPrice();
                } else if (shares + bid.getQuantity() >= 0) { // About to finish accounting for all sold shares
                    bidValue = (bid.getQuantity() + shares) * bid.getPrice();
                    revenue -= (-shares) * bid.getPrice();
                } else {
                    revenue -= bid.getQuantity() * bid.getPrice();
                }
                shares += bid.getQuantity();
            });
            remainingMap.set(bidSymbol.symbol, shares);

            if (revenue != 0) { // If no revenue was earned, don't add it to the map
                this.atAsk.revenues.set(bidSymbol.symbol, revenue);
            }

            let revenueWithUnearned = revenue;
            if (remainingMap.get(bidSymbol.symbol) > 0) {
                revenueWithUnearned += remainingMap.get(bidSymbol.symbol) * values.get(bidSymbol.symbol) - bidValue;
            }

            if (revenueWithUnearned != 0) {
                this.atMoment.revenues.set(bidSymbol.symbol, revenueWithUnearned);
            }
        });

        // Round all numbers to 2 decimal places
        this.atAsk.revenues.forEach((revenue, symbol) => {
            if (revenue === 0) {
                this.atAsk.revenues.delete(symbol);
            } else {
                this.atAsk.revenues.set(symbol, Math.round(revenue * 100) / 100);
                this.atAsk.sumOfRevenues += this.atAsk.revenues.get(symbol);
            }
        });

        this.atMoment.revenues.forEach((revenue, symbol) => {
            if (revenue === 0) {
                this.atMoment.revenues.delete(symbol);
            } else {
                this.atMoment.revenues.set(symbol, Math.round(revenue * 100) / 100);
                this.atMoment.sumOfRevenues = this.atMoment.revenues.get(symbol);
            }
        });
    }

    /**
     * Gets the portfolio that this portfolio revenue
     * represents.
     * 
     * @return The portfolio.
     */
    public getPortfolio() : Portfolio {
        return this.portfolio;
    }

    /**
     * Gets the revenue earned.
     * 
     * @return The sum of revenues earned, and a mapping of symbols
     * to revenue earned by purchasing and re-selling their shares.
     */
    public getAtAsk() : { sumOfRevenues: number, revenues: Map<string, number> } {
        return this.atAsk;
    }

    /**
     * Gets the revenue earned and unearned.
     * 
     * @return The sum of revenues earned and unearned, and a mapping
     * of symbols to revenue earned and unearned by purchasing and re-selling
     * their shares, and the change in value of purchased shares since
     * bidding for them.
     */
    public getAtMoment() : { sumOfRevenues: number, revenues: Map<string, number> } {
        return this.atMoment;
    }
}

export class PortfolioValueHistory {
    private portfolio: Portfolio;
    private snapshots: Array<{time: Date, atBid: number, atMoment: number}>;

    /**
     * Constructs historical portfolio value data for a portfolio.
     * 
     * @param portfolio Portfolio to find the historical portfolio value of.
     * @param histories Mapping from symbol -> deque of historical market data
     * for the company, in order from oldest -> newest
     * @param daysInterval How many days in between each snapshot.
     */
    constructor(portfolio: Portfolio, histories: Map<string, ArrayDeque<CompanyHistory>>, daysInterval: number) {
        if (portfolio == null) {
            throw 'portfolio = ' + portfolio;
        } else if (history == null) {
            throw 'history = ' + history;
        } else if (daysInterval == null) {
            throw 'daysInterval = ' + daysInterval;
        } else if (isNaN(daysInterval)) {
            throw 'daysInterval = ' + daysInterval;
        } else if (Number.isInteger(daysInterval)) {
            throw 'daysInterval must be an integer';
        } else if (daysInterval <= 0) {
            throw 'daysInterval must be positive';
        }

        this.portfolio = portfolio;
        this.snapshots = new Array<{time: Date, atBid: number, atMoment: number}>();

        let trades = ArrayDeque.factoryArray(this.portfolio.getTrades());   // Deque of trades

        // No trades have occurred, history will be empty.
        if (trades.isEmpty()) {
            return;
        }

        // Mapping from symbol -> Queue of shares (price and quantity) that have been placed
        // at a point in time, from oldest to newest, and have not yet been sold back
        let remainingBids = new Map<string, ArrayDeque<{price: number, quantity: number}>>();

        // When the last snapshot will be of (right now)
        let end = new Date();

        // When the first snapshot will be of (counting backwards in time from end,
        // every 'daysInterval' days, until we pass when the first trade was made)
        let start = end;
        while (start.valueOf() > trades[0].trade.getTimeStamp().valueOf()) {
            start.setDate(start.getDate() - daysInterval);
        }
        
        // Iterate from when, or just before, the first trade was made, to now
        for (let current = start; current.valueOf() <= end.valueOf(); current.setDate(current.getDate() + daysInterval)) {
            // While there are more trades to look through, and the current trade happened before the current time
            while (!trades.isEmpty() && trades.getFirst().trade.getTimeStamp().valueOf() <= current.valueOf()) {
                let next = trades.removeFirst();
                let action = next.action;
                let trade = next.trade;
                let symbol = trade.getSymbol();

                if (!remainingBids.has(symbol)) { // Symbol has not been seen yet
                    remainingBids.set(symbol, new ArrayDeque<{price: number, quantity: number}>());
                }

                let quantity = trade.getQuantity();

                if (action === 'bid') { // Bid placed, increase the remaining shares and add to list of outstanding bids
                    remainingBids.get(symbol).add({
                        price: trade.getPrice(),
                        quantity: trade.getQuantity()
                    });
                } else { // Ask placed, decrease the remaining shares and remove from the list of outstanding bids
                    let remaining = trade.getQuantity();
                    while (true) {
                        if (remaining < remainingBids.get(symbol).getFirst().quantity) { // Satisfied by next bid, and the bid will have remaining shares
                            remainingBids.get(symbol).getFirst().quantity -= remaining;
                            break;
                        } else if (remaining > remainingBids.get(symbol).getFirst().quantity) { // Not satisfied by next bid
                            remaining -= remainingBids.get(symbol).removeFirst().quantity;
                        } else { // Satisfied by the next bid, bid will have no remaining shares
                            remainingBids.get(symbol).removeFirst();
                            break;
                        }
                    }
                }
            }
        }
    }
}