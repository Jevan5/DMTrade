import { Consumer } from './consumer';
import { Thing } from './thing';

export abstract class MyIterator<T> {
    forEachRemaining(action: Consumer<T>) : void {
        if(action == null){
            throw 'action must be non-null';
        }
        while(this.hasNext()){
            action.accept(this.next());
        }
    }
    abstract hasNext() : boolean;
    abstract next() : T;
    remove() : void {
        throw 'remove not supported';
    }
}