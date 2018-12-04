export interface Thing {
    hashCode() : number;
    toString() : string;
    equals(t: Thing) : boolean;
    clone() : Thing;
}