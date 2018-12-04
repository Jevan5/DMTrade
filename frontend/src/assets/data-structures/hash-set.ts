import { Thing } from './thing';
import { Collection } from './collection';
import { MySet } from './my-set';
import { MyIterator } from './my-iterator';

export class HashSet<T extends Thing> extends MySet<T> {
    private container: Array<Node<T>>;
    private loadFactor: number;
    private _size: number;

    /**
     * Constructs a hash set from a collection. Uses
     * the hash code of the elements to index into the
     * underlying array container. Collisions are
     * handled with linked-lists at the collision index.
     * @param c Collection to initialize the set with.
     * @param loadFactor Maximum ratio of number of
     * elements to length of underlying array container
     * before resizing the container.
     */
    constructor(c?: Collection<T>, loadFactor?: number) {
        super();
        if (loadFactor == null) {
            loadFactor = 0.7;
        }
        if (loadFactor <= 0) {
            throw 'load factor must be greater than 0.';
        }
        this.container = new Array<Node<T>>(13);
        this.loadFactor = loadFactor;
        this._size = 0;

        if (c) {
            this.addAll(c);
        }
    }

    /**
     * Adds an element to the set if it does not yet
     * exist in the set.
     * @param t Element to add.
     * @returns Whether or not the element was added.
     */
    public add(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null';
        }
        let hash = t.hashCode();
        let node = this.container[hash];
        if (node == null) {
            this.container[hash] = new Node(t);
        } else {
            while (true) {
                if (node.value.equals(t)) {
                    return false;
                }
                if (node.next == null) {
                    if (this._size / this.container.length > this.loadFactor) {
                        this.resize();
                    }
                    node.next = new Node<T>(t);
                    break;
                }
                node = node.next;
            }
        }
        this._size++;
        return true;
    }

    /**
     * @description Creates a copy if this set in memory.
     * @returns The copy of this set.
     */
    public clone() : HashSet<T> {
        return new HashSet<T>(this, this.loadFactor);
    }

    /**
     * @description Determines whether this set contains
     * the element.
     * @param t Element to search for.
     * @returns Whether or not the set contains the
     * element.
     */
    public contains(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null';
        }

        for (let node = this.container[t.hashCode()]; node != null; node = node.next) {
            if (node.value.equals(t)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @description Returns an iterator over the set.
     * The order of elements is not predictable.
     * @returns The iterator of the elements.
     */
    public iterator() : MyIterator<T> {
        return new SetIterator<T>(this, this.container);
    }

    /**
     * Removes an element from the set if it exists.
     * @param t Element to remove.
     * @returns Whether or not the element was removed.
     */
    public remove(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null.';
        }

        let hash = t.hashCode();
        let node = this.container[hash];

        if (node == null) {
            return false;
        }

        if (node.value.equals(t)) {
            this.container[hash] = node.next;
            this._size--;
            return true;
        } else {
            for (let prevNode = node; node != null; prevNode = node, node = node.next) {
                if (node.value.equals(t)) {
                    prevNode.next = node.next;
                    this._size--;
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * @description Resizes the container.
     * @param newCapacity Capacity of the new container.
     * Should be a prime number for best runtime
     * performance.
     */
    private resize(newCapacity?: number) : void {
        if (!newCapacity) {
            // Find the lowest prime number that is at least
            // twice as large as current capacity
            for (var newCapacity = this.container.length * 2 + 1; ; newCapacity += 2) {
                let divides = false;
                for (let divisor = 2; divisor <= Math.sqrt(newCapacity) + 1; divisor++) {
                    if (newCapacity % divisor === 0) {
                        divides = true;
                        break;
                    }
                }
                if (!divides) {
                    break;
                }
            }
        }
        let newContainer = new Array<Node<T>>(Math.round(newCapacity));

        let myIterator = this.iterator();

        while (myIterator.hasNext()) {
            let next = myIterator.next();
            let hash = next.hashCode();

            if (newContainer[hash] == null) {
                newContainer[hash] = new Node<T>(next);
                break;
            }

            let node = newContainer[hash];

            while ((node.next) != null) {
                node = node.next;
            }

            node.next = new Node<T>(node.value);
        }

        this.container = newContainer;
    }

    /**
     * @description The number of elements currently in
     * the set.
     * @returns How many elements are in the set.
     */
    public size() : number {
        return this._size;
    }
}

class Node<T extends Thing> {
    public value: T;
    public next: Node<T>;

    constructor(t: T) {
        this.value = t;
        this.next = null;
    }
}

class SetIterator<T extends Thing> extends MyIterator<T> {
    private set: HashSet<T>;
    private container: Array<Node<T>>;
    private searched: number;
    private lastIndex: number;
    private lastNode: Node<T>;
    private removed: boolean;

    constructor(set: HashSet<T>, container: Array<Node<T>>) {
        super();
        this.set = set;
        this.container = container;
        this.searched = 0;
        this.lastIndex = -1;
        this.lastNode = null;
        this.removed = true;
    }

    /**
     * @description Determines whether there are more
     * elements to iterate over in the set.
     * @returns Whether or not there are more elements
     * to iterate over.
     */
    public hasNext() : boolean {
        if (this.searched === this.set.size()) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @description Finds the next element in the set.
     * @returns The next element in the set.
     */
    public next() : T {
        if (this.searched === this.set.size()) {
            throw 'No elements remaining';
        }
        while (this.lastNode == null || this.lastNode.next == null) {
            this.lastIndex++;
            this.lastNode = this.container[this.lastIndex];
        }
        this.removed = false;
        return this.lastNode.value;
    }

    /**
     * @description Removes the last element iterated over
     * from the set.
     */
    public remove() : void {
        if (this.removed) {
            throw 'No element to remove.';
        }
        this.set.remove(this.lastNode.value);
        this.removed = true;
    }
}