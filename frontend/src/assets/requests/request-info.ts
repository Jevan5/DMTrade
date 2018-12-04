import { RequestResponse } from './request-response';

export class RequestInfo {
    public searchSeqNum: number;
    public self;
    public callback: (r: RequestResponse) => any;
  
    constructor(searchSeqNum: number, self: Object, callback: (r: RequestResponse) => any){
      this.searchSeqNum = searchSeqNum;
      this.self = self;
      this.callback = callback;
    }
  
    public respond(data) : void {
      this.callback(new RequestResponse(this, data));
    }
  }