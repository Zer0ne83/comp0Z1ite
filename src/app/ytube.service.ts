import { AppPaths, HomeScrapeDLInfo, HomeScrapeDLType, HomeScrapeSnippetSubMatch } from './appTypes';
import { NGXLogger } from 'ngx-logger';
import { app } from 'electron';
import { Injectable } from '@angular/core';
import Youtube, { YoutubeChannelSearch, YoutubeChannel, YoutubeCommentThreadSearch, YoutubeCommentParams, YoutubeVideo, YoutubeVideoSearch, YoutubePlaylist, YoutubePlaylistSearch, YoutubePlaylistItemsSearch, YoutubePlaylistItem } from 'youtube.ts';
import fs from 'fs';
import path from 'path';
import https from 'https';
import ytdl, { captionTrack, VideoDetails, videoInfo } from 'ytdl-core';
import { access,stat,readFile,writeFile,mkdir,readdir,rename} from 'fs/promises';
import ytpl from 'ytpl';
import readline from 'readline';
import cp from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { EventsService } from './events.service';
////////////////////////////////////////////////////////////////
@Injectable({providedIn:'root'})
////////////////////////////////////////////////////////////////
export class YTubeService {
  //------------------------------
  pathsObj:AppPaths|null=null;
  binPaths:any|null=null;
  mpegExePath:string|null=null;
  probeExePath:string|null=null;
  playExePath:string|null;
  ytdlExePath:string|null;
  //------------------------------
  ytIsReady:boolean=false;
  ytServ:null|Youtube=null;
  ffmpegBP:string|null=null;
  //------------------------------
  searchOrderBy:any='relevance';
  matchMax:number=50;
  resolveMax:number=50;
////////////////////////////////////////////////////////////////
  constructor(
    private logger:NGXLogger,
    private evServ:EventsService
  ){if(!this.ytIsReady||this.ytServ===null){this.ytServ=new Youtube('AIzaSyCe4Z4Q0SyuGpvqMIyB9581Ns1X35L4qis');this.ytIsReady=true}}
////////////////////////////////////////////////////////////////
// HELPER FNS
////////////////////////////////////////////////////////////////
  dCon(t:string,f:string,m?:string){let fC:string='',b:string='[ytServ|'+f+'] ',ts:any={fn:'(👟 RUN)',info:'(📋 INFO)',ok:'(✔️ SUCCESS)',nil:'(🤷 NIL)',err:'(❌ ERROR)'};let cM:string=b+ts[t];if(!m){t==='fn'?fC=cM+='...':fC=cM}else{fC=cM+=': '+m};this.logger.info(fC)};
  vStr2Id(v:string):string{if(typeof v==='string'&&v.length===11&&(ytdl.validateID(v))){return v}else if(typeof v==='string'&&v.startsWith('http')&&ytdl.validateURL(v)){return ytdl.getURLVideoID(v)}else{this.dCon('err','vStr2Id','Invalid YT ID/URl - Unfixable - Aborted')}};
  vStr2URL(v:string):string{if(typeof v==='string'&&v.length===11&&(ytdl.validateID(v))){return 'https://www.youtube.com/watch?v='+v}else if(typeof v==='string'&&v.startsWith('http')&&ytdl.validateURL(v)){return v}else{this.dCon('err','vStr2URL','Invalid YT ID/URl - Unfixable - Aborted')}};
  setPaths(paths:AppPaths):Promise<boolean>{if(paths){this.pathsObj=paths;this.binPaths=paths.binary;for(const[k,v]of Object.entries(this.pathsObj.binary)){const gVK:string=String(k).replace('ff','')+'ExePath';if(v){this[gVK]=v}};return Promise.resolve(true)}};
  async statSize(path:string):Promise<any>{try{const sRes:any=await stat(path);return Promise.resolve({r:true,d:sRes.size})}catch(e){console.log(e);return Promise.resolve({r:false,d:0})}};
//--------------------------------------------------------------
  async nextPage(nextPageToken:string,type:string,searchStr:string):Promise<any>{ this.dCon('fn','nextPage','nextPageToken: '+nextPageToken);
    const npFn=async():Promise<any>=>{
      let npRes:any;
      const searchOpts:any={pageToken:nextPageToken,q:searchStr,type:type.replace('s',''),order:this.searchOrderBy,maxResults:500}
      if(type==='channels'){npRes=await this.ytServ.channels.search(searchOpts)}
      else if(type==='playlists'){npRes=await this.ytServ.playlists.search(searchOpts)}
      else if(type==='videos'){npRes=await this.ytServ.videos.search(searchOpts)};
      return Promise.resolve(npRes);
    };
    try{
      const nPCRes:any=await npFn();
      if(nPCRes&&nPCRes.hasOwnProperty('items')&&nPCRes.items.length>0){this.dCon('ok','nextPage',nPCRes.kind+' | '+nPCRes.regionCode+' | Items:'+String(nPCRes.items.length));return Promise.resolve({r:true,d:nPCRes})}else{this.dCon('nil','nextPageChannels');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','nextPage',JSON.stringify(e));return Promise.resolve({r:false})}
  };
//--------------------------------------------------------------
  async resolveCPL(type:string,id:string):Promise<any>{ this.dCon('fn','resolveCPL',id);
    let plId:string='';if(type==='channel'){const chanPLId:string=await ytpl.getPlaylistID('https://www.youtube.com/channel/'+id);if(chanPLId&&ytpl.validateID(chanPLId)){plId=chanPLId}else{this.dCon('err','resolveCPL','ERROR: Unable to Get/Validate [CHANNEL] ID!')}}else{plId=id};
    console.log('YT Resolve Max: '+this.resolveMax);
    try{const rCPLRes:ytpl.Result=await ytpl(plId,{limit:this.resolveMax});
      if(rCPLRes&&rCPLRes.hasOwnProperty('items')&&rCPLRes.items.length>0){this.dCon('ok','resolveCPL','id: '+rCPLRes.id+' | title: '+rCPLRes.title+', itemCount: '+rCPLRes.estimatedItemCount+', views: '+rCPLRes.views);return Promise.resolve({r:true,d:rCPLRes})}
      else{this.dCon('nil','resolveCPL');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','resolveCPL',JSON.stringify(e));return Promise.resolve({r:false})};
  }
////////////////////////////////////////////////////////////////
// CHANNELS
////////////////////////////////////////////////////////////////
  async findChannels(searchStr:string):Promise<any>{ this.dCon('fn','findChannels',searchStr);
    try{const fCRes:YoutubeChannelSearch=await this.ytServ.channels.search({q:searchStr,type:'channel',order:this.searchOrderBy,maxResults:500});
      if(fCRes&&fCRes.hasOwnProperty('items')&&fCRes.items.length>0){this.dCon('ok','findChannels',fCRes.kind+' | '+fCRes.regionCode+' | Items:'+String(fCRes.items.length));return Promise.resolve({r:true,d:fCRes})}else{this.dCon('nil','findChannels');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','findChannels',JSON.stringify(e));return Promise.resolve({r:false})}
  };
//--------------------------------------------------------------
  async getChannel(id:string):Promise<any>{ this.dCon('fn','getChannel',id);
    try{const gCRes:YoutubeChannel=await this.ytServ.channels.get('https://www.youtube.com/channel/'+id,{id:id,maxResults:1});
      if(gCRes&&gCRes.hasOwnProperty('id')){this.dCon('ok','getChannel',gCRes.id+' | '+gCRes.snippet.title+' ('+gCRes.snippet.country+'/'+gCRes.snippet.defaultLanguage+' | Subs:'+gCRes.statistics.subscriberCount+', Vids: '+gCRes.statistics.videoCount);return Promise.resolve({r:true,d:gCRes})}
      else{this.dCon('nil','getChannel');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','getChannel',JSON.stringify(e));return Promise.resolve({r:false})}
  };
//--------------------------------------------------------------
  async findChannelComments(CName:string,searchStr?:string):Promise<any>{ let fPs:string=CName;if(searchStr){fPs+=searchStr};this.dCon('fn','findChannelComments',fPs);
    let qParams:YoutubeCommentParams={maxResults:'5000'};if(searchStr){qParams['searchTerms']=searchStr;qParams['order']='relevance'};
    try{const fCCRes:YoutubeCommentThreadSearch=await this.ytServ.channels.allComments(CName,qParams);
      if(fCCRes&&fCCRes.hasOwnProperty('items')&&fCCRes.items.length>0){this.dCon('ok','findChannelComments',fCCRes.kind+' | Items:'+String(fCCRes.items.length));return Promise.resolve({r:true,d:fCCRes})}else{this.dCon('nil','findChannelComments');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','findChannelComments',JSON.stringify(e));return Promise.resolve({r:false})}
  };
////////////////////////////////////////////////////////////////
// VIDEOS
////////////////////////////////////////////////////////////////
  async getVideo(id:string):Promise<any>{ this.dCon('fn','getVideo',id);
    try{const gVRes:YoutubeVideo=await this.ytServ.videos.get('https://www.youtube.com/watch?v='+id,{id:id,maxResults:1});
      if(gVRes&&gVRes.hasOwnProperty('id')){this.dCon('ok','getVideo',gVRes.id+' | '+gVRes.snippet.title+' ('+gVRes.contentDetails.duration+') | Views: '+gVRes.statistics.viewCount);return Promise.resolve({r:true,d:gVRes})}else{this.dCon('nil','getVideo');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','getVideo',JSON.stringify(e));return Promise.resolve({r:false})}
  };
  //--------------------------------------------------------------
  async findVideos(searchStr:string):Promise<any>{ this.dCon('fn','findVideos',searchStr);
    try{const fVRes:YoutubeVideoSearch=await this.ytServ.videos.search({q:searchStr,type:'video',order:this.searchOrderBy,maxResults:500});
      if(fVRes&&fVRes.hasOwnProperty('items')&&fVRes.items.length>0){this.dCon('ok','findVideos',fVRes.kind+' | '+fVRes.regionCode+' | Items:'+String(fVRes.items.length));return Promise.resolve({r:true,d:fVRes})}else{this.dCon('nil','findVideos');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','findVideos',JSON.stringify(e));return Promise.resolve({r:false})}
  };
////////////////////////////////////////////////////////////////
// PLAYLISTS
////////////////////////////////////////////////////////////////
  async getPlaylist(url:string):Promise<any>{ this.dCon('fn','getPlaylist',url);
    try{const gPLRes:YoutubePlaylist=await this.ytServ.playlists.get(url,{maxResults:'1'});
      if(gPLRes&&gPLRes.hasOwnProperty('id')){this.dCon('ok','getPlaylist',gPLRes.id+' | '+gPLRes.snippet.title+' ('+gPLRes.contentDetails.itemCount+' Items');return Promise.resolve({r:true,d:gPLRes})}else{this.dCon('nil','getPlaylist');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','getPlaylist',JSON.stringify(e));return Promise.resolve({r:false})}
  };
  //--------------------------------------------------------------
  async findPlaylists(searchStr:string):Promise<any>{ this.dCon('fn','findPlaylists',searchStr);
    try{const fPLRes:YoutubePlaylistSearch=await this.ytServ.playlists.search({q:searchStr,type:'playlist',order:this.searchOrderBy,maxResults:500});
      if(fPLRes&&fPLRes.hasOwnProperty('items')&&fPLRes.items.length>0){this.dCon('ok','findPlaylists',fPLRes.kind+' | '+fPLRes.regionCode+' | Items:'+String(fPLRes.items.length));return Promise.resolve({r:true,d:fPLRes})}else{this.dCon('nil','findPlaylists');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','findPlaylists',JSON.stringify(e));return Promise.resolve({r:false})}
  };
  //--------------------------------------------------------------
  async getPlaylistItems(url:string):Promise<any>{ this.dCon('fn','getPlaylistItems',url);
    try{const gPLIRes:YoutubePlaylistItemsSearch=await this.ytServ.playlists.items(url,{maxResults:'500'});
      if(gPLIRes&&gPLIRes.hasOwnProperty('items')&&gPLIRes.items.length>0){this.dCon('ok','getPlaylistItems',gPLIRes.kind+' | Items:'+String(gPLIRes.items.length));return Promise.resolve({r:true,d:gPLIRes})}else{this.dCon('nil','getPlaylistItems');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','getPlaylistItems',JSON.stringify(e));return Promise.resolve({r:false})}
  };
  //--------------------------------------------------------------
  async getPlaylistItem(method:'id'|'urls',paramObj:any):Promise<any>{
    let fPs:string=method+',';method==='id'?fPs+=paramObj.id:fPs+=paramObj.pURL+','+paramObj.vURL;this.dCon('fn','getPlaylistItem',fPs);
    try{let gPLIRes:YoutubePlaylistItem|null=null;if(method==='id'){gPLIRes=await this.ytServ.playlists.itemByID(paramObj.id)}else{gPLIRes=await this.ytServ.playlists.item(paramObj.pURL,paramObj.vURL)};
      if(gPLIRes&&gPLIRes.hasOwnProperty('id')){this.dCon('ok','getPlaylistItem',gPLIRes.id+' | '+gPLIRes.snippet.title);return Promise.resolve({r:true,d:gPLIRes})}else{this.dCon('nil','getPlaylistItem');return Promise.resolve({r:false})}
    }catch(e){this.dCon('err','getPlaylistItem',JSON.stringify(e));return Promise.resolve({r:false})}
  };
////////////////////////////////////////////////////////////////
// YTDL-CORE DOWNLOAD FNS
////////////////////////////////////////////////////////////////
  async hasCaps(vId:string):Promise<boolean>{ this.dCon('fn','hasCaps',vId);
    try{const vInfo:videoInfo=await ytdl.getInfo(this.vStr2URL(vId)),cTracks:captionTrack[]=vInfo.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;
      if(cTracks&&cTracks.length>0&&cTracks.find(t=>t.languageCode==='en')!==undefined){return Promise.resolve(true)}else{return Promise.resolve(false)}
    }catch(e){this.dCon('err','hasCaps',JSON.stringify(e));return Promise.resolve(false)};
  }
//--------------------------------------------------------------
  async dlCaps(vId:string,cTrack:captionTrack,subsPath:string):Promise<HomeScrapeDLType>{
    const getCap=(capPath:string):Promise<boolean>=>{
      const format:string='xml';
      return new Promise((resolve)=>{
        https.get(`${cTrack.baseUrl}&fmt=${format !== 'xml' ? format : ''}`, res => {
          res.pipe(fs.createWriteStream(path.resolve(__dirname,capPath)));
          res.on('end',()=>{resolve(true);});
        });
      });
    };
    this.dCon('fn','dlCaps',vId);
    const capPath:string=path.join(subsPath,vId+'.xml');
    const dlRes:boolean=await getCap(capPath);
    let capRes:HomeScrapeDLType={ext:'xml',path:capPath,size:0,err:false};
    if(dlRes){
      const{r,d}:any=await this.statSize(capPath);
      if(r&&d>0){capRes.size=d}else{capRes.err=true;this.dCon('err','dlCaps','0/null file size')};
      return Promise.resolve(capRes);
    }else{this.dCon('err','(dlCaps) ERROR: Download Failed');capRes.err=true;return Promise.resolve(capRes)};
  }
//--------------------------------------------------------------
  async dlAudio(vId:string,audioPath:string):Promise<HomeScrapeDLType>{
    this.dCon('fn','dlAudio',vId);
    const updSTP=()=>{let dlTTL:number=stp.dla;if(dlTTL<0){dlTTL=0};if(dlTTL>1){dlTTL=1};this.evServ.publish('stpA'+vId,dlTTL)};
    let aRes:HomeScrapeDLType={ext:'mp3',path:path.join(audioPath,vId+'.mp3'),size:0,err:false},stp:any={dla:0,proc:0};
    return new Promise((resolve)=>{
      const audio=ytdl(this.vStr2URL(vId),{quality:'highestaudio'}).on('progress',(_,dla,ttla)=>{stp.dla=(dla/ttla);updSTP()});
      const ffmProc:any=cp.spawn(this.mpegExePath,['-i','pipe:0','-acodec:a','libmp3lame',aRes.path],{windowsHide:true});
      ffmProc.on('close',async(code:number)=>{
        if(code===0){const{r,d}:any=await this.statSize(aRes.path);if(r&&d>0){aRes.size=d}else{aRes.err=true;this.dCon('err','dlAudio','0/null file size')};resolve(aRes)}
        else{this.dCon('err','dlAudio','ERROR Code: '+code);aRes.err=true;resolve(aRes)}
      });
      audio.pipe(ffmProc.stdio[0]);
    });
  }
//--------------------------------------------------------------
s2T(secs:number):string{let fStr:string='',tH:string|null,tM:string|null,tS:string|null,hours:number=Math.floor(secs/3600),mins:number=0;if(hours>=1){tH=String(hours);secs=secs-(hours*3600)}else{tH=null};mins=Math.floor(secs/60);if(mins>=1){tM=String(mins);secs=secs-(mins*60)}else{tM=null};if(secs<1){tS=null}else{tS=String(secs)};(tH&&tM&&tM.length===1)?tM='0'+tM:void 0;(tS&&tS.length===1)?tS='0'+tS:void 0;if(tH){fStr+=tH;tM=':'+tM};if(tM){fStr+=tM;tS=':'+tS}else{fStr+='00:'};if(tS){fStr+=tS};if(fStr.includes(':null')){const rX:RegExp=/:null/gi;fStr=fStr.replace(rX,':00')};if(fStr===''){fStr='0'};return fStr};
//--------------------------------------------------------------
  async dlTimeRange(vId:string,aOrV:string,evStr:string,saveFilePath:string,snipSubMatch:HomeScrapeSnippetSubMatch):Promise<{r:boolean,d:HomeScrapeDLType|null}>{
    let dlTRRes:HomeScrapeDLType={ext:path.extname(saveFilePath),path:saveFilePath,size:0,err:false},stp:any={dl:0,proc:0};
    let dlStart:string=snipSubMatch.times.start.txt;if(dlStart.split(':').length<3){dlStart='00:'+dlStart};
    let dlAudioOpts:ytdl.downloadOptions={quality:'lowest',filter:'audioonly'};
    let dlVideoOpts:ytdl.downloadOptions={quality:'lowest',filter:format=>format.container==='mp4'&&format.hasAudio};
    let dlOpts:ytdl.downloadOptions;aOrV==='a'?dlOpts=dlAudioOpts:dlOpts=dlVideoOpts;
    const trimStart:string=snipSubMatch.times.start.secs.toFixed(1),trimDur:string=snipSubMatch.times.dur.secs.toFixed(1);
    this.dCon('fn','dlTimeRange',vId+' - ('+aOrV+','+evStr+') | '+saveFilePath+' - dlStart:'+dlStart+',trimStart:'+trimStart+',trimDur:'+trimDur+'...');
    const updSTP=()=>{let dlTTL:number=stp.dl;if(dlTTL<0){dlTTL=0};if(dlTTL>1){dlTTL=1};this.evServ.publish(evStr,dlTTL)};
    return new Promise((resolve)=>{
      const dlTRStream=ytdl(this.vStr2URL(vId),dlOpts);
      dlTRStream.on('progress',(_,dl,ttla)=>{stp.dl=(dl/ttla);updSTP()});
      const ffmProc=cp.spawn(this.mpegExePath,['-i','pipe:0','-ss',trimStart,'-t',trimDur,dlTRRes.path],{windowsHide:true});
      ffmProc.on('close',async(code:number)=>{
        if(code===0){const{r,d}:any=await this.statSize(dlTRRes.path);if(r&&d>0){dlTRRes.size=d}else{dlTRRes.err=true;this.dCon('err','dlTimeRange','0/null file size')};resolve({r:true,d:dlTRRes})}
        else{this.dCon('err','dlTimeRange','ERROR Code: '+code);dlTRRes.err=true;resolve({r:false,d:dlTRRes})};
      });
      dlTRStream.pipe(ffmProc.stdio[0]);
    });
  }
//--------------------------------------------------------------
  async dlVideo(vId:string,videoPath:string):Promise<HomeScrapeDLType>{
    this.dCon('fn','dlVideo',vId);
    const updSTP=()=>{let dlTTL:number=stp.dla+stp.dlv;if(dlTTL<0){dlTTL=0};if(dlTTL>1){dlTTL=1};this.evServ.publish('stpV'+vId,dlTTL)};
    let vRes:HomeScrapeDLType={ext:'mp4',path:path.join(videoPath,vId+'.mp4'),size:0,err:false},stp:any={dla:0,dlv:0,proc:0};
    return new Promise((resolve)=>{
      const audio=ytdl(this.vStr2URL(vId),{quality:'highestaudio'}).on('progress',(_,dla,ttla)=>{stp.dla=((dla/ttla)/2);updSTP()});
      const video=ytdl(this.vStr2URL(vId),{quality:'lowestvideo',filter:format=>format.container==='mp4'}).on('progress',(_,dlv,ttlv)=>{stp.dlv=((dlv/ttlv)/2);updSTP()});
      const ffmProc:any=cp.spawn(this.mpegExePath,['-loglevel','8','-hide_banner','-progress','pipe:3','-i','pipe:4','-i','pipe:5','-map','0:a','-map','1:v',vRes.path],{windowsHide:true,stdio:['inherit','inherit','inherit','pipe','pipe','pipe']});
      ffmProc.on('close',async(code:number)=>{
        if(code===0){
          const{r,d}:any=await this.statSize(vRes.path);if(r&&d>0){vRes.size=d}else{vRes.err=true;this.dCon('err','dlVideo','0/null file size')};resolve(vRes)}
          else{this.dCon('err','dlVideo','ERROR Code: '+code);vRes.err=true;resolve(vRes)}
      });
      audio.pipe(ffmProc.stdio[4]);
      video.pipe(ffmProc.stdio[5]);
    });
  }
//--------------------------------------------------------------
  async dlInfo(vId:string,infoPath:string):Promise<{r:boolean,d:string|{ctrack:captionTrack|null,info:HomeScrapeDLInfo}}>{
  this.dCon('fn','dlInfo',vId);
    try{const infoFPath:string=path.join(infoPath,vId+'.json'),vInfo:videoInfo=await ytdl.getInfo(this.vStr2Id(vId)),cTracks:captionTrack[]=vInfo.player_response.captions.playerCaptionsTracklistRenderer.captionTracks,cDeets:VideoDetails=vInfo.player_response.videoDetails;
      if(cTracks&&cTracks.length>0){const cTrack:captionTrack|undefined=cTracks.find(t=>t.languageCode==='en');
        if(cTrack&&cTrack!==undefined){const vJSON:string=JSON.stringify(vInfo,null,2).replace(/(ip(?:=|%3D|\/))((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|[0-9a-f]{1,4}(?:(?::|%3A)[0-9a-f]{1,4}){7})/ig,'$10.0.0.0');
          try{await writeFile(infoFPath,vJSON);
            const getSize:any=await this.statSize(infoFPath);
            if(getSize.r&&getSize.d>0){return Promise.resolve({r:true,d:{ctrack:cTrack,info:{title:cDeets.title,channel:cDeets.channelId,author:cDeets.author,views:Number(cDeets.viewCount),duration:Number(cDeets.lengthSeconds),ext:'json',path:infoFPath,size:getSize.d,err:false}}});
            }else{return Promise.resolve({r:true,d:{ctrack:cTrack,info:{title:cDeets.title,channel:cDeets.channelId,author:cDeets.author,views:Number(cDeets.viewCount),duration:Number(cDeets.lengthSeconds),ext:'json',path:infoFPath,size:0,err:true}}})};
          }catch(e){this.dCon('err','dlVideoInfo',JSON.stringify(e));return Promise.resolve({r:true,d:{ctrack:cTrack,info:{title:cDeets.title,channel:cDeets.channelId,author:cDeets.author,views:Number(cDeets.viewCount),duration:Number(cDeets.lengthSeconds),ext:'json',path:infoFPath,size:0,err:true}}})};
        }else{this.dCon('nil','dlVideoInfo','Not English');return Promise.resolve({r:true,d:{ctrack:null,info:{title:cDeets.title,channel:cDeets.channelId,author:cDeets.author,views:Number(cDeets.viewCount),duration:Number(cDeets.lengthSeconds),ext:'',path:'',size:0,err:true}}})};
      }else{this.dCon('nil','dlVideoInfo','No Captions');return Promise.resolve({r:true,d:{ctrack:null,info:{title:cDeets.title,channel:cDeets.channelId,author:cDeets.author,views:Number(cDeets.viewCount),duration:Number(cDeets.lengthSeconds),ext:'',path:'',size:0,err:true}}})};
    }catch(e){this.dCon('err','dlVideoInfo',JSON.stringify(e));return Promise.resolve({r:false,d:JSON.stringify(e)})};
  }
//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
}
/* ipcMain.handle('mov-to-mp4',async(event,videoFile:string)=>{
  const baseFlags=['-pix_fmt','yuv420p','-movflags','+faststart'],ext=path.extname(videoFile),name=path.basename(videoFile,ext),savePath=path.join(app.getAppPath(),'./media/video/'+name+'.mp4');
  if(!fs.existsSync(path.dirname(savePath))){fs.mkdirSync(path.dirname(savePath),{recursive:true})}
  if(fs.existsSync(savePath)){return savePath};
  await new Promise<void>((resolve)=>{ffmpeg(path.normalize(videoFile).replace(/\//g,'/')).outputOptions([...baseFlags,'-vcodec','libx264','-preset','ultrafast','-crf','16','-acodec','copy']).save(savePath).on('end',()=>{resolve()})});
  return savePath
}); */
/* const getVideoRes=async(videoFile:string):Promise<object>=>{
  const vFPath:string=path.join(app.getAppPath(),'./media/video/'+videoFile);
  const cmd:string=ffmpegBP+' -i "./media/'+vFPath+'"';
  const str=await exec(cmd).then((s:any)=>s.stdout).catch((e:any)=>e.stderr);
  const dim=str.match(/(?<= )\d+x\d+(?= |,)/)[0].split('x');
  return Promise.resolve({width:Number(dim[0]),height:Number(dim[1])});
};
//-------------------------------------------------------
const splitVideo=async(videoFile:string,savePath:string)=>{
  const baseFlags:string[]=['-pix_fmt','yuv420p','-movflags','+faststart'];
  await new Promise<void>((resolve)=>{ffmpeg(path.normalize(videoFile).replace(/\//g,'/')).outputOptions([...baseFlags,'-acodec','copy','-vcodec','copy','-f','segment','-segment_time','10','-reset_timestamps','1','-map','0']).save(savePath).on('end',()=>{resolve()})});
  return fs.readdirSync(path.dirname(savePath),{withFileTypes:true}).filter((p)=>p.isFile()).map((p)=>path.dirname(savePath)+'/'+p.name);
};
//-------------------------------------------------------
const reverseSegments=async(segments:string[],savePath:string)=>{
  const baseFlags:string[]=['-pix_fmt','yuv420p','-movflags','+faststart'];
  let queue:string[][]=[];while(segments.length){queue.push(segments.splice(0,2))};
  for(let i=0;i<queue.length;i++){await Promise.all(queue[i].map(async(f)=>{return new Promise<void>((resolve)=>{ffmpeg(path.normalize(f).replace(/\//g,'/')).outputOptions([...baseFlags,'-vf','reverse','-af','areverse']).save(savePath+'/'+path.basename(f)).on('end',()=>{resolve()})})}))};
  return fs.readdirSync(savePath,{withFileTypes:true}).filter((p)=>p.isFile()).map((p)=>savePath+'/'+p.name);
};
//-------------------------------------------------------
const concatSegments=async(segments:string[],savePath:string)=>{
  const baseFlags:string[]=['-pix_fmt','yuv420p','-movflags','+faststart'],sorted:string[]=segments.sort(new Intl.Collator(undefined,{numeric:true,sensitivity:'base'}).compare).reverse(),text:string=sorted.map((s)=>`file '${process.platform==='win32'?'file:':''}${s}'`).join('\n'),textPath:string=path.dirname(savePath)+'/list.txt';
  fs.writeFileSync(textPath,text);
  await new Promise<void>((resolve)=>{ffmpeg(path.normalize(textPath).replace(/\//g,'/')).inputOptions(['-f','concat','-safe','0']).outputOptions([...baseFlags,'-c','copy']).save(savePath).on('end',()=>{resolve()})});
  return savePath
}; */
