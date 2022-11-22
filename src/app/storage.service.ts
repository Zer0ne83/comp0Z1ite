import Store from 'electron-store';
import { NGXLogger } from 'ngx-logger';
import { Injectable } from '@angular/core';
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
@Injectable({providedIn:'root'})
////////////////////////////////////////////////////////////////
export class StorageService {
  storeIsReady:boolean=false;
  store:Store|null=null;
////////////////////////////////////////////////////////////////
  constructor(public logger:NGXLogger){
    if(!this.store||!this.storeIsReady){this.store=new Store()};
  }
////////////////////////////////////////////////////////////////
  isJSON(data:any):boolean {
    if(typeof data!=='string')return false;
    try{
      const result=JSON.parse(data);
      const type=Object.prototype.toString.call(result);
      return type==='[object Object]'||type==='[object Array]'
    }catch(err){return false}
  }
////////////////////////////////////////////////////////////////
  set(setKey:string,setVal:any):Promise<boolean>{
    try{this.store.set(setKey,setVal);this.logger.info('[storeServ|set] Item ('+setKey+') Set - \u2714\uFE0F OK');return Promise.resolve(true)}
    catch(e){this.logger.info('[storeServ|set] Item ('+setKey+') Set - \u2757 ERROR');return Promise.resolve(false)}
  }
////////////////////////////////////////////////////////////////
  async get(getKey:string):Promise<any>{
    try{
      const getRes:any=await this.store.get(getKey);
      if(getRes){
        this.logger.info('[storeServ|get] Item ('+getKey+') Get - \u2714\uFE0F FOUND');return Promise.resolve({r:true,d:getRes})}
      else{this.logger.info('[storeServ|get] Item ('+getKey+') Get - \u2757NOT FOUND');return Promise.resolve({r:false})}
    }catch(e){this.logger.info('[storeServ|get] Item ('+getKey+') Set - \u2757 ERROR');return Promise.resolve({r:false})}
  }
////////////////////////////////////////////////////////////////
  delete(delKey:string):Promise<boolean>{
    try{this.store.delete(delKey);this.logger.info('[storeServ|delete] Item ('+delKey+') Deleted - \u2714\uFE0F OK');return Promise.resolve(true)}
    catch(e){this.logger.info('[storeServ|delete] Item ('+delKey+') Delete - \u2757 ERROR');return Promise.resolve(false)}
  }
////////////////////////////////////////////////////////////////
  has(hasKey:string):Promise<boolean>{
    try{
      if(this.store.has(hasKey)){this.logger.info('[storeServ|has] Key '+hasKey+' - \u2714\uFE0F FOUND');return Promise.resolve(true)}
      else{this.logger.info('[storeServ|has] Key '+hasKey+' - \u2757NOT FOUND');return Promise.resolve(false)};
    }catch(e){this.logger.info('[storeServ|has] ('+hasKey+') Has - \u2757 ERROR');return Promise.resolve(false)}
  }
////////////////////////////////////////////////////////////////
  clear():Promise<boolean> {
    try{this.store.clear();this.logger.info('[storeServ|set] Cleared Store - \u2714\uFE0F OK');return Promise.resolve(true)}
    catch(e){this.logger.info('[storeServ|clear] Clear Store - \u2757 ERROR');return Promise.resolve(false)}
  }
////////////////////////////////////////////////////////////////
  storeInfo():Promise<any> {
    try{
      const storeRes:any={size:this.store.size,path:this.store.path,data:this.store.store};this.logger.info('[storeServ|storeInfo] Store Info - \u2714\uFE0F OK');return Promise.resolve(storeRes)}
    catch(e){this.logger.info('[storeServ|storeInfo] Store Info - \u2757 ERROR');return Promise.resolve(null)}
  }
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
}
