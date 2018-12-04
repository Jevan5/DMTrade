import { Thing } from './thing';
import { Queue } from './queue';
import { MyIterator } from './my-iterator';

export interface Deque<T> extends Queue<T> {
    addFirst(t: T) : void;
    addLast(t: T) : void;
    descendingIterator() : MyIterator<T>;
    getFirst() : T;
    getLast() : T;
    removeFirst() : T;
    removeLast() : T;
}