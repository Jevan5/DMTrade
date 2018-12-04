import { Thing } from './thing';

export abstract class Consumer<T> {
    private t: T;

    abstract accept(t: T) : void;
    andThen(then: Consumer<T>) : Consumer<T> {
        if(then == null){
            throw 'then must be non-null';
        }
        this.accept(this.t);
        then.accept(this.t);
        return then;
    }
}