import { Thing } from './thing';
import { Collection } from './collection';
import { Deque } from './deque';
import { MyIterator } from './my-iterator';

export class ArrayDeque<T> extends Collection<T> implements Deque<T> {
    private container: Array<T>;
    private front: number;          // Index where the element at the head of the deque exists
    private back: number;           // Index where the next element would be added at the tail of the deque

    /**
     * Constructs the deque from a collection of elements.
     * @param c Collection to fill the deque with.
     */
    constructor(c?: Collection<T>) {
        super();
        this.container.length = 16;
        this.container = new Array<T>(this.container.length);
        this.front = Math.round(this.container.length / 2);
        this.back = this.front;
        if (c) {
            this.addAll(c);
        }
    }

    /**
     * @description Adds an element to the back of the deque.
     * Equivalent to addLast.
     * @param t Element to be added.
     * @returns Whether or not the element was added.
     */
    public add(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null';
        }
        this.addLast(t);
        return true;
    }

    /**
     * @description Adds all elements in the collection to the
     * back of the deque.
     * @param c Collection of elements to be added to the deque.
     * @returns Whether or not at least 1 element was added to
     * the deque.
     */
    public addAll(c: Collection<T>) : boolean {
        if (c == null) {
            throw 'c must be non-null';
        }
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
     * @description Adds the element to the front of the deque.
     * @param t Element to be added.
     */
    public addFirst(t: T) : void {
        if (t == null) {
            throw 't must be non-null';
        }
        if (this.size() === this.container.length) {
            this.resize();
        }

        // Wrap the front index if needed
        if (this.front === 0) {
            this.front = this.container.length;
        }
        this.front--;
        this.container[this.front] = t;
    }

    /**
     * Adds an element to the back of the deque.
     * @param t Element to add.
     */
    public addLast(t: T) : void {
        if (t == null) {
            throw 't must be non-null';
        }
        if (this.size() === this.container.length) {
            this.resize();
        }

        this.container[this.back] = t;
        // Wrap the back index if needed
        if (this.back === this.container.length - 1) {
            this.back = 0;
        }
    }

    /**
     * @description Removes all elements from the deque.
     */
    public clear() : void {
        this.front = Math.round(this.container.length / 2);
        this.back = this.front;
    }

    /**
     * @description Creates a clone of this deque in memory.
     * @returns The cloned deque.
     */
    public clone() : ArrayDeque<T> {
        return new ArrayDeque<T>(this);
    }

    /**
     * @description Removes an element from the back of the deque,
     * treating the collection as a queue. Equivalent to removeLast.
     * Throws an error if there are no elements in the deque.
     * @returns The element removed.
     */
    public dequeue() : T {
        if (this.front === this.back) {
            throw 'Cannot dequeue from an empty deque.';
        }
        return this.removeLast();
    }

    /**
     * @description Returns an iterator over the deque in reverse
     * order.
     * @returns An iterator over the deque in reverse order.
     */
    public descendingIterator() : MyIterator<T> {
        let backCursor: number;
        if (this.back === 0) {
            backCursor = this.container.length - 1;
        } else {
            backCursor = this.back - 1;
        }
        return new DescendingDequeIterator<T>(this, this.container, backCursor);
    }

    /**
     * @description Gets the element at the back of the deque.
     * Equivalent to getLast. Throws an error if no elements exist.
     * @returns The element at the end of the deque.
     */
    public element() : T {
        if (this.front === this.back) {
            throw 'Cannot retrieve from an empty deque.';
        }
        return this.getLast();
    }

    /**
     * Determines whether the object passed is an ArrayDeque
     * equal to this deque. Equality is checked by traversing
     * both deques in order, and ensuring that every element
     * is equal.
     * @param t Object to compare to.
     * @returns Whether or not the two objects are equal.
     */
    public equals(t: Thing) : boolean {
        if (t == null) {
            throw 't must be non-null.';
        }
        let deque: ArrayDeque<T>;
        try {
           deque = t as any as ArrayDeque<T>;
        } catch (e) {
            throw 't must be of type ArrayDeque.';
        }

        if (this.size() !== deque.size()) {
            return false;
        }

        let thisIterator = this.iterator();
        let thatIterator = deque.iterator();

        while (thisIterator.hasNext()) {
            if (thisIterator.next() !== thatIterator.next()) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @description Gets the element at the front of the deque.
     * @returns The element at the front of the deque.
     */
    public getFirst() : T {
        if (this.front === this.back) {
            throw 'Cannot retrieve from an empty deque.';
        }
        return this.container[this.front];
    }

    /**
     * @description Gets the element at the back of the deque.
     * @returns The element at the back of the deque.
     */
    public getLast() : T {
        if (this.front === this.back) {
            throw 'Cannot retrieve from an empty deque.';
        }
        let backCursor: number;
        if (this.back === 0) {
            backCursor = this.container.length - 1;
        } else {
            backCursor = this.back - 1;
        }
        return this.container[backCursor];
    }

    /**
     * @description Determines whether the deque has no elements
     * stored in it.
     * @returns Whether the deque has no elements or not.
     */
    public isEmpty() : boolean {
        return this.front === this.back;
    }

    /**
     * @description Returns an iterator over the deque in order.
     * @returns An iterator over the deque in order.
     */
    public iterator() : MyIterator<T> {
        return new DequeIterator<T>(this, this.container, this.front);
    }

    /**
     * @description Removes an element from the front of the deque,
     * treating the collection as a stack. Equivalent to
     * removeFirst. Throws an error if there are no elements in
     * the deque.
     * @returns The element removed.
     */
    public pop() : T {
        if (this.front === this.back) {
            throw 'Cannot pop from an empty deque.';
        }
        return this.removeFirst();
    }

    /**
     * @description Removes the first occurrence of the element in
     * order of the deque.
     * @param t Element to be removed.
     * @returns Whether or not the element was removed.
     */
    public remove(t: T) : boolean {
        if (t == null) {
            throw 't must be non-null';
        }
        // Iterate over the container, from [front, capacity), [0, back)
        for (let i = this.front; i !== this.back; i++) {
            if (i === this.container.length - 1) {
                i = 0;
            }
            if (this.container[i] === t) {
                // Pull all the elements ahead of t backwards 1 spot
                for (let to = i; to !== this.front; to--) {
                    if (to === -1) {
                        to = this.container.length - 1;
                    }
                    let from = to + 1;
                    if (from === this.container.length) {
                        from = 0;
                    }
                    this.container[to] = this.container[from];
                }
                this.front++;
                if (this.front === this.container.length) {
                    this.front = 0;
                }
                return true;
            }
        }
        
        return false;
    }

    /**
     * @description Removes an element from the front of the deque.
     * Throws an error if there are no elements in the deque.
     * @returns The element removed.
     */
    public removeFirst() : T {
        if (this.front === this.back) {
            throw 'Cannot remove the first element from an empty deque.';
        }
        let t = this.container[this.front];
        this.front++;
        if (this.front === this.container.length) {
            this.front = 0;
        }
        return t;
    }

    /**
     * @description Removes an element from the back of the deque.
     * Throws an error if there are no elements in the deque.
     * @returns The element removed.
     */
    public removeLast() : T {
        if (this.front === this.back) {
            throw 'Cannot remove the last element from an empty deque';
        }
        let t: T;
        if (this.back === 0) {
            t = this.container[this.container.length - 1];
            this.back = this.container.length - 1;
        } else {
            t = this.container[this.back - 1];
            this.back--;
        }
        return t;
    }

    /**
     * @description Resizes the deque, needed when the length
     * equals the capacity and can no longer hold any additional
     * elements.
     * @param capacity New capacity to resize to.
     */
    private resize(capacity?: number) : void {
        // Double the current capacity by default
        if (!capacity) {
            capacity = this.container.length * 2;
        }
        // Will not be able to fit all elements using the new capacity
        if (this.size() > capacity) {
            throw 'capacity must be greater or equal to length';
        }
        // New container to store the elements in
        let newContainer: Array<T> = new Array<T>(capacity);
        // The index where the front of the new container is
        let newFront = Math.round(capacity / 2);
        // The index where the back of the new container is
        let newBack = Math.round(capacity / 2);

        // Iterate over the elements in the deque, and add them to
        // the new container
        let myIterator = this.iterator();
        while (myIterator.hasNext()) {
            // The new back has went over the edge of the new container,
            // must reset it at the 0th index of the container
            if (newBack >= capacity) {
                newBack = 0;
            }
            newContainer[newBack] = myIterator.next();
            newBack++;
        }

        this.front = newFront;
        this.back = newBack;

        this.container = newContainer;
    }

    /**
     * @description Finds the number of elements in the deque.
     * @returns The number of elements in the deque.
     */
    public size() : number {
        if (this.front < this.back) {
            return this.back - this.front;
        } else {
            return this.container.length - this.front + this.back;
        }
    }

    public static factoryArray<T>(a: Array<T>) : ArrayDeque<T> {
        if (a == null) {
            throw new Error('a = ' + a);
        }

        var arrayDeque = new ArrayDeque<T>();
        a.forEach((e) => {
            arrayDeque.add(e);
        });

        return arrayDeque;
    }
}

class DequeIterator<T> extends MyIterator<T> {
    private deque: ArrayDeque<T>;
    private container: Array<T>;
    private cursor: number;
    private crossed: number;
    private lastElement: T;

    /**
     * Contructs an iterator for an ArrayDeque. If the
     * underlying container is modified after the iterator
     * has been created, the behaviour is unpredictable.
     * @param d Array deque to iterate over.
     * @param container Underlying container of the deque.
     * @param front Index of the first element.
     */
    constructor(d: ArrayDeque<T>, container: Array<T>, front: number) {
        super();
        this.deque = d;
        this.container = container;
        this.cursor = front;
        this.crossed = 0;
        this.lastElement = null;
    }

    /**
     * @description Determines whether the iterator has any
     * more elements remaining.
     * @returns Whether or not the iterator has any more elements
     * remaining.
     */
    public hasNext() : boolean {
        return this.crossed !== this.deque.size();
    }

    /**
     * @description Finds the next element in order in the deque.
     * Throws an error if no elements remain.
     * @returns The next element in order in the deque.
     */
    public next() : T {
        if (this.crossed === this.deque.size()) {
            throw 'No remaining elements';
        }
        if (this.cursor === this.deque.size()) {
            this.cursor = 0;
        }
        let t = this.container[this.cursor];
        this.cursor++;
        this.crossed++;
        this.lastElement = t;
        return t;
    }

    /**
     * @description Removes the last element that was iterated over
     * from the underlying deque. Throws error if no successful call
     * to next() was made since the last remove.
     */
    public remove() : void {
        if (this.lastElement === null) {
            throw 'No element to remove.';
        }
        this.deque.remove(this.lastElement);
        this.lastElement = null;
    }
}

class DescendingDequeIterator<T> extends MyIterator<T> {
    private deque: ArrayDeque<T>;
    private container: Array<T>;
    private cursor: number;
    private crossed: number;
    private lastElement: T;

    /**
     * @description Constructs an iterator in reverse order over the deque.
     * If the underlying container is modified after the iterator has been
     * created, the behaviour is unpredictable.
     * @param d: Array deque to iterate over.
     * @param container Underlying container of the deque.
     * @param end Index of the last element.
     */
    constructor(d: ArrayDeque<T>, container: Array<T>, end: number) {
        super();
        this.deque = d;
        this.container = container;
        this.cursor = end;
        this.crossed = 0;
        this.lastElement = null;
    }

    /**
     * @description Determines whether the iterator has any
     * more elements remaining.
     * @returns Whether or not the iterator has any more elements
     * remaining.
     */
    public hasNext() : boolean {
        return this.crossed !== this.deque.size();
    }

    /**
     * @description Finds the next element in reverse order in the deque.
     * Throws an error if no elements remain.
     * @returns The next element in order in the deque.
     */
    public next() : T {
        if (this.crossed === this.deque.size()) {
            throw 'No remaining elements';
        }
        if (this.cursor === - 1) {
            this.cursor = this.container.length - 1;
        }
        let t = this.container[this.cursor];
        this.cursor--;
        this.crossed++;
        this.lastElement = t;
        return t;
    }

    /**
     * @description Removes the last element that was iterated over from
     * the underlying deque. Throws an error if no successful call to
     * next() was made since the last remove.
     */
    public remove() : void {
        if (this.lastElement === null) {
            throw 'No element to remove.';
        }
        this.deque.remove(this.lastElement);
        this.lastElement = null;
    }
}