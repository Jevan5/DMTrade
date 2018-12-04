import { Thing } from './thing';
import { Iterable } from './iterable';
import { Entry } from './entry';
import { MySet } from './my-set';

export abstract class MyMap<K extends Thing, V extends Thing> extends Iterable<K> implements Thing {
    abstract clear() : void;
    abstract clone() : MyMap<K, V>
    abstract containsKey(k: K) : boolean;
    abstract containsValue(v: V) : boolean;
    abstract entrySet() : MySet<Entry<K, V>>;
    equals(t: Thing) : boolean {
        let otherMap;
        try {
            otherMap = t as any as MyMap<K, V>;
        } catch (e) {
            return false;
        }
        let mySet = this.entrySet();
    }
    hashCode() : number {
        return this.entrySet().hashCode();
    }
}