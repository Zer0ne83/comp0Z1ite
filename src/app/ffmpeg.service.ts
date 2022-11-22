import { AppPaths, HomeSnipWordPeak, HomeScrapeDLType, HomeThumbObject, HomeEditorCrop, HomeEditorDelete, HomeThumbObjectTime } from './appTypes';
import {Injectable} from '@angular/core';
import ffprobe,{FFProbeResult,FFProbeStream} from 'ffprobe';
import {execSync} from 'child_process';
const _= require('lodash');
import {createFFmpeg,fetchFile} from '@ffmpeg/ffmpeg';
import getInfo from 'ffprobe';
import { access, stat, readFile, writeFile, mkdir, readdir, rename, unlink } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
///////////////////////////////////////////////////////////////
@Injectable({ providedIn: 'root' })
///////////////////////////////////////////////////////////////
export class FFMPEGService {
///////////////////////////////////////////////////////////////
  pathsObj:AppPaths|null=null;
  binPaths:any|null=null;
  mpegExePath:string|null=null;
  probeExePath:string|null=null;
  playExePath:string|null;
  ytdlExePath:string|null;
///////////////////////////////////////////////////////////////
  cC(msg:any){if(msg===null||msg===undefined){return};const cCP:string='[ffServ] - ';if(typeof msg==='string'){console.log(cCP+msg)}else{if(Array.isArray(msg)){console.log(cCP+'Array Start...');console.log(msg);console.log(cCP+'...Array End.')}else{console.log(cCP+'Object Start...');console.log(msg);console.log(cCP+'...Object End.')}}};
  setPaths(paths:AppPaths):Promise<boolean>{if(paths){this.pathsObj=paths;this.binPaths=paths.binary;for(const[k,v]of Object.entries(this.pathsObj.binary)){const gVK:string=String(k).replace('ff','')+'ExePath';if(v){this[gVK]=v}};return Promise.resolve(true)}};
  async statSize(path:string):Promise<any>{try{const sRes:any=await stat(path);return Promise.resolve({r:true,d:sRes.size})}catch(e){console.log(e);return Promise.resolve({r:false,d:0})}};
  async exists(path:string):Promise<boolean>{try{await access(path);return true}catch{return false}};
  async mkDir(path:string):Promise<boolean>{try{await mkdir(path,{recursive:true});return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}};
  removeDir(p:string):Promise<boolean>{if(fs.existsSync(p)){let rfs:any=fs.readdirSync(p);if(rfs.length>0){rfs.forEach((fn:any)=>{if(fs.statSync(p+'/'+fn).isDirectory()){this.removeDir(p+'/'+fn)}else{fs.unlinkSync(p+'/'+fn)}});fs.rmdirSync(p)}else{fs.rmdirSync(p)};return Promise.resolve(true)}else{return Promise.resolve(false)}}
  /* secs2HMS(d:number):string{let h:number=Math.floor(d/3600),m:number=Math.floor(d%3600/60),s:number=Math.floor(d%3600%60),hD:string=String(h>0?(h<10?'0'+h:h):'00'),mD:string=String(m>0?(m<10?'0'+m:m):'00'),sD:string=String(s>0?(s<10?'0'+s:s):'00');return String(hD+':'+mD+':'+sD)} */
  secs2HMS(d:number):string{let h:number=Math.floor(d/3600),m:number=Math.floor(d%3600/60),s:number=d%3600%60,hD:string=String(h>0?(h<10?'0'+h:h):'00'),mD:string=String(m>0?(m<10?'0'+m:m):'00'),sD:string=String(s>0?(s<10?'0'+(s).toFixed(2):(s).toFixed(2)):'00');return String(hD+':'+mD+':'+sD)}
///////////////////////////////////////////////////////////////
  async getProbe(filePath:string):Promise<FFProbeStream|null>{this.cC('(getProbe)...');
    if(this.probeExePath){
      try{
        const ffPRes:FFProbeResult=await ffprobe(filePath,{path:this.probeExePath});
        console.log(ffPRes);
        if(ffPRes&&ffPRes.hasOwnProperty('streams')&&ffPRes.streams&&ffPRes.streams.length>0){return Promise.resolve(ffPRes.streams[0])}
        else{this.cC('ERROR: Probe Result NULL or streams.length === 0');return Promise.resolve(null)}}
      catch(e){this.cC('ERROR: '+e);return Promise.resolve(null)}
    }else{this.cC('ERROR: probeExePath===null');return Promise.resolve(null)}
  }
///////////////////////////////////////////////////////////////
  async getMediaDur(path:string):Promise<number>{
    try{const gIRes:FFProbeResult=await getInfo(path,{path:this.probeExePath});
    if(gIRes&&gIRes.streams.length>0&&gIRes.streams[0]&&gIRes.streams[0].duration&&Number(gIRes.streams[0].duration)>0){return Promise.resolve(Number(gIRes.streams[0].duration))}else{return Promise.resolve(0)}}catch(e){this.cC('(getMediaDur) ERROR: '+JSON.stringify(e));return Promise.resolve(0)};
  }
///////////////////////////////////////////////////////////////
  async cropVideo(editFPath:string,start:number,end:number,prevUndo:HomeEditorCrop|null):Promise<HomeEditorCrop|false>{
    const sTS:string=this.secs2HMS(start),eTS:string=this.secs2HMS(end);
    this.cC('cropVideo('+editFPath+','+sTS+','+eTS+')...');
    let cropSourceFPath:string='';
    if(prevUndo){
      if((await this.exists(prevUndo.path))){await unlink(prevUndo.path)};
      if(!(await this.exists(prevUndo.path))){await rename(editFPath,prevUndo.path)};
      cropSourceFPath=prevUndo.path;
    }else{cropSourceFPath=editFPath};
    const editsDir:string=path.dirname(editFPath),cropFName:string=path.basename(cropSourceFPath,'.mp4')+'-crop.mp4',cropFPath:string=path.join(editsDir,cropFName);
    if((await this.exists(cropFPath))){await unlink(cropFPath)};
    try{
      execSync(this.mpegExePath+' -i '+cropSourceFPath+' -loglevel 8 -hide_banner -ss '+sTS+' -t '+eTS+' -async -1 -y '+cropFPath,{windowsHide:true});
      if((await this.exists(cropFPath))&&(await this.statSize(cropFPath)).r){
        let newCrop:HomeEditorCrop={path:cropFPath,name:cropFName,cname:cropFName.replace('.mp4',''),dur:0};
        newCrop.dur=await this.getMediaDur(cropFPath);
        return Promise.resolve(newCrop);
      }else{console.log('ERROR: Crop File !==Exist||Size=0');return Promise.resolve(false)}
    }catch(e){console.log('ERROR: '+e);return Promise.resolve(false)}
  }
///////////////////////////////////////////////////////////////
async delSegment(editFPath:string,start:number,end:number,prevUndo:HomeEditorCrop|null):Promise<HomeEditorDelete|false>{
  const fullDur:number=await this.getMediaDur(editFPath);
  const sTS:string=this.secs2HMS(start),eTS:string=this.secs2HMS(end),ttlTS:string=this.secs2HMS(fullDur);
  this.cC('delSegment('+editFPath+','+sTS+','+eTS+')...');
  //-------------------
  let delSourceFPath:string='';
  if(prevUndo){
    if((await this.exists(prevUndo.path))){await unlink(prevUndo.path)};
    if(!(await this.exists(prevUndo.path))){await rename(editFPath,prevUndo.path)};
    delSourceFPath=prevUndo.path;
  }else{delSourceFPath=editFPath};
  const editsDir:string=path.dirname(editFPath);
  const delChunk1FName:string=path.basename(delSourceFPath,'.mp4')+'-deleteC1.mp4';
  const delC1FPath:string=path.join(editsDir,delChunk1FName);
  if((await this.exists(delC1FPath))){await unlink(delC1FPath)};
  const delChunk2FName:string=path.basename(delSourceFPath,'.mp4')+'-deleteC2.mp4';
  const delC2FPath:string=path.join(editsDir,delChunk2FName);
  if((await this.exists(delC2FPath))){await unlink(delC2FPath)};
  const delChunk3FName:string=path.basename(delSourceFPath,'.mp4')+'-delete.mp4';
  const delC3FPath:string=path.join(editsDir,delChunk3FName);
  if((await this.exists(delC3FPath))){await unlink(delC3FPath)};
  //-------------------
  const makeChunk=(sourceFPath:string,startEndChunk:string):Promise<boolean>=>{
    let chunkSTime:string='',chunkETime:string='',chunkSavePath:string;
    if(startEndChunk==='start'){chunkSTime='00:00:00.00';chunkETime=sTS;chunkSavePath=delC1FPath}else{chunkSTime=eTS;chunkETime=ttlTS;chunkSavePath=delC2FPath};
    console.log(startEndChunk+': '+chunkSTime+' -> '+chunkETime);
    try{
      execSync(this.mpegExePath+' -i '+sourceFPath+' -loglevel 8 -hide_banner -ss '+chunkSTime+' -t '+chunkETime+' -async -1 -y '+chunkSavePath,{windowsHide:true});
      return Promise.resolve(true)
    }catch(e){console.log('ERROR: '+e);return Promise.resolve(false)};
  };
  const mkStartChunk:boolean=await makeChunk(delSourceFPath,'start');
  if(mkStartChunk){this.cC('(delSegment) Created Chunk 1 - OK: '+delC1FPath)}else{this.cC('(delSegment) ERROR Creating Chunk 1 - Aborted');return Promise.resolve(false)};
  const mkEndChunk:boolean=await makeChunk(delSourceFPath,'end');
  if(mkEndChunk){this.cC('(delSegment) Created Chunk 2 - OK: '+delC2FPath)}else{this.cC('(delSegment) ERROR Creating Chunk 2 - Aborted');return Promise.resolve(false)};
  const delSegsFPath:string=path.join(editsDir,'delSegs.txt');
  const delSegsFData:string=`file '`+delC1FPath+`'\nfile '`+delC2FPath+`'`;
  if((await this.exists(delSegsFPath))){await unlink(delSegsFPath)};
  if(!(await this.exists(delSegsFPath))){await writeFile(delSegsFPath,delSegsFData,{encoding:'utf-8'})};
  //--------------------
  try{
    execSync(this.mpegExePath+' -loglevel 8 -hide_banner -safe 0 -f concat -i '+delSegsFPath+' -c copy -y '+delC3FPath,{windowsHide:true});
    if((await this.exists(delC3FPath))&&(await this.statSize(delC3FPath)).r){
      let newDel:HomeEditorDelete={path:delC3FPath,name:delChunk3FName,cname:delChunk3FName.replace('.mp4',''),dur:0};
      newDel.dur=await this.getMediaDur(delC3FPath);
      return Promise.resolve(newDel);
    }else{console.log('ERROR: Del File !==Exist||Size=0');return Promise.resolve(false)};
  }catch(e){console.log('ERROR: '+e);return Promise.resolve(false)}
}
///////////////////////////////////////////////////////////////
  async trimAudio(fPath:string):Promise<{orig:{path:string,size:number,dur:number},trim:{path:string,size:number,dur:number}}|false>{
    this.cC('trimAudio('+fPath+')...');
    const origExist:boolean=await this.exists(fPath),origSize:number=(await this.statSize(fPath)).d,origDur:number=await this.getMediaDur(fPath);
    let trimRes:any={orig:{path:fPath,size:origSize,dur:origDur},trim:{path:'',size:0,dur:0}};
    if(origExist&&origSize>0&&origDur>0){
      const baseFNameExt:string=path.basename(fPath),baseFName:string=path.basename(fPath,'.mp3'),baseFPath:string=fPath.replace(baseFNameExt,'');
      trimRes.trim.path=path.join(baseFPath,baseFName+'-trimd.mp3');
      return new Promise((resolve)=>{
        const ffmProc:any=cp.spawn(this.mpegExePath,['-i',fPath,'-af','silenceremove=start_periods=1:start_duration=0:start_threshold=-50dB:detection=peak,aformat=dblp,areverse,silenceremove=start_periods=1:start_duration=0:start_threshold=-50dB:detection=peak,aformat=dblp,areverse',trimRes.trim.path],{windowsHide:true});
        ffmProc.on('close',async(code:number)=>{
          if(code===0){
            if((await this.exists(trimRes.trim.path))){
              const trimSize:any=await this.statSize(trimRes.trim.path);
              if(trimSize.r&&trimSize.d>0){
                trimRes.trim.size=trimSize.d;
                const trimDur:number=await this.getMediaDur(trimRes.trim.path);
                if(trimDur>0){
                  trimRes.trim.dur=trimDur;
                  const redSize:number=trimRes.orig.size-trimRes.trim.size,redDur:number=trimRes.orig.dur-trimRes.trim.dur;
                  this.cC('(trimAudio) SUCCESS - Reduced by '+String(redSize)+'bytes | '+String(redDur)+'s');
                  resolve(trimRes);
                }else{this.cC('(trimAudio) ERROR: Trimmed MP3 Dur=0s');resolve(false)};
              }else{this.cC('(trimAudio) ERROR: Trimmed MP3 Size=0 bytes');resolve(false)};
            }else{this.cC('(trimAudio) ERROR: Trimmed MP3 Path!=Exist - '+trimRes.trim.path);resolve(false)}
          }else{this.cC('(trimAudio) ERROR|Code: '+code);resolve(false)};
        });
      });
    }else{this.cC('(trimAudio) ERROR: Original MP3 Path!=Exist|Size=0|Dur=0 - '+path);return Promise.resolve(false)};
  }
///////////////////////////////////////////////////////////////
  async plotAudioWave(filePath:string,audioDir:string,dims:any):Promise<string|false>{
    this.cC('plotAudioWave('+filePath+','+audioDir+',{w:'+dims.w+',h:'+dims.h+'})...');
    const imgId:string=path.basename(filePath,'.mp3');
    const waveImgPath:string=path.join(audioDir,imgId+'-'+String(dims.w)+'x'+String(dims.h)+'wave.png');
    const wDims:string=dims.w+'x'+dims.h;
    try{
      execSync(this.mpegExePath+' -i '+filePath+' -loglevel 8 -hide_banner -filter_complex "compand,showwavespic=s='+wDims+':colors=#2585D1" -frames:v 1 -y '+waveImgPath,{windowsHide:true});
      return Promise.resolve(waveImgPath);
    }catch(e){console.log('ERROR: '+e);return Promise.resolve(false)}
  }
///////////////////////////////////////////////////////////////
  async getMediaInfo(path:string):Promise<FFProbeStream|false>{
    try{const gIRes:any=await getInfo(path,{path:this.probeExePath});
      if(gIRes&&gIRes.hasOwnProperty('streams')&&gIRes.streams&&gIRes.streams.length>0){return Promise.resolve(gIRes.streams[0])}
      else{return Promise.resolve(false)};
    }catch(e){return Promise.resolve(false)};
  };
///////////////////////////////////////////////////////////////
  async getWordPeaks(path:string):Promise<{peaks:HomeSnipWordPeak[],info:any}|false>{
    this.cC('getWordPeaks('+path+')...');
    const log_10=(arg:any)=>{return Math.log(arg)/Math.LN10},coefficient_to_db=(coeff:any)=>{return 20.0*log_10(coeff)},log_meter=(power:any,lower_db:any,upper_db:any,non_linearity:any)=>{if(power<lower_db){return 0}else{return Math.pow((power-lower_db)/(upper_db-lower_db),non_linearity)}},alt_log_meter=(power:any)=>{return log_meter(power,-192.0,0.0,8.0)};
    const stdDev=(avg:number,data:any[]):number=>{const stdRes:number=Math.sqrt(_.sum(_.map(data,(n:number)=>Math.pow((n-avg),2)))/data.length);return stdRes};
    //------------------------------
    let gotData:boolean=false,oddByte:any=null,samples:any[]=[],channel:number=0,info:any,peaks:any[]=[],peakData:any;
    const infD:FFProbeStream|false=await this.getMediaInfo(path);
    if(infD){info={durSecs:Number(infD.duration),startSecs:Number(infD.start_time),channels:Number(infD.channels),sampleRate:infD.sample_rate,bitRate:infD.bit_rate,fileType:infD.codec_name}}else{info=null};
    //------------------------------
    const processData=()=>{let numOfSample:number=(((info.durSecs-info.startSecs)*info.sampleRate)*info.channels),currMax:number=0,partialMax:number=0,sampleIdx:number=0;
      const samplesPerPeak=Math.ceil(samples.length/numOfSample);
      for(let idx=0;idx<samples.length;idx++){let value=Math.abs(samples[idx]);sampleIdx++;if(value>partialMax){partialMax=value};if(sampleIdx>=samplesPerPeak){currMax=alt_log_meter(coefficient_to_db(partialMax));peaks.push(currMax);sampleIdx=0;partialMax=0}};
      while(peaks.length<numOfSample){peaks.push(peaks[0])};
      peakData=peaks;
      const i2S=(i:number):number=>{return Number(((i/peakData.length)*info.durSecs).toFixed(2))};
      const wMin:number=_.min(peakData),wAvg:number=_.mean(peakData),wStd:number=stdDev(wAvg,peakData);
      let ttlP:number=peakData.length,vFlr:number=wMin+wStd,prevP:any={v:vFlr,s:0,p:0},h:HomeSnipWordPeak[]=[];
      for(let i=0;i<peakData.length;i++){const pO:any={v:peakData[i],s:(i2S(i)),p:(i/ttlP)};if(pO.v>vFlr&&pO.v>prevP.v&&pO.s>(prevP.s+0.25)){h.push(pO);prevP=pO}};
      return Promise.resolve(h);
    };
    //------------------------------
    const waveDataChild=cp.spawn(this.mpegExePath,['-i',path,'-loglevel','8','-hide_banner','-f','s16le', '-acodec','pcm_s16le','-y','pipe:1']);
    waveDataChild.stdout.on('data',(data)=>{if(!gotData){gotData=true};let value:any,i:number=0,dataLen:number=data.length;if(oddByte!==null){value=((data.readInt8(i++,true)<8)||oddByte)/32767.0;samples.push(value);channel=++channel%2};for(;i<dataLen;i+=2){value=data.readInt16LE(i,true)/32767.0;samples.push(value);channel=++channel%2};oddByte=(i<dataLen)?data.readUInt8(i,true):null});
    return new Promise((resolve)=>{
      waveDataChild.stdout.on('end',async()=>{
        if(gotData){const peaksRes:HomeSnipWordPeak[]=await processData();
          if(peaksRes&&peaksRes.length>0&&info!==null){resolve({peaks:peaksRes,info:info})}else{resolve(false)};
        }else{resolve(false)};
      });
    });
  }
///////////////////////////////////////////////////////////////
  async cvtMP42MP3(mp4Path:string):Promise<HomeScrapeDLType|false>{
    this.cC('cvtMP42MP3('+mp4Path+')...');
    const mp3Path:string=mp4Path.replace('.mp4','.mp3');
    try{
      let resObj:HomeScrapeDLType={ext:'.mp3',path:mp3Path,size:0,err:false};
      execSync(this.mpegExePath+' -i '+mp4Path+' -loglevel 8 -hide_banner -y '+mp3Path,{windowsHide:true});
      if((await this.exists(mp3Path))){
        const mp3Size:any=await this.statSize(mp3Path);
        if(mp3Size.r&&mp3Size.d>0){resObj.size=mp3Size.d;return Promise.resolve(resObj)}
        else{return Promise.resolve(false)};
      }else{return Promise.resolve(false)};
    }catch(e){console.log('ERROR: '+e);return Promise.resolve(false)}
  }
///////////////////////////////////////////////////////////////
  async getEditThumbs(editFilePath:string,thumbWrapW:number,thumbWrapH:number,vidDur:number):Promise<HomeThumbObject[]|false>{
    this.cC('getThumbStrip('+editFilePath+')...');
    let thumbsDirName:string='';
    const bFileCName:string=path.basename(editFilePath);
    if(bFileCName.includes('-crop.mp4')){thumbsDirName=path.basename(editFilePath,'.mp4').replace('-crop','')+'-thumbs'}else{thumbsDirName=path.basename(editFilePath,'.mp4')+'-thumbs'};
    const editsDirPath:string=path.dirname(editFilePath),thisThumbsDirPath:string=path.join(editsDirPath,thumbsDirName);
    if((await this.exists(thisThumbsDirPath))){await this.removeDir(thisThumbsDirPath)};
    if(!(await this.exists(thisThumbsDirPath))){await this.mkDir(thisThumbsDirPath)};
    const noOfThumbs:number=Math.ceil(thumbWrapW/75);
    const thumbsPS:number=noOfThumbs/vidDur;
    const timePT:number=vidDur/noOfThumbs;
    try{
      const thumbFilesPath:string=path.join(thisThumbsDirPath,'thumb%d.png');
      execSync(this.mpegExePath+' -i '+editFilePath+' -loglevel 8 -hide_banner -filter:v scale="-1:42",fps="'+thumbsPS+'" -y '+thumbFilesPath,{windowsHide:true});
      let thumbsArr:HomeThumbObject[]=[];
      let startT:number=0,endT:number=timePT;
      const pngList:string[]=await readdir(thisThumbsDirPath);
      if(pngList&&pngList.length>0){
        for(let png=0;png<pngList.length;png++){
          if(path.extname(pngList[png])==='.png'){
            const ttPath:string=path.join(thisThumbsDirPath,pngList[png]);
            const ttTime:HomeThumbObjectTime={s:startT,e:endT};
            const ttObj:HomeThumbObject={time:ttTime,path:ttPath};
            thumbsArr.push(ttObj);
            startT+=timePT;
            endT+=timePT;
          };
        };
        return Promise.resolve(thumbsArr);
      }else{this.cC('(getEditThumbs) ERROR: readDir.length===0 ('+thisThumbsDirPath+')');return Promise.resolve(false)}
    }catch(e){console.log('ERROR: '+e);return Promise.resolve(false)}
  }
///////////////////////////////////////////////////////////////
}
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
