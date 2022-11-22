import { AppPaths, HowlProgressObj, HomePPLItem } from './appTypes';
import { Injectable } from '@angular/core';
import { EventsService } from './events.service';
import { ipcRenderer } from 'electron';
import { Howl, Howler } from 'howler';
import * as path from 'path';
const _=require('lodash');
import {spawn} from 'child_process';
import {access,stat,readFile,writeFile,mkdir,readdir,rename,unlink} from 'fs/promises';
import { FFMPEGService } from './ffmpeg.service';
import baseFF from 'ffmpeg';
import {app} from 'electron';
///////////////////////////////////////////////////////////////
@Injectable({providedIn:'root'})
///////////////////////////////////////////////////////////////
export class HowlerService {
///////////////////////////////////////////////////////////////
  compzAppPaths:AppPaths|null=null;
  pathsObj:AppPaths|null=null;
  binPaths:any|null=null;
  mpegExePath:string|null=null;
  probeExePath:string|null=null;
  playExePath:string|null;
  ytdlExePath:string|null;
  hwlGOptsSet:boolean=false;
//-------------------------------------------------------------
  hwlPL:any[]=[];
  hwlFileObj:any|null=null;
  hwlHowl:Howl|null=null;
  hwlFileId:number|null=null;
  hwlLoaded:boolean=false;
  hwlPlaying:boolean=false;
  hwlPaused:boolean=false;
  hwlSegment:number;
//-------------------------------------------------------------
  eleIdArr:string[]=['vizcanvas','vizlogo','waveformwrap','waveimgdiv','wavedatawrap','wavedatacanvas','wavegridwrap','wavegridcanvas'];
  eleGVarArr:string[]=['vCanvas','vLogo','wfWrap','wfImgDiv','wfDataWrap','wfCanvas','gridWrap','gridCanvas'];
//-------------------------------------------------------------
  vizInitDone:boolean=false;
  vizModel:string='bars';
  audioCTX:AudioContext|null=null;
  audioSRC:MediaElementAudioSourceNode|null=null;
  vizAnalyser:AnalyserNode|null=null;
  vizBufferLength:number;
  vizDataArray:Uint8Array;
  vCanvas:HTMLCanvasElement;
  vLogo:HTMLDivElement;
  vLogoRad:number=0;
  vizCLogo:HTMLImageElement;
  vContext:CanvasRenderingContext2D;
  vFrame:boolean=false;
  vFrameId:any;
  cWrapDs:DOMRect;
  vCanvasW:number;
  vCanvasH:number;
//-------------------------------------------------------------
  wavePngPath:string|null=null;
  wfWrap:HTMLDivElement;
  wfImgDiv:HTMLDivElement;
  wfDataWrap:HTMLDivElement;
  wfCanvas:HTMLCanvasElement;
  wfPeakData:any[]=[];
  wfContext:CanvasRenderingContext2D;
  wfProgX:number=0;
//-------------------------------------------------------------
  gridWrap:HTMLDivElement;
  gridCanvas:HTMLCanvasElement;
  gridContext:CanvasRenderingContext2D;
  gridProgColNo:number=0;
//-------------------------------------------------------------
  vPlyr:HTMLVideoElement;
  vFile:HomePPLItem;
//-------------------------------------------------------------
  pHwlProg:HowlProgressObj;
  pFrame:boolean=false;
  pFrameId:any;
//-------------------------------------------------------------
  gMute:boolean=false;
  gLoop:boolean=false;
  gVolume:number=0.5;
  gRate:number=1;
//-------------------------------------------------------------
  prevAudioHwl:Howl|null=null;
//-------------------------------------------------------------
  constructor(
    private evServ:EventsService,
    private ffServ:FFMPEGService
  ){this.pInitProg();}
///////////////////////////////////////////////////////////////
  cC(msg:any){if(msg===null||msg===undefined){return;};const cCP:string='[howlServ] - ';if(typeof msg==='string'){console.log(cCP+msg);}else{if(Array.isArray(msg)){console.log(cCP+'Array Start...');console.log(msg);console.log(cCP+'...Array End.');}else{console.log(cCP+'Object Start...');console.log(msg);console.log(cCP+'...Object End.');}}}
//-------------------------------------------------------------
  exists=async(path:string):Promise<boolean>=>{try{await access(path);return true}catch{return false}};
  pGetCurrentDur():number{return this.hwlHowl.seek();}
  pGetMaxDur():number{return this.hwlHowl.duration();}
  bgCanvas(){this.vContext.fillStyle='#0F0F0F';this.vContext.fillRect(0,0,this.vCanvasW,this.vCanvasH);}
  clrCanvas(){this.vContext.clearRect(0,0,this.vCanvasW,this.vCanvasH)}
  cvtH2WPad(w:number):number{return Math.round((w/9)*16)}
//-------------------------------------------------------------
  pGetHwlObj():HowlProgressObj{
    const progNo:number=this.pGetCurrentDur(),durNo:number=this.pGetMaxDur(),percNo=progNo/durNo,durStr:string=durNo.toFixed(2),percStr=String(Math.round(percNo*100))+'%',pDs:number=progNo.toFixed(2).split('.')[0].length,dDs:number=durStr.split('.')[0].length;
    let progStr:string=progNo.toFixed(2);
    if(pDs!==dDs){progStr='0'.repeat(dDs-pDs)+progStr;};
    return {prog:{n:progNo,s:progStr},dur:{n:durNo,s:durStr},perc:{n:percNo,s:percStr}};
  }
//-------------------------------------------------------------
  capd(s:string):string{return s.charAt(0).toUpperCase()+s.slice(1);}
//-------------------------------------------------------------
  hwErrEvent(type:'load'|'play',data:any,soundId:number,error:MediaError):Promise<boolean>{
    const eTitle:string=this.capd(type)+' Media Error';
    let eMsg:string='Error '+type+'ing '+data.bdir+' file: ../'+this.capd(data.bdir)+'/'+path.basename(data.path);
    soundId&&typeof soundId==='number'?eMsg+=' ('+String(soundId)+')\n':eMsg+='\n';
    const eErrObj:any={1:'Fetch process aborted agent at the user\'s request.',2:'Fetch process failed due to network error',3:'Failed to decode media resource',4:'Unsuported media source attribute'};
    if(error&&typeof error==='number'&&error>0){eMsg+=eErrObj[error];}
    else{error&&error.hasOwnProperty('code')&&error.code&&typeof error.code==='number'?eMsg+=eErrObj[error.code]:eMsg+='Unknown Error';};
    ipcRenderer.invoke('doErr',[eTitle,eMsg]);
    return Promise.resolve(true);
  }
//-------------------------------------------------------------
  async hwlSetPaths(paths:AppPaths):Promise<boolean>{
    this.cC('hwlSetPaths(paths:AppPaths)...');
    if(paths){
      this.pathsObj=paths;
      this.binPaths=paths.binary;
      for(const[k,v]of Object.entries(this.pathsObj.binary)){
        const gVK:string=String(k).replace('ff','')+'ExePath';
        if(v){this[gVK]=v};
      };
      return Promise.resolve(true);
    };
  }
///////////////////////////////////////////////////////////////
  pInitProg(){this.pHwlProg={prog:{n:0,s:''},dur:{n:0,s:''},perc:{n:0,s:''}};};
//-------------------------------------------------------------
  pStopProg(){
    this.pFrame=false;this.cC('(pStopProg) STOPPED.');
    if(this.hwlHowl&&this.hwlPlaying&&this.hwlPaused){return}
    else{this.renderGrid('init');this.renderWaveData('init')};
  }
//-------------------------------------------------------------
  pStartProg(){if(!this.pFrame){this.pFrame=true;};this.pStepProg();this.cC('(pStartProg) STARTED...');}
//-------------------------------------------------------------
  pStepProg(){
    if(!this.pFrame){
      window.cancelAnimationFrame(this.pFrameId);
    }else{
      if(this.hwlHowl.playing()&&!this.hwlPaused){
        const checkHwlObj:HowlProgressObj=this.pGetHwlObj();
        if(!_.isEqual(this.pHwlProg,checkHwlObj)){
          this.pHwlProg=checkHwlObj;
          this.animProgress(checkHwlObj.perc.n);
          this.evServ.publish('hwlProgress',this.pHwlProg);
        }
      };
      this.pFrameId=window.requestAnimationFrame(()=>this.pStepProg());
    };
  }
///////////////////////////////////////////////////////////////
  vizToggle(model:string):Promise<boolean>{
    this.vizModel=model;
    this.cC('(vizToggle) Loaded '+this.capd(model)+' vizModel - OK');
    if(model==='none'){if(this.vFrame){this.vizAnimStop()}}
    else{if(!this.vFrame&&this.hwlPlaying&&!this.hwlPaused){this.vizAnimStart()}};
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////////////this.hwlHowl['_sounds'][0]['_node']
  vizInitPlayer(fileObj:HomePPLItem):Promise<boolean>{
    this.cC('vizInitPlayer(fileObj:HomePPLITEM)...');
    if(fileObj){
      if(!_.isEqual(this.vFile,fileObj)){this.vFile=fileObj};
      if(!this.audioCTX){this.audioCTX=new AudioContext()};
      if(!this.audioSRC){
        if(!this.vPlyr){this.vPlyr=document.getElementById('playerVideoPlayer') as HTMLVideoElement};
        this.audioSRC=this.audioCTX.createMediaElementSource(this.vPlyr);
      };
      if(!this.vizAnalyser){
        this.vizAnalyser=this.audioCTX.createAnalyser();
        this.vizAnalyser.fftSize=256;
        this.vizBufferLength=this.vizAnalyser.frequencyBinCount;
        this.vizDataArray=new Uint8Array(this.vizBufferLength);
        this.audioSRC.connect(this.vizAnalyser);
        this.vizAnalyser.connect(this.audioCTX.destination);
        this.vizAnalyser.getByteFrequencyData(this.vizDataArray);
      };
      this.doWavePic();this.doWaveData();
      return Promise.resolve(true);
    }else{this.cC('vizInitPlayer|ERROR: Missing|null fileObj');return Promise.resolve(false)};
  }
//-------------------------------------------------------------
  async setDOMPtys():Promise<boolean>{
    this.cWrapDs=document.getElementById('vizcanvaswrap').getBoundingClientRect();
    this.vCanvasW=Math.floor(this.cWrapDs.width);
    this.vCanvasH=Math.floor(this.cWrapDs.height);
    this.vCanvas.width=this.gridCanvas.width=this.wfCanvas.width=this.vCanvasW;
    this.vCanvas.height=this.gridCanvas.height=this.vCanvasH;
    this.wfCanvas.height=(this.vCanvasH/8);
    this.wfCanvas.style.height=(this.vCanvasH/8).toString()+'px';
    this.vCanvas.style.width=this.wfWrap.style.width=this.wfImgDiv.style.width=this.wfDataWrap.style.width=this.wfCanvas.style.width=this.gridWrap.style.width=this.gridCanvas.style.width=String(this.vCanvasW)+'px';
    this.vCanvas.style.height=this.wfWrap.style.height=this.wfImgDiv.style.height=this.wfDataWrap.style.height=this.gridWrap.style.height=this.gridCanvas.style.height=String(this.vCanvasH)+'px';
    this.gridContext=this.gridCanvas.getContext('2d');
    this.evServ.publish('doPDom',true);
    let smDim:number=0;this.vCanvasW<this.vCanvasH?smDim=this.vCanvasW:smDim=this.vCanvasH;
    this.vLogoRad=smDim/8;
    this.vLogo.style.width=(this.vLogoRad*2).toString()+'px';
    this.vLogo.style.height=(this.vLogoRad*2).toString()+'px';
    this.evServ.publish('doPDom',true);
    return Promise.resolve(true);
  }
//-------------------------------------------------------------
  async vizResize(){ this.cC('(vizResize)...');
    let eleTFArr:boolean[]=[];for(let i=0;i<this.eleIdArr.length;i++){let tf:boolean=false;document.getElementById(this.eleIdArr[i])?tf=true:tf=false;eleTFArr.push(tf)};
    if(eleTFArr.every(tf=>tf)){await this.setDOMPtys();if(this.hwlLoaded&&this.vizModel==='none'&&this.hwlFileObj.codec_type!=='video'){this.renderGrid('init');this.doWavePic();this.doWaveData()}};
  }
//-------------------------------------------------------------
  vizInitDom():Promise<boolean>{
    let vizInitCount:number=0,vizInitTO:number=12;
    return new Promise((resolve)=>{
      const waitElesLoop=setInterval(()=>{
        if(vizInitCount>vizInitTO){this.cC('(howlServ|vizInitDom) TIMEOUT ERROR!');
          clearInterval(waitElesLoop);
          resolve(false);
        }else{vizInitCount++};
        let eleTFArr:boolean[]=[];for(let i=0;i<this.eleIdArr.length;i++){if(document.getElementById(this.eleIdArr[i])){eleTFArr.push(true)}else{eleTFArr.push(false)}};
        if(eleTFArr.every(tf=>tf)){
          clearInterval(waitElesLoop);
          for(let i=0;i<this.eleGVarArr.length;i++){this[this.eleGVarArr[i]]=document.getElementById(this.eleIdArr[i])};
          this.cWrapDs=document.getElementById('vizcanvaswrap').getBoundingClientRect();
          this.vCanvasW=Math.floor(this.cWrapDs.width);
          this.vCanvasH=Math.floor(this.cWrapDs.height);
          this.vCanvas.width=this.gridCanvas.width=this.wfCanvas.width=this.vCanvasW;
          this.vCanvas.height=this.gridCanvas.height=this.vCanvasH;
          this.wfCanvas.height=(this.vCanvasH/8);
          this.wfCanvas.style.height=(this.vCanvasH/8).toString()+'px';
          this.vCanvas.style.width=this.wfWrap.style.width=this.wfImgDiv.style.width=this.wfDataWrap.style.width=this.wfCanvas.style.width=this.gridWrap.style.width=this.gridCanvas.style.width=String(this.vCanvasW)+'px';
          this.vCanvas.style.height=this.wfWrap.style.height=this.wfImgDiv.style.height=this.wfDataWrap.style.height=this.gridWrap.style.height=this.gridCanvas.style.height=String(this.vCanvasH)+'px';
          this.gridContext=this.gridCanvas.getContext('2d');
          this.evServ.publish('doPDom',true);
          let smDim:number=0;this.vCanvasW<this.vCanvasH?smDim=this.vCanvasW:smDim=this.vCanvasH;
          this.vLogoRad=smDim/8;
          this.vLogo.style.width=(this.vLogoRad*2).toString()+'px';
          this.vLogo.style.height=(this.vLogoRad*2).toString()+'px';
          this.vizCLogo=document.querySelector('.viz-logo.img') as HTMLImageElement;
          this.vContext=this.vCanvas.getContext('2d');
          this.evServ.publish('doPDom',true);
          this.vizInitDone=true;
          resolve(true);
        };
      },250);
    });
  }
//-------------------------------------------------------------
  vizAnimStart(){
    if(!this.vFrame){this.vFrame=true};
    this.vizAnimStep();
    this.cC('(vizAnimFrame) STARTED...');
  }
//-------------------------------------------------------------
  vizAnimStop(){
    this.vFrame=false;
    this.cC('(vizAnimFrame) STOPPED.');
  }
//-------------------------------------------------------------
  async vizAnimStep(){
    if(!this.vFrame||this.vizModel==='none'){
      window.cancelAnimationFrame(this.vFrameId);
      if(this.vizModel==='none'||!this.hwlPaused){this.clrCanvas()};
    }else{
      this.vizAnalyser.getByteFrequencyData(this.vizDataArray);
      if(this.vizModel==='bars'){await this.vizModelBars()}else if(this.vizModel==='circle'){await this.vizModelCircle()};
      this.vFrameId=window.requestAnimationFrame(()=>this.vizAnimStep());
    };
  }
//-------------------------------------------------------------
  vizModelCircle():Promise<boolean>{
    this.vizCLogo.style.opacity='1';
    const rangeM:number=255/100;
    const bars:number=64,barWidth:number=2,minRad:number=this.vLogoRad;
    let radius:number=0,rads:number=0,x:number=0,y:number=0,xEnd:number=0,yEnd:number=0,barHeight:number=0;
    const drawBar=(x1:number,y1:number,x2:number,y2:number,width:number,frequency:number)=>{
      const freqTrans:number=(Math.ceil(rangeM*frequency))/100;
      const lineColor='rgba(31,130,217,'+String(freqTrans)+')';
      this.vContext.strokeStyle=lineColor;
      this.vContext.lineWidth=width;
      this.vContext.beginPath();
      this.vContext.moveTo(x1,y1);
      this.vContext.lineTo(x2,y2);
      this.vContext.stroke();
    };
    this.clrCanvas();
    const vDASum:number=this.vizDataArray.reduce((a,b)=>a+b,0);
    const vDAAvg:number=(vDASum/this.vizDataArray.length)||0;
    const newRad:number=(vDAAvg/85)*minRad;
    newRad<minRad||newRad===minRad?radius=minRad:radius=newRad;
    if(radius>minRad){
      this.vLogo.style.transform='scale('+(radius/minRad).toFixed(2)+')';
      this.vLogo.style.filter='brightness('+(((radius/minRad)*2)*0.33).toFixed(2)+')';
    }else{
      this.vLogo.style.transform='scale(0.9)';
      this.vLogo.style.filter='brightness(0.25)';
    };
    this.vContext.fillStyle='#ffca28ad';
    const avgPercH:number=(vDAAvg*0.39)/100;
    let gBarLeftY:number=this.vCanvasH-(this.vCanvasH*avgPercH)+radius;
    if(gBarLeftY>=(this.vCanvasH-1)){gBarLeftY=this.vCanvasH-1;};
    let gBarRightY:number=(this.vCanvasH*avgPercH)-radius;
    if(gBarRightY<=1){gBarRightY=1;};
    this.vContext.fillRect(0,gBarLeftY,this.vCanvasW/2,1);
    this.vContext.fillRect(this.vCanvasW/2,gBarRightY,this.vCanvasW/2,1);
    for(let i=0;i<bars;i++){
      rads=(Math.PI*2)/bars;
      barHeight=((this.vizDataArray[i]*0.39)/100)*(minRad*2);
      x=(this.vCanvasW/2)+Math.cos(rads*i)*radius;
      y=(this.vCanvasH/2)+Math.sin(rads*i)*radius;
      xEnd=(this.vCanvasW/2)+Math.cos(rads*i)*(radius+barHeight);
      yEnd=(this.vCanvasH/2)+Math.sin(rads*i)*(radius+barHeight);
      drawBar(x,y,xEnd,yEnd,barWidth,this.vizDataArray[i]);
    };
    return Promise.resolve(true);
  }
//-------------------------------------------------------------
  vizModelBars():Promise<boolean>{
    this.bgCanvas();
    const vDASum:number=this.vizDataArray.reduce((a,b)=>a+b,0);
    const vDAAvg:number=(vDASum/this.vizDataArray.length)||0;
    this.vContext.fillStyle='#ffca28ad';
    this.vContext.fillRect(0,(this.vCanvasH-vDAAvg),this.vCanvasW,1);
    let barX:number=0;
    const barW:number=((this.vCanvasW/64)-1);
    for(let i=0;i<64;i++){
      const bFreq:number=this.vizDataArray[i];
      const bPerc:number=(Math.ceil(bFreq*0.39)/100);
      const bH:number=this.vCanvasH*0.6*bPerc;
      const lineColor='rgba(31,130,217,'+String((bPerc*0.75))+')';
      this.vContext.fillStyle=lineColor;
      this.vContext.fillRect(barX,(this.vCanvasH-bH),barW,bH);
      barX+=barW+1;
    };
    return Promise.resolve(true);
  }
///////////////////////////////////////////////////////////////
  async doWavePic(){
    this.cC('(doWavePic)...');
    const gWErr=(type:string)=>{let cM:string='';type==='stderr'?cM='|STDERR: '+outputStr:cM='|MISSING: wave.png NOT FOUND @ '+wavePngPath;this.cC('(getWaveData) ERROR'+cM)};
    this.wfWrap.style.opacity='0';
    let outputStr:string='';
    const wavePngPath:string=path.join(this.pathsObj.userData,'wave.png');
    console.log(wavePngPath);
    const wPicExists:boolean=await this.exists(wavePngPath);
    const gWOK=async()=>{
      this.cC('(doWavePic) OK...');
      if(wPicExists){
        this.wavePngPath=wavePngPath;
        this.wfImgDiv.style.background='transparent';
        const waitLoop=setInterval(()=>{
          if(this.wfImgDiv.style.background==='transparent'){
            clearInterval(waitLoop);
            this.evServ.publish('doPDom',true);
            const newBGStr:string='url('+(path.relative(__dirname,this.wavePngPath)).replace(/\\/g,'/')+') no-repeat center';
            this.wfImgDiv.style.background=newBGStr;
            const waitLoop2=setInterval(()=>{
              if(this.wfImgDiv.style.background=newBGStr){
                clearInterval(waitLoop2);
                this.evServ.publish('doPDom',true);
                this.cC('(doWavePic) WavePNG SUCCESS: '+this.wavePngPath);
                this.wfWrap.style.opacity='1';
              };
            },60);
          }
        },60);
      }else{gWErr('missing')};
    };
    //--------------------
    if(wPicExists){await unlink(wavePngPath)};
    const waveChild=spawn(this.mpegExePath,['-i',this.vFile.path,'-filter_complex','showwavespic=s='+this.vCanvasW+'x'+this.vCanvasH+':colors=#2585D1','-frames:v','1','-y',wavePngPath]);
    waveChild.on('close',code=>{if(code===0){gWOK()}else{gWErr('stderr')}});
    waveChild.on('error',error=>{outputStr+=error.name+': '+error.message+' '});
  }
///////////////////////////////////////////////////////////////
  doWaveData(){
    this.cC('(doWaveData)...');
    let outputStr:string='',oddByte:any=null,gotData:boolean=false,samples:any[]=[],channel:number=0,info:any,rawPeaks:any[]=[],peaks:any[]=[];
    const log_10=(arg:any)=>{return Math.log(arg)/Math.LN10};
    const coefficient_to_db=(coeff:any)=>{return 20.0*log_10(coeff)};
    const log_meter=(power:any,lower_db:any,upper_db:any,non_linearity:any)=>{if(power<lower_db){return 0}else{return Math.pow((power-lower_db)/(upper_db-lower_db),non_linearity)}};
    const alt_log_meter=(power:any)=>{return log_meter(power,-192.0,0.0,8.0)};
    const processData=()=>{
      let pattern:RegExp=new RegExp(/Duration: ([0-9:.]*),( start: [0-9:.]*,)? bitrate: ([0-9]*) kb/);
      let pattern2:RegExp=new RegExp(/Stream #[0-9:^(eng)]* Audio: [^,]*, ([0-9]*) Hz, ([a-z]*),/);
      let matches:RegExpMatchArray=outputStr.match(pattern);
      let matches2:RegExpMatchArray=outputStr.match(pattern2);
      let strList:string[]=matches[1].split(new RegExp('[:.]','g'));
      let duration=0;
      for(let i=0;i<3;i++){let val=Number(strList[i]);duration*=60;duration+=val};
      let channels:any=matches2[2];
      if(channels!==undefined){channels==='mono'?channels=1:channels=2};
      info={duration:duration,bitRate:Number(matches[3]),sampleRate:Number(matches2[1]),channels:channels};
      let numOfSample=Math.floor((this.wfCanvas.width/5));
      const samplesPerPeak=Math.ceil(samples.length/numOfSample);
      let currMax:number=0,partialMax:number=0,sampleIdx:number=0;
      for(let idx=0;idx<samples.length;idx++){
        let value=Math.abs(samples[idx]);
        sampleIdx++;
        if(value>partialMax){partialMax=value};
        if(sampleIdx>=samplesPerPeak){
          currMax=alt_log_meter(coefficient_to_db(partialMax));
          peaks.push(currMax);
          sampleIdx=0;
          partialMax=0;
        };
      };
      while(peaks.length<numOfSample){peaks.push(peaks[0])};
      this.wfPeakData=peaks;
      this.renderWaveData('init');
    };
    //--------------------
    const waveDataChild=spawn(this.mpegExePath,['-i',this.vFile.path,'-f','s16le', '-acodec','pcm_s16le','-y','pipe:1']);
    waveDataChild.stdout.on('data',(data)=>{
      gotData=true;
      let value:any,i:number=0,dataLen:number=data.length;
      if(oddByte!==null){value=((data.readInt8(i++,true)<8)||oddByte)/32767.0;samples.push(value);channel=++channel%2};
      for(;i<dataLen;i+=2){value=data.readInt16LE(i,true)/32767.0;samples.push(value);channel=++channel%2};
      oddByte=(i<dataLen)?data.readUInt8(i,true):null;
    });
    waveDataChild.stderr.on('data',(data)=>{outputStr+=data.toString()});
    waveDataChild.stderr.on('end',()=>{if(gotData){processData()}else{this.cC('(doWaveData) ERROR: '+outputStr)}});
  }
///////////////////////////////////////////////////////////////
  renderGrid(type:string,data?:any){
    let inProg:boolean=false,progX:number=this.gridProgColNo;
    if(type==='progress'){inProg=true;if(data){progX=data}}else{inProg=false;this.cC('(renderGrid) [INIT]...')};
    if(this.gridCanvas.width!==this.cWrapDs.width||this.gridCanvas.height!==this.cWrapDs.height){
      this.gridCanvas.width=this.cWrapDs.width;this.gridCanvas.height=this.cWrapDs.height;
      this.gridCanvas.style.width=String(this.cWrapDs.width)+'px';this.gridCanvas.style.height=String(this.cWrapDs.height)+'px';
      this.gridWrap.style.width=String(this.cWrapDs.width)+'px';this.gridWrap.style.height=String(this.cWrapDs.height)+'px';
      this.gridContext=this.gridCanvas.getContext('2d');
    };
    this.gridContext.clearRect(0,0,this.gridCanvas.width,this.gridCanvas.height);
    const bgRecGrad=this.gridContext.createLinearGradient(0,0,0,this.gridCanvas.height);
    bgRecGrad.addColorStop(0,'#121212');
    bgRecGrad.addColorStop(0.25,'#060606');
    bgRecGrad.addColorStop(0.50,'#030303');
    bgRecGrad.addColorStop(0.75,'#060606');
    bgRecGrad.addColorStop(1,'#121212');
    this.gridContext.fillStyle=bgRecGrad;
    this.gridContext.fillRect(0,0,this.gridCanvas.width,this.gridCanvas.height);
    let colHX:number=0;
    let lineHXCol1:string='#212121';
    let lineHXCol2:string='#161616';
    const colHXSpace:number=(this.gridCanvas.width/96)-1;
    for(let i=0;i<96;i++){
      this.gridContext.beginPath();
      this.gridContext.lineWidth=1;
      const gradHX=this.gridContext.createLinearGradient(colHX,0,colHX,this.gridCanvas.height);
      gradHX.addColorStop(0,lineHXCol1);
      gradHX.addColorStop(0.5,lineHXCol2);
      gradHX.addColorStop(1,lineHXCol1);
      this.gridContext.strokeStyle=gradHX;
      this.gridContext.moveTo(colHX,0);
      this.gridContext.lineTo(colHX,this.gridCanvas.height);
      this.gridContext.stroke();
      this.gridContext.closePath();
      colHX+=(colHXSpace+1);
      lineHXCol1==='#212121'?lineHXCol1='#161616':lineHXCol1='#212121';
      lineHXCol2==='#161616'?lineHXCol2='#121212':lineHXCol2='#161616';
    };
    if(inProg){
      this.gridContext.beginPath();
      this.gridContext.lineWidth=(colHXSpace/2);
      const progGradHX=this.gridContext.createLinearGradient(progX+1,0,progX+1,this.gridCanvas.height);
      progGradHX.addColorStop(0,'rgba(255,204,0,.12)');
      progGradHX.addColorStop(0.25,'rgba(255,204,0,.12)');
      progGradHX.addColorStop(0.375,'rgba(255,204,0,.48)');
      progGradHX.addColorStop(0.5,'rgba(255,204,0,1)');
      progGradHX.addColorStop(0.625,'rgba(255,204,0,.48)');
      progGradHX.addColorStop(0.75,'rgba(255,204,0,.12)');
      progGradHX.addColorStop(1,'rgba(255,204,0,.12)');
      this.gridContext.strokeStyle=progGradHX;
      this.gridContext.moveTo(progX+1,0);
      this.gridContext.lineTo(progX+1,this.gridCanvas.height);
      this.gridContext.stroke();
      this.gridContext.closePath();
    };
    let colWY:number=0;
    let lineWYColAlpha:number=1;
    const colWYSpace:number=((this.gridCanvas.height)/12)-1;
    for(let i=0;i<13;i++){
      this.gridContext.beginPath();
      this.gridContext.lineWidth=1;
      if(i===0||i===12){this.gridContext.strokeStyle='#242424'}
      else{this.gridContext.strokeStyle='rgba(33,33,33,'+String(lineWYColAlpha)+')'};
      this.gridContext.moveTo(0,colWY);
      this.gridContext.lineTo(this.gridCanvas.width,colWY);
      this.gridContext.stroke();
      this.gridContext.closePath();
      colWY+=(colWYSpace+1);
      lineWYColAlpha>0.5?lineWYColAlpha-=0.1:lineWYColAlpha+=0.1;
    };
  }
///////////////////////////////////////////////////////////////
  renderWaveData(type:string,data?:any){
    let inProg:boolean=false,progX:number=this.wfProgX;
    if(type==='progress'){inProg=true;if(data){progX=data}}else{inProg=false;this.cC('(renderWaveData) [INIT]...')};
    if(!this.wfContext){this.wfContext=this.wfCanvas.getContext('2d')};
    this.wfContext.clearRect(0,0,this.wfCanvas.width,this.wfCanvas.height);
    let barX:number=0;
    const barW:number=4;
    for(let i=0;i<this.wfPeakData.length;i++){
      this.wfContext.beginPath();
      const pH:number=this.wfCanvas.height*this.wfPeakData[i];
      this.wfContext.lineWidth=4;
      let isProgBar:boolean=false;
      if(inProg&&(progX>=(barX-3)&&progX<=(barX+2))){isProgBar=true};
      if(isProgBar){
        const pbG:CanvasGradient=this.wfContext.createLinearGradient(barX,this.wfCanvas.height-pH,barX+4,this.wfCanvas.height-pH);
        pbG.addColorStop(0,'#eab92d');
        pbG.addColorStop(1,'#c79810');
        this.wfContext.strokeStyle=pbG;
      }else{
        const pcG:CanvasGradient=this.wfContext.createLinearGradient(barX,this.wfCanvas.height-pH,barX,pH);
        pcG.addColorStop(0,'#1762A5');
        pcG.addColorStop(0.5,'#1F82D9');
        pcG.addColorStop(1,'#1762A5');
        this.wfContext.strokeStyle=pcG;
      };
      this.wfContext.moveTo(barX,this.wfCanvas.height-pH);
      this.wfContext.lineTo(barX,pH);
      this.wfContext.stroke();
      this.wfContext.closePath();
      barX+=(barW+1);
    };
  }
///////////////////////////////////////////////////////////////
  animProgress(progPerc:number){
    if(this.vizModel==='none'){
      let progX:number=this.gridCanvas.width*progPerc;
      if(progX<=0){progX=0};
      if(progX>=this.gridCanvas.width){progX=this.gridCanvas.width};
      if(this.gridProgColNo!==progX){
        this.gridProgColNo=progX;this.renderGrid('progress',progX);
        this.wfProgX=progX;this.renderWaveData('progress',progX);
      }
    };
  }
///////////////////////////////////////////////////////////////
  async didLoad(result:boolean){
    this.cC('didLoad('+String(result)+')...');
    if(result){
      //await this.vizInitHowl();
      if(this.hwlFileObj.codec_type!=='video'){this.doWavePic();this.doWaveData()};
      this.hwlLoaded=true;
      this.hwlSegment=Number((this.hwlHowl.duration()/48).toFixed(2));
      this.evServ.publish('hwlEvent',{e:'loaded',d:{r:true,fileObj:this.hwlFileObj,durStr:this.hwlHowl.duration().toFixed(2)}});
      if(this.hwlPlaying){
        const soundId:any=this.hwlHowl.play();
        if(soundId&&this.hwlFileId!==soundId){this.hwlFileId=soundId;}
      };
    }else{this.evServ.publish('hwlEvent',{e:'unloaded',d:this.hwlFileObj});};
  }
//-------------------------------------------------------------
  didUnload(){
    this.cC('didUnLoad(fileObj)...');
    this.evServ.publish('hwlEvent',{e:'unloaded',d:true});
  }
//-------------------------------------------------------------
  didPlay(id:any){
    this.cC('didPlay('+String(id)+')...');
    if(id&&this.hwlFileId!==id){this.hwlFileId=id;};
    this.hwlPlaying=true;
    this.hwlPaused=false;
    this.evServ.publish('hwlEvent',{e:'play',d:null});
    if(this.hwlHowl.playing(id)){
      this.pStartProg();
      if(this.vizModel!=='none'){this.vizAnimStart();}
    };
  }
//-------------------------------------------------------------
  didPause(id:any){
    this.cC('didPause('+String(id)+')...');
    if(id&&this.hwlFileId!==id){this.hwlFileId=id;};
    this.hwlPaused=true;
    this.evServ.publish('hwlEvent',{e:'pause',d:null});
    this.pStopProg();
    if(this.vizModel!=='none'){this.vizAnimStop();};
  }
//-------------------------------------------------------------
  didStop(id:any){
    this.cC('didStop('+String(id)+')...');
    if(id&&this.hwlFileId!==id){this.hwlFileId=id;};
    this.hwlPlaying=false;
    this.hwlPaused=false;
    this.pStopProg();
    if(this.vizModel!=='none'){this.vizAnimStop();};
    this.evServ.publish('hwlEvent',{e:'stop',d:null});
  }
//-------------------------------------------------------------
  didEnd(id:any){
    this.cC('didEnd('+String(id)+')...');
    if(id&&this.hwlFileId!==id){this.hwlFileId=id;};
    if(!this.gLoop){this.hwlPlayNext();};
  }
//-------------------------------------------------------------
  didSeek(id:any){
    this.cC('didSeek('+String(id)+')...');
  }
///////////////////////////////////////////////////////////////
  async hwlUpdatePlaylist(plist:any):Promise<boolean>{
    this.cC('hwlUpdatePlaylist(plist)...');
    if(plist.length===0){
      if(this.hwlHowl&&this.hwlHowl.playing()){this.hwlStop()};
      if(this.hwlLoaded){this.hwlUnload()};
      this.hwlPL=plist;
      this.wfImgDiv.style.opacity='0';
      this.wfDataWrap.style.opacity='0';
    }else{
      this.wfImgDiv.style.opacity='0.48';
      this.wfDataWrap.style.opacity='1';
      if(this.hwlHowl&&this.hwlLoaded){
        const wasRem:number=plist.findIndex(plO=>plO.path===this.hwlFileObj.path);
        if(wasRem===-1){
          let wasNextIndex:number=0;
          const remHwlIndex:number=this.hwlPL.findIndex(plO=>plO.path===this.hwlFileObj.path);
          if(remHwlIndex!==-1){wasNextIndex=remHwlIndex+1};
          if(wasNextIndex>this.hwlPL.length-1){wasNextIndex=0;};
          const tempList=this.evServ.subscribe('hwlEvent',(eData:any)=>{tempList.unsubscribe();if(eData.e==='loaded'){this.hwlPL=plist;this.cC('(hwlUpdatePlaylist): hwlPL Updated!')}});
          if(this.hwlHowl.playing()){this.hwlPlayThis(wasNextIndex);}
          else{this.hwlLoadThis(wasNextIndex);};
        }else{
          this.hwlPL=plist;
          this.cC('(hwlUpdatePlaylist): hwlPL Updated!');
        }
      }else{
        this.hwlPL=plist;
        this.cC('(hwlUpdatePlaylist): hwlPL Updated!');
      }
    };
    return Promise.resolve(true);
  }
///////////////////////////////////////////////////////////////
  async hwlSetPlaylist(plist:any[]):Promise<boolean>{
    if(!_.isEqual(plist,this.hwlPL)){
      const noDiff:number=plist.length-this.hwlPL.length;
      this.hwlPL=plist;
      this.evServ.publish('hwlEvent',{e:'setplaylist',d:{mute:this.gMute,loop:this.gLoop,rate:this.gRate,volume:this.gVolume}});
      this.cC('(hwlSetPlaylist) pList Updated ('+String(noDiff)+')');
    }else{this.cC('(hwlSetPlaylist) Skipped - No Change to pList');};
    return Promise.resolve(false);
  }
///////////////////////////////////////////////////////////////
  async hwlLoad(fileObj:any){
    if(_.isEqual(this.hwlFileObj,fileObj)&&this.hwlHowl&&this.hwlHowl.state()==='loaded'){
      this.cC('(hwlLoad): Already Loaded '+fileObj.cname+' (Current Item)...');
      if(this.hwlHowl.mute()!==this.gMute){this.hwlHowl.mute(this.gMute);};
      if(this.hwlHowl.loop()!==this.gLoop){this.hwlHowl.loop(this.gLoop);};
      if(this.hwlHowl.rate()!==this.gRate){this.hwlHowl.rate(this.gRate);};
      if(!this.hwlLoaded){this.hwlLoaded=true};
      const soundId:any=this.hwlHowl.play();
      if(soundId&&this.hwlFileId!==soundId){this.hwlFileId=soundId}
    }else{
      this.cC('(hwlLoad): Loading '+fileObj.cname+' (New/1st Item)...');
      if(this.hwlFileId){this.hwlFileId=null};
      this.hwlFileObj=fileObj;
      this.hwlHowl=new Howl({
        src:fileObj.path,
        html5:true,
        preload:false,
        autoplay:false,
        volume:this.gVolume,
        loop:this.gLoop,
        mute:this.gMute,
        rate:this.gRate,
        onload:()=>{this.didLoad(true)},
        onplay:(id:any)=>{this.didPlay(id)},
        onpause:(id:any)=>{this.didPause(id)},
        onstop:(id:any)=>{this.didStop(id)},
        onend:(id:any)=>{this.didEnd(id)},
        onseek:(id:any)=>{this.didSeek(id)},
        onloaderror:(id:number,err:any)=>{this.didLoad(false);this.hwErrEvent('load',this.hwlFileObj,id,err)},
        onplayerror:(id:number,err:any)=>{this.didLoad(false),this.hwErrEvent('play',this.hwlFileObj,id,err)}
      });
      if(this.hwlLoaded){this.hwlLoaded=false};
      this.hwlHowl.load();
    }
  }
///////////////////////////////////////////////////////////////
  hwlUnload():Promise<boolean>{
    this.cC('(hwlUnload)...');
    this.hwlFileObj=null;
    this.hwlHowl=null;
    this.hwlFileId=null;
    this.hwlLoaded=false;
    this.hwlPlaying=false;
    this.hwlPaused=false;
    this.didUnload();
    return Promise.resolve(true);
  }
///////////////////////////////////////////////////////////////
  hwlPreview(action:string,id:string,path:string){
    this.cC('hwlPreview('+action+')...');
    if(action==='load'){
      this.prevAudioHwl=new Howl({src:path,html5:true,
        onload:()=>{this.evServ.publish('prevHwl'+id,'onload')},
        onend:()=>{this.evServ.publish('prevHwl'+id,'onend')},
        onloaderror:()=>{this.evServ.publish('prevHwl'+id,'onerr')},
        onplayerror:()=>{this.evServ.publish('prevHwl'+id,'onerr')},
      });
      this.prevAudioHwl.load();
    }else{this.prevAudioHwl.play()};
  }
///////////////////////////////////////////////////////////////
  hwlPlay(){
    if(this.hwlLoaded&&this.hwlHowl){
      if(this.hwlPaused){this.hwlPause(this.hwlFileId);}
      else{
        const soundId:any=this.hwlHowl.play();
        if(soundId&&this.hwlFileId!==soundId){this.hwlFileId=soundId;}
      }
    }else{this.cC('(hwlPlay) ERROR');}
  }
//--------------------------------------------------------------
  hwlStop(){
    if(this.hwlLoaded&&this.hwlHowl&&this.hwlPlaying){
      if(this.hwlFileId){this.hwlHowl.stop(this.hwlFileId);}
      else{this.hwlHowl.stop();}
    }else{this.cC('(hwlPlay) ERROR');}
  }
//--------------------------------------------------------------
  hwlPause(id?:any){
    if(this.hwlLoaded&&this.hwlHowl&&this.hwlPlaying){
      if(this.hwlPaused){this.hwlHowl.play(id);}
      else{this.hwlHowl.pause();}
    }else{this.cC('(hwlPause) ERROR');}
  }
//--------------------------------------------------------------
  hwlPlayNext(){
    this.cC('(hwlPlayNext)...');
    const currentIndex:number=this.hwlPL.findIndex(plO=>plO.path===this.hwlFileObj.path);
    const nextIndex:number=currentIndex+1;
    let nextFileObj:any|null=null;
    if(nextIndex<this.hwlPL.length){nextFileObj=this.hwlPL[nextIndex];}
    else{nextFileObj=this.hwlPL[0];};
    this.hwlLoad(nextFileObj);
  }
//-------------------------------------------------------------
  hwlLoadThis(plIndex:number){
    const ptFileObj:any=this.hwlPL[plIndex];
    this.cC('(hwlLoadThis) ['+ptFileObj.cname+']...');
    if(this.hwlHowl&&this.hwlHowl.playing()){
      const tempSub=this.evServ.subscribe('hwlEvent',hEData=>{
        tempSub.unsubscribe();
        if(hEData.e==='stop'){
          if(this.hwlPlaying){this.hwlPlaying=false;};
          this.hwlLoad(ptFileObj);
        };
      });
      this.hwlStop();
    }else{
      if(this.hwlPlaying){this.hwlPlaying=false;};
      this.hwlLoad(ptFileObj);
    };
  }
//-------------------------------------------------------------
  hwlPlayThis(plIndex:number){
    const ptFileObj:any=this.hwlPL[plIndex];
    this.cC('(hwlPlayThis) ['+ptFileObj.cname+']...');
    if(this.hwlHowl&&this.hwlHowl.playing()){
      const tempSub=this.evServ.subscribe('hwlEvent',hEData=>{
        if(hEData.e==='stop'){
          if(!this.hwlPlaying){this.hwlPlaying=true;};
          this.hwlLoad(ptFileObj);
          tempSub.unsubscribe();
        };
      });
      this.hwlStop();
    }else{
      if(!this.hwlPlaying){this.hwlPlaying=true;};
      this.hwlLoad(ptFileObj);
    };
  }
//-------------------------------------------------------------
  hwlSeek(perc:number){
    this.cC('(hwlSeek)...');
    if(this.hwlHowl&&this.hwlHowl.playing()){
      let seek2Dur:number=this.hwlHowl.duration()*perc;
      if(seek2Dur<0){seek2Dur=0;};
      if(seek2Dur>this.hwlHowl.duration()){seek2Dur=this.hwlHowl.duration();};
      this.hwlHowl.seek(seek2Dur);
    }else{this.cC('(hwlSeek) ERROR');}
  }
//-------------------------------------------------------------
  hwlNext(){
    this.cC('(hwlNext)...');
    if(this.hwlHowl.playing()){
      const tempSub=this.evServ.subscribe('hwlEvent',hEData=>{
        if(hEData.e==='stop'){
          if(!this.hwlPlaying){this.hwlPlaying=true;};
          this.hwlPlayNext();
          tempSub.unsubscribe();
        };
      });
      this.hwlStop();
    }else{this.hwlPlayNext();};
  }
//-------------------------------------------------------------
  hwlPrev(){
    this.cC('(hwlPrev)...');
    const currentIndex:number=this.hwlPL.findIndex(plO=>plO.path===this.hwlFileObj.path);
    const prevIndex:number=currentIndex-1;
    let prevFileObj:any|null=null;
    if(prevIndex<0){prevFileObj=this.hwlPL[this.hwlPL.length-1];}
    else{prevFileObj=this.hwlPL[prevIndex];};
    if(this.hwlHowl.playing()){
      const tempSub=this.evServ.subscribe('hwlEvent',hEData=>{
        if(hEData.e==='stop'){
          if(!this.hwlPlaying){this.hwlPlaying=true;};
          this.hwlLoad(prevFileObj);
          tempSub.unsubscribe();
        };
      });
      this.hwlStop();
    }else{this.hwlLoad(prevFileObj);};
  }
//-------------------------------------------------------------
  hwlFwd(){
    this.cC('(hwlFwd) [+] '+String(this.hwlSegment)+'...');
    const fwd2Dur:number=this.hwlHowl.seek()+this.hwlSegment;
    if(fwd2Dur<this.hwlHowl.seek()){return;}
    else if(fwd2Dur>this.hwlHowl.duration()){this.hwlNext();}
    else{this.hwlHowl.seek(fwd2Dur);}
  }
//-------------------------------------------------------------
  hwlBack(){
    this.cC('(hwlBack) [-] '+String(this.hwlSegment)+'...');
    const back2Dur:number=this.hwlHowl.seek()-this.hwlSegment;
    if(back2Dur>this.hwlHowl.seek()){return;}
    else if(back2Dur<0){this.hwlPrev();}
    else{this.hwlHowl.seek(back2Dur);}
  }
//--------------------------------------------------------------
  hwlLoop(){
    const oldL:boolean=this.gLoop;
    let newL:boolean=oldL;oldL?newL=false:newL=true;
    if(this.hwlHowl.playing()){this.hwlHowl.loop(newL,this.hwlFileId);}
    else{this.hwlHowl.loop(newL);};
    this.gLoop=newL;
    this.cC('(hwlLoop) [LOOP] '+String(oldL).toUpperCase()+' >>> '+String(this.gLoop).toUpperCase());
    this.evServ.publish('hwlEvent',{e:'loop',d:this.gLoop});
  }
//--------------------------------------------------------------
  hwlMute(){
    const oldM:boolean=this.gMute;
    let newM:boolean=oldM;oldM?newM=false:newM=true;
    Howler.mute(newM);
    this.gMute=newM;
    this.cC('(hwlMute) [MUTE] '+String(oldM).toUpperCase()+' >>> '+String(this.gMute).toUpperCase());
    this.evServ.publish('hwlEvent',{e:'mute',d:this.gMute});
  }
//--------------------------------------------------------------
  hwlRate(newRateVal:number){
    const oldR:number=this.hwlHowl.rate();
    const newR:number=newRateVal;
    if(this.hwlHowl.playing()){this.hwlHowl.rate(newR,this.hwlFileId);}
    else{this.hwlHowl.rate(newR);};
    this.gRate=newR;
    this.cC('(hwlRate) [RATE] '+String(oldR).toUpperCase()+' >>> '+String(newR).toUpperCase());
    this.evServ.publish('hwlEvent',{e:'rate',d:newR});
  }
//--------------------------------------------------------------
  hwlVolume(newVolVal:number){
    const oldVTxt:string=String(Math.round(this.gVolume*100))+'%';
    const newV:number=newVolVal;
    const newVTxt=String(Math.round(newV*100))+'%';
    Howler.volume(newV);
    if(this.hwlHowl){this.hwlHowl.volume(newV);};
    this.gVolume=newV;
    this.cC('(hwlVolume) [VOLUME] '+oldVTxt+' >>> '+newVTxt);
    this.evServ.publish('hwlEvent',{e:'volume',d:newV});
  }
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
}
