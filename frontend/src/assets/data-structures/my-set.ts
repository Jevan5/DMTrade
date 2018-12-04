import { Thing } from './thing';
import { Collection } from './collection';

export abstract class MySet<T extends Thing> extends Collection<T> implements Thing {

    /**
     * @description Calculates the hash code of the set, summing
     * the hash codes of the individual elements.
     * @returns Hash code of the set.
     */
    hashCode() : number {
        let hash = 0;
        let myIterator = this.iterator();
        while (myIterator.hasNext()) {
            let e = myIterator.next();
            if (e != null) {
                hash += e.hashCode();
            }
        }
        return hash;
    }

    /**
     * @description Determines whether the argument object equals this
     * set.
     * @param set Object to find the equality to this set.
     * @returns Whether or not the passed object equals this set.
     */
    equals(t: Thing) : boolean {
        if (t == null) {
            return false;
        }
        let set: MySet<T>;
        try {
            set = t as any as MySet<T>;
        } catch (e) {
            return false;
        }
        if (this.size() !== set.size()) {
            return false;
        }
        let myIterator = this.iterator();
        while (myIterator.hasNext()) {
            if (!set.contains(myIterator.next())) {
                return false;
            }
        }
        return true;
    }
    abstract clone() : MySet<T>;
}