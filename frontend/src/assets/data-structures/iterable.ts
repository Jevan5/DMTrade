import { Thing } from './thing';
import { MyIterator } from './my-iterator';
import { Consumer } from './consumer';

export abstract class Iterable<T> {
    forEach(func: (t: T) => any) : void {
        if (func == null) {
            throw new Error('func = ' + func);
        }
        let myIterator = this.iterator();
        while(myIterator.hasNext()){
            func(myIterator.next());
        }
    }
    abstract iterator() : MyIterator<T>;
}