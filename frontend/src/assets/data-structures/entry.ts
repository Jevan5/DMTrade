import { Thing } from './thing';

export class Entry<K extends Thing, V extends Thing> implements Thing {
    private key: K;
    private value: V;

    /**
     * @description Constructs an entry for a key value
     * pair.
     * @param k The key.
     * @param v The value.
     */
    constructor(k: K, v: V) {
        this.key = k;
        this.value = v;
    }

    /**
     * @description Creates a copy of this entry in memory.
     * @returns The entry copy.
     */
    public clone() : Entry<K, V> {
        return new Entry(this.key, this.value);
    }

    /**
     * Determines whether the object is equal to this entry.
     * Will return true if the other object is an Entry,
     * and it's key and value are equal to this entry's key
     * and value.
     * @param t Object to compare this entry to.
     */
    public equals(t: Thing) : boolean {
        if (t == null) {
            return false;
        }
        let otherEntry: Entry<K, V>;
        try {
            otherEntry = t as any as Entry<K, V>;
        } catch (e) {
            return false;
        }

        if (otherEntry.getKey() == null) {
            if (this.key !== otherEntry.getKey()) {
                return false;
            }
        } else {
            if (!otherEntry.getKey().equals(this.key)) {
                return false;
            }
        }

        if (otherEntry.getValue() == null) {
            if (this.value !== otherEntry.getValue()) {
                return false;
            }
        } else {
            if (!otherEntry.getValue().equals(this.value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @description Returns the key of this entry.
     * @returns The key.
     */
    public getKey() : K {
        return this.key;
    }

    /**
     * @description Returns the value of this entry.
     * @returns The value.
     */
    public getValue() : V {
        return this.value;
    }

    /**
     * @description Calculates the hash code of this entry.
     * @returns The hash code.
     */
    public hashCode() : number {
        return 31 * ((this.key == null) ? 0 : this.value.hashCode()) + ((this.value == null) ? 0 : this.value.hashCode());
    }
}