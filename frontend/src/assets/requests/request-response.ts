import { RequestInfo } from './request-info';

export class RequestResponse {
    public requestInfo: RequestInfo;
    public response;
  
    constructor(requestInfo: RequestInfo, response: any){
        this.requestInfo = requestInfo;
        this.response = response;
    }
}