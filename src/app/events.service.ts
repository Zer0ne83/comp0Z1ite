import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import {getUnixTime,format,fromUnixTime,intervalToDuration,formatDuration,isBefore,isAfter,getTime,addMinutes,isSameDay,isSameMinute,subDays, isYesterday, isTomorrow, subMonths, isSameYear, subMinutes, addSeconds,subSeconds,addDays,getDay,getYear,parse,isSameSecond, addHours} from 'date-fns';
import isValidFilename from 'valid-filename';
const _ = require('lodash');
///////////////////////////////////////////////////////////////
@Injectable({ providedIn: 'root' })
///////////////////////////////////////////////////////////////
export class EventsService {
///////////////////////////////////////////////////////////////
  channels:{[key:string]:Subject<any>}={};
///////////////////////////////////////////////////////////////
  subscribe(topic:string,observer:(_:any)=>void):Subscription{if(!this.channels[topic]){this.channels[topic]=new Subject<any>()};return this.channels[topic].subscribe(observer)}
///////////////////////////////////////////////////////////////
  publish(topic:string,data:any):void{const subject=this.channels[topic];if(!subject){return};subject.next(data)}
///////////////////////////////////////////////////////////////
  check(topic:string):Promise<boolean>{const subject=this.channels[topic];if(!subject){return Promise.resolve(false)}else{return Promise.resolve(true)}}
///////////////////////////////////////////////////////////////
  destroy(topic:string):null{const subject=this.channels[topic];if(!subject){return};subject.complete();delete this.channels[topic]}
// DATE-FNS ///////////////////////////////////////////////////
  strFormat(d:Date,s:string):string{return format(d,s)};
  nowNice():string{return format(new Date(),'dd/MM/yyyy hh:mmaaa')};
  gUT(d:any):number{return getUnixTime(new Date(d))};
  dUT(uts:any):Date{return fromUnixTime(Number(uts))};
  durToNow(d:Date):string{const dO:Duration=intervalToDuration({start:new Date(),end:d});return formatDuration(dO,{delimiter:', ',format:['hours','minutes']})};
  runTime(d:Date):string{const dO:Duration=intervalToDuration({start:new Date(),end:d});return formatDuration(dO,{delimiter:', ',format:['minutes','seconds']})};
  longDurToNow(d:Date):string{const dO:Duration=intervalToDuration({start:new Date(),end:d});return formatDuration(dO,{delimiter:', ',format:['days','hours','minutes']})};
  ttlTime(sT:Date):string{const stMS:number=getTime(sT);const eTMS:number=getTime(new Date());return '(⏲️ '+((eTMS-stMS)/1000).toFixed(1)+'s)'};
  isSD(d1:Date,d2:Date):boolean{return isSameDay(d1,d2)};
  isYD(d:Date):boolean{return isYesterday(d)};
  isB(d1:Date,d2:Date){return isBefore(d1,d2)};
  isA(d1:Date,d2:Date){return isAfter(d1,d2)};
  addMins(d:Date,m:number){return addMinutes(d,m)};
  subMins(d:Date,m:number){return subMinutes(d,m)};
  addSecs(d:Date,s:number){return addSeconds(d,s)};
  addHrs(d:Date,h:number){return addHours(d,h)};
  subSecs(d:Date,s:number){return subSeconds(d,s)};
  addDs(d:Date,ds:number){return addDays(d,ds)};
  subDs(d:Date,ds:number){return subDays(d,ds)};
  isSM(d1:Date,d2:Date){return isSameMinute(d1,d2)};
  gD(d:Date):number{return getDay(d)};
  gY(d:Date):number{return getYear(d)};
  parseStr(Dstr:string,strF:string):Date{return parse(Dstr,strF,new Date())};
  isTM(d:Date):boolean{return isTomorrow(d)};
  isSY(d1:Date,d2:Date):boolean{return isSameYear(d1,d2)};
  isSS(d1:Date,d2:Date):boolean{return isSameSecond(d1,d2)};
  ttMS(d1:Date,d2:Date):number{const startUT:number=d1.getTime(),endUT:number=d2.getTime(),msDur:number=endUT-startUT;return msDur};
//////////////////////////////////////////////////
  isDiff(newObject:any,oldObject:any):any{function changes(object:any,base:any){return _.transform(object,function(result:any,value:any,key:any){if(!_.isEqual(value,base[key])){result[key]=(_.isObject(value)&&_.isObject(base[key]))?changes(value,base[key]):value}})};const diffRes:object=changes(newObject,oldObject);if(_.isEmpty(diffRes)){return {r:false}}else{return {r:true,d:diffRes}}};
//////////////////////////////////////////////////
  isVFN(fname:string):boolean{const isV:boolean=isValidFilename(fname);return isV}
//////////////////////////////////////////////////
}
