import { Thing } from './thing';
import { MyIterator } from './my-iterator';
import { Iterable } from './iterable';

export abstract class Collection<T> extends Iterable<T> {
    abstract add(t: T) : boolean;

    /**
     * @description Adds the elements from one collection
     * to this collection.
     * @param c Collection to add to this collection.
     * @returns Whether or not any elements were added
     * to this collection.
     */
    public addAll(c: Collection<T>) : boolean {
        let added = false;
        let myIterator = c.iterator();
        while (myIterator.hasNext()) {
            if (this.add(myIterator.next())) {
                added = true;
            }
        }
        return added;
    }

    /**
     * @description Removes all elements from this
     * collection.
     */
    public clear() : void {
        let myIterator = this.iterator();
        while (myIterator.hasNext()) {
            myIterator.next();
            myIterator.remove();
        }
    }

    /**
     * Determines whether this collection contains an
     * element.
     * @param t Element to search for.
     * @returns Whether or not this collection contains
     * the element.
     */
    public contains(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null.';
        }
        let myIterator = this.iterator();
        while (myIterator.hasNext()) {
            if (myIterator.next() === t) {
                return true;
            }
        }
        return false;
    }

    /**
     * Determines whether this collection contains all
     * the elements in the passed collection or not.
     * @param c Collection of elements to look for.
     * @returns True if all the elements in the collection
     * are in this collection.
     */
    public containsAll(c: Collection<T>) : boolean {
        let myIterator = c.iterator();
        while (myIterator.hasNext()) {
            if (!this.contains(myIterator.next())) {
                return false;
            }
        }
        return true;
    }
    
    abstract clone() : Collection<T>;

    /**
     * @description Determines whether this collection
     * contains no elements or not.
     * @returns Whether or not this collection contains
     * no elements.
     */
    public isEmpty() : boolean {
        return this.size() === 0;
    }
    abstract iterator() : MyIterator<T>;
    public remove(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null.';
        }
        let myIterator = this.iterator();
        while (myIterator.hasNext()) {
            if (myIterator.next() === t) {
                myIterator.remove();
                return true;
            }
        }
        return false;
    }
    public removeAll(c: Collection<T>) : boolean {
        if (c == null) {
            throw 'c must be non-null.';
        }
        let removed = false;
        let myIterator = c.iterator();
        while (myIterator.hasNext()) {
            if (this.remove(myIterator.next())) {
                removed = true;
            }
        }
        return removed;
    }
    abstract size() : number;

}