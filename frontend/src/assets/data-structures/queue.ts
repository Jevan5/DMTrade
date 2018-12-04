import { Thing } from './thing';
import { Collection } from '../data-structures/collection';

export interface Queue<T> extends Collection<T> {
    element() : T;
    dequeue() : T;
}