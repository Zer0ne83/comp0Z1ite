import { AppPaths } from './../../../app/appTypes';
import { FFProbeStream } from 'ffprobe';
import { DirectoryTree } from 'directory-tree';
import { HomePLHData, defAppStates, AppProject, CompzPopoverOptions, CompzPopoverQueryBtn, HomePlayerCtrls, HomeProjectPlaylist, HomeSearchSourceResults, HomeSearchSourceResultItem, HomeScrapeTargetCounts, HomeScrapeTargetProcessMode, HomeScrapeDLInfo, HomeScrapeDLType, HomeProg, HomeDLDSObject, HomeTargetItem, HomeTargetChannelData, HomeTargetVideo, HomeSearchTermWGroupsQuery, ContractionsArr, HomeSearchTermWGroupMultiObject, HomeSearchTermWGroupSingleObject, HomeSubSearchMatch, HomeSubSearchMatches, HomeScrapeSnippet, HomeScrapeSnippetPAV, HomeScrapeSubJSON, HomeScrapeSnippetSubMatch, HomeScrapeSubJSONTranscriptLine, HomeScrapeSubJSONTranscriptLineTime, HomeScrapeSnippets, CommonWordsArr, HomeScrapeSnipResults, HomeScrapeSnipRGItem, HomeScrapeSnipResultsGroup, HomeScrapeSnipLimits, HomeScrapeSnippetSubMatchTimes, HomeScrapeSnippetPAVObject, HomeSnipWordPeak, HomePPLDurObject, HomePPLDurNiceBytes, HomePPLItem, HomePlayerPtys, HomeProjectPlaylistDirPaths, HomeEditorFile, HomeEditProgObj, HomeThumbObject, HomeEditSelectRange, HomeEditSelectRangeObject, HomeEditDrawClicks, HomeEditTick, HomeEditorCrop, HomeEditorDelete, HomeEditorEdit, HomeEditDrawClick, HomeEditDrawTTL } from './../appTypes';
import { Component, ViewChild, OnInit, ElementRef, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import ytdl, { captionTrack, VideoDetails, videoInfo } from 'ytdl-core';
import {spawn} from 'child_process';
import { Router, ActivatedRoute, Navigation, NavigationEnd, Event, NavigationStart, NavigationError } from '@angular/router';
import { fileSearch, getFilesFromDir, search } from 'search-in-file';
import { NavController } from '@ionic/angular';
import { HowlerService } from '../viz.service';
import { YTubeService } from '../ytube.service';
import { EventsService } from '../events.service';
import { FFMPEGService } from '../ffmpeg.service';
import { ipcRenderer } from 'electron';
import { defHomeStates, HomeStates } from '../appTypes';
import { access,stat,readFile,writeFile,mkdir,readdir,unlink,rename,copyFile} from 'fs/promises';
import { constants,Dirent,Stats} from 'fs';
const fs = require('fs');
const readline = require('readline');
import * as path from 'path';
const _ = require('lodash');
import { DragulaService, dragula, DragulaOptions } from 'ng2-dragula';
import { Subscription, } from 'rxjs';
import { Parser, ParserOptions, parseString, parseStringPromise} from 'xml2js';
import { Drake } from 'dragula';
import { TooltipService } from 'angular-simple-tooltip';
import { LoadingController, LoadingOptions } from '@ionic/angular';
/////////////////////////////////////////////////////////
@Component({selector:'app-home',templateUrl:'./home.component.html',styleUrls:['./home.component.scss']})
/////////////////////////////////////////////////////////
export class HomeComponent implements OnInit,AfterViewInit {
/////////////////////////////////////////////////////////
  @ViewChild('homeWrap') homeWrap:ElementRef<HTMLElement>;
  //-------------------
  @ViewChild('editorSelRangeInputStart') editorSelRangeInputStart:ElementRef<HTMLInputElement>;
  @ViewChild('editorSelRangeInputEnd') editorSelRangeInputEnd:ElementRef<HTMLInputElement>;
  //-------------------
  @ViewChild('editDrawRectCanvas') editDrawRectCanvas:ElementRef<HTMLCanvasElement>;
  @ViewChild('editPosOverlay') editPosOverlay:ElementRef<HTMLDivElement>;
  @ViewChild('editSelectLine') editSelectLine:ElementRef<HTMLDivElement>;
  @ViewChild('editSelectLineNo') editSelectLineNo:ElementRef<HTMLDivElement>;
  @ViewChild('editProgLine') editProgLine:ElementRef<HTMLDivElement>;
  @ViewChild('editProgLineNo') editProgLineNo:ElementRef<HTMLDivElement>;
  @ViewChild('editorAVPlyr') editorAVPlyr:ElementRef<HTMLVideoElement>;
  @ViewChild('editorAVPlyrWrap') editorAVPlyrWrap:ElementRef<HTMLDivElement>;
  @ViewChild('editWaveImgWrap') editWaveImgWrap:ElementRef<HTMLDivElement>;
  @ViewChild('editGridWrap') editGridWrap:ElementRef<HTMLDivElement>;
  @ViewChild('editGridCanvas') editGridCanvas:ElementRef<HTMLCanvasElement>;
  @ViewChild('editThumbsWrap') editThumbsWrap:ElementRef<HTMLDivElement>;
  //--------------------
  @ViewChild('playerVideoWrap') playerVideoWrap:ElementRef<HTMLDivElement>;
  @ViewChild('playerVideoPlayer') playerVideoPlayer:ElementRef<HTMLVideoElement>;
  //--------------------
  @ViewChild('prevPlyrWrap') prevPlyrWrap:ElementRef<HTMLDivElement>;
  @ViewChild('prevPlyr') prevPlyr:ElementRef<HTMLVideoElement>;
  @ViewChild('prevProg') prevProg:ElementRef<HTMLDivElement>;
  //--------------------
  @ViewChild('searchModeRadioSearch') searchModeRadioSearch:ElementRef<HTMLInputElement>;
  @ViewChild('searchModeRadioScrape') searchModeRadioScrape:ElementRef<HTMLInputElement>;
  @ViewChild('compzSearchInput') compzSearchInput:ElementRef<HTMLInputElement>;
  @ViewChild('compzSearchBtn') compzSearchBtn:ElementRef<HTMLButtonElement>;
  @ViewChild('compzSearchCancelBtn') compzSearchCancelBtn:ElementRef<HTMLButtonElement>;
  @ViewChild('compzSearchPauseBtn') compzSearchPauseBtn:ElementRef<HTMLButtonElement>;
  @ViewChild('scraperSearchValidTxt') scraperSearchValidTxt:ElementRef<HTMLSpanElement>;
  @ViewChild('scraperSearchValidErr') scraperSearchValidErr:ElementRef<HTMLSpanElement>;
  @ViewChild('editorSearchInput') editorSearchInput:ElementRef<HTMLInputElement>;
  @ViewChild('editorReplaceInput') editorReplaceInput:ElementRef<HTMLInputElement>;
  @ViewChild('editorFindReplaceGoBtn',{read:ElementRef}) editorFindReplaceGoBtn:ElementRef;
  @ViewChild('homeEditorSubsTextbox') homeEditorSubsTextbox:ElementRef<HTMLDivElement>;
  @ViewChild('hcsPlayer') hcsPlayer:ElementRef<HTMLDivElement>;
  @ViewChild('hcsEditor') hcsEditor:ElementRef<HTMLDivElement>;
  @ViewChild('hcsScraper') hcsScraper:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayList') hcaPlayList:ElementRef<HTMLDivElement>;
  @ViewChild('playListSortSelect') playListSortSelect:ElementRef<HTMLSelectElement>;
  @ViewChild('projectPLSelect') projectPLSelect:ElementRef<HTMLSelectElement>;
  @ViewChild('projectPLNameInput') projectPLNameInput:ElementRef<HTMLInputElement>;
  @ViewChild('projectPLNameSaveBtn') projectPLNameSaveBtn:ElementRef<HTMLButtonElement>;
  @ViewChild('projectPLVisWrapper') projectPLVisWrapper:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayEqualiser') hcaPlayEqualiser:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayTrackHeader') hcaPlayTrackHeader:ElementRef<HTMLDivElement>;
  @ViewChild('playerScrollWrapper') playerScrollWrapper:ElementRef<HTMLDivElement>;
  @ViewChild('playerStaticWrapper') playerStaticWrapper:ElementRef<HTMLDivElement>;
  @ViewChild('playerScrollText') playerScrollText:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayTrackTitle') hcaPlayTrackTitle:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayTrackMeta') hcaPlayTrackMeta:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayVis') hcaPlayVis:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayProgressBar') hcaPlayProgressBar:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayStatus') hcaPlayStatus:ElementRef<HTMLDivElement>;
  @ViewChild('hcaPlayerVolCtrl') hcaPlayerVolCtrl:ElementRef<HTMLDivElement>;
  debouncedScrapeVal=_.debounce((status:string,err?:string)=>this.doScrapeVal(status,err),500,{});
  headEle:any|null=null;
  wrapEle:any|null=null;
  debouncedSaveStates=_.debounce(()=>this.bouncedSS(),2000,{});
  hcSections:any={
    hcsPlayer:['hcaPlayList','hcaPlayEqualiser','hcaPlayTrackHeader','hcaPlayVis','hcaPlayProgressBar','hcaPlayStatus','hcaPlayRate','hcaPlayerVolCtrl'],
    hcsEditor:['hcaEditFileHeader','hcEditTBoxEditBtns','hcEditTBoxCanvas','hcEditTBoxFooterBtns'],
    hcsScraper:['hcaScrapeSearchCol','hcaScrapeResultsCol','hcaScrapeSelectCol']
  };
  loadPop:HTMLIonLoadingElement;
/////////////////////////////////////////////////////////
  routesParamsOnce:boolean=false;
  compzRoute:string|null=null;
  homeInitParams:any|null=null;
  homeSStates:HomeStates|null=null;
  homeProject:AppProject|null=null;
  homeProjectReady:boolean=false;
/////////////////////////////////////////////////////////
// PLAYER ///////////////////////////////////////////////
  homeCMIsOpen:boolean=false;
  isPlayerTTScroll:boolean=true;
  playBtnFns:string[]=['rate','prev','back','play','pause','stop','fwd','next','loop','mute','max','volume'];
  playerCtrls:HomePlayerCtrls={play:false,pause:false,stop:true,loop:false};
  showNoPPLsWarning:boolean=false;
  mainPlayerPtys:HomePlayerPtys={
    plLoaded:null,
    isLoaded:false,
    isListen:false,
    canPlay:false,
    playerStatusTxt:'',
    elapsedVal:'',
    durationVal:'',
    timelineTicks:[],
    cursorSeekInfo:null,
    backFWDLeftX:0,
    scrubHead:{init:false,pos:0,isDrag:false},
    progressVal:0,
    volumeVal:0.5,
    volumeTxt:'50%',
    rateVal:1,
    isMute:false,
    isLoop:false
  };
  trackLine:any={
    mouseIn:false,
    left:0,
    infoNo:0,
    outX:0,
    outW:0,
  };
  //-----------------------------------------------------
  dragulaPLSubs:any;
  dragulaPLItems:any;
  dragulaPLDragItem:any;
  dragulaPLIsDrag:boolean=false;
  plDDZoneActive:boolean=false;
  //----------
  dragulaSourceSubs:any;
  dragulaSourceItems:any;
  dragulaSourceDragItem:any;
  dragulaSourceIsDrag:any;
  //-----------------------------------------------------
  homeMouseInSection:string='';
  homeMouseInArea:string='';
  plItemHovered:string='';
  plItemSelected:string='';
  playerFileReady:boolean=false;
//-----------------------------------------------------
// EDITOR /////////////////////////////////////////////
  pathsObj:AppPaths|null=null;
  binPaths:any|null=null;
  mpegExePath:string|null=null;
  probeExePath:string|null=null;
  playExePath:string|null;
  ytdlExePath:string|null;
  editPlyrIsListen:boolean=false;
  pProgObj:HomeEditProgObj;
  pFrame:boolean=false;
  pFrameId:any;
  vizFrame:boolean=false;
  vizFrameId:any;
  audioCTX:AudioContext|null=null;
  audioSRC:MediaElementAudioSourceNode|null=null;
  vizAnalyser:AnalyserNode|null=null;
  vizBufferLength:number;
  vizDataArray:Uint8Array;
  gridWrap:HTMLDivElement;
  gridCanvas:HTMLCanvasElement;
  gridContext:CanvasRenderingContext2D;
  waveProgX:number=0;
  gridProgColNo:number=0;
  editWavePng:string;
  vizInitDone:boolean=false;
  editThumbsReady:boolean=false;
  editThumbs:HomeThumbObject[]=[];
//-----------------------------------------------------
  editPos:number=0;
  editTicks:HomeEditTick[]=[];
  editDur:number;
  editPlyrPtys:any={
    isPlay:<boolean>false,
    isPause:<boolean>false,
    isLoaded:<boolean>false,
    loop:<boolean>true,
    selection:<boolean>true,
    rate:<number>1,
    mute:<boolean>false,
    spaceListen:<boolean>false
  };
  editSelect:any={
    mouseIn:<boolean>false
  };
  editDrawRectContext:CanvasRenderingContext2D;
  editDrawMouseDown:boolean=false;
  editDrawClicks:HomeEditDrawClicks={start:{x:0,y:0,t:0},end:{x:0,y:0,t:0},ttl:{time:0,perc:0}};
  editSelectRange:HomeEditSelectRange|null=null;
  showEditSelectRangeInputs:boolean=false;
  editShouldSave:boolean=true;
//-----------------------------------------------------
// SCRAPER ////////////////////////////////////////////
  searchTypeTO:any;
  searchInt:any;
  searchOrderOpts:string[]=['date','relevance','rating','title','videoCount','viewCount'];
  processInProgress:boolean=false;
  singleDLItemId:string='';
  processStatus:any={itemNo:<number|null>null,ttlItems:<number|null>null};
  addTProgTxt:string='';
  scrapeSubsSpin:boolean=false;
  snipLimitTypeSelect:string='exact';
  snipPrevDLProg:any={
    inProg:<boolean>false,
    av:<string|null>null,
    vId:<string|null>null,
    perc:<number|null>null,
    txt:<string|null>null
  };
  //-----------------------------------------------------
  snipPrevPlayState:any={
    id:<string|null>null,
    isPlay:<boolean>false,
    isPaused:<boolean>false,
    isGroup:<boolean>false,
    isErr:<boolean>false
  };
  cleanPrevSrc:any;
  cleanBGImgSrc:any;
  prevPlyrType:string|null=null;
  prevPlyrReady:boolean=false;
  showWordPeaks:boolean=false;
  prevPlyrWordPeaks:HomeSnipWordPeak[]|null=null;
  prevPlyrWordsArr:string[]=[];
  peakWord:string='';
  peakPos:string='auto';
  peakWordMatch:boolean=false;
/////////////////////////////////////////////////////////
  constructor(
    private logger:NGXLogger,
    private ytServ:YTubeService,
    private evServ:EventsService,
    private changeDet:ChangeDetectorRef,
    private renderer:Renderer2,
    private router:Router,
    private vizServ:HowlerService,
    private ffServ:FFMPEGService,
    private dragulaService:DragulaService,
    public navCtrl:NavController,
    private sanitizer:DomSanitizer,
    private loaderPop:LoadingController
    ){
      const gCNRes:Navigation=this.router.getCurrentNavigation();
      if(gCNRes&&gCNRes.hasOwnProperty('extras')&&!_.isEmpty(gCNRes.extras)&&gCNRes.extras.hasOwnProperty('state')&&gCNRes.extras.state){this.homeInitParams=gCNRes.extras.state.homeInitParams}
      else{this.homeInitParams=null};
      if(!this.routesParamsOnce){
        this.router.events.subscribe(async(event:Event)=>{
          if(event instanceof NavigationEnd){
            const neP:string=event.url.replace('/','');
            if(neP.length>0&&neP!==this.compzRoute){
              this.compzRoute=neP;ipcRenderer.send('set-compz-route',[this.compzRoute]);this.cCons('[HOME|ROUTE] >>> '+this.compzRoute);
              if(this.compzRoute!=='launcher'){this.homeInitParams=null;this.cCons('[HOME|INITPARAMS] Cleared (null)')};
            }
          }
        });
        this.routesParamsOnce=true;
      };
    }
/////////////////////////////////////////////////////////
  async ngOnInit(){this.cCons('(ngOnInit)...');
    if(!this.homeInitParams){alert('[home|ngOnInit] Missing this.homeInitParams!');return};
    if(!this.compzRoute||this.compzRoute.trim().length<1){
      this.compzRoute=this.router.url.replace('/','');
      ipcRenderer.send('set-compz-route',[this.compzRoute])
    };
    const gotCPRes:null|AppPaths =await ipcRenderer.invoke('getCompzPaths');
    if(gotCPRes!==null){
      this.pathsObj=gotCPRes;
      this.binPaths=gotCPRes.binary;
      for(const[k,v]of Object.entries(this.pathsObj.binary)){
        const gVK:string=String(k).replace('ff','')+'ExePath';
        if(v){this[gVK]=v};
      };
    };
    await this.homeEVServChannels('add');
    await this.homeIPCListeners();
  }
  //-----------------------------------------------------
  async ngOnDestroy(){
    this.cCons('[########## HOME - NG DESTROYED ############]');
    if(this.homeSStates&&this.homeSStates.playerFile&&this.playerCtrls.play){this.mainMediaPlayer('stop')};
    await this.homeEVServChannels('remove');
    this.homeInitParams=null;
    this.homeSStates=null;
    this.homeProject=null;
    this.homeProjectReady=false;
    this.dragulaPLSubs.unsubscribe();
    this.dragulaSourceSubs.unsubscribe();
  }
  //-----------------------------------------------------
  async ngAfterViewInit(){this.cCons('(ngAfterViewInit)...');
    if(this.homeInitParams.hasOwnProperty('project')&&!_.isEmpty(this.homeInitParams)){
      this.homeProject=this.homeInitParams.project;
      this.cCons('(ngOnInit) this.homeProject SET TO: '+this.homeProject.projectName);
      await this.showLoader('Loading '+this.homeProject.projectName);
      await this.setSaveStates();
      await this.closeLoader();
      let ssRDFFiles:number=0;for(let i=0;i<this.homeSStates.rdfSummary.length;i++){ssRDFFiles+=this.homeSStates.rdfSummary[i].files};
      let hdRDFFiles:number=0,tPaths:string[]=[];const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,tKeys:string[]=['sub','audio','video'];
      for(let i=0;i<tKeys.length;i++){const tP:string=path.join(pPath,'scrapeTargets/'+tKeys[i]);tPaths.push(tP)};
      for(let i=0;i<tPaths.length;i++){if((await this.exists(tPaths[i]))){const dList:string[]=await readdir(tPaths[i]);if(dList.length>0){hdRDFFiles+=dList.length}}};
      await this.xml2JsonTxtFiles('all');
      await this.checkAVFiles();
      if(ssRDFFiles!==hdRDFFiles){this.rdfUpdateCounts()};
      const getIPRegLan:any=await ipcRenderer.invoke('getIPRegionLang');
      if(!_.isEqual(getIPRegLan,this.homeSStates.ipRegionLang)){this.homeSStates.ipRegionLang=getIPRegLan};
      this.cCons('(ngOnInit) initHomeSStates COMPLETED - OK');
      await this.initDragulaPLItems();
      await this.initDragulaSTItems();
    }else{alert('[home|ngOnInit] Missing this.homeInitParams.project/this.homeProject!');return};
  }
/////////////////////////////////////////////////////////
  capd(s:string):string{return s.charAt(0).toUpperCase()+s.slice(1)}
  removeDir(p:string):Promise<boolean>{if(fs.existsSync(p)){let rfs:any=fs.readdirSync(p);if(rfs.length>0){rfs.forEach((fn:any)=>{if(fs.statSync(p+'/'+fn).isDirectory()){this.removeDir(p+'/'+fn)}else{fs.unlinkSync(p+'/'+fn)}});fs.rmdirSync(p)}else{fs.rmdirSync(p)};return Promise.resolve(true)}else{return Promise.resolve(false)}}
  async renameDir(oldP:string,newP:string):Promise<boolean>{try{await rename(oldP,newP);return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}}
  //-----------------------------------------------------
  async showLoader(msg:string):Promise<boolean>{
    let sLOpts:LoadingOptions={spinner:'dots',message:msg,cssClass:'compz-loader-pop',showBackdrop:true,animated:true,backdropDismiss:false,mode:'md'};
    this.loadPop=await this.loaderPop.create(sLOpts);
    await this.loadPop.present();
    return Promise.resolve(true);
  }
  //-----------------------------------------------------
  async closeLoader():Promise<boolean>{await this.loadPop.dismiss();return Promise.resolve(true)};
  //-----------------------------------------------------
  pDOM(){this.changeDet.detectChanges()}
  //-----------------------------------------------------
  async pCmds():Promise<boolean>{const isE=(c:string):boolean=>{return (document.queryCommandEnabled(c))};for(let i=0;i<this.homeSStates.eCmds.allArr.length;i++){const cK:string=this.homeSStates.eCmds.allArr[i];this.homeSStates.eCmds[cK]=isE(cK)};return Promise.resolve(true)}
  //-----------------------------------------------------
  cCons(txt:string){this.logger.info('[home|cCons|logger.info] '+txt)};
/////////////////////////////////////////////////////////
  async setSaveStates():Promise<boolean>{
    const readHomePrefs:any=await ipcRenderer.invoke('readProjPrefsFile',['home']);
    if(readHomePrefs.r){
      this.homeSStates=readHomePrefs.d;
      for(const[k,v] of Object.entries(defHomeStates)){if(!this.homeSStates.hasOwnProperty(k)){this.homeSStates[k]=v}};
      this.pDOM();
      this.homeProjectReady=true;
      this.cCons('(setSaveStates) this.homeProjectReady - SET (true)');
      await this.showHideSection('init');
      if(this.homeSStates.homeFeIsOpen!==(await ipcRenderer.invoke('is-fe-open'))){
        ipcRenderer.send('fe-is-open',[this.homeSStates.homeFeIsOpen]);
        this.evServ.publish('homeFeIsOpen',this.homeSStates.homeFeIsOpen);
      };
      if(this.homeSStates.searchMode==='search'){this.searchModeRadioSearch.nativeElement.checked=true;this.searchModeRadioScrape.nativeElement.checked=false}
      else{this.searchModeRadioSearch.nativeElement.checked=false;this.searchModeRadioScrape.nativeElement.checked=true};
      if(this.homeSStates.searchLimits.search.orderby!=='relevance'){this.ytServ.searchOrderBy=this.homeSStates.searchLimits.search.orderby};
      if(this.homeSStates.searchLimits.search.maxmatch!==50){this.ytServ.matchMax=this.homeSStates.searchLimits.search.maxmatch};
      if(this.homeSStates.searchLimits.search.maxresolve!==50){this.ytServ.resolveMax=this.homeSStates.searchLimits.search.maxresolve};
      if(this.homeSStates.playerSectionVis){
        let isLoadedIndexes:number[]=[];
        for(let i=0;i<this.homeSStates.projectPlaylists.length;i++){if(this.homeSStates.projectPlaylists[i].isLoaded){isLoadedIndexes.push(i)}};
        if(isLoadedIndexes.length>0){
          const willLoadPLIndex:number=isLoadedIndexes[0],doLoadPL:HomeProjectPlaylist=this.homeSStates.projectPlaylists[willLoadPLIndex];
          if(isLoadedIndexes.length>1){for(let i=0;i<this.homeSStates.projectPlaylists.length;i++){if(i!==willLoadPLIndex){this.homeSStates.projectPlaylists[i].isLoaded=false}}};
          await this.plListFileActions('select',null,doLoadPL);
        }else{this.mainPlayerPtys.isLoaded=null};
      };
      return Promise.resolve(true);
    }else{
      this.cCons('(setSaveStates|IPC->readProjPrefsFile) ERROR: Read File (compzPrefs.json): !FAILED!');
      alert('HOME|setSavedStates: Failed to Read Project Prefs JSON');
      return Promise.resolve(true);
    }
  }
  //-----------------------------------------------------
  async bouncedSS():Promise<boolean>{
    const hasPrefsFile:boolean=await ipcRenderer.invoke('isProjectLoaded');
    if(hasPrefsFile){
      const writeHomePrefs:boolean=await ipcRenderer.invoke('writeProjPrefsFile',[this.homeSStates,'homeStates']);
      if(writeHomePrefs){return Promise.resolve(true)}else{this.cCons('(doSaveStates|IPC->writeProjPrefsFile): FAIL');return Promise.resolve(false)}
    };
    return Promise.resolve(true);
  }
  //-----------------------------------------------------
  async doSaveStates():Promise<boolean>{this.debouncedSaveStates();return Promise.resolve(true)}
/////////////////////////////////////////////////////////
  homeIPCListeners():Promise<boolean>{
    ipcRenderer.on('new-compz-route',(e:any,args:any[])=>{if(this.compzRoute!==args[0]){this.compzRoute=args[0]}});
    ipcRenderer.on('app-will-quit',async()=>{this.evServ.publish('will-quit-home-ss',this.homeSStates)});
    ipcRenderer.on('main-context-menu-open',async()=>{if(!this.homeCMIsOpen){this.homeCMIsOpen=true}});
    ipcRenderer.on('fe-is-open-changed',async(e:any,args:any[])=>{
      this.headEle=document.getElementById('scrubhead');this.wrapEle=document.getElementById('scrubwrap');
      this.vizServ.vizResize();
    });
    ipcRenderer.on('editorDoSaveClose',async()=>{ipcRenderer.send('editorSaveDone',[true])});
    ipcRenderer.on('cm-fe-add2playlist',async(e:any,args:any[])=>{this.loadFiles('player',args[0])});
    ipcRenderer.on('cm-fe-loadInEditor',async(e:any,args:any[])=>{this.loadFiles('editor',args[0])});
    ipcRenderer.on('cm-player-playlist-edit',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3],args[4])});
    ipcRenderer.on('cm-player-playlist-play',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3],args[4])});
    ipcRenderer.on('cm-player-playlist-remove',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3],args[4])});
    ipcRenderer.on('cm-player-playlist-rename',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3],args[4])});
    ipcRenderer.on('cm-player-playlist-viewinfo',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3],args[4])});
    ipcRenderer.on('cm-player-playlist-mark',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3],args[4])});
    ipcRenderer.on('cm-player-playlist-clearall',async(e:any,args:any[])=>{this.homeCMActions(args[1],args[2],args[3])});
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  initDragulaPLItems():Promise<boolean>{
    this.dragulaPLSubs=new Subscription();
    this.dragulaPLItems='dragulaPLItems';
    const dragulaPLOpts:DragulaOptions={revertOnSpill:true};
    this.dragulaService.createGroup(this.dragulaPLItems,dragulaPLOpts);
    //------------------------
    this.dragulaPLSubs.add(this.dragulaService.drag(this.dragulaPLItems).subscribe((dragEv)=>{
      this.dragulaPLIsDrag=true;
      const plItemIndex:number=Number(dragEv.el.id.replace('pli',''));
      this.dragulaPLDragItem=this.mainPlayerPtys.plLoaded.items[plItemIndex];
      this.cCons('(dragulaPLItems) [onDRAG]: '+this.dragulaPLDragItem.cname);
    }));
    this.dragulaPLSubs.add(this.dragulaService.cancel(this.dragulaPLItems).subscribe(async(cancelEv)=>{
      this.cCons('(dragulaPLItems) [onCANCEL]: '+this.dragulaPLDragItem.cname);
      if(this.plDDZoneActive){
        this.cCons('(dragulaPLItems) [IN-DELETE-DROP-ZONE]: TRUE');
        cancelEv.el.remove();
        this.homeCMActions('hcsPlayer','hcaPlayList','remove',this.dragulaPLDragItem);
      };
      this.dragulaPLIsDrag=false;
      this.dragulaPLDragItem=null;
    }));
    this.dragulaPLSubs.add(this.dragulaService.dropModel(this.dragulaPLItems).subscribe(async(dropEv)=>{
      this.cCons('(dragulaPLItems) [onDROPMODEL]: '+this.dragulaPLDragItem.cname);
      if(!_.isEqual(dropEv.sourceModel,dropEv.targetModel)){if(this.homeSStates.plSort.by!==null){this.homeSStates.plSort.by=null}};
      this.evServ.publish('updateBA','Playlist|Reorder: '+this.dragulaPLDragItem.cname+' ('+String(dropEv.sourceIndex+1)+' > '+String(dropEv.targetIndex+1)+')');
      this.dragulaPLIsDrag=false;
      this.dragulaPLDragItem=null;
    }));
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  initDragulaSTItems():Promise<boolean>{
    this.dragulaSourceSubs=new Subscription();
    this.dragulaSourceItems='dragulaSourceItems';
    const dragulaSourceOpts:DragulaOptions={
      moves:(el,container,handle,sibling)=>{return container.id!=='scrapetargetlist'},
      accepts:(el,target,source,sibling)=>{return (target.id==='scrapetargetlist')},
      direction:'vertical',
      copy:(el,source)=>{return (source.id.split('-')[0]!=='targets')},
      copyItem:(item:HomeSearchSourceResultItem)=>({...item}),
      copySortSource:false,
      revertOnSpill:true,
      removeOnSpill:false
    };
    this.dragulaService.createGroup(this.dragulaSourceItems,dragulaSourceOpts);
    //------------------------
    this.dragulaSourceSubs.add(this.dragulaService.drag(this.dragulaSourceItems).subscribe((dragEv)=>{
      this.dragulaSourceIsDrag=true;
      const nI:string[]=dragEv.el.id.split('-');
      this.dragulaSourceDragItem=this.homeSStates.searchSourceResults[nI[0]][Number(nI[1])];
      console.log(this.dragulaSourceDragItem);
      this.cCons('(dragulaSourceItems) [DRAG]: '+this.dragulaSourceDragItem.title+' (from) '+nI[0]);
    }));
    this.dragulaSourceSubs.add(this.dragulaService.drop(this.dragulaSourceItems).subscribe(async(dropEv)=>{
      console.log('(dragulaSourceItems) [DROP]: '+this.dragulaSourceDragItem.title+' (copied-to) '+dropEv.target.id);
      this.evServ.publish('updateBA','ScrapeTargets|Added: '+this.dragulaSourceDragItem.title+' ('+this.capd(this.dragulaSourceDragItem.type)+')');
      const existSSItemIndex:number=this.homeSStates.searchSourceResults[this.dragulaSourceDragItem.type+'s'].findIndex((ssO:HomeTargetItem)=>ssO.itemID===this.dragulaSourceDragItem.itemID);
      this.homeSStates.searchSourceResults[this.dragulaSourceDragItem.type+'s'][existSSItemIndex].isTarget=true;
      this.initProcessScrapeTarget(this.dragulaSourceDragItem.itemID);
      this.dragulaSourceDragItem=null;
      this.dragulaSourceIsDrag=false;
    }));
    this.dragulaSourceSubs.add(this.dragulaService.over(this.dragulaSourceItems).subscribe((overEv)=>{
      console.log('(dragulaSourceItems) [OUT]: '+this.dragulaSourceDragItem.title+' (left) '+overEv.container.id);
    }));
    this.dragulaSourceSubs.add(this.dragulaService.cancel(this.dragulaSourceItems).subscribe((cancelEv)=>{
      console.log('(dragulaSourceItems) [CANCEL]: '+this.dragulaSourceDragItem.title+' (back-to) '+cancelEv.container.id);
      this.dragulaSourceDragItem=null;
      this.dragulaSourceIsDrag=false;
    }));
    return Promise.resolve(true);
  }
//////////////////////////////////////////////////////////
  mainPlayerListeners(action:string){
    this.cCons('mainPlayerListeners('+action+')...');
    if(action==='add'){
      this.playerVideoPlayer.nativeElement.addEventListener('loadedmetadata',(lmd)=>{console.log('[vPlyr|loaded]');
        this.setPlayerProgress(0,true,true,true);
        this.mainPlayerPtys.isLoaded=true;
        this.mainPlayerPtys.playerStatusTxt='loaded';
        this.pDOM();
      });
      this.playerVideoPlayer.nativeElement.addEventListener('canplaythrough',async()=>{console.log('[vPlyr|canplaythrough]');
        this.mainPlayerPtys.playerStatusTxt='ready';
        this.pDOM();
        const isplaying=():boolean=>{const vidEle:HTMLVideoElement=this.playerVideoPlayer.nativeElement;if(vidEle.currentTime>0&&!vidEle.paused&&!vidEle.ended){return true}else{return false}};
        this.mainPlayerPtys.durationVal=Number(this.homeSStates.playerFile.duration).toFixed(2);
        const bestDurNo:number=Number(this.mainPlayerPtys.durationVal),subTNo:number=bestDurNo/24;
        let newTicks:any[]=[],nextTVal:number=0;
        for(let i=0;i<12;i++){let tT:any={l:0,m:0};if(i===0){tT.l=0;nextTVal+=subTNo;tT.m=nextTVal.toFixed(1);newTicks.push(tT)}else{nextTVal+=subTNo;tT.l=nextTVal.toFixed(1);nextTVal+=subTNo;tT.m=nextTVal.toFixed(1);newTicks.push(tT)}};
        this.mainPlayerPtys.canPlay=true;
        this.mainPlayerPtys.timelineTicks=newTicks;
        if(this.playerCtrls.play&&!isplaying()){await this.playerVideoPlayer.nativeElement.play()}
        else if(this.playerCtrls.play&&this.playerCtrls.pause){this.mainPlayerPtys.playerStatusTxt='paused';this.pDOM()}
        else if(this.playerCtrls.stop){this.mainPlayerPtys.playerStatusTxt='stopped';this.pDOM()};
      });
      this.playerVideoPlayer.nativeElement.addEventListener('play',()=>{console.log('[vPlyr|play]');
        if(!this.playerCtrls.play){this.playerCtrls.play=true};
        if(this.playerCtrls.stop){this.playerCtrls.stop=false};
        if(this.playerCtrls.pause){this.playerCtrls.pause=false};
        this.mainPlayerPtys.playerStatusTxt='playing';
        this.pDOM();
      });
      this.playerVideoPlayer.nativeElement.addEventListener('pause',()=>{console.log('[vPlyr|pause]');
        if(!this.playerCtrls.stop){
          if(!this.playerCtrls.pause){this.playerCtrls.pause=true};
          this.mainPlayerPtys.playerStatusTxt='paused';
          this.pDOM();
        };
      });
      this.playerVideoPlayer.nativeElement.addEventListener('timeupdate',()=>{
        const vidEle:HTMLVideoElement=this.playerVideoPlayer.nativeElement;
        const isplaying=():boolean=>{if(vidEle.currentTime>0&&!vidEle.paused&&!vidEle.ended){return true}else{return false}};
        if(this.mainPlayerPtys.isLoaded&&this.mainPlayerPtys.canPlay&&this.playerCtrls.play&&isplaying()){
          if(!this.mainPlayerPtys.scrubHead.isDrag){
            const doAniProg=()=>{
              const perc:number=vidEle.currentTime/Number(this.homeSStates.playerFile.duration),prog:number=this.mainPlayerPtys.progressVal;
              if(prog!==perc){this.setPlayerProgress(perc,true,true,true)};
              requestAnimationFrame(doAniProg);
            };
            requestAnimationFrame(doAniProg);
          };
        };
      });
      this.playerVideoPlayer.nativeElement.addEventListener('ended',async()=>{console.log('[vPlyr|ended]');
        this.setPlayerProgress(0,true,true,true);
        if(this.mainPlayerPtys.isLoop||this.playerCtrls.loop){
          this.mainPlayerPtys.isLoop=this.playerCtrls.loop=true;
        }else{
          const isLastPLFile=():boolean=>{if(this.homeSStates.playerFile.path===this.mainPlayerPtys.plLoaded.items[this.mainPlayerPtys.plLoaded.items.length-1].path){return true}else{return false}};
          if(isLastPLFile()){
            if(this.homeSStates.plRepeat){this.mainMediaPlayer('load',this.mainPlayerPtys.plLoaded.items[0])}
            else{this.mainMediaPlayer('stop')};
          }else{
            const nextFIndex:number=this.mainPlayerPtys.plLoaded.items.findIndex(f=>f.path===this.homeSStates.playerFile.path)+1;
            this.mainMediaPlayer('load',this.mainPlayerPtys.plLoaded.items[nextFIndex]);
          };
        };
      });
      this.playerVideoPlayer.nativeElement.addEventListener('emptied',async()=>{console.log('[vPlyr|emptied]')});
      this.playerVideoPlayer.nativeElement.addEventListener('ratechange',()=>{console.log('[vPlyr|ratechange]');
        const newRate:any=this.playerVideoPlayer.nativeElement.playbackRate;
        this.mainPlayerPtys.rateVal=newRate;
        this.evServ.publish('updateBA','Player|Control: Playback Speed '+String(newRate)+'x');
      });
      this.playerVideoPlayer.nativeElement.addEventListener('volumechange',()=>{console.log('[vPlyr|volumechange/muted]');
        let muteSB:boolean=false;
        const isMuteChange=():boolean=>{if(this.mainPlayerPtys.isMute!==this.playerVideoPlayer.nativeElement.muted){return true}else{return false}};
        if(isMuteChange()){
          muteSB=true;
          const newMuteVal:boolean=this.playerVideoPlayer.nativeElement.muted;
          let sbTxt:string='';newMuteVal?sbTxt='Muted':sbTxt='Unmuted';
          this.mainPlayerPtys.isMute=newMuteVal;
          this.evServ.publish('updateBA','Player|Control: Audio '+sbTxt);
        };
        let newVolVal:number=this.playerVideoPlayer.nativeElement.volume;
        this.mainPlayerPtys.volumeVal=newVolVal;
        this.mainPlayerPtys.volumeTxt=String(Math.round(this.mainPlayerPtys.volumeVal*100))+'%';
        if(!muteSB){this.evServ.publish('updateBA','Player|Control: Volume '+this.mainPlayerPtys.volumeTxt)};
      });
      this.mainPlayerPtys.isListen=true;
      return Promise.resolve(true);
    //-----------------
    }else{
      this.playerVideoPlayer.nativeElement.removeAllListeners();
      this.mainPlayerPtys.isListen=false;
      return Promise.resolve(true);
    };
  }
//////////////////////////////////////////////////////////
  async mainMediaPlayer(action:string,fileObj?:HomePPLItem,data?:any):Promise<boolean>{
    this.cCons('mainMediaPlayer('+action+',fileObj,data)...');
    if(data){console.log(data)};
    let pM:string,sbT:string;const dirCtrlBtns:string[]=['prev','back','fwd','next'];
    if(action==='loop'){this.playerCtrls[action]?pM='[-]':pM='[+]';sbT='Player|Control: '+pM+' '+this.capd(action);this.cCons('(mainMediaPlayer) '+sbT);this.evServ.publish('updateBA',sbT)};
    if(dirCtrlBtns.includes(action)){action==='prev'||action==='next'?action==='prev'?pM='[<] Previous Item':pM='[>] Next Item':action==='back'?pM='[<<] Seek Backward':pM='[>>] Seek Forward';sbT='Player|Control: '+pM;this.cCons('(mainMediaPlayer) '+sbT);this.evServ.publish('updateBA',sbT)};
    switch(action){
      //--------------------
      case 'updatelist':this.cCons('(mMP|updatelist)');
        const vidEle:HTMLVideoElement=this.playerVideoPlayer.nativeElement;
        const isplaying=():boolean=>{if(this.playerCtrls.play&&vidEle.currentTime>0&&!vidEle.paused&&!vidEle.ended){return true}else{return false}};
        const mainPLLoaded=():boolean=>{if(this.mainPlayerPtys.plLoaded&&this.mainPlayerPtys.plLoaded.hasOwnProperty('name')&&this.mainPlayerPtys.plLoaded.name){return true}else{return false}};
        if(mainPLLoaded()){
          if(this.mainPlayerPtys.plLoaded.items.length>0){
            this.cCons('(mainMediaPlayer|updatelist) Playlist Has Files (plLoaded.items.length>0)');
            if(this.homeSStates.playerFile){
              let wasPlaying:boolean=isplaying();
              const pFExists:number=this.mainPlayerPtys.plLoaded.items.filter(plO=>plO.path===this.homeSStates.playerFile.path).length;
              if(pFExists<1){
                if(wasPlaying){await this.mainMediaPlayer('stop')};
                if(this.mainPlayerPtys.isLoaded){await this.mainMediaPlayer('unload')};
                if(this.homeSStates.playerFile){this.homeSStates.playerFile=null;ipcRenderer.send('player-file-loaded',[null])};
                await this.mainMediaPlayer('load',this.mainPlayerPtys.plLoaded.items[0]);
              }else{
                if(!this.mainPlayerPtys.isLoaded){await this.mainMediaPlayer('load',this.mainPlayerPtys.plLoaded.items[0])};
              };
            }else{await this.mainMediaPlayer('load',this.mainPlayerPtys.plLoaded.items[0])};
          }else{
            this.cCons('(mainMediaPlayer|updatelist) Playlist Has NO Files (plLoaded.items.length===0)');
            if(this.mainPlayerPtys.isLoaded){this.mainPlayerPtys.isLoaded=false};
            if(this.playerVideoPlayer.nativeElement.src){this.playerVideoPlayer.nativeElement.load()};
            if(this.homeSStates.playerFile){this.homeSStates.playerFile=null;ipcRenderer.send('player-file-loaded',[null])};
          }
        }else{
          this.cCons('(mainMediaPlayer|updatelist) No Playlist Loaded (plLoaded===null)');
          if(this.mainPlayerPtys.isLoaded){this.mainPlayerPtys.isLoaded=false};
          if(this.playerVideoPlayer.nativeElement.src){this.playerVideoPlayer.nativeElement.load()};
          if(this.homeSStates.playerFile){this.homeSStates.playerFile=null;ipcRenderer.send('player-file-loaded',[null])};
        };
        break;
      //--------------------
      case 'load':this.cCons('(mMP|load)');
        let pFile:HomePPLItem;fileObj?pFile=fileObj:pFile=this.homeSStates.playerFile;
        this.homeSStates.playerFile=pFile;
        ipcRenderer.send('player-file-loaded',[this.homeSStates.playerFile]);
        if(!this.headEle||!this.wrapEle){this.headEle=document.getElementById('scrubhead');this.wrapEle=document.getElementById('scrubwrap')};
        this.setPlayerProgress(0,true,true,true);
        if(!this.mainPlayerPtys.scrubHead.init){this.scrubHeadEvents()};
        this.playerFileReady=true;
        this.pDOM();
        //-----------------------
        if(!this.mainPlayerPtys.isListen){await this.mainPlayerListeners('add')};
        //-----------------------
        this.mainPlayerPtys.isLoaded=false;
        this.mainPlayerPtys.isListen=true;
        this.mainPlayerPtys.canPlay=false;
        this.mainPlayerPtys.playerStatusTxt='loading';
        this.mainPlayerPtys.ttlMSDur=0;
        this.mainPlayerPtys.startTS=0;
        this.mainPlayerPtys.delayPadPerc=0;
        this.mainPlayerPtys.elapsedVal='';
        this.mainPlayerPtys.durationVal='';
        this.mainPlayerPtys.timelineTicks=[];
        this.mainPlayerPtys.progressVal=0;
        this.playerVideoPlayer.nativeElement.src=fileObj.path;
        //-----------------------
        break;
      //--------------------
      case 'unload':this.cCons('(mMP|unload)');this.mainPlayerPtys.isLoaded=false;this.playerVideoPlayer.nativeElement.load();break;
      //--------------------
      case 'playthis':
        this.cCons('(mMP|playthis)');
        const isLoadedFile=():boolean=>{if(this.homeSStates.playerFile.path===fileObj.path){return true}else{return false}};
        if(isLoadedFile()){this.playerVideoPlayer.nativeElement.currentTime=0;this.setPlayerProgress(0,true,true,true)}
        else{await this.mainMediaPlayer('load',fileObj,null)};
        await this.mainMediaPlayer('play');
        break;
      //--------------------
      case 'play':
        this.cCons('(mMP|play)');
        if(this.playerCtrls.pause){this.playerCtrls.pause=false};
        this.playerVideoPlayer.nativeElement.play();
        break;
      //--------------------
      case 'pause':this.cCons('(mMP|pause)');
        if(!this.playerCtrls.stop){
          if(this.playerCtrls.pause){this.playerCtrls.pause=false;this.playerVideoPlayer.nativeElement.play()}
          else{this.playerVideoPlayer.nativeElement.pause()};
        };
        break;
      //--------------------
      case 'stop':this.cCons('(mMP|stop)');
        this.playerCtrls.play=false;this.playerCtrls.pause=false;this.playerCtrls.stop=true;
        this.playerVideoPlayer.nativeElement.pause();
        this.playerVideoPlayer.nativeElement.currentTime=0;
        this.setPlayerProgress(0,true,true,true);
        this.mainPlayerPtys.playerStatusTxt='stopped';
        this.evServ.publish('updateBA','Player|Playback: Stopped ('+this.homeSStates.playerFile.cname+')');
        break;
      //--------------------
      case 'mute':this.cCons('(mMP|mute)');
        let newMuteTF:boolean=this.mainPlayerPtys.isMute;this.mainPlayerPtys.isMute?newMuteTF=false:newMuteTF=true;
        this.playerVideoPlayer.nativeElement.muted=newMuteTF;
        break;
      //--------------------
      case 'loop':this.cCons('(mMP|loop)');
        let newLoopTF:boolean=this.mainPlayerPtys.isLoop;this.mainPlayerPtys.isLoop?newLoopTF=false:newLoopTF=true;
        let sbT:string='';newLoopTF?sbT='[+]':sbT='[-]';
        this.mainPlayerPtys.isLoop=newLoopTF;
        this.playerCtrls.loop=newLoopTF;
        this.playerVideoPlayer.nativeElement.loop=newLoopTF;
        this.evServ.publish('updateBA','Player|Loop: '+sbT+' Loop Item ('+this.homeSStates.playerFile.cname+')');
        break;
      //--------------------
      case 'rate':this.cCons('(mMP|rate)');this.playerVideoPlayer.nativeElement.playbackRate=data;break;
      //--------------------
      case 'volume':this.cCons('(mMP|volume)');this.playerVideoPlayer.nativeElement.volume=data;break;
      //--------------------
      case 'max':this.cCons('(mMP|max)');this.playerVideoPlayer.nativeElement.volume=1;break;
      //--------------------
      case 'seek':this.cCons('(mMP|seek)');
        const seek2Secs:number=Number(this.mainPlayerPtys.durationVal)*data;
        this.setPlayerProgress(data,true,true,true);
        this.playerVideoPlayer.nativeElement.currentTime=seek2Secs;
        if(this.playerCtrls.play&&!this.playerCtrls.pause){this.mainPlayerPtys.playerStatusTxt='playing'};
        if(this.playerCtrls.play&&this.playerCtrls.pause){this.mainPlayerPtys.playerStatusTxt='paused'};
        if(this.playerCtrls.stop){this.mainPlayerPtys.playerStatusTxt='stopped'};
        break;
      //--------------------
      case 'prev':this.cCons('(mMP|prev)');
        this.mainPlayerPtys.playerStatusTxt='◄ skip';
        const prevCIndex:number=this.mainPlayerPtys.plLoaded.items.findIndex(plO=>plO.path===this.homeSStates.playerFile.path);
        const prevPIndex:number=prevCIndex-1;
        let prevFileObj:any|null=null;
        if(prevPIndex<0){prevFileObj=this.mainPlayerPtys.plLoaded.items[this.mainPlayerPtys.plLoaded.items.length-1]}
        else{prevFileObj=this.mainPlayerPtys.plLoaded.items[prevPIndex]};
        this.mainMediaPlayer('load',prevFileObj);
        break;
      //--------------------
      case 'next':this.cCons('(mMP|next)');
        this.mainPlayerPtys.playerStatusTxt='skip ►';
        const nextCIndex:number=this.mainPlayerPtys.plLoaded.items.findIndex(plO=>plO.path===this.homeSStates.playerFile.path);
        const nextPIndex:number=nextCIndex+1;
        let nextFileObj:any|null=null;
        if(nextPIndex<this.mainPlayerPtys.plLoaded.items.length){nextFileObj=this.mainPlayerPtys.plLoaded.items[nextPIndex]}
        else{nextFileObj=this.mainPlayerPtys.plLoaded.items[0]};
        this.mainMediaPlayer('load',nextFileObj);
        break;
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  homeEVServChannels(action:'add'|'remove'):Promise<boolean>{
    if(action==='add'){
      this.evServ.subscribe('doPDom',()=>{this.pDOM()});
      this.evServ.subscribe('appTxtSelection',async aTSData=>{this.homeSStates.tSelO=aTSData.txtSelection;this.homeSStates.eCmds=aTSData.eCmds;await this.pCmds()});
      this.evServ.subscribe('homeFeIsOpen',async tf=>{
        if(this.homeSStates.homeFeIsOpen!==tf){this.homeSStates.homeFeIsOpen=tf};
        if((await ipcRenderer.invoke('is-fe-open'))!==tf){ipcRenderer.send('fe-is-open',[tf])}
      });
      this.evServ.subscribe('invoke-home-cps-data',()=>{this.evServ.publish('handle-home-cps-data',this.homeSStates)});
    }else{
      this.evServ.destroy('doPDom');
      this.evServ.destroy('hwlProgress');
      this.evServ.destroy('hwlEvent');
      this.evServ.destroy('appTxtSelection');
      this.evServ.destroy('homeFeIsOpen');
      this.evServ.destroy('invoke-home-cps-data');
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  setPlayerProgress(perc:number,head:boolean,bar:boolean,time:boolean){
    this.headEle=document.getElementById('scrubhead');
    this.wrapEle=document.getElementById('scrubwrap');
    if(!this.mainPlayerPtys.scrubHead.isDrag){
      if(head){
        let nLNo:number=0,maxL:number=this.wrapEle.offsetWidth-this.headEle.offsetWidth;
        nLNo=Math.round(maxL*perc);
        if(nLNo<0){nLNo=0};
        if(nLNo>maxL){nLNo=maxL};
        this.mainPlayerPtys.scrubHead.pos=nLNo;
        const nLStr=String(nLNo)+'px';
        this.headEle.style.left=nLStr;
      };
      if(bar){this.mainPlayerPtys.progressVal=perc};
      if(time){
        let nElap:number=Number(this.mainPlayerPtys.durationVal)*perc;
        nElap=Number(nElap.toFixed(2));
        if(nElap<0||nElap-0.01===0){nElap=0};
        if(nElap>Number(this.mainPlayerPtys.durationVal)||nElap+0.01===Number(this.mainPlayerPtys.durationVal)){nElap=Number(this.mainPlayerPtys.durationVal)};
        let progStr:string=nElap.toFixed(2);
        if(this.mainPlayerPtys.durationVal!==''){const pDs:number=nElap.toFixed(2).split('.')[0].length,dDs:number=this.mainPlayerPtys.durationVal.split('.')[0].length,digDiff:number=dDs-pDs;if(pDs!==dDs){progStr='0'.repeat(digDiff)+progStr}};
        if(this.mainPlayerPtys.elapsedVal!==progStr){this.mainPlayerPtys.elapsedVal=progStr}
      };
      this.pDOM();
    };
  }
/////////////////////////////////////////////////////////
  trackerSeek(action:string,eV:any){
    if(!this.mainPlayerPtys.scrubHead.isDrag){
      switch(action){
        case 'enter':
          this.homeSStates.playerFile&&this.mainPlayerPtys.isLoaded?this.trackLine.mouseIn=true:this.trackLine.mouseIn=false;
          if(this.trackLine.outX===0){this.trackLine.outX=document.getElementById('plc-out').getBoundingClientRect().left};
          if(this.trackLine.outW===0){this.trackLine.outW=document.getElementById('plc-out').clientWidth};
          this.pDOM();
          break;
        case 'move':
          let cursX:number=eV.clientX-this.trackLine.outX;
          if(cursX<0){cursX=0};
          if(cursX>this.trackLine.outW){cursX=this.trackLine.outW};
          this.trackLine.left=cursX;
          this.trackLine.infoNo=(Number(this.mainPlayerPtys.durationVal)*(cursX/this.trackLine.outW));
          this.pDOM();
          break;
        case 'leave':this.trackLine.mouseIn=false;break;
        case 'click':
          const seek2Perc:number=this.trackLine.left/this.trackLine.outW;
          this.setPlayerProgress(seek2Perc,true,true,true);
          this.mainMediaPlayer('seek',this.homeSStates.playerFile,seek2Perc);
          this.pDOM();
          break;
      };
    };
  }
/////////////////////////////////////////////////////////
  adjustPlayrate(dir:string){
    this.cCons('(adjustPlayrate) adjustPlayrate('+dir+')...');
    let newR:number=0;dir==='increase'?newR=this.mainPlayerPtys.rateVal+0.5:newR=this.mainPlayerPtys.rateVal-0.5;
    this.mainMediaPlayer('rate',null,newR);
  }
/////////////////////////////////////////////////////////
  scrubHeadEvents(){
    let head:any=document.getElementById('scrubhead');
    let wrap:any=document.getElementById('scrubwrap');
    let sX:number=0;
    const onMouseMove=(e)=>{
      let nL:number=e.clientX-sX-wrap.getBoundingClientRect().left;
      if(nL<0){nL=0};
      let rE=wrap.offsetWidth-head.offsetWidth;
      if(nL>rE){nL=rE};
      this.mainPlayerPtys.scrubHead.pos=nL;
      head.style.left=nL+'px';
    };
    const onMouseUp=()=>{
      const progPerc:number=this.mainPlayerPtys.scrubHead.pos/wrap.offsetWidth;
      this.mainPlayerPtys.progressVal=progPerc;
      this.setPlayerProgress(progPerc,false,false,true);
      this.mainMediaPlayer('seek',this.homeSStates.playerFile,progPerc);
      document.removeEventListener('mouseup',onMouseUp);
      document.removeEventListener('mousemove',onMouseMove);
      this.mainPlayerPtys.scrubHead.isDrag=false;
    };
    head.onmousedown=(e)=>{
      e.preventDefault();
      this.mainPlayerPtys.scrubHead.pos=0;
      sX=e.clientX-head.getBoundingClientRect().left;
      document.addEventListener('mousemove',onMouseMove);
      document.addEventListener('mouseup',onMouseUp);
      this.mainPlayerPtys.scrubHead.isDrag=true;
    };
    head.ondragstart=()=>{return false};
    this.mainPlayerPtys.scrubHead.init=true;
  }
/////////////////////////////////////////////////////////
  hcsMouseClick(){if(this.homeCMIsOpen){this.homeCMIsOpen=false};ipcRenderer.send('cm-isopen',[false])}
/////////////////////////////////////////////////////////
  hcsMouseEnter(sName:string){
    if(this.homeCMIsOpen){this.homeCMIsOpen=false};ipcRenderer.send('cm-isopen',[false]);
    this.homeMouseInSection=sName;ipcRenderer.send('home-context-section',[sName]);
  }
  //-----------------------------------------------------
  hcaMouseEnter(aName:string){
    if(this.homeCMIsOpen){this.homeCMIsOpen=false};ipcRenderer.send('cm-isopen',[false]);
    for(const[k,v]of Object.entries(this.hcSections)){const hcs:string=String(k),hca:any=v;if(hca.includes(aName)&&this.homeMouseInSection!==hcs){this.homeMouseInSection=hcs;ipcRenderer.send('home-context-section',[hcs])}};
    this.homeMouseInArea=aName;ipcRenderer.send('home-context-area',[aName])
  }
  //-----------------------------------------------------
  plListMouseLeave(){if(!this.homeCMIsOpen){ipcRenderer.send('pl-context-file',[null]),ipcRenderer.send('home-context-section',[null])}}
  //-----------------------------------------------------
  async plItemMouseEvents(eName:string,itemObj:any){
    switch(eName){
      case 'cm':this.homeCMIsOpen=true;ipcRenderer.send('cm-isopen',[true]);break;
      case 'me':
        if(this.homeCMIsOpen){this.homeCMIsOpen=false};ipcRenderer.send('cm-isopen',[false]);
        this.plItemHovered=itemObj.path;
        ipcRenderer.send('pl-context-file',[itemObj]);
        break;
      case 'ml':if(!this.homeCMIsOpen){this.plItemHovered=''};break;
      case 'click':this.plItemSelected=itemObj.path;break;
      case 'dblclick':this.mainMediaPlayer('playthis',itemObj,null);break;
    };
  }
/////////////////////////////////////////////////////////
  async gFocusSel(n:string,v:string):Promise<boolean>{
    let gFTO:boolean=false;
    const gLoop=setInterval(()=>{
      return new Promise((resolve)=>{
        if(gFTO){clearInterval(gLoop);resolve(false)}
        else{
          setTimeout(()=>{this[n].nativeElement.value=v;
            setTimeout(()=>{this[n].nativeElement.focus();
              setTimeout(()=>{this[n].nativeElement.select();
                setTimeout(()=>{if(document.getSelection().toString()===v){clearInterval(gLoop);resolve(true)}
                },50);
              },50);
            },50);
          },50);
        };
      });
    },250);
    setTimeout(()=>{gFTO=true},1500);
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async plListFileActions(aName:string,aEvent:any,eData:any):Promise<any>{
    let plLFARes:any=true;
    this.cCons('(plListFileActions) ('+aName+',$event,'+eData+')...');
    if(eData){console.log(eData)};
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const mADir:string=path.join(pPath,'media/audio'),mVDir:string=path.join(pPath,'media/video'),mSDir:string=path.join(pPath,'media/subs');
    const plNameUniq=(nTxt:string,mode:'create'|'rename'):boolean=>{let orsN:string[]=[];if(mode==='create'){orsN=this.homeSStates.projectPlaylists.map(plO=>plO.name)}else{orsN=this.homeSStates.projectPlaylists.filter((plO:HomeProjectPlaylist)=>plO.name!==this.mainPlayerPtys.plLoaded.name).map(plO=>plO.name)};if(!orsN.includes(nTxt)){return true}else{return false}};
    switch(aName){
      case 'change': // eData=HomeProjectPlaylist.name
        if(eData!==this.mainPlayerPtys.plLoaded.name){
          const matchHPP:HomeProjectPlaylist=this.homeSStates.projectPlaylists.filter(plO=>plO.name===eData)[0];
          await this.plListFileActions('select',null,matchHPP);
        };
        break;
      case 'select': // eData=HomeProjectPlaylist
        const pPL:HomeProjectPlaylist[]=this.homeSStates.projectPlaylists;
        let selPLIndex:number=0;
        for(let i=0;i<pPL.length;i++){if(pPL[i].name===eData.name){selPLIndex=i;this.homeSStates.projectPlaylists[i].isLoaded=true}else{this.homeSStates.projectPlaylists[i].isLoaded=false}};
        this.mainPlayerPtys.plLoaded=this.homeSStates.projectPlaylists[selPLIndex];
        this.pDOM();
        if(this.projectPLSelect.nativeElement.value!==this.mainPlayerPtys.plLoaded.name){this.projectPLSelect.nativeElement.value=this.mainPlayerPtys.plLoaded.name};
        const sbTxt:string='Playlist|Select: Selected '+this.mainPlayerPtys.plLoaded.name;
        this.evServ.publish('updateBA',sbTxt);this.cCons('(plListFileActions): '+sbTxt);
        this.pDOM();
        await this.doSaveStates();
        await this.mainMediaPlayer('updatelist');
        break;
      case 'create': // eData={mode:'button'|'snip',qTxt?:snipGroupItem.q}
        let newPLObject:HomeProjectPlaylist={name:'',items:[],dirPaths:{a:'',v:'',s:''},isLoaded:false};
        const doPLInputPop=async(defPLName:string):Promise<string>=>{
          return new Promise(async(resolve)=>{
            this.evServ.subscribe('temp-popover-data',(plIPopData:any)=>{this.evServ.destroy('temp-popover-data');let retRes:string='';plIPopData.data==='cancel'||plIPopData.role==='cancel'?retRes='cancel':retRes=plIPopData.data;resolve(retRes)});
            let newPLInputPopOpts:CompzPopoverOptions={id:'newpli'+this.evServ.strFormat(new Date(),'ddMMyyHHmmss'),type:'input',title:'Create Playlist',msg:'Enter a name for your NEW Playlist',inputLabel:'Playlist Name',inputInitValue:defPLName};
            this.evServ.publish('do-compz-popover',newPLInputPopOpts);
          });
        };
        let rawDefPLName:string='playlist'+this.evServ.strFormat(new Date(),'ddMMyyhhmmss');
        if(eData.mode==='snip'&&eData.qTxt&&eData.qTxt.length>0){rawDefPLName=eData.qTxt.trim().replace(/[^a-z0-9]/gi,'').substring(0,20)};
        if(!plNameUniq(rawDefPLName,'create')){rawDefPLName=rawDefPLName+String(Math.floor(Math.random()*9000+1000))};
        const plInputPopRes:string=await doPLInputPop(rawDefPLName)
        if(plInputPopRes==='cancel'){plLFARes=false}
        else{
          let newPLName:string=plInputPopRes;
          if(!plNameUniq(newPLName,'create')||!this.evServ.isVFN(newPLName)){newPLName=newPLName.replace(/[^a-z0-9]/gi,'')+String(Math.floor(Math.random()*9000+1000))};
          newPLObject.name=newPLName;
          newPLObject.dirPaths.a=path.join(mADir,newPLName);
          newPLObject.dirPaths.v=path.join(mVDir,newPLName);
          newPLObject.dirPaths.s=path.join(mSDir,newPLName);
          let errPLPaths:string[]=[];
          for(const[ck,cv]of Object.entries(newPLObject.dirPaths)){
            if((await this.exists(cv))){await this.removeDir(cv)};
            const mDRes:boolean=await this.mkDir(cv);
            if(!mDRes){errPLPaths.push(ck)}
          };
          if(errPLPaths.length>0){for(const[k,v]of Object.entries(newPLObject.dirPaths)){if((await this.exists(v))){await this.removeDir(v)}};plLFARes=false}
          else{
            this.homeSStates.projectPlaylists.push(newPLObject);
            this.evServ.publish('updateBA','Playlist|Created: '+newPLObject.name);
            this.cCons('(plListFileActions): Playlist|Created: '+newPLObject.name);
            await this.plListFileActions('select',null,newPLObject);
            plLFARes=newPLObject;
          };
        };
        break;
      case 'rename': // eData=null
        const matchProjPLIndex:number=this.homeSStates.projectPlaylists.findIndex(ppl=>ppl.name===this.mainPlayerPtys.plLoaded.name);
        if(matchProjPLIndex===-1){console.log('(plListFileActions|rename) Failed to Match plLoaded=>projectPlaylists');return Promise.resolve(false)};
        const oldMatchedPL:any=this.homeSStates.projectPlaylists[matchProjPLIndex],oldPLName:string=oldMatchedPL.name;
        let rnPLObject:HomeProjectPlaylist={name:'',items:[],dirPaths:{a:'',v:'',s:''},isLoaded:true};
        //------------------
        this.evServ.destroy('temp-popover-data');
        this.evServ.subscribe('temp-popover-data',async(plRNPopData:any)=>{
          let retRNRes:string='';plRNPopData.data==='cancel'||plRNPopData.role==='cancel'?retRNRes='cancel':retRNRes=plRNPopData.data;
          if(retRNRes==='cancel'){this.cCons('(plListFileActions|rename|RenamePop) Canceled!');this.evServ.publish('updateBA','Playlist|Rename: Canceled');this.evServ.destroy('temp-popover-data')}
          else{this.cCons('(plListFileActions|rename|RenamePop) New PL Name: '+retRNRes);
            const plRNNewName:string=retRNRes,rnDirArr:any[]=[{old:oldMatchedPL.dirPaths.a,new:path.join(mADir,plRNNewName)},{old:oldMatchedPL.dirPaths.v,new:path.join(mVDir,plRNNewName)},{old:oldMatchedPL.dirPaths.s,new:path.join(mSDir,plRNNewName)}];
            let dirRNErr:boolean=false;
            for(let rnplDirI=0;rnplDirI<rnDirArr.length;rnplDirI++){const rnDRes:boolean=await this.renameDir(rnDirArr[rnplDirI].old,rnDirArr[rnplDirI].new);if(!rnDRes){this.cCons('(plListFileActions|rename|mediaDirs) ERROR Renaming '+rnDirArr[rnplDirI].old+' > '+rnDirArr[rnplDirI].new);dirRNErr=true}};
            if(!dirRNErr){rnPLObject.name=plRNNewName;rnPLObject.dirPaths={a:rnDirArr[0].new,v:rnDirArr[1].new,s:rnDirArr[2].new};
              if(oldMatchedPL.items.length>0){
                for(let updFPI=0;updFPI<oldMatchedPL.items.length;updFPI++){
                  let oldVFileObj:any=oldMatchedPL.items[updFPI];
                  const newVidFP:string=path.join(rnDirArr[1].new,oldMatchedPL.items[updFPI].name);
                  if(this.homeSStates.playerFile&&this.homeSStates.playerFile.path===oldVFileObj.path){this.homeSStates.playerFile.path=newVidFP};
                  oldVFileObj.path=newVidFP;
                  rnPLObject.items.push(oldVFileObj);
                };
                this.mainPlayerPtys.plLoaded=rnPLObject;
                this.homeSStates.projectPlaylists[matchProjPLIndex]=rnPLObject;
                await this.doSaveStates();this.pDOM();
                const sbT:string='Playlist|Renamed: '+oldPLName+' > '+plRNNewName;
                this.evServ.publish('updateBA',sbT);this.cCons('(plListFileActions): '+sbT);
              }else{this.cCons('(plListFileActions|rename|items) No PL Items to Correct Paths - Skipped')};
            }else{this.cCons('(plListFileActions|rename) Error Renaming 1 or more Dirs - Aborted')};
          };
        });
        //-------------------
        let plRNInputPopOpts:CompzPopoverOptions={id:'rnpl'+this.evServ.strFormat(new Date(),'ddMMyyHHmmss'),type:'input',title:'Rename Playlist',msg:'Enter a new name for your Playlist',inputLabel:'Playlist Name',inputInitValue:oldPLName};
        const invNames:string[]=this.homeSStates.projectPlaylists.map(pl=>pl.name);
        if(invNames&&invNames.length>0){plRNInputPopOpts['invalidStrs']=invNames};
        this.evServ.publish('do-compz-popover',plRNInputPopOpts);
        break;
      case 'delete': // eData={mode:silent|prompt,pl:HomeProjectPlaylist}
        const doDel=async():Promise<boolean>=>{
          const delProjPLIndex:number=this.homeSStates.projectPlaylists.findIndex(dPLO=>dPLO.name===this.mainPlayerPtys.plLoaded.name);
          if(delProjPLIndex===-1){this.cCons('(plListFileActions|delete) Failed to Match projectPL Index - Aborting...');return Promise.resolve(false)};
          let delProjPLDirErr:boolean=false;
          for(const proPLDirPath of Object.values(this.homeSStates.projectPlaylists[delProjPLIndex].dirPaths)){
            if((await this.exists(proPLDirPath))){
              const delDirRes:boolean=await this.removeDir(proPLDirPath);
              if(!delDirRes){this.cCons('(plListFileActions|delete|removeDir) ERROR Deleting: '+proPLDirPath);delProjPLDirErr=true};
            };
          };
          if(!delProjPLDirErr){
            this.homeSStates.playerFile=null;
            ipcRenderer.send('player-file-loaded',[null]);
            this.mainPlayerPtys.plLoaded=null;
            if(this.homeSStates.projectPlaylists.length>1){
              let prevPLIndex:number=delProjPLIndex-1;
              if(prevPLIndex<0){prevPLIndex=0};
              const prevPLObject:HomeProjectPlaylist=this.homeSStates.projectPlaylists[prevPLIndex];
              await this.plListFileActions('select',null,prevPLObject);
              this.homeSStates.projectPlaylists.splice(delProjPLIndex,1);
            }else{this.homeSStates.projectPlaylists.splice(delProjPLIndex,1)};
            await this.doSaveStates();this.pDOM();
            const sbT:string='Playlist|Deleted: '+eData.pl.name;
            this.evServ.publish('updateBA',sbT);
            this.cCons('(plListFileActions): '+sbT);
            return Promise.resolve(true);
          }else{this.cCons('(plListFileActions|delete) Error Deleting 1 or more Dirs - Aborted')};
        };
        if(eData.mode!=='silent'){
          const doDelPrompt:any=await ipcRenderer.invoke('do-show-msg',['deletePlaylistQuestion',{name:this.mainPlayerPtys.plLoaded.name}]);
          if(doDelPrompt==='delete'){const doDelRes:boolean=await doDel();plLFARes=doDelRes}else{plLFARes=false};
        }else{const doDelRes:boolean=await doDel();plLFARes=doDelRes};
        break;
    };
    this.pDOM();
    return Promise.resolve(plLFARes);
  }
/////////////////////////////////////////////////////////
  async playListSortChange(newVal:string){this.cCons('(playListSortChange) ('+newVal+')');
    let sbTxt:string='';
    const pPLIndex:number=this.homeSStates.projectPlaylists.findIndex(plO=>plO.name===this.mainPlayerPtys.plLoaded.name);
    switch(newVal){
      case 'repeat':let sbT:string='';if(this.homeSStates.plRepeat){sbT='OFF';this.homeSStates.plRepeat=false}else{sbT='ON';this.homeSStates.plRepeat=true};sbTxt='Playlist|Loop: '+sbT;break;
      case 'name':
        let obNDir:string='';this.homeSStates.plSort.dir===null?obNDir='asc':obNDir=this.homeSStates.plSort.dir;
        this.homeSStates.plSort.dir=obNDir;
        const obNPL:any[]=_.orderBy(this.mainPlayerPtys.plLoaded.items,'cname',obNDir);
        this.homeSStates.plSort.by='name';
        this.mainPlayerPtys.plLoaded.items=obNPL;
        this.homeSStates.projectPlaylists[pPLIndex].items=obNPL;
        sbTxt='Playlist|Sorted: By Name ('+obNDir.toUpperCase()+')';
        break;
      case 'size':
        let obSDir:string='';this.homeSStates.plSort.dir===null?obSDir='asc':obSDir=this.homeSStates.plSort.dir;
        this.homeSStates.plSort.dir=obSDir;
        const obSPL:any[]=_.orderBy(this.mainPlayerPtys.plLoaded.items,'fsize.no',obSDir);
        this.homeSStates.plSort.by='size';
        this.mainPlayerPtys.plLoaded.items=obSPL;
        this.homeSStates.projectPlaylists[pPLIndex].items=obSPL;
        sbTxt='Playlist|Sorted: By Size ('+obSDir.toUpperCase()+')';
        break;
      case 'time':
        let obTDir:string='';this.homeSStates.plSort.dir===null?obTDir='asc':obTDir=this.homeSStates.plSort.dir;
        this.homeSStates.plSort.dir=obTDir;
        const obTPL:any[]=_.orderBy(this.mainPlayerPtys.plLoaded.items,'dur.no',obTDir);
        this.homeSStates.plSort.by='time';
        this.mainPlayerPtys.plLoaded.items=obTPL;
        this.homeSStates.projectPlaylists[pPLIndex].items=obTPL;
        sbTxt='Playlist|Sorted: By Time ('+obTDir.toUpperCase()+')';
        break;
      case 'reverse':
        const revPL:any[]=this.mainPlayerPtys.plLoaded.items.reverse();
        this.mainPlayerPtys.plLoaded.items=revPL;
        this.homeSStates.projectPlaylists[pPLIndex].items=revPL;
        if(this.homeSStates.plSort.dir!==null){this.homeSStates.plSort.dir==='asc'?this.homeSStates.plSort.dir='desc':this.homeSStates.plSort.dir='asc'};
        sbTxt='Playlist|Sorted: Reversed';
        break;
      case 'shuffle':
        const randPL:any[]=_.shuffle(this.mainPlayerPtys.plLoaded.items);
        this.mainPlayerPtys.plLoaded.items=randPL;
        this.homeSStates.projectPlaylists[pPLIndex].items=randPL;
        if(this.homeSStates.plSort.by!==null){this.homeSStates.plSort.by=null};
        if(this.homeSStates.plSort.dir!==null){this.homeSStates.plSort.dir=null};
        this.playListSortSelect.nativeElement.value='';
        sbTxt='Playlist|Sorted: Shuffled';
        break;
      case 'dir':
        let newDir:string='';if(!this.homeSStates.plSort.dir){newDir='asc'}else{this.homeSStates.plSort.dir==='asc'?newDir='desc':newDir='asc'};
        let byObjPty:string='';const nowBy:string=this.homeSStates.plSort.by;if(nowBy==='name'){byObjPty='cname'}else if(nowBy==='size'){byObjPty='fsize.no'}else if(nowBy==='time'){byObjPty='dur.no'};
        const newDirPL:any[]=_.orderBy(this.mainPlayerPtys.plLoaded.items,byObjPty,newDir);
        this.mainPlayerPtys.plLoaded.items=newDirPL;
        this.homeSStates.projectPlaylists[pPLIndex].items=newDirPL;
        sbTxt='Playlist|Sort|Direction: ';newDir==='asc'?sbTxt+='Ascending':sbTxt+='Descending';
        break;
      default:break;
    };
    this.pDOM();this.evServ.publish('updateBA',sbTxt);await this.doSaveStates();
  }
/////////////////////////////////////////////////////////
  async playerEvent(action:any,data?:any):Promise<boolean>{
    let dStr:string=')...';if(data){const tStr:string=typeof data;dStr=', [data]: '+tStr+')...'};
    this.cCons('(playerEvent) [action]:'+action+dStr);
    if(typeof action==='object'&&action.toggle==='playerTabToggle'){const currentV:'list'|'eq'=this.homeSStates.playerTabToggle,actionV:'list'|'eq'=action.value;if(currentV!==actionV){this.homeSStates.playerTabToggle=actionV;this.pDOM()};await this.doSaveStates();return Promise.resolve(true)}
    else{
      const fObj:any=data;
      switch(action){
        case 'viewinfo':
          let viFile:any|null=null;data?viFile=data:this.homeSStates.playerFile?viFile=this.homeSStates.playerFile:viFile=await ipcRenderer.invoke('get-player-file-loaded');
          const cpMsg:any[]=await this.formatFileMeta(viFile);
          if(viFile){
            this.cCons('(playerEvent) VIEWINFO:');
            this.evServ.subscribe('temp-popover-data',(popData:any)=>{
              this.evServ.destroy('temp-popover-data')
              if(popData.role==='ok'){this.evServ.publish('updateBA','View Info|Closed: '+viFile.name)}
              else{this.cCons('(playerEvent|viewinfo|) > EDITMETA...')}
            });
            const cpOpts:CompzPopoverOptions={id:'player-view-info-popover',type:'btnquery',title:this.capd(viFile.bdir)+' File Info',msg:cpMsg,msgIsList:true,icon:'assets/compz-popover-fileinfo-ico.png',btnQueryBtns:<CompzPopoverQueryBtn[]>[{role:'ok',label:'Close Meta',action:null}]};
            this.evServ.publish('do-compz-popover',cpOpts);
          }else{this.cCons('(playerEvent|viewinfo) ERROR: No playerFileLoaded FOUND!')};
          this.pDOM();await this.doSaveStates();
          break;
        //--------------------
        case 'mark':this.cCons('(playerEvent) MARK FILE');
          this.homeSStates.plMarkedItems[fObj.path]=true;
          ipcRenderer.send('pl-marked-files',[this.homeSStates.plMarkedItems]);
          this.pDOM();await this.doSaveStates();
          this.evServ.publish('updateBA','Player|Playlist: [+] Marked Item: '+fObj.cname);
          break;
        //--------------------
        case 'unmark':this.cCons('(playerEvent) UNMARK FILE');
          this.homeSStates.plMarkedItems[fObj.path]=false;
          ipcRenderer.send('pl-marked-files',[this.homeSStates.plMarkedItems]);
          this.pDOM();await this.doSaveStates();
          this.evServ.publish('updateBA','Player|Playlist: [-] Unmarked Item: '+fObj.cname);
          break;
        //--------------------
      };
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  bfTimer(dir:string){
    console.log('bouncedBFTimer('+dir+')...');
    let doStop:boolean=false,head:any=document.getElementById('scrubhead'),wrap:any=document.getElementById('scrubwrap'),holdSecs:number=0,segSize:number=wrap.clientWidth/96;
    const fbLoop=setInterval(()=>{
      holdSecs+=0.25;
      if(holdSecs>1){
        if(holdSecs>3){segSize=wrap.clientWidth/48};
        if(holdSecs>5){segSize=wrap.clientWidth/24};
        let nL=this.mainPlayerPtys.backFWDLeftX;
        if(dir==='fwd'){nL+=segSize}else{nL-=segSize};
        if(nL<0){
          clearInterval(fbLoop);this.evServ.destroy('stopBFTimer');
          this.mainPlayerPtys.backFWDLeftX=false;this.mainMediaPlayer('prev');
          this.cCons('(bouncedBFTimer) Cancelled > GO [PREV]');
        }else if(nL>wrap.clientWidth){
          clearInterval(fbLoop);this.evServ.destroy('stopBFTimer');
          this.mainPlayerPtys.backFWDLeftX=false;this.mainMediaPlayer('next');
          this.cCons('(bouncedBFTimer) Cancelled > GO [NEXT]');
        }else{
          if(!doStop){this.mainPlayerPtys.backFWDLeftX=nL;head.style.left=nL+'px'}
          else{clearInterval(fbLoop);this.cCons('(bouncedBFTimer) Cleared Interval (doStop===true)')}
        }
      }
    },250);
    this.evServ.subscribe('stopBFTimer',()=>{
      clearInterval(fbLoop);this.evServ.destroy('stopBFTimer');doStop=true;
      if(holdSecs>1){this.evServ.publish('bfTimerResult','doSeek')}
      else{this.evServ.publish('bfTimerResult','doBF')}
    });
  }
/////////////////////////////////////////////////////////
  playerBackFWDCalc(eV:any,dir:string,action:string){this.cCons('playerBackFWDCalc('+action+')...');
    let dirArrow:string='';dir==='back'?dirArrow='◄ seek':dirArrow='seek ►';
    let head:any=document.getElementById('scrubhead');
    let wrap:any=document.getElementById('scrubwrap');
    if(action==='down'){console.log('playerBackFWDCalc - [DOWN]');
      this.mainPlayerPtys.playerStatusTxt=dirArrow;
      this.mainPlayerPtys.scrubHead.isDrag=true;
      this.mainPlayerPtys.backFWDLeftX=head.offsetLeft;
      this.bfTimer(dir);
    }else{console.log('playerBackFWDCalc - [UP]');
      this.mainPlayerPtys.scrubHead.isDrag=false;
      this.evServ.subscribe('bfTimerResult',resD=>{
        if(typeof this.mainPlayerPtys.backFWDLeftX==='boolean'){this.cCons('(playerBackFWDCalc) Ignoring Click - User Went '+this.capd(dir)+' to NEW ITEM')}
        else{
          if(resD==='doSeek'){
            const newPosPerc:number=this.mainPlayerPtys.backFWDLeftX/wrap.clientWidth;
            this.mainMediaPlayer('seek',null,newPosPerc);
            this.cCons('(playerBackFWDCalc) Seeking to New Perc: '+(newPosPerc*100).toFixed(0)+'%');
          }else{
            if(dir==='back'){this.mainMediaPlayer('back')}else{this.mainMediaPlayer('fwd')};
            this.cCons('(playerBackFWDCalc) Default '+this.capd(dir)+' Action');
          }
        };
      });
      this.evServ.publish('stopBFTimer',true);
    }
  }
/////////////////////////////////////////////////////////
  async homeCMActions(hSection:string,hArea:string,action:string,data?:any):Promise<boolean>{
    this.cCons('(homeCMActions) '+hSection+','+hArea+','+action+','+JSON.stringify(data)+'...');
    const delFEF=async(p:string):Promise<boolean>=>{if((await this.exists(p))){try{await unlink(p);return Promise.resolve(true)}catch(e){return Promise.resolve(false)}}else{return Promise.resolve(false)}};
    let fObj:any|null=null;if(data){fObj=data};let sbTxt:string|null=null;
    const homePLIndex:number=this.homeSStates.projectPlaylists.findIndex(plO=>plO.name===this.mainPlayerPtys.plLoaded.name);
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const mADir:string=path.join(pPath,'media/audio'),mVDir:string=path.join(pPath,'media/video'),mSDir:string=path.join(pPath,'media/subs'),editsDir:string=path.join(pPath,'edits');
    const cpF=async(from:string,to:string):Promise<boolean>=>{try{await copyFile(from,to);return Promise.resolve(true)}catch(e){return Promise.resolve(false)}};
    switch(hSection){
      case 'hcsPlayer':
        switch(hArea){
          case 'hcaPlayList':
            switch(action){
              case 'edit':
                const editFObj:any=fObj;
                const editFPath:string=fObj.path;
                const editMatchMainItemIndex:number=this.mainPlayerPtys.plLoaded.items.findIndex(emmi=>emmi.path===editFPath);
                const editMatchProjPLIndex:number=this.homeSStates.projectPlaylists.findIndex(eppl=>eppl.name===this.mainPlayerPtys.plLoaded.name);
                if(!(await this.exists(editsDir))){const mkEditsDir:boolean=await this.mkDir(editsDir);if(!mkEditsDir){this.cCons('(homeCMActions|edit) ERROR Creating Edits/ Dir');return Promise.resolve(false)}};
                const editCopyBFName:string=path.basename(editFPath,'.mp4');
                const editCopyNameExt:string=editCopyBFName+'-edit'+String(Math.floor(1000+Math.random()*9000))+'.mp4';
                const editCPFPath:string=path.join(editsDir,editCopyNameExt);
                if((await cpF(editFPath,editCPFPath))){
                  const editVideoFileObj:HomeEditorFile={pl:{plProjIndex:editMatchProjPLIndex,plObj:this.mainPlayerPtys.plLoaded,plFileIndex:editMatchMainItemIndex,plFileObj:editFObj},edit:{cname:editCopyBFName,name:editCopyNameExt,path:editCPFPath,dur:fObj.dur.no},undo:null};
                  await this.editorAVFns('load',editVideoFileObj);
                }else{this.cCons('(homeCMActions|edit) FAILED to Copy Temp Edit File > '+editCPFPath)};
                console.log(this.homeSStates.editorFile);
                break;
              case 'rename':
                const rnOldObj:any=fObj;
                const rnOldFPath:string=fObj.path;
                const matchMainItemIndex:number=this.mainPlayerPtys.plLoaded.items.findIndex(mmi=>mmi.path===rnOldFPath);
                const matchProjPLIndex:number=this.homeSStates.projectPlaylists.findIndex(ppl=>ppl.name===this.mainPlayerPtys.plLoaded.name);
                const matchProjItemIndex:number=this.homeSStates.projectPlaylists[matchProjPLIndex].items.findIndex(mpi=>mpi.path===fObj.path);
                if(matchMainItemIndex===-1||matchProjPLIndex===-1|| matchProjItemIndex===-1){console.log('(homeCMActions|rename) Failed to Match PL/Item Index(es)');return Promise.resolve(false)};
                //------------------
                this.evServ.destroy('temp-popover-data');
                this.evServ.subscribe('temp-popover-data',async(plRNPopData:any)=>{
                  let retRNRes:string='';plRNPopData.data==='cancel'||plRNPopData.role==='cancel'?retRNRes='cancel':retRNRes=plRNPopData.data;
                  if(retRNRes==='cancel'){this.cCons('(homeCMActions|rename|RenamePop) Canceled!');this.evServ.publish('updateBA','Playlist|Rename: Canceled');this.evServ.destroy('temp-popover-data')}
                  else{
                    this.cCons('(homeCMActions|rename|RenamePop) New File Name: '+retRNRes);
                    let niceNewName:string='';const rawNewName:string=retRNRes;if(rawNewName.slice(-5).toLowerCase()!=='.mp4'){niceNewName=rawNewName+'.mp4'}else{niceNewName=rawNewName};
                    const newRNFPath:string=path.join(mVDir,niceNewName);
                    try{
                      await rename(rnOldFPath,newRNFPath);
                      let wasPlayerFile:boolean=false;
                      if(this.homeSStates.playerFile.path===rnOldFPath){wasPlayerFile=true;await this.mainMediaPlayer('unload');this.homeSStates.playerFile=null;ipcRenderer.send('player-file-loaded',[null])};
                      this.homeSStates.projectPlaylists[matchProjPLIndex].items[matchProjItemIndex].path=newRNFPath;
                      this.homeSStates.projectPlaylists[matchProjPLIndex].items[matchProjItemIndex].name=path.basename(newRNFPath);
                      this.homeSStates.projectPlaylists[matchProjPLIndex].items[matchProjItemIndex].cname=path.basename(newRNFPath,'.mp4');
                      this.mainPlayerPtys.plLoaded.items[matchMainItemIndex].path=newRNFPath;
                      this.mainPlayerPtys.plLoaded.items[matchMainItemIndex].name=path.basename(newRNFPath);
                      this.mainPlayerPtys.plLoaded.items[matchMainItemIndex].cname=path.basename(newRNFPath,'.mp4');
                      if(wasPlayerFile){await this.mainMediaPlayer('load',this.mainPlayerPtys.plLoaded.items[matchMainItemIndex],null)};
                      await this.doSaveStates();this.pDOM();
                      const sbT:string='Item|Renamed: '+rnOldObj.name+' > '+niceNewName;
                      this.evServ.publish('updateBA',sbT);this.cCons('(homeCMActions|rename): '+sbT);
                      this.evServ.destroy('temp-popover-data');
                    }catch(e){this.cCons('(homeCMActions|rename) ERROR Renaming File: '+rnOldFPath);this.evServ.destroy('temp-popover-data')};
                  }
                });
                //-------------------
                let plFileRNInputPopOpts:CompzPopoverOptions={id:'plfilern'+this.evServ.strFormat(new Date(),'ddMMyyHHmmss'),type:'input',title:'Rename '+this.capd(fObj.codec_type),msg:'Enter a new name for your '+this.capd(fObj.codec_type),inputLabel:'New File Name',inputInitValue:fObj.name};
                const invNames:string[]=this.mainPlayerPtys.plLoaded.items.map(fO=>fO.name);
                if(invNames&&invNames.length>0){plFileRNInputPopOpts['invalidStrs']=invNames};
                this.evServ.publish('do-compz-popover',plFileRNInputPopOpts);
                break;
              case 'remove':
                const plDirs:string[]=Object.values(this.mainPlayerPtys.plLoaded.dirPaths);
                for(let plDI=0;plDI<plDirs.length;plDI++){const rFP:string=path.join(plDirs[plDI],fObj.name);await delFEF(rFP)};
                this.evServ.publish('feDoSync',['audio','video','subs']);
                const updList:HomePPLItem[]=this.mainPlayerPtys.plLoaded.items.filter(item=>item.path!==fObj.path);
                this.mainPlayerPtys.plLoaded.items=updList;
                this.homeSStates.projectPlaylists[homePLIndex].items=updList;
                this.cCons('(homeCMActions|remove) Removed '+fObj.cname+' from '+this.mainPlayerPtys.plLoaded.name);
                if(this.homeSStates.plMarkedItems.hasOwnProperty(fObj.path)){delete this.homeSStates.plMarkedItems[fObj.path]};
                if(_.isEmpty(this.homeSStates.plMarkedItems)){ipcRenderer.send('pl-marked-files',[null])}else{ipcRenderer.send('pl-marked-files',[this.homeSStates.plMarkedItems])};
                await this.mainMediaPlayer('updatelist');
                this.pDOM();await this.doSaveStates();
                sbTxt='Playlist|File Removed ('+fObj.name+')';
                break;
              case 'viewinfo':
                sbTxt='Playlist|File View Info ('+fObj.name+')';
                await this.playerEvent('viewinfo',fObj);
                break;
              case 'mark':await this.playerEvent('mark',fObj);sbTxt='Playlist|File Marked ('+fObj.name+')';break;
              case 'unmark':await this.playerEvent('unmark',fObj);sbTxt='Playlist|File Unmarked ('+fObj.name+')';break;
              case 'clearall':
                for(let caI=0;caI<this.mainPlayerPtys.plLoaded.items.length;caI++){
                  const plFObj:any=this.mainPlayerPtys.plLoaded.items[caI];
                  const caPLDirs:string[]=Object.values(this.mainPlayerPtys.plLoaded.dirPaths);
                  for(let caDI=0;caDI<caPLDirs.length;caDI++){const caRFP:string=path.join(caPLDirs[caDI],plFObj.name);await delFEF(caRFP)};
                };
                this.evServ.publish('feDoSync',['audio','video','subs']);
                this.homeSStates.playerFile=null;
                ipcRenderer.send('player-file-loaded',[null]);
                this.mainPlayerPtys.plLoaded.items=[];
                this.homeSStates.projectPlaylists[homePLIndex].items=[];
                await this.mainMediaPlayer('updatelist');
                this.homeSStates.plMarkedItems={};
                ipcRenderer.send('pl-marked-files',[null]);
                sbTxt='Playlist|Clear All Files';
                this.pDOM();await this.doSaveStates();
                break;
              default:break;
            };
            if(sbTxt){this.evServ.publish('updateBA',sbTxt)};this.pDOM();await this.doSaveStates();
            break;
          case 'hcaPlayEqualiser':break;
          case 'hcaPlayTrackHeader':
            switch(action){
              case 'viewinfo':
                sbTxt='Player|File View Info ('+fObj.name+')';
                await this.playerEvent('viewinfo',fObj);
                break;
            };
            if(sbTxt){this.evServ.publish('updateBA',sbTxt)};
            break;
          case 'hcaPlayVis':break;
          case 'hcaPlayProgressBar':break;
          case 'hcaPlayStatus':break;
          case 'hcaPlayerCtrlBtns':break;
          case 'hcaPlayerVolCtrl':break;
          default:break;
        };
        break;
      case 'hcsEditor':
      case 'hcsScraper':
      default:break;
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async formatFileMeta(fileObject:any):Promise<any[]>{this.cCons('(formatFileMeta)...');
    let fORes:any[]=[],fFORes:any[]=[],sizeKLabel:string='filesize',sizeVTxt:string|null=null,sizeVSuffix:string|null=null;
    const projDirPath:string=path.normalize(this.homeProject.projectDirPath);
    const exclPtys:string[]=['birthtime','bdir','rw','dur'],replPtys:any={atime:'accessedTime',mtime:'modifiedTime',ctime:'createdTime'};
    const iNO=(obj:any):Promise<any[]>=>{
      return new Promise((resolve)=>{
        const iterate=(obj:any)=>{
          for(const[k,v]of Object.entries(obj)){
            if(!exclPtys.includes(k)&&v!==null&&v!==undefined){
              if(typeof v==='object'){
                if((v instanceof Date)){
                  const fmtD:string=this.evServ.strFormat(new Date(v),'dd/MM/yyyy HH:mm:ss');
                  if(replPtys.hasOwnProperty(k)){fORes.push({isHeader:false,label:replPtys[k],value:fmtD})}
                  else{fORes.push({isHeader:false,label:k,value:fmtD})}
                }else if(k!=='fsize'){
                  fORes.push({isHeader:true,label:k,value:null})
                  if(Array.isArray(v)){for(let i=0;i<v.length;i++){const arrK=Object.keys(v[i])[0];const arrV=Object.values(v[i])[0];fORes.push({isHeader:false,label:arrK,value:arrV})}}
                  else{iterate(v)}
                }
              }else{
                if(k!=='txt'&&k!=='suffix'&&k!=='cname'&&k!=='path'){fORes.push({isHeader:false,label:k,value:v})}
                else{
                  if(k==='txt'){sizeVTxt=String(v)};
                  if(k==='suffix'){sizeVSuffix=String(v)};
                  if(sizeVTxt&&sizeVSuffix){fORes.push({isHeader:false,label:sizeKLabel,value:sizeVTxt+sizeVSuffix})};
                  if(k==='path'){fORes.push({isHeader:false,label:k,value:path.normalize(String(v)).replace(path.normalize(projDirPath),'../[projectDir]').replace(/\\/g,'/')})}
                }
              }
            }
          }
        };
        iterate(obj);return resolve(fORes)
      })
    };
    const iFFRes:any[]=await iNO(fileObject);
    for(let i=0;i<iFFRes.length;i++){
      let fV:string='';typeof(iFFRes[i].value==='string'?fV=iFFRes[i].value.replace(/_/g,' ').toLowerCase():fV=String(iFFRes[i].value).replace(/_/g,' ').toLowerCase());
      const fMO:any={isHeader:iFFRes[i].isHeader,label:iFFRes[i].label.replace(/_/g,' ').toLowerCase(),value:fV};
      fFORes.push(fMO);
    };
    return Promise.resolve(fFORes)
  }
/////////////////////////////////////////////////////////
  async showHideSection(section:string):Promise<boolean>{
    const cvtH2WPad=(h:number):number=>{return Math.round((h/9)*16)};
    const sbListenFn=(eEvent)=>{if(eEvent.code==='Space'){eEvent.preventDefault();if(eEvent.defaultPrevented){if(this.editorAVPlyr.nativeElement.paused){this.editorAVPlyr.nativeElement.play()}else{this.editorAVPlyr.nativeElement.pause()}}}};
    let s:string='';if(section){s=' '+section};this.cCons('(showHideSection) Toggle'+s);
    let nEArr:string[]=['hcsPlayer','hcsEditor','hcsScraper'];
    return new Promise((resolve)=>{
      let wlCount:number=0;
      const wLoop=setInterval(async()=>{
        let nEStatRes:any[]=[],allG:boolean=true;
        for(let i=0;i<nEArr.length;i++){if(this[nEArr[i]].nativeElement){nEStatRes.push({ne:nEArr[i],tf:true})}else{allG=false;nEStatRes.push({ne:nEArr[i],tf:false})}};
        this.cCons('(showHideSection) Loop Result: '+nEStatRes[0].ne+'='+String(nEStatRes[0].tf)+', '+nEStatRes[1].ne+'='+String(nEStatRes[1].tf)+', '+nEStatRes[2].ne+'='+String(nEStatRes[2].tf));
        if(allG){
          clearInterval(wLoop);
          if(section!=='init'){const secKey:string=section+'SectionVis';this.homeSStates[secKey]?this.homeSStates[secKey]=false:this.homeSStates[secKey]=true};
          const ttlV:number=Object.entries(this.homeSStates).filter(o=>o[0].includes('SectionVis')&&o[1]).map(a=>a[0]).length,ttlNVNo:number=(3-ttlV)*28;
          let ttlNVH:string='';if(ttlNVNo>0){ttlNVH=' - '+String(ttlNVNo)+'px'}else{ttlNVH=''};
          this.homeSStates.playerSectionVis?this.homeSStates.sectionHs.player='calc((100vh - 74px'+ttlNVH+') / '+ttlV+')':this.homeSStates.sectionHs.player='28px';
          this.homeSStates.editorSectionVis?this.homeSStates.sectionHs.editor='calc((100vh - 74px'+ttlNVH+') / '+ttlV+')':this.homeSStates.sectionHs.editor='28px';
          this.homeSStates.scraperSectionVis?this.homeSStates.sectionHs.scraper='calc((100vh - 74px'+ttlNVH+') / '+ttlV+')':this.homeSStates.sectionHs.scraper='28px';
          this.cCons('(showHideSection|MainSections) SUCCESS: Section Hs Set - OK');
          let secSpecCheckCount:number=0;
          const checkSCC=()=>{secSpecCheckCount++;if(secSpecCheckCount===2){resolve(true)}};
          if(this.homeSStates.playerSectionVis){
            let vlCount:number=0;
            const vLoop=setInterval(()=>{
              if(this.playerVideoWrap.nativeElement&&this.playerVideoPlayer.nativeElement){
                clearInterval(vLoop);
                const vPlyrH:number=this.playerVideoWrap.nativeElement.getBoundingClientRect().height;
                if(this.playerVideoPlayer.nativeElement.height!==vPlyrH){this.playerVideoPlayer.nativeElement.height=vPlyrH};
                if(this.playerVideoPlayer.nativeElement.style.height!==String(vPlyrH)+'px'){this.playerVideoPlayer.nativeElement.style.height=String(vPlyrH)+'px'};
                const vPlyrW:number=cvtH2WPad(vPlyrH);
                if(this.playerVideoPlayer.nativeElement.width!==vPlyrW){this.playerVideoPlayer.nativeElement.width=vPlyrW};
                if(this.playerVideoPlayer.nativeElement.style.width!==String(vPlyrW)+'px'){this.playerVideoPlayer.nativeElement.style.width=String(vPlyrW)+'px'};
                this.cCons('(showHideSection|VideoPlayer) SUCCESS: Section Ds Set - OK');
                checkSCC();
              }else{
                vlCount++;
                this.cCons('(showHideSection|VideoPlayer) WAIT: '+String(vlCount)+'/8');
                if(vlCount===8){
                  clearInterval(vLoop);
                  this.cCons('(showHideSection|VideoPlayer) Failed: Timeout after 2s');
                  checkSCC();
                };
              };
            },250);
          }else{checkSCC()};
          if(this.homeSStates.editorSectionVis){
            let elCount:number=0;
            let readyEleArr:boolean[]=[];
            let editEleArr:string[]=['editorAVPlyrWrap','editorAVPlyr','editWaveImgWrap','editGridWrap','editGridCanvas'];
            const eLoop=setInterval(async()=>{
              for(let i=0;i<editEleArr.length;i++){this[editEleArr[i]].nativeElement?readyEleArr.push(true):readyEleArr.push(false)};
              if(readyEleArr.every(tf=>tf)){
                clearInterval(eLoop);
                const editVPlyrWrapW:number=this.editorAVPlyrWrap.nativeElement.clientWidth;
                let aspRatStr:string='16:9';
                if(this.homeSStates.editorFile&&this.homeSStates.editorFile.pl.plFileObj.hasOwnProperty('display_aspect_ratio')&&this.homeSStates.editorFile.pl.plFileObj.display_aspect_ratio.includes(':')){aspRatStr=this.homeSStates.editorFile.pl.plFileObj.display_aspect_ratio};
                const ratStrArr:string[]=aspRatStr.split(':'),arUnit:number=editVPlyrWrapW/Number(ratStrArr[0]),editVPlyrWrapH:number=Math.round(arUnit*Number(ratStrArr[1]));
                this.editorAVPlyrWrap.nativeElement.style.height=this.editorAVPlyr.nativeElement.style.height=String(editVPlyrWrapH)+'px';
                this.editorAVPlyr.nativeElement.style.width=String(editVPlyrWrapW)+'px';
                this.editorAVPlyr.nativeElement.height=editVPlyrWrapH;
                this.editorAVPlyr.nativeElement.width=editVPlyrWrapW;
                //----
                const gridWaveW:number=this.editGridWrap.nativeElement.clientWidth;
                const gridWaveH:number=editVPlyrWrapH-72;
                this.editGridWrap.nativeElement.style.height=this.editWaveImgWrap.nativeElement.style.height=this.editGridCanvas.nativeElement.style.height=String(gridWaveH)+'px';
                this.editGridWrap.nativeElement.style.width=this.editWaveImgWrap.nativeElement.style.width=this.editGridCanvas.nativeElement.style.width=String(gridWaveW)+'px';
                this.editGridCanvas.nativeElement.height=gridWaveH;
                this.editGridCanvas.nativeElement.width=gridWaveW;
                //----
                if(!this.editPlyrPtys.spaceListen){window.addEventListener('keydown',sbListenFn);this.editPlyrPtys.spaceListen=true};
                if(this.homeSStates.editorFile&&!this.editorAVPlyr.nativeElement.src){await this.editorAVFns('load',this.homeSStates.editorFile)};
                this.cCons('(showHideSection|Editor) SUCCESS: Edit DOM Ready!');
                checkSCC();
              }else{
                elCount++;
                this.cCons('(showHideSection|Editor) WAIT: '+String(elCount)+'/8');
                if(elCount===8){
                  clearInterval(eLoop);
                  this.cCons('(showHideSection|Editor) Failed: Timeout after 2s');
                  checkSCC();
                };
              };
            },250);
          }else{
            if(this.editPlyrPtys.spaceListen){window.removeEventListener('keydown',sbListenFn)};
            checkSCC();
          };
        }else{
          wlCount++;
          this.cCons('(showHideSection|MainSections) WAIT: '+String(wlCount)+'/8');
          if(wlCount===8){
            clearInterval(wLoop);
            this.cCons('(showHideSection|MainSections) Failed: Timeout after 2s');
            resolve(false);
          };
        };
      },250);
    });
  }
  //-----------------------------------------------------
  resizePanels(e:MouseEvent,s:string,p:string){
    const mousemove=(e)=>{const newRSX=prevRSX-e.x,newRSWidth:number=prevRSWidth-newRSX,newOrsWidth:number=prevOrsWidth,newRightWidth:number=containWidth-(newRSWidth+newOrsWidth);rsPane.style.width=newRSWidth+'px';orsPane.style.width=newOrsWidth+'px';rightPane.style.width=newRightWidth+'px'};
    const mouseup=():boolean=>{document.removeEventListener('mousemove',mousemove);document.removeEventListener('mouseup',mouseup);return true};
    let rsP:string='',orsP:any;if(p==='left'){rsP='left';orsP='middle'}else{rsP='middle';orsP='left'};
    const rsPane=<HTMLDivElement>document.querySelector('.rs-'+rsP+'-pane-'+s),orsPane=<HTMLDivElement>document.querySelector('.rs-'+orsP+'-pane-'+s),rightPane=<HTMLDivElement>document.querySelector('.rs-right-pane-'+s),containPane=<HTMLDivElement>document.querySelector('.rs-wrapper-scraper'),containWidth:number=containPane.getBoundingClientRect().width;
    document.addEventListener('mousemove',mousemove);document.addEventListener('mouseup',mouseup);
    const prevRSX=e.x,prevRSWidth=rsPane.getBoundingClientRect().width,prevOrsWidth=orsPane.getBoundingClientRect().width;
  }
///////////////////////////////////////////////////////////////
  renderGrid(type:string,data?:any){
    let inProg:boolean=false,progX:number=this.gridProgColNo;
    if(type==='progress'){inProg=true;if(data){progX=data}}else{inProg=false;this.cCons('(renderGrid) [INIT]...')};
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
    const colHXSpace:number=(this.gridCanvas.width/100)-1;
    for(let i=0;i<100;i++){
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
/////////////////////////////////////////////////////////
  async doWavePic(){
    this.cCons('(doWavePic)...');
    this.editWaveImgWrap.nativeElement.style.width=String(this.editGridWrap.nativeElement.clientWidth)+'px';
    this.editWaveImgWrap.nativeElement.style.height=String(this.editGridWrap.nativeElement.clientHeight)+'px';
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,editsDir:string=path.join(pPath,'edits');
    const gWErr=(type:string)=>{let cM:string='';type==='stderr'?cM='|STDERR: '+outputStr:cM='|MISSING: wave.png NOT FOUND @ '+wavePngPath;this.cCons('(getWavePic) ERROR'+cM)};
    let outputStr:string='';
    let wavePngFName:string='';
    if(this.homeSStates.editorFile.edit.cname.includes('-crop')){wavePngFName=this.homeSStates.editorFile.edit.cname.replace('-crop','')}
    else if(this.homeSStates.editorFile.edit.cname.includes('-delete')){wavePngFName=this.homeSStates.editorFile.edit.cname.replace('-delete','')}
    else{wavePngFName=this.homeSStates.editorFile.edit.cname};
    const wavePngPath:string=path.join(editsDir,wavePngFName+'-wave.png');
    const sourceFPath:string=this.homeSStates.editorFile.edit.path;
    //---------------------
    const gWOK=async()=>{
      this.editWavePng=wavePngPath;
      this.editWaveImgWrap.nativeElement.style.background='transparent';
      const waitLoop=setInterval(()=>{
        if(this.editWaveImgWrap.nativeElement.style.background==='transparent'){
          clearInterval(waitLoop);
          const newBGStr:string='url('+(path.relative(__dirname,this.editWavePng)).replace(/\\/g,'/')+') no-repeat center';
          this.editWaveImgWrap.nativeElement.style.background=newBGStr;
          const waitLoop2=setInterval(()=>{
            if(this.editWaveImgWrap.nativeElement.style.background=newBGStr){
              clearInterval(waitLoop2);
              this.pDOM();
              this.cCons('(doWavePic) WavePNG SUCCESS: '+this.editWavePng);
            };
          },60);
        }
      },60);
    };
    //--------------------
    const wPicExists:boolean=await this.exists(wavePngPath);
    if(wPicExists){await unlink(wavePngPath)};
    const waveChild=spawn(this.mpegExePath,['-i',sourceFPath,'-filter_complex','showwavespic=s='+this.editGridWrap.nativeElement.clientWidth+'x'+this.editGridWrap.nativeElement.clientHeight+':colors=#2585D1','-frames:v','1','-y',wavePngPath]);
    waveChild.on('close',code=>{if(code===0){gWOK()}else{gWErr('stderr')}});
    waveChild.on('error',error=>{outputStr+=error.name+': '+error.message+' '});
  }
/////////////////////////////////////////////////////////
  pGetCurrentDur():number{return this.editorAVPlyr.nativeElement.currentTime}
  pGetMaxDur():number{return this.editorAVPlyr.nativeElement.duration}
  pGetProgObj():HomeEditProgObj{const progNo:number=this.pGetCurrentDur(),durNo:number=this.pGetMaxDur(),percNo=progNo/durNo,durStr:string=durNo.toFixed(2),percStr=String(Math.round(percNo*100))+'%',pDs:number=progNo.toFixed(2).split('.')[0].length,dDs:number=durStr.split('.')[0].length;let progStr:string=progNo.toFixed(2);if(pDs!==dDs){progStr='0'.repeat(dDs-pDs)+progStr;};return {prog:{n:progNo,s:progStr},dur:{n:durNo,s:durStr},perc:{n:percNo,s:percStr}}}
//-------------------------------------------------------
  editPlyrPlaying():boolean{const evEle:HTMLVideoElement=this.editorAVPlyr.nativeElement;if(evEle.currentTime>0&&!evEle.paused&&!evEle.ended){return true}else{return false}};
//-------------------------------------------------------
  pInitProg(){this.pProgObj={prog:{n:0,s:''},dur:{n:0,s:''},perc:{n:0,s:''}}};
//-------------------------------------------------------
  pStopProg(){
    this.pFrame=false;
    this.cCons('(pStopProg) STOPPED.');
    const evEle:HTMLVideoElement=this.editorAVPlyr.nativeElement;
    if(evEle.currentTime>0&&evEle.paused&&!evEle.ended){return}
    else{this.renderGrid('init')};
  }
//-------------------------------------------------------
  pStartProg(){if(!this.pFrame){this.pFrame=true};this.pStepProg();this.cCons('(pStartProg) STARTED...')}
//-------------------------------------------------------
  pStepProg(){
    if(!this.pFrame){window.cancelAnimationFrame(this.pFrameId)}
    else{
      if(this.editPlyrPlaying()){
        const checkProgObj:HomeEditProgObj=this.pGetProgObj();
        if(!_.isEqual(this.pProgObj,checkProgObj)){
          this.pProgObj=checkProgObj;
          this.animProgress(checkProgObj.perc.n);
          const editProgLinePos:number=this.gridCanvas.width*checkProgObj.perc.n;
          const editProgLineTime:number=this.editDur*checkProgObj.perc.n;
          this.editPos=editProgLineTime;
          if(this.editPlyrPtys.selection&&!this.editDrawMouseDown&&this.editSelectRange&&this.editSelectRange.end.time>0&&this.editPos>this.editSelectRange.end.time){
              this.editorAVPlyr.nativeElement.currentTime=this.editSelectRange.start.time;
              this.editProgLine.nativeElement.style.left=String(this.editSelectRange.start.pos)+'px';
              this.editPos=this.editSelectRange.start.time;
          }else{
            this.editProgLine.nativeElement.style.left=String(editProgLinePos)+'px';
            this.editPos=editProgLineTime;
          };
          this.pDOM();
        }
      };
      this.pFrameId=window.requestAnimationFrame(()=>this.pStepProg());
    };
  }
//-------------------------------------------------------
  animProgress(progPerc:number){
    let progX:number=this.gridCanvas.width*progPerc;
    if(progX<=0){progX=0};
    if(progX>=this.gridCanvas.width){progX=this.gridCanvas.width};
    if(this.gridProgColNo!==progX){
      this.gridProgColNo=progX;
      this.renderGrid('progress',progX);
    }
  }
//-------------------------------------------------------
  bgCanvas(){this.gridContext.fillStyle='#0F0F0F';this.gridContext.fillRect(0,0,this.gridCanvas.width,this.gridCanvas.height)}
//-------------------------------------------------------
  clrCanvas(){this.gridContext.clearRect(0,0,this.gridCanvas.width,this.gridCanvas.height)}
//-------------------------------------------------------
  vizAnimStart(){if(!this.vizFrame){this.vizFrame=true};this.vizAnimStep();this.cCons('(vizAnimFrame) STARTED...')}
//-------------------------------------------------------
  vizAnimStop(){this.vizFrame=false;this.cCons('(vizAnimFrame) STOPPED.')}
//-------------------------------------------------------
  async vizAnimStep(){
    if(!this.vizFrame){window.cancelAnimationFrame(this.vizFrameId);this.clrCanvas()}
    else{
      this.vizAnalyser.getByteFrequencyData(this.vizDataArray);
      this.vizFrameId=window.requestAnimationFrame(()=>this.vizAnimStep());
    };
  }
//-------------------------------------------------------
editPlyrListen(){
  this.cCons('editPlyrListen()...');
  this.editorAVPlyr.nativeElement.removeAllListeners();
  this.editorAVPlyr.nativeElement.addEventListener('loadedmetadata',(lmd)=>{console.log('[editPlyr|loaded]');
    this.editPlyrPtys.isLoaded=true;
    this.editorAVPlyr.nativeElement.currentTime=0;
    this.editProgLine.nativeElement.style.left='0px';
    this.editPos=0;
  });
  this.editorAVPlyr.nativeElement.addEventListener('play',()=>{console.log('[editPlyr|play]');
    this.editPlyrPtys.isPlay=true;
    this.pStartProg();
  });
  this.editorAVPlyr.nativeElement.addEventListener('pause',()=>{console.log('[editPlyr|pause]');
    this.editPlyrPtys.isPause=true;
    this.pStopProg();
  });
  this.editorAVPlyr.nativeElement.addEventListener('timeupdate',()=>{});
  this.editorAVPlyr.nativeElement.addEventListener('ended',async()=>{console.log('[editPlyr|ended]');
    this.editorAVPlyr.nativeElement.currentTime=0;
    this.editProgLine.nativeElement.style.left='0px';
    this.editPos=0;
  });
  this.editorAVPlyr.nativeElement.addEventListener('emptied',async()=>{console.log('[editPlyr|emptied]');
    this.editPlyrPtys.isLoaded=false;
  });
  this.editorAVPlyr.nativeElement.addEventListener('ratechange',()=>{console.log('[editPlyr|ratechange]')});
  this.editorAVPlyr.nativeElement.addEventListener('volumechange',()=>{console.log('[editPlyr|volumechange/muted]')});
  return Promise.resolve(true);
}
//-------------------------------------------------------
vizInitEditPlyr():Promise<boolean>{
  if(!this.audioCTX){this.audioCTX=new AudioContext()};
  if(!this.audioSRC){this.audioSRC=this.audioCTX.createMediaElementSource(this.editorAVPlyr.nativeElement)};
  if(!this.vizAnalyser){
    this.vizAnalyser=this.audioCTX.createAnalyser();
    this.vizAnalyser.fftSize=256;
    this.vizBufferLength=this.vizAnalyser.frequencyBinCount;
    this.vizDataArray=new Uint8Array(this.vizBufferLength);
    this.audioSRC.connect(this.vizAnalyser);
    this.vizAnalyser.connect(this.audioCTX.destination);
    this.vizAnalyser.getByteFrequencyData(this.vizDataArray);
  };
  this.vizInitDone=true;
  return Promise.resolve(true);
}
//-------------------------------------------------------
/////////////////////////////////////////////////////////
  editRectDraw(){
    this.editDrawRectContext.beginPath();
    this.editDrawRectContext.rect(this.editDrawClicks.start.x,31,this.editDrawClicks.end.x-this.editDrawClicks.start.x,this.editDrawRectCanvas.nativeElement.height-72);
    this.editDrawRectContext.fillStyle='#ffca281f';
    this.editDrawRectContext.fill();
    this.editDrawRectContext.strokeStyle='#ffca28';
    this.editDrawRectContext.lineWidth=0.5;
    this.editDrawRectContext.stroke();
  };
/////////////////////////////////////////////////////////
  editRectPoints(finalPoints){
    let startPCol:string='#ffca28',endPCol:string='#ffca28';
    if(finalPoints){startPCol='#24d372';endPCol='#fb4532'};
    this.editDrawRectContext.strokeStyle=startPCol;
    this.editDrawRectContext.lineJoin='round';
    this.editDrawRectContext.lineWidth=1;
    this.editDrawRectContext.beginPath();
    this.editDrawRectContext.arc(this.editDrawClicks.start.x,31,3,0,2*Math.PI,false);
    this.editDrawRectContext.fillStyle=startPCol;
    this.editDrawRectContext.fill();
    this.editDrawRectContext.lineWidth=1;
    this.editDrawRectContext.stroke();
    //----------
    this.editDrawRectContext.strokeStyle=endPCol;
    this.editDrawRectContext.lineJoin='round';
    this.editDrawRectContext.lineWidth=1;
    this.editDrawRectContext.beginPath();
    this.editDrawRectContext.arc(this.editDrawClicks.end.x,31,3,0,2*Math.PI,false);
    this.editDrawRectContext.fillStyle=endPCol;
    this.editDrawRectContext.fill();
    this.editDrawRectContext.lineWidth=1;
    this.editDrawRectContext.stroke();
  };
/////////////////////////////////////////////////////////
  editRectRedraw(finalPoints:boolean){
    this.editDrawRectCanvas.nativeElement.width=this.editDrawRectCanvas.nativeElement.width;
    this.editRectDraw();
    this.editRectPoints(finalPoints);
  };
/////////////////////////////////////////////////////////
  setEditSelectRange():Promise<HomeEditSelectRange>{
    let absStartX:number=0,absEndX:number=0;
    if(this.editDrawClicks.end.x>this.editDrawClicks.start.x){absStartX=this.editDrawClicks.start.x;absEndX=this.editDrawClicks.end.x}
    else{absStartX=this.editDrawClicks.end.x;absEndX=this.editDrawClicks.start.x};
    const absStartTime:number=Number(((absStartX/this.editDrawRectCanvas.nativeElement.width)*this.editDur).toFixed(2));
    const absEndTime:number=Number(((absEndX/this.editDrawRectCanvas.nativeElement.width)*this.editDur).toFixed(2));
    const absTTLTime:number=absEndTime-absStartTime;
    const absTTLPerc:number=(absTTLTime/this.editDur)*100;
    let esrObj:HomeEditSelectRange={start:{pos:absStartX,time:absStartTime},end:{pos:absEndX,time:absEndTime},ttl:{time:absTTLTime,perc:absTTLPerc}};
    return Promise.resolve(esrObj);
  };
/////////////////////////////////////////////////////////
  editDrawRectListen(){
    this.editDrawRectCanvas.nativeElement.removeAllListeners();
    this.editDrawRectCanvas.nativeElement.addEventListener('mousedown',(e)=>{
      this.editDrawMouseDown=true;
      this.homeWrap.nativeElement.style.userSelect='none!important';
      this.editDrawRectCanvas.nativeElement.style.userSelect='all!important';
      if(this.editSelectRange){this.editSelectRange=null};
      let limX:number;if(e.offsetX<0){limX=0}else if(e.offsetX>this.editDrawRectCanvas.nativeElement.width){limX=this.editDrawRectCanvas.nativeElement.width}else{limX=e.offsetX};
      this.editDrawClicks.start={x:limX,y:31,t:((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)};
      this.pDOM();
    });
    this.editDrawRectCanvas.nativeElement.addEventListener('mousemove',async(e)=>{
      if(this.editDrawMouseDown){
        let limX:number;if(e.offsetX<0){limX=0}else if(e.offsetX>this.editDrawRectCanvas.nativeElement.width){limX=this.editDrawRectCanvas.nativeElement.width}else{limX=e.offsetX};
        this.editDrawClicks.end={
          x:limX,
          y:(this.editDrawRectCanvas.nativeElement.height-72),
          t:((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)
        };
        this.pDOM();
        const absTime:number=Math.abs(((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)-this.editDrawClicks.start.t);
        this.editDrawClicks.ttl={time:absTime,perc:((absTime/this.editDur)*100)};
        if(this.showEditSelectRangeInputs){this.updateEditRange()};
        this.editRectRedraw(false);
        this.pDOM();
      }else{
        this.editSelectLine.nativeElement.style.left=String(e.offsetX)+'px';
        this.editSelectLineNo.nativeElement.innerText=((e.offsetX/this.editDrawRectCanvas.nativeElement.width)*this.editDur).toFixed(2);
        this.pDOM();
      };
    });
    this.editDrawRectCanvas.nativeElement.addEventListener('mouseup',async(e)=>{
      this.editDrawMouseDown=false;
      this.homeWrap.nativeElement.style.userSelect='unset';
      this.editDrawRectCanvas.nativeElement.style.userSelect='unset';
      let limX:number;if(e.offsetX<0){limX=0}else if(e.offsetX>this.editDrawRectCanvas.nativeElement.width){limX=this.editDrawRectCanvas.nativeElement.width}else{limX=e.offsetX};
      const absTime:number=Math.abs(((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)-this.editDrawClicks.start.t);
      this.editDrawClicks.end={x:limX,y:(this.editDrawRectCanvas.nativeElement.height-72),t:((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)};
      this.editDrawClicks.ttl={time:absTime,perc:((absTime/this.editDur)*100)};
      if(this.editDrawClicks.ttl.time>=0.02){
        if(this.editDrawClicks.end.x<this.editDrawClicks.start.x){
          const flipdStartX:number=this.editDrawClicks.end.x;
          const flidStartTime:number=this.editDrawClicks.end.t;
          const flipdEndX:number=this.editDrawClicks.start.x;
          const flipdEndTime:number=this.editDrawClicks.start.t;
          this.editDrawClicks.start.x=flipdStartX;
          this.editDrawClicks.start.t=flidStartTime;
          this.editDrawClicks.end.x=flipdEndX;
          this.editDrawClicks.end.t=flipdEndTime;
        };
        this.editRectRedraw(true);
        this.editSelectRange=await this.setEditSelectRange();
        if(this.showEditSelectRangeInputs){this.updateEditRange()};
        this.pDOM();
      }else{
        this.editDrawRectCanvas.nativeElement.width=this.editDrawRectCanvas.nativeElement.width;
        this.editDrawClicks={start:{x:0,y:0,t:0},end:{x:0,y:0,t:0},ttl:{time:0,perc:0}};
        this.editSelectRange=null;
        this.pDOM();
      };
    });
    this.editDrawRectCanvas.nativeElement.addEventListener('dblclick',()=>{
      this.editDrawRectCanvas.nativeElement.width=this.editDrawRectCanvas.nativeElement.width;
      this.editDrawClicks={start:{x:0,y:0,t:0},end:{x:0,y:0,t:0},ttl:{time:0,perc:0}};
      this.editSelectRange=null;
      this.pDOM();
    });
    this.editDrawRectCanvas.nativeElement.addEventListener('mouseenter',()=>{
      this.editSelect.mouseIn=true;
      this.pDOM();
    });
    this.editDrawRectCanvas.nativeElement.addEventListener('mouseleave',async(e)=>{
      if(this.editDrawMouseDown){
        this.editDrawMouseDown=false;
        this.homeWrap.nativeElement.style.userSelect='unset';
        this.editDrawRectCanvas.nativeElement.style.userSelect='unset';
        let limX:number=this.editDrawClicks.end.x;
        const absTime:number=Math.abs(((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)-this.editDrawClicks.start.t);
        this.editDrawClicks.end={x:limX,y:(this.editDrawRectCanvas.nativeElement.height-72),t:((limX/this.editDrawRectCanvas.nativeElement.width)*this.editDur)};
        this.editDrawClicks.ttl={time:absTime,perc:((absTime/this.editDur)*100)};
        if(this.editDrawClicks.ttl.time>=0.02){
          if(this.editDrawClicks.end.x<this.editDrawClicks.start.x){
            const flipdStartX:number=this.editDrawClicks.end.x;
            const flidStartTime:number=this.editDrawClicks.end.t;
            const flipdEndX:number=this.editDrawClicks.start.x;
            const flipdEndTime:number=this.editDrawClicks.start.t;
            this.editDrawClicks.start.x=flipdStartX;
            this.editDrawClicks.start.t=flidStartTime;
            this.editDrawClicks.end.x=flipdEndX;
            this.editDrawClicks.end.t=flipdEndTime;
          };
          this.editRectRedraw(true);
          this.editSelectRange=await this.setEditSelectRange();
          if(this.showEditSelectRangeInputs){this.updateEditRange()};
          this.pDOM();
        }else{
          this.editDrawRectCanvas.nativeElement.width=this.editDrawRectCanvas.nativeElement.width;
          this.editDrawClicks={start:{x:0,y:0,t:0},end:{x:0,y:0,t:0},ttl:{time:0,perc:0}};
          this.editSelectRange=null;
          this.pDOM();
        };
      }else{
        this.editDrawMouseDown=false;
        this.editSelect.mouseIn=false;
        this.pDOM();
      }
    });
  }
/////////////////////////////////////////////////////////
  updateEditRange():Promise<boolean>{
    let sInput:HTMLInputElement=this.editorSelRangeInputStart.nativeElement,eInput:HTMLInputElement=this.editorSelRangeInputEnd.nativeElement;
    let fDur:number=0;if(this.editDur&&this.editDur>0){fDur=Number((this.editDur).toFixed(2))}else{fDur=Number((this.homeSStates.editorFile.pl.plFileObj.dur.no).toFixed(2))};
    let oIU:number=Number((fDur/100).toFixed(2));
    let siV:number=0,eiV:number=0;
    if(this.editDrawClicks.ttl.time>0){
      const sDen:number=Math.round(this.editDrawClicks.start.t/oIU);siV=oIU*sDen;
      const eDen:number=Math.round(this.editDrawClicks.end.t/oIU);eiV=oIU*eDen;
    }else{siV=oIU*40;eiV=oIU*60};
    sInput.min=String(0);sInput.max=String((eiV-oIU));sInput.step=String(oIU);sInput.value=String((siV).toFixed(2));
    eInput.min=String(siV);eInput.max=String(fDur);eInput.step=String(oIU);eInput.value=String((eiV).toFixed(2));
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async specRectSelect(sTime:number,eTime:number):Promise<boolean>{
    this.cCons('specRectSelect('+String(sTime)+','+String(eTime)+')...');
    this.editDrawRectCanvas.nativeElement.width=this.editDrawRectCanvas.nativeElement.width;
    const canvW:number=this.editDrawRectCanvas.nativeElement.width,canvH:number=this.editDrawRectCanvas.nativeElement.height;
    const t2Pos=(t:number):number=>{return Math.floor((t/this.editDur)*canvW)};
    this.editDrawClicks={start:{x:t2Pos(sTime),y:31,t:sTime},end:{x:t2Pos(eTime),y:(canvH-43),t:eTime},ttl:{time:(eTime-sTime),perc:(((eTime-sTime)/this.editDur)*100)}};
    this.editRectRedraw(true);
    this.editSelectRange=await this.setEditSelectRange();
    if(this.showEditSelectRangeInputs){this.updateEditRange()};
    this.pDOM();
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async editAVToolboxEvents(eName:string,eData:any,eEvent?:any):Promise<boolean>{
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,editsDir:string=path.join(pPath,'edits');
    switch(eName){
      case 'openeditdir':ipcRenderer.send('openWindowsDir',[eData]);break;
      case 'selection-deselect':
        let SDsInput:HTMLInputElement=this.editorSelRangeInputStart.nativeElement,SDeInput:HTMLInputElement=this.editorSelRangeInputEnd.nativeElement;
        SDsInput.min=String(0);SDsInput.max=String(0);SDsInput.step=String(0);SDsInput.value=String(0);
        SDeInput.min=String(0);SDeInput.max=String(0);SDeInput.step=String(0);SDeInput.value=String(0);
        this.editDrawRectCanvas.nativeElement.width=this.editDrawRectCanvas.nativeElement.width;
        this.editDrawClicks={start:{x:0,y:0,t:0},end:{x:0,y:0,t:0},ttl:{time:0,perc:0}};
        this.editSelectRange=null;
        this.pDOM();
        break;
      case 'selection-selectall':this.specRectSelect(0,this.editDur);break;
      case 'selection-editrange-ok':this.showEditSelectRangeInputs=false;break;
      case 'selection-editrange-cancel':this.editAVToolboxEvents('selection-deselect',null,null);this.showEditSelectRangeInputs=false;break;
      case 'selection-editrange':
        let sInput:HTMLInputElement=this.editorSelRangeInputStart.nativeElement,eInput:HTMLInputElement=this.editorSelRangeInputEnd.nativeElement;
        let fDur:number=0;if(this.editDur&&this.editDur>0){fDur=Number((this.editDur).toFixed(2))}else{fDur=Number((this.homeSStates.editorFile.pl.plFileObj.dur.no).toFixed(2))};
        let oIU:number=Number((fDur/100).toFixed(2));console.log(oIU);
        if(eData==='toggle'){
          if(this.showEditSelectRangeInputs){this.showEditSelectRangeInputs=false}
          else{this.showEditSelectRangeInputs=true;
            let siV:number=0,eiV:number=0;
            if(this.editDrawClicks.ttl.time>0){
              const sDen:number=Math.round(this.editDrawClicks.start.t/oIU);siV=oIU*sDen;
              const eDen:number=Math.round(this.editDrawClicks.end.t/oIU);eiV=oIU*eDen;
            }else{siV=oIU*40;eiV=oIU*60};
            sInput.min=String(0);sInput.max=String((eiV-oIU));sInput.step=String(oIU);sInput.value=String(siV);
            eInput.min=String(siV);eInput.max=String(fDur);eInput.step=String(oIU);eInput.value=String(eiV);
            if(this.editDrawClicks.ttl.time===0||this.editSelectRange===null){this.specRectSelect(siV,eiV)};
          };
        }else{
          if(eData.subaction==='keyup'||eData.subaction==='blur'||eData.subaction==='wheel'){sInput.max=String((Number(eInput.value)-oIU));eInput.min=sInput.value;await this.specRectSelect(Number(sInput.value),Number(eInput.value))}
          else if(eData.subaction==='keypress'){if(eEvent.code==='Enter'||eEvent.key==='Enter'){eEvent.preventDefault();if(eEvent.defaultPrevented){await this.specRectSelect(Number(sInput.value),Number(eInput.value));this.editAVToolboxEvents('selection-editrange','toggle',null)}}};
        };
        break;
      case 'selection-cropdelete-undo':
        const remUndoneFP:string=this.homeSStates.editorFile.edit.path;
        const undoEditObj:HomeEditorCrop|HomeEditorDelete=this.homeSStates.editorFile.undo;
        this.homeSStates.editorFile.edit=undoEditObj;
        await this.editorAVFns('load',this.homeSStates.editorFile);
        this.homeSStates.editorFile.undo=null;
        await unlink(remUndoneFP);
        break;
      case 'selection-crop':
        if(this.editSelectRange){
          let hasPUndo:boolean=false,pUndo:HomeEditorCrop|HomeEditorDelete|null=null;
          if(this.homeSStates.editorFile.hasOwnProperty('undo')&&this.homeSStates.editorFile.undo){hasPUndo=true;pUndo=this.homeSStates.editorFile.undo};
          const cropRes:HomeEditorCrop|false=await this.ffServ.cropVideo(this.homeSStates.editorFile.edit.path,this.editSelectRange.start.time,this.editSelectRange.end.time,pUndo);
          if(cropRes){
            if(!hasPUndo){
              const undoEditObj:HomeEditorEdit=this.homeSStates.editorFile.edit;
              this.homeSStates.editorFile.undo=undoEditObj;
              this.homeSStates.editorFile.edit=cropRes;
              this.pDOM();
            };
            await this.editAVToolboxEvents('selection-deselect',null,null);
            this.editorAVFns('load',this.homeSStates.editorFile);
          }else{this.cCons('(editAVToolboxEvents|selection-crop) ERROR: Crop Failed')};
        }else{this.cCons('(editAVToolboxEvents|selection-crop) ERROR: editSelectRange===null')};
        break;
      case 'selection-delete':
        if(this.editSelectRange){
          let hasPUndo:boolean=false,pUndo:HomeEditorCrop|HomeEditorDelete|null=null;
          if(this.homeSStates.editorFile.hasOwnProperty('undo')&&this.homeSStates.editorFile.undo){hasPUndo=true;pUndo=this.homeSStates.editorFile.undo};
          const delRes:HomeEditorDelete|false=await this.ffServ.delSegment(this.homeSStates.editorFile.edit.path,this.editSelectRange.start.time,this.editSelectRange.end.time,pUndo);
          if(delRes){
            if(!hasPUndo){
              const undoEditObj:HomeEditorEdit=this.homeSStates.editorFile.edit;
              this.homeSStates.editorFile.undo=undoEditObj;
              this.homeSStates.editorFile.edit=delRes;
              this.pDOM();
            };
            await this.editAVToolboxEvents('selection-deselect',null,null);
            this.editorAVFns('load',this.homeSStates.editorFile);
          }else{this.cCons('(editAVToolboxEvents|selection-crop) ERROR: Crop Failed')};
        }else{this.cCons('(editAVToolboxEvents|selection-crop) ERROR: editSelectRange===null')};
        break;
      case 'selection-exporttofile':break;
      //-------------------
      case 'save2pl':
        if((await this.exists(this.homeSStates.editorFile.pl.plFileObj.path))){await unlink(this.homeSStates.editorFile.pl.plFileObj.path)};
        if(!(await this.exists(this.homeSStates.editorFile.pl.plFileObj.path))){await copyFile(this.homeSStates.editorFile.edit.path,this.homeSStates.editorFile.pl.plFileObj.path)};
        if((await this.exists(this.homeSStates.editorFile.pl.plFileObj.path))){this.evServ.publish('updateBA','Editor|Save: Edit Saved to Playlist ('+this.homeSStates.editorFile.pl.plFileObj.cname+')')}
        else{this.cCons('(editAVToolboxEvents|save2pl) ERROR: Error Del Old File || Copying Edit File')};
        break;
      case 'finishclose':
        let didSave2PL:boolean|null=null;
        if(this.editShouldSave){
          const doSaveEditPrompt:any=await ipcRenderer.invoke('prompt-save-editor-file',['saveEditAVQuestion',{name:this.homeSStates.editorFile.pl.plFileObj.cname}]);
          if(doSaveEditPrompt==='cancel'){this.evServ.publish('updateBA','Editor|Finish/Close: Canceled');return}
          else{if(doSaveEditPrompt==='yes'){await this.editAVToolboxEvents('save2pl',null,null);didSave2PL=true}else{didSave2PL=false}};
        }else{didSave2PL=false};
        const editDirList:Dirent[]=await readdir(editsDir,{withFileTypes:true});
        if(editDirList&&editDirList.length>0){
          for(let fcI=0;fcI<editDirList.length;fcI++){
            const fileO:Dirent=editDirList[fcI],fileP:string=path.join(editsDir,fileO.name),fileIsD:boolean=fileO.isDirectory();
            if(fileP.includes(path.basename(this.homeSStates.editorFile.pl.plFileObj.path,'.mp4'))){
              if(fileIsD){await this.removeDir(fileP)}
              else{await unlink(fileP)}
            };
            const dSTxtFName:string=path.join(editsDir,'delSegs.txt');
            if((await this.exists(dSTxtFName))){await unlink(dSTxtFName)};
          };
        };
        const tempCName:string=this.homeSStates.editorFile.edit.cname;
        this.homeSStates.editorFile=null;
        ipcRenderer.send('home-editor-file',[null]);
        let fcSBTxt:string='Editor|Finish/Close: Closed '+tempCName;
        if(didSave2PL){fcSBTxt+=' (Playlist Updated)'};
        this.evServ.publish('updateBA',fcSBTxt);
        await this.doSaveStates();this.pDOM();
        break;
      case 'saveasnewfile':
        const saFPath:string=path.join(pPath,this.homeSStates.editorFile.edit.name);
        const doSaveEditPrompt:any=await ipcRenderer.invoke('editor-save-as',[saFPath]);
        if(doSaveEditPrompt){
          await copyFile(this.homeSStates.editorFile.edit.path,doSaveEditPrompt);
          if((await this.exists(doSaveEditPrompt))){this.evServ.publish('updateBA','Editor|SaveAs: Saved File to '+doSaveEditPrompt)}
          else{this.cCons('(editAVToolboxEvents|savenewfile) Copy from ../edits > Selected Location Failed')};
        }else{this.cCons('(editAVToolboxEvents|savenewfile) Save As Dialog Selection Failed')};
        break;
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  editPlyrCtrlBtns(action:string){
    this.cCons('(editPlyrCtrlBtns) ['+action+']...');
    const rateOpts:number[]=[0.25,0.5,1,2,3,4];
    switch(action){
      case 'playpause':if(this.editorAVPlyr.nativeElement.paused){this.editorAVPlyr.nativeElement.play()}else{this.editorAVPlyr.nativeElement.pause()};break;
      case 'loop':
        if(this.editorAVPlyr.nativeElement.loop){
          this.editorAVPlyr.nativeElement.loop=false;
          this.editPlyrPtys.loop=false;
        }else{
          this.editorAVPlyr.nativeElement.loop=true;
          this.editPlyrPtys.loop=true;
        };
        break;
      case 'selection':if(this.editPlyrPtys.selection){this.editPlyrPtys.selection=false}else{this.editPlyrPtys.selection=true};break;
      case 'rate-inc':
        const rIOldI:number=rateOpts.findIndex(r=>r===this.editorAVPlyr.nativeElement.playbackRate);
        const rINewI:number=rIOldI+1;
        this.editorAVPlyr.nativeElement.playbackRate=rateOpts[rINewI];
        this.editPlyrPtys.rate=rateOpts[rINewI];
        break;
      case 'rate-dec':
        const rDOldI:number=rateOpts.findIndex(r=>r===this.editorAVPlyr.nativeElement.playbackRate);
        const rDNewI:number=rDOldI-1;
        this.editorAVPlyr.nativeElement.playbackRate=rateOpts[rDNewI];
        this.editPlyrPtys.rate=rateOpts[rDNewI];
        break;
      case 'mute':
        if(this.editorAVPlyr.nativeElement.muted){this.editorAVPlyr.nativeElement.muted=false;this.editPlyrPtys.mute=false}
        else{this.editorAVPlyr.nativeElement.muted=true;this.editPlyrPtys.mute=true};
        break;
    };
  }
/////////////////////////////////////////////////////////
  async renderEditTicks(editFilePath?:string):Promise<boolean>{
    this.cCons('renderEditTicks('+editFilePath+')...');
    let editFP:string='';editFilePath?editFP=editFilePath:editFP=this.homeSStates.editorFile.edit.path;
    const getFreshDur:number=await this.ffServ.getMediaDur(editFP);
    const dur2Dec:number=Number((getFreshDur).toFixed(2));
    this.homeSStates.editorFile.edit['dur']=dur2Dec;
    this.editDur=this.homeSStates.editorFile.edit.dur;
    const segSize:number=this.editDur/100;
    const sT5Arr:number[]=[5,15,25,35,45,55,65,75,85,95];
    const sT10Arr:number[]=[10,20,30,40,50,60,70,80,90];
    let newTicks:HomeEditTick[]=[],lastTickVal:number=0,showTickCount:number=0;
    for(let i=0;i<100;i++){
      let tT:HomeEditTick={value:0,show:false};
      if(i===0){tT.show=true}
      else{
        showTickCount++;
        const thisNo:number=lastTickVal+=segSize;
        if(sT5Arr.includes(showTickCount)){tT={value:thisNo,show:true}}
        else if(sT10Arr.includes(showTickCount)){tT={value:thisNo,show:true}}
        else{tT={value:thisNo,show:false}};
      };
      newTicks.push(tT);
    };
    this.editTicks=newTicks;
    console.log(newTicks);
    return Promise.resolve(true);
  };
/////////////////////////////////////////////////////////
  async editorAVFns(action:string,data?:any):Promise<boolean>{
    switch(action){
      case 'load':
        let newEditFile:HomeEditorFile|null=null;
        if(data){newEditFile=data}else{return Promise.resolve(false)};
        if(!this.homeSStates.playerSectionVis){await this.showHideSection('player')};
        if(this.homeSStates.editorToolbox!=='av'){this.homeSStates.editorToolbox='av'};
        if(!_.isEqual(this.homeSStates.editorFile,newEditFile)){this.homeSStates.editorFile=newEditFile};
        if(this.editorAVPlyr.nativeElement.currentTime>0&&!this.editorAVPlyr.nativeElement.paused&&!this.editorAVPlyr.nativeElement.ended){this.editorAVPlyr.nativeElement.pause()};
        this.editorAVPlyr.nativeElement.currentTime=0;
        this.editProgLine.nativeElement.style.left='0px';
        this.editPlyrPtys.isPlay=false;this.editPlyrPtys.isPause=true;this.editPlyrPtys.isLoaded=false
        this.editPos=0;this.editTicks=[];this.editDur=0;
        this.editDrawClicks={start:{x:0,y:0,t:0},end:{x:0,y:0,t:0},ttl:{time:0,perc:0}};
        this.editSelectRange=null;
        await this.editPlyrListen();
        this.editorAVPlyr.nativeElement.src=this.homeSStates.editorFile.edit.path;
        //-----
        const editVPlyrWrapW:number=this.editorAVPlyrWrap.nativeElement.clientWidth;
        let aspRatStr:string='16:9';
        if(this.homeSStates.editorFile&&this.homeSStates.editorFile.pl.plFileObj.hasOwnProperty('display_aspect_ratio')&&this.homeSStates.editorFile.pl.plFileObj.display_aspect_ratio.includes(':')){aspRatStr=this.homeSStates.editorFile.pl.plFileObj.display_aspect_ratio};
        const ratStrArr:string[]=aspRatStr.split(':'),arUnit:number=editVPlyrWrapW/Number(ratStrArr[0]),editVPlyrWrapH:number=Math.round(arUnit*Number(ratStrArr[1]));
        this.editorAVPlyrWrap.nativeElement.style.height=this.editorAVPlyr.nativeElement.style.height=String(editVPlyrWrapH)+'px';
        this.editorAVPlyr.nativeElement.style.width=String(editVPlyrWrapW)+'px';
        this.editorAVPlyr.nativeElement.height=editVPlyrWrapH;
        this.editorAVPlyr.nativeElement.width=editVPlyrWrapW;
        //-----
        const gridWaveW:number=this.editGridWrap.nativeElement.clientWidth;
        const gridWaveH:number=editVPlyrWrapH-72;
        this.editGridWrap.nativeElement.style.height=this.editWaveImgWrap.nativeElement.style.height=this.editGridCanvas.nativeElement.style.height=String(gridWaveH)+'px';
        this.editGridWrap.nativeElement.style.width=this.editWaveImgWrap.nativeElement.style.width=this.editGridCanvas.nativeElement.style.width=String(gridWaveW)+'px';
        this.editGridCanvas.nativeElement.height=gridWaveH;
        this.editGridCanvas.nativeElement.width=gridWaveW;
        if(!this.gridContext){this.gridContext=this.editGridCanvas.nativeElement.getContext('2d')};
        if(!this.gridCanvas){this.gridCanvas=this.editGridCanvas.nativeElement};
        //-----
        this.editDrawRectCanvas.nativeElement.width=this.editPosOverlay.nativeElement.clientWidth;
        this.editDrawRectCanvas.nativeElement.height=this.editPosOverlay.nativeElement.clientHeight;
        this.editDrawRectContext=this.editDrawRectCanvas.nativeElement.getContext('2d');
        this.pDOM();
        //-----------------
        this.editThumbsReady=false;
        const getEditThumbs:HomeThumbObject[]|false=await this.ffServ.getEditThumbs(this.homeSStates.editorFile.edit.path,this.editThumbsWrap.nativeElement.clientWidth,this.editThumbsWrap.nativeElement.clientHeight,this.homeSStates.editorFile.edit.dur);
        if(getEditThumbs){let cleanThumbsArr:HomeThumbObject[]=[];for(let i=0;i<getEditThumbs.length;i++){const cleanPath:any=this.sanitizer.bypassSecurityTrustResourceUrl(getEditThumbs[i].path);cleanThumbsArr.push({time:getEditThumbs[i].time,path:cleanPath})};this.editThumbs=cleanThumbsArr;this.editThumbsReady=true};
        this.pDOM();
        //------------------
        if(!this.vizInitDone){await this.vizInitEditPlyr()};
        this.editDrawRectListen();
        await this.renderEditTicks();
        this.renderGrid('init');
        this.doWavePic();
        this.pDOM();
        await this.doSaveStates();
        const sbT:string='Editor|Added: '+newEditFile.pl.plFileObj.cname+' (../edits/'+newEditFile.edit.name+')';
        this.evServ.publish('updateBA',sbT);this.cCons('(editorAVFns|load): '+sbT);
        console.log(this.homeSStates.editorFile);
        break;
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async doAddFilesPrompt(){
    if(!this.homeSStates.homeFeIsOpen){
      const tempL=this.evServ.subscribe('homeFeIsOpen',tf=>{
        if(tf){setTimeout(()=>{this.evServ.publish('fePromptAddFiles',null);tempL.unsubscribe},250)}
      });
      this.evServ.publish('feToggle',true);
    }else{this.evServ.publish('fePromptAddFiles',null)}
  }
  //-----------------------------------------------------
  async icFile(testFilePath:string,parentDir:'media'|'audio'|'subs'|'video'):Promise<boolean>{
    let bDP:string='';
    if(parentDir==='media'){bDP=path.normalize((await ipcRenderer.invoke('getMediaPath')))}
    else{bDP=path.normalize((await ipcRenderer.invoke('getBDirPath',[parentDir])))};
    const tDP:string=path.dirname(testFilePath);
    if(bDP===tDP){return Promise.resolve(true)}
    else{
      const gRel:string=path.relative(bDP,tDP);
      const isSD:boolean=gRel&&!gRel.startsWith('..')&&!path.isAbsolute(gRel);
      return Promise.resolve(isSD)
    }
  }
  //-----------------------------------------------------
  async rwFile(fileObj:any):Promise<boolean>{
    const rwFPIsV:boolean=await this.vFile(fileObj.path);
    if(rwFPIsV){
      try{const rwRes:boolean=await fs.promises.access(fileObj.path,constants.W_OK);
      if(rwRes){return Promise.resolve(true)}else{return Promise.resolve(false)}}
      catch(e){this.cCons('(rwFile) ERROR: '+JSON.stringify(e));return Promise.resolve(false)}
    }else{return Promise.resolve(false)}}
  //-----------------------------------------------------
  async wFile(fileObj:any,data:any):Promise<boolean>{
    const wFPIsV:boolean=await this.vFile(fileObj.path);
    if(wFPIsV){
      let fileTxt:any=data;if(typeof data!=='string'){fileTxt=JSON.stringify(data)};
      try{await writeFile(fileObj.path,fileTxt);return Promise.resolve(true)}
      catch(e){this.cCons('(wFile) ERROR: '+JSON.stringify(e));return Promise.resolve(false)}
    }else{this.cCons('(wFile) Invalid FP - Aborted');return Promise.resolve(false)}
  }
  //-----------------------------------------------------
  async getFSize(path:string):Promise<any>{
    try{
      const statRes:Stats=await stat(path,{bigint:false});
      if(statRes){const fSz:number=statRes.size;return Promise.resolve({r:true,d:fSz})}
      else{this.cCons('(getFSize) ERROR: statRes Object Empty');return Promise.resolve({r:false,d:null})}
    }catch(e){this.cCons('(getFSize) ERROR: '+e);return Promise.resolve({r:false,d:null})}
  }
  //-----------------------------------------------------
  async exists(path:string):Promise<boolean>{try{await access(path);return true}catch{return false}};
  async mkDir(path:string):Promise<boolean>{try{await mkdir(path,{recursive:true});return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}};
  async statSize(path:string):Promise<{r:boolean,d:number}>{try{const sRes:any=await stat(path);return Promise.resolve({r:true,d:sRes.size})}catch(e){return Promise.resolve({r:false,d:0})}};
  //-----------------------------------------------------
  async vFile(fPath:string):Promise<boolean>{
    try{const existRes:boolean=await this.exists(fPath);if(existRes){return Promise.resolve(existRes)}else{return Promise.resolve(false)}}
    catch(e){this.cCons('(vFile) ERROR: '+e);return Promise.resolve(false)}
  }
  //-----------------------------------------------------
  async rFile(fPath:string):Promise<any>{try{const rFRes:any=await readFile(fPath,{encoding:'utf-8'});return Promise.resolve({r:true,d:rFRes})}catch(e){this.cCons('(rFile) ERROR: '+JSON.stringify(e));return Promise.resolve({r:false,d:null})}}
  //-----------------------------------------------------
  async rLines(mode:'file'|'txt',fPath:string):Promise<number>{let lCount:number=0;if(mode==='file'){let rl:any=readline.createInterface({input:fs.createReadStream(fPath),crlfDelay:Infinity,output:process.stdout,terminal:false});rl.on('line',()=>{lCount++});return new Promise((resolve)=>{rl.on('close',()=>{resolve(lCount)})})}else{const txtLineArr:string[]=fPath.toString().replace(/\r\n/g,'\n').split('\n');lCount=txtLineArr.length;return Promise.resolve(lCount)}}
  //-----------------------------------------------------
  secs2HMS(d:number):string{let h:number=Math.floor(d/3600),m:number=Math.floor(d%3600/60),s:number=Math.floor(d%3600%60),hD:string=String(h>0?(h<10?'0'+h:h):'00'),mD:string=String(m>0?(m<10?'0'+m:m):'00'),sD:string=String(s>0?(s<10?'0'+s:s):'00');return String(hD+':'+mD+':'+sD)}
  //-----------------------------------------------------
  cvBs(b:number):Promise<HomePPLDurNiceBytes>{
    const bts:number=b,sz:string[]=['bs','KB','MB','GB','TB'];
    let resO:any={no:<number>0,txt:<string>'',suffix:<string>''};
    if(bts===0){resO={no:0,txt:'',suffix:''}}
    else{
      const bI:number=(Math.floor(Math.log(b)/Math.log(1024)));
      resO.no=(bts/Math.pow(1024,bI));
      resO.suffix=sz[bI];
      if(bI===0||bI===1){resO.txt=resO.no.toFixed(0)}
      else{resO.txt=resO.no.toFixed(2)}
    };
    return Promise.resolve(resO);
  }
  //-----------------------------------------------------
  async gTPLDur():Promise<HomePPLDurObject>{
    let hDataTDObj:HomePPLDurObject={no:<number>0,txt:<string>'-'};
    const itemsL:HomePPLItem[]=this.mainPlayerPtys.plLoaded.items;
    for(let i=0;i<itemsL.length;i++){if(itemsL[i].dur.no>0){hDataTDObj.no+=itemsL[i].dur.no}};
    if(hDataTDObj.no>0){hDataTDObj.txt=this.secs2HMS(hDataTDObj.no)};
    return Promise.resolve(hDataTDObj);
  }
  //-----------------------------------------------------
  async gTPLSize():Promise<HomePPLDurNiceBytes>{
    let hDataTSObj:HomePPLDurNiceBytes={no:0,txt:'',suffix:''};
    const itemsL:HomePPLItem[]=this.mainPlayerPtys.plLoaded.items;
    for(let i=0;i<itemsL.length;i++){
      const plOPath:string=itemsL[i].path;
      const plOSizeRes:any=await this.statSize(plOPath);
      if(plOSizeRes.r&&plOSizeRes.d>0){hDataTSObj.no+=plOSizeRes.d};
    };
    if(hDataTSObj.no>0){
      let lBTS:string[]=['MB','GB','TB'];
      hDataTSObj=await this.cvBs(hDataTSObj.no);
      if(lBTS.includes(hDataTSObj.suffix)&&Number(hDataTSObj.txt.split('.')[0])>0){hDataTSObj.txt=Math.ceil(Number(hDataTSObj.txt)).toString()}
    };
    return Promise.resolve(hDataTSObj);
  }
  //-----------------------------------------------------
  async gMData(fileObj:any):Promise<{size:number,info:FFProbeStream}|false> {
    this.cCons('(gMData)...');
    const fST:string=path.dirname(fileObj.path);
    if(fileObj.type!=='file'){this.cCons('!fileObj=Directory');return Promise.resolve(false)};
    if(fST==='subs'){this.cCons('!fileObj=Subtitle');return Promise.resolve(false)};
    if(fST==='audio'&&!defAppStates.mediaFileExts[fST].includes(fileObj.extension)){this.cCons('Unsupported Audio Format');return Promise.resolve(false)};
    if(fST==='video'&&!defAppStates.mediaFileExts[fST].includes(fileObj.extension)){this.cCons('Unsupported Video Format');return Promise.resolve(false)};
    if((await this.exists(fileObj.path))){const aDSizeRes:any=await this.statSize(fileObj.path),aDInfoRes:FFProbeStream=await this.ffServ.getProbe(fileObj.path);
      if(aDSizeRes.r&&aDSizeRes.d>0&&aDInfoRes){return Promise.resolve({size:aDSizeRes.d,info:aDInfoRes})}
      else{this.cCons('(gMDur|vFile) Size|Info Req Failed');return Promise.resolve(false)};
    }else{this.cCons('(gMDur|vFile) File Path !Exists');return Promise.resolve(false)}
  }
/////////////////////////////////////////////////////////
  async loadFiles(section:string,fileData:any) { this.cCons('(loadFiles)...');
    const isU=(o:any)=>{if(this.mainPlayerPtys.plLoaded.items.filter(pO=>pO.path===o.path).length===0){return true}else{return false}};
    const addPs=async(o:any):Promise<HomePPLItem>=>{
      if(_.isEmpty(this.homeSStates.plMarkedItems)||!this.homeSStates.plMarkedItems.hasOwnProperty(o.path)){this.homeSStates.plMarkedItems[o.path]=false};
      let nO:HomePPLItem=o;
      const extStr:string=path.extname(o.path);
      nO['bdir']=path.dirname(o.path);
      nO['cname']=path.basename(o.path,extStr);
      const xtraDRes:{size:number,info:FFProbeStream}|false=await this.gMData(o);
      if(xtraDRes){
        nO['dur']={no:Number(xtraDRes.info.duration),txt:(xtraDRes.info.duration>0?Number(xtraDRes.info.duration).toFixed(4):'-')};nO['fsize']=await this.cvBs(xtraDRes.size);
        for(const[k,v]of Object.entries(xtraDRes.info)){if(!nO.hasOwnProperty(k)){nO[k]=v}};
      }else{nO['dur']={no:0,txt:'-'};nO.fsize={no:0,txt:'',suffix:''}};
      return Promise.resolve(nO);
    };
    if(section==='player'){
      if(fileData.type==='directory'){
        let uOs:HomePPLItem[]=[];
        if(fileData.hasOwnProperty('children')&&fileData.children.length>0){
          for(let i=0;i<fileData.children.length;i++){
            let aO:any=fileData.children[i];if(aO.type==='file'){if(isU(aO)){const uO:any=await addPs(aO);uOs.push(uO)}}
            else{
              if(aO.hasOwnProperty('children')&&aO.children.length>0){
                for(let i=0;i<aO.children.length;i++){
                  let a2O:any=aO.children[i];if(a2O.type==='file'){if(isU(a2O)){const u2O:any=await addPs(a2O);uOs.push(u2O)}}
                  else{
                    if(a2O.hasOwnProperty('children')&&a2O.children.lenth>0){
                      for(let i=0;i<a2O.children.length;i++){
                        let a3O:any=a2O.children[i];if(a3O.type==='file'){if(isU(a3O)){const u3O:any=await addPs(a3O);uOs.push(u3O)}}
                      };
                    };
                  };
                };
              };
            };
          };
          if(uOs.length>0){
            let lCs:any={count:{no:uOs.length,txt:String(uOs.length)},size:{no:0,txt:'',suffix:''},dur:{no:0,txt:''}};
            let comboDArr:HomePPLItem[]=[];
            if(this.mainPlayerPtys.plLoaded.items.length===0){comboDArr=uOs}
            else{comboDArr=this.mainPlayerPtys.plLoaded.items.concat(uOs)};
            // If List Sorting ON
            if(this.homeSStates.plSort.by!==null){comboDArr=_.orderBy(comboDArr,this.homeSStates.plSort.by,this.homeSStates.plSort.dir)};
            // Update projectPlaylists Array & plLoaded Obj
            const homePLIndex:number=this.homeSStates.projectPlaylists.findIndex(plO=>plO.name===this.mainPlayerPtys.plLoaded.name);
            this.mainPlayerPtys.plLoaded.items=comboDArr;
            this.homeSStates.projectPlaylists[homePLIndex].items=comboDArr;
            await this.doSaveStates();
            // Update playList Header
            let newPLHData:HomePLHData={tsize:{no:0,txt:'',suffix:''},tdur:{no:0,txt:''}};
            newPLHData.tsize=await this.gTPLSize();newPLHData.tdur=await this.gTPLDur();
            lCs.size.no=newPLHData.tsize.no-this.homeSStates.plHData.tsize.no;
            const txtSzs:any=await this.cvBs(lCs.size.no);lCs.size.txt=txtSzs.txt;lCs.size.suffix=txtSzs.suffix;
            lCs.dur.no=newPLHData.tdur.no-this.homeSStates.plHData.tdur.no;lCs.dur.txt=this.secs2HMS(lCs.dur.no);
            this.homeSStates.plHData=newPLHData;
            // Sync Player/list
            await this.mainMediaPlayer('updatelist');
            const cTxt:string='Add '+lCs.count.txt+' Files ► Playlist (+'+lCs.size.txt+lCs.size.suffix+'|'+lCs.dur.txt+')';
            this.cCons('(loadFiles) '+cTxt);this.evServ.publish('updateBA',cTxt);
            this.pDOM();await this.doSaveStates();return Promise.resolve(true);
          }
        }
      }else{
        if(isU(fileData)){
          const fObj:HomePPLItem=await addPs(fileData);
          let comboFArr:any[]=this.mainPlayerPtys.plLoaded.items;
          comboFArr.push(fObj);
          // If List Sorting ON
          if(this.homeSStates.plSort.by!==null){comboFArr=_.orderBy(comboFArr,this.homeSStates.plSort.by,this.homeSStates.plSort.dir)};
          // Update projectPlaylists Array & plLoaded Obj
          const homePLIndex:number=this.homeSStates.projectPlaylists.findIndex(plO=>plO.name===this.mainPlayerPtys.plLoaded.name);
          this.mainPlayerPtys.plLoaded.items=comboFArr;
          this.homeSStates.projectPlaylists[homePLIndex].items=comboFArr;
          await this.doSaveStates();
          // Update playList Header
          const newTSize:HomePPLDurNiceBytes=await this.gTPLSize();
          const newTDur:HomePPLDurObject=await this.gTPLDur();
          const newPLHData:HomePLHData={tsize:newTSize,tdur:newTDur};
          this.homeSStates.plHData=newPLHData;
          // Sync Player/list
          await this.mainMediaPlayer('updatelist');
          let cTxt:string='Add File ► Playlist ';fObj.hasOwnProperty('fsize')&&fObj.fsize.no>0?cTxt+='(+'+fObj.fsize.txt+fObj.fsize.suffix+'|':cTxt+='(+';cTxt+=fObj.dur.txt+')';
          this.cCons('(loadFiles) '+cTxt);this.evServ.publish('updateBA',cTxt);
          this.pDOM();await this.doSaveStates();return Promise.resolve(true);
        }
      }
    }
  }
/////////////////////////////////////////////////////////
  scrapeSTimer(action:string){
    const timeRemaining=(endtime:number):Promise<any>=>{
      const xMins=(ms:number):string=>{let rawM:string=String(Math.floor((ms/1000/60)%60));if(rawM.length<2){return '0'+rawM}else{return rawM}};
      const xSecs=(ms:number):string=>{let rawS:string=String(Math.floor((ms/1000)%60));if(rawS.length<2){return '0'+rawS}else{return rawS}};
      const nowTime:number=(this.evServ.gUT(new Date())*1000),et:number=(nowTime-this.homeSStates.searchStatus.startTime),tr:number=endtime-nowTime;
      let progP:number=0,progPT:string='',progB:number=0;
      if(this.homeSStates.searchLimits.scrape.nolimit.time){progP=0.01;progB=0.01}
      else{const ttl:number=(this.homeSStates.searchLimits.scrape.time.minutes*60*1000)+(this.homeSStates.searchLimits.scrape.time.seconds*1000);progP=et/ttl;progPT=String(Math.round(progP*100)+'%');progB=1};
      return Promise.resolve({trTotal:tr,trStr:xMins(tr)+':'+xSecs(tr),etTotal:et,etStr:xMins(et)+':'+xSecs(et),progPerc:progP,progTxt:progPT,progBuff:progB});
    };
    const runClock=(endtime:number)=>{
	    const updateClock=async()=>{
        let t:any=await timeRemaining(endtime);
        this.homeSStates.searchStatus.counter={remainTime:t.trTotal,remainTStr:t.trStr,execTime:t.etTotal,execTStr:t.etStr};
        this.homeSStates.searchStatus.progress={type:'determinate',buffer:t.progBuff,perc:t.progPerc,txt:t.progTxt}
        this.pDOM();
        if(t.trTotal<=0){
          clearInterval(this.searchInt);
          this.cCons('(scrapeSTimer|updateClock) TIMEOUT');
          this.evServ.publish('updateBA','Scraper|Search: Limited (by Time) (at '+this.evServ.strFormat(new Date(),'HH:mm:ss')+')');
          const endTimeDate:Date=new Date();
          this.homeSStates.searchStatus.eTime={date:endTimeDate,txt:(this.evServ.strFormat(endTimeDate,'HH:mm:ss'))};
          this.homeSStates.searchStatus.info={txt:'Limited (by Time)',isErr:false};
          this.homeSStates.searchStatus.inProgress=false;
          this.pDOM();
        };
      };
	    updateClock();
	    this.searchInt=setInterval(updateClock,1000);
      this.pDOM();
    };
    const startClock=()=>{
      this.cCons('(scrapeSTimer|startClock) START');
      this.evServ.publish('updateBA','Scraper|Search: Started (at '+this.evServ.strFormat(new Date(),'HH:mm:ss')+')');
      this.homeSStates.searchStatus.inProgress=true;
      const startTimeDate:Date=new Date();
      this.homeSStates.searchStatus.startTime=(this.evServ.gUT(startTimeDate))*1000;
      this.homeSStates.searchStatus.sTime={date:startTimeDate,txt:(this.evServ.strFormat(startTimeDate,'HH:mm:ss'))};
      this.homeSStates.searchStatus.deadlineTime=this.homeSStates.searchStatus.startTime+(this.homeSStates.searchLimits.scrape.time.minutes*60*1000)+(this.homeSStates.searchLimits.scrape.time.seconds*1000);
      this.homeSStates.searchStatus.info={txt:'Searching...',isErr:false};
      runClock(this.homeSStates.searchStatus.deadlineTime);
      this.pDOM();
    };
    const stopClock=()=>{
      clearInterval(this.searchInt);
      this.cCons('(scrapeSTimer|stopClock) STOPPED');
      this.evServ.publish('updateBA','Scraper|Search: Stopped (at '+this.evServ.strFormat(new Date(),'HH:mm:ss')+')');
      this.homeSStates.searchStatus.inProgress=false;
      const endTimeDate:Date=new Date();
      this.homeSStates.searchStatus.eTime={date:endTimeDate,txt:(this.evServ.strFormat(endTimeDate,'HH:mm:ss'))};
      this.homeSStates.searchStatus.info={txt:'Search Canceled',isErr:false};
      this.pDOM();
    };
    const pauseClock=async()=>{
      if(!this.homeSStates.searchStatus.isPaused){
        clearInterval(this.searchInt);
        this.cCons('(scrapeSTimer|pauseClock) PAUSED');
        this.evServ.publish('updateBA','Scraper|Search: Paused (at '+this.evServ.strFormat(new Date(),'HH:mm:ss')+')');
        this.homeSStates.searchStatus.isPaused=true;
        this.homeSStates.searchStatus.info={txt:'paused',isErr:false};
        this.homeSStates.searchStatus.progress.type='indeterminate';
        this.compzSearchPauseBtn.nativeElement.classList.add('scrape-pausebtn-ispaused');
        const getCounts:any=await timeRemaining(this.homeSStates.searchStatus.deadlineTime);
        this.homeSStates.searchStatus.pauseTimeRemain=getCounts.trTotal;
        this.homeSStates.searchStatus.pauseTimeExec=getCounts.etTotal;
        this.pDOM();
      };
    };
    const resumeClock=()=>{
      if(this.homeSStates.searchStatus.isPaused){
        this.cCons('(scrapeSTimer|resumeClock) RESUMED');
        this.evServ.publish('updateBA','Scraper|Search: Resumed (at '+this.evServ.strFormat(new Date(),'HH:mm:ss')+')');
        this.homeSStates.searchStatus.isPaused=false;
        this.homeSStates.searchStatus.info={txt:'searching...',isErr:false};
        this.homeSStates.searchStatus.progress.type='determinate';
        this.compzSearchPauseBtn.nativeElement.classList.remove('scrape-pausebtn-ispaused');
        const resumeTimeDate:Date=new Date();
        this.homeSStates.searchStatus.deadlineTime=(this.evServ.gUT(resumeTimeDate)*1000)+this.homeSStates.searchStatus.pauseTimeRemain;
        this.homeSStates.searchStatus.startTime=(this.evServ.gUT(resumeTimeDate)*1000)-this.homeSStates.searchStatus.pauseTimeExec;
        this.pDOM();
        runClock(this.homeSStates.searchStatus.deadlineTime);
      };
    };
    //--------------------------------------------------
    switch(action){
      case 'start':startClock();break;
      case 'stop':stopClock();break;
      case 'pause':pauseClock();break;
      case 'resume':resumeClock();break;
    };
  }
/////////////////////////////////////////////////////////
  async removeScrapeFiles():Promise<boolean>{
    this.cCons('(removeScrapeFiles)...');
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const aPath:string=path.join(pPath,'scrapeTargets/audio'),vPath:string=path.join(pPath,'scrapeTargets/video');
    const readD=async(p:string):Promise<string[]|false>=>{try{const fL:any=await readdir(p);return Promise.resolve(fL)}catch(e){console.log(e);return Promise.resolve(false)}};
    const delF=async(p:string):Promise<boolean>=>{try{await unlink(p);return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}};
    const aFL:string[]|false=await readD(aPath)
    if(aFL){for(let i=0;i<aFL.length;i++){const fP:string=path.join(aPath,aFL[i]);await delF(fP)}};
    const vFL:string[]|false=await readD(vPath);
    if(vFL){for(let i=0;i<vFL.length;i++){const fP:string=path.join(vPath,vFL[i]);await delF(fP)}};
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async clearScrapeSearch():Promise<boolean>{
    this.cCons('(clearScrapeSearch)...');
    await this.showLoader('Clearing Search/Scrape Data');
    if(this.searchInt){clearInterval(this.searchInt)};
    this.compzSearchInput.nativeElement.value='';
    this.homeSStates.searchTerm={phrase:{q:'',c:{chars:0,words:0}},wGroups:{q:{exact:'',multi:[],single:[],counts:{exact:0,multi:0,single:0}}}};
    this.scrapeSubsSpin=false;
    this.homeSStates.searchSourceResults={channels:[],playlists:[],videos:[],matches:{c:0,p:0,v:0}};
    this.homeSStates.searchStatus={inProgress:false,isPaused:false,sTime:{date:null,txt:''},eTime:{date:null,txt:''},startTime:0,deadlineTime:0,pauseTimeRemain:0,pauseTimeExec:0,counter:{remainTime:0,remainTStr:'',execTime:0,execTStr:''},progress:{type:'determinate',buffer:1,perc:0,txt:''},info:{txt:'ready/waiting',isErr:false}};
    if(this.homeSStates.searchMode==='scrape'){
      this.homeSStates.subSearchMatches={exact:null,multi:[],single:[],counts:{exact:0,multi:0,single:0}};
      this.homeSStates.scrapeSnippets={exact:[],multi:[],single:[]};
      this.homeSStates.scrapeSnipResults={exact:[],multi:[],single:[]};
    };
    await this.removeScrapeFiles();
    this.pDOM();
    await this.doSaveStates();
    this.evServ.publish('updateBA','Source|Search: Search Query/Results Cleared');
    await this.closeLoader();
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async doYTSourceSearch():Promise<boolean>{
    this.cCons('(doYTSourceSearch)...');
    this.homeSStates.searchStatus.inProgress=false;
    let progP:number=0,progStages:number=0,progStageVal:number=0;
    this.homeSStates.searchSourceResults={channels:[],playlists:[],videos:[],matches:{c:0,p:0,v:0}};
    let ssRes:any={channels:[],playlists:[],videos:[],matches:{c:0,p:0,v:0}};
    let selectedS:any={channels:false,playlists:false,videos:false};
    const stripData=(items:any[],type:string):Promise<HomeSearchSourceResultItem[]>=>{
      const tKey:string=type.slice(0,-1),idKey:string=tKey+'Id';
      let sDArr:any[]=[];
      for(let i=0;i<items.length;i++){
        const iO:any=items[i];
        sDArr.push({type:tKey,id:iO.id[idKey],date:this.evServ.strFormat(new Date(iO.snippet.publishedAt),'dd/MM/yy'),title:iO.snippet.title,thumb:iO.snippet.thumbnails.high.url.includes('no_thumbnail')||iO.snippet.thumbnails.high.url.includes('hgdefault.jpg')?'assets/cm-compz-ico.png':iO.snippet.thumbnails.high.url,isTarget:false,toggled:false,isBad:false})
      };
      return Promise.resolve(sDArr);
    };
    const updateProg=()=>{this.homeSStates.searchStatus.progress={type:'determinate',buffer:1,perc:progP,txt:String(Math.round(progP*100))+'%'};this.pDOM()};
    this.homeSStates.searchStatus.inProgress=true;
    progP=0;updateProg();
    for(let i=0;i<this.homeSStates.searchSources.length;i++){const sS:any=this.homeSStates.searchSources[i],sSKey:string=sS.value,isSel:boolean=sS.checked;selectedS[sSKey]=isSel;if(isSel){progStages++}};
    progStageVal=((1/progStages)/(this.homeSStates.searchLimits.search.maxmatch/50));
    const findFn=async(k:string):Promise<any>=>{let fFRes:any;if(k==='channels'){fFRes=await this.ytServ.findChannels(this.homeSStates.searchTerm.phrase.q)}else if(k==='playlists'){fFRes=await this.ytServ.findPlaylists(this.homeSStates.searchTerm.phrase.q)}else if(k==='videos'){fFRes=await this.ytServ.findVideos(this.homeSStates.searchTerm.phrase.q)};return Promise.resolve(fFRes)};
    for(const[k,v]of Object.entries(selectedS)){
      if(v){
        const findFnRes=await findFn(k);
        if(findFnRes.r&&findFnRes.d.hasOwnProperty('items')&&findFnRes.d.items.length>0){
          let fFRItems:any[]=findFnRes.d.items;if(this.homeSStates.searchLimits.search.maxmatch<findFnRes.d.items.length){fFRItems=findFnRes.d.items.slice(0,this.homeSStates.searchLimits.search.maxmatch)};
          ssRes[k]=await stripData(fFRItems,k);
          ssRes.matches[k.charAt(0)]=findFnRes.d.pageInfo.totalResults;
          let nextPToken:string|null=null;if(findFnRes.d.hasOwnProperty('nextPageToken')&&findFnRes.d.nextPageToken&&findFnRes.d.nextPageToken.length>0){nextPToken=findFnRes.d.nextPageToken};
          let resRemain:number=ssRes.matches[k.charAt(0)]-findFnRes.d.items.length;
          let maxRemain:number=this.homeSStates.searchLimits.search.maxmatch-findFnRes.d.items.length;
          let pReqsRemain:number=0;
          progP+=progStageVal;updateProg();
          if(resRemain>0&&maxRemain>0&&nextPToken){
            if(resRemain<maxRemain){pReqsRemain=Math.floor(resRemain/50)}else{pReqsRemain=Math.floor(maxRemain/50)};
            for(let i=0;i<pReqsRemain;i++){
              if(nextPToken){
                const npRes:any=await this.ytServ.nextPage(nextPToken,k,this.homeSStates.searchTerm.phrase.q);
                if(npRes.r&&npRes.d.hasOwnProperty('items')&&npRes.d.items.length>0){
                  const stripRes:any[]=await stripData(npRes.d.items,k);
                  ssRes[k]=ssRes[k].concat(stripRes);
                  progP+=progStageVal;updateProg();
                  if(npRes.d.hasOwnProperty('nextPageToken')&&npRes.d.nextPageToken&&npRes.d.nextPageToken.length>0){nextPToken=npRes.d.nextPageToken}else{break};
                }
              }
            }
          }
        }
      }
    };
    this.homeSStates.searchSourceResults=ssRes;
    progP=1;updateProg();
    await this.searchResAlreadyTarget();
    this.pDOM();await this.doSaveStates();
    setTimeout(()=>{this.homeSStates.searchStatus.info.txt='completed';this.homeSStates.searchBarHidden=true},250);
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async scrapeSearchActions(action:string,data?:any){
    switch(action){
      //-------------------------------------------------------
      case 'source':
        let aOrRStr:string='',didWarn:boolean=false;
        if(this.homeSStates.searchSources[data.evData].checked){
          if(this.homeSStates.searchSources.filter(sO=>sO.checked).length===1){await ipcRenderer.invoke('doWarn',['Invalid (No Sources)','At least ONE (1) source is required']);didWarn=true}
          else{this.homeSStates.searchSources[data.evData].checked=false;aOrRStr='-'};
        }else{this.homeSStates.searchSources[data.evData].checked=true;aOrRStr='+'};
        if(!didWarn){await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA','Scraper|Search: ['+aOrRStr+'] Source ('+this.homeSStates.searchSources[data.evData].id+')')};
        break;
      //-------------------------------------------------------
      case 'format':
        if(!this.homeSStates.scrapeFormat[data.evData].checked){
          this.homeSStates.scrapeFormat[data.evData].checked=true;
          for(let i=0;i<this.homeSStates.scrapeFormat.length;i++){
            if(this.homeSStates.scrapeFormat[i].value!==this.homeSStates.scrapeFormat[data.evData].value){this.homeSStates.scrapeFormat[i].checked=false}
          };
          await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA','Scraper|Format: '+this.homeSStates.scrapeFormat[data.evData].id);
        };
        break;
      //-------------------------------------------------------
        case 'mode':
          await this.clearScrapeSearch();
          this.homeSStates.searchMode=data.evName;
          await this.doSaveStates();this.pDOM();
          this.evServ.publish('updateBA','Search|Scrape: '+this.capd(this.homeSStates.searchMode)+' Mode');
          break;
      //-------------------------------------------------------
      case 'searchMax':
        let sbTxt:string='';
        if(data.evName==='wheel'){return}
        else{
          const newMaxSSKey:string='max'+data.evData.limit;
          const newMaxYTKey:string=data.evData.limit+'Max';
          const newMaxNo:number=data.evData.value;
          if(newMaxNo>500||newMaxNo<1){
            const maxInputEle:any=document.querySelector('.sl-input.data.maxno.resolve') as HTMLInputElement;
            maxInputEle.value=50;
            if(this.homeSStates.searchLimits.search[newMaxSSKey]!==50){this.homeSStates.searchLimits.search[newMaxSSKey]=50};
            if(this.ytServ[newMaxYTKey]!==50){this.ytServ[newMaxYTKey]=50};
            sbTxt='Search Options: '+this.capd(data.evData.limit)+' Max > Limit (Reset: 50)';
          }else{
            if(this.homeSStates.searchLimits.search[newMaxSSKey]!==newMaxNo){this.homeSStates.searchLimits.search[newMaxSSKey]=newMaxNo};
            if(this.ytServ[newMaxYTKey]!==newMaxNo){this.ytServ[newMaxYTKey]=newMaxNo};
            sbTxt='Search Options: '+this.capd(data.evData.limit)+' Max = '+String(newMaxNo);
          };
          await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA',sbTxt);
        };
        break;
      //-------------------------------------------------------
      case 'orderby':
        let orderOpts:string[]=this.searchOrderOpts;
        let selOptIndex:number=orderOpts.findIndex(o=>o===this.homeSStates.searchLimits.search.orderby);
        let newOptIndex:number=selOptIndex;
        data.evData==='next'?newOptIndex++:newOptIndex--;
        if(newOptIndex<0){newOptIndex=orderOpts.length-1};
        if(newOptIndex>orderOpts.length-1){newOptIndex=0};
        this.homeSStates.searchLimits.search.orderby=orderOpts[newOptIndex];
        this.ytServ.searchOrderBy=this.homeSStates.searchLimits.search.orderby;
        await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA','Search Options: Order by '+this.capd(this.homeSStates.searchLimits.search.orderby));
        break;
      //-------------------------------------------------------
      case 'limit':
        if(data.evName==='wheel'){return}
        else if(data.evName==='infinity'){
          let noLimitObjKey:string='';data.evData.tOrD==='t'?noLimitObjKey='time':noLimitObjKey='data';
          const oldVal:boolean=this.homeSStates.searchLimits.scrape.nolimit[noLimitObjKey];
          let nLCT:string='';
          if(oldVal){this.homeSStates.searchLimits.scrape.nolimit[noLimitObjKey]=false;nLCT='Limited'}else{this.homeSStates.searchLimits.scrape.nolimit[noLimitObjKey]=true;nLCT='Unlimited'};
          await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA','Scraper|Search: Set '+nLCT+' '+this.capd(noLimitObjKey));
        }
        else if(data.evName==='blur'){
          let oldVal:number;data.evData.mSD==='data'?oldVal=this.homeSStates.searchLimits.scrape.data:oldVal=this.homeSStates.searchLimits.scrape.time[data.evData.mSD];
          const newVal:number=data.evData.newVal;
          if(oldVal!==newVal){
            if(data.evData.mSD==='data'){this.homeSStates.searchLimits.scrape.data=newVal}
            else{this.homeSStates.searchLimits.scrape.time[data.evData.mSD]=newVal};
            let newLimitCT:string='Scraper|Search: Set ';data.evData.mSD==='data'?newLimitCT+='Data Limit ('+String(newVal)+'MB'+')':newLimitCT+='Time Limit ('+String(this.homeSStates.searchLimits.scrape.time.minutes)+':'+String(this.homeSStates.searchLimits.scrape.time.seconds)+')';
            await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA',newLimitCT);
          };
        };
        break;
      //-------------------------------------------------------
      case 'search':
        await this.clearScrapeSearch();
        this.homeSStates.searchTerm.phrase.q=data.trim();
        await this.doSaveStates();this.pDOM();this.evServ.publish('updateBA',this.capd(this.homeSStates.searchMode)+'|Start: "'+this.homeSStates.searchTerm.phrase.q+'"');
        this.cCons('(scrapeSearchActions) [SEARCH]: '+this.homeSStates.searchTerm.phrase.q);
        if(this.homeSStates.searchMode==='scrape'){
          this.homeSStates.searchStatus.info.txt='splitting phrase';
          await this.doScrapeWordSplit();
          this.scrapeResHeadsVisFn();
          this.pDOM();
          if(!this.homeSStates.searchLimits.scrape.nolimit.time){this.scrapeSTimer('start')};
          // DO SCRAPED DATA PROCESSING HERE!
          console.log('DO SCRAPED DATA PROCESSING HERE!');
          await this.doSubScrape();
          // DO SCRAPED DATA PROCESSING HERE!
        }else{await this.doYTSourceSearch()};
        break;
      //-------------------------------------------------------
      case 'input':
        const inputName:string=data.evName,inputEvent:KeyboardEvent=data.evEvent,inputData:any=data.evData;
        const inputNE:any=this.compzSearchInput.nativeElement,btnNE:any=this.compzSearchBtn.nativeElement;
        const isValid=(txt:string):boolean=>{
          const txtChars:number=txt.trim().length,txtWords:number=txt.trim().split(' ').length;
          if(txt.trim().length>0){
            if(txtChars>2&&txtWords<11){if(btnNE.disabled){btnNE.disabled=false};this.debouncedScrapeVal('ok');return true}
            else{
              if(!btnNE.disabled){btnNE.disabled=true};
              let errStr:string='';txtChars<3?errStr='chars':errStr='words';
              this.debouncedScrapeVal('err',errStr);
              return false;
            };
          }else{if(!btnNE.disabled){btnNE.disabled=true};this.debouncedScrapeVal('nil');return false};
        };
        switch(inputName){
          case 'clr':inputNE.value='';isValid('');break;
          case 'focus':isValid(inputData);break;
          case 'blur':isValid(inputData);break;
          case 'kdown':
            const eKey:any=inputEvent.key;
            if(eKey==='Enter'||eKey==='Escape'){
              inputEvent.preventDefault();
              if(inputEvent.defaultPrevented){
                if(eKey==='Escape'){if(inputNE.focus){if(inputNE.value.length>0){inputNE.value=''}else{inputNE.blur()}}}
                else{if(inputNE.focus){if(isValid(inputData)){this.scrapeSearchActions('search',inputData)}else{inputNE.focus()}}}
              };
            };
            break;
          case 'kup':
            this.homeSStates.searchStatus.info.txt='typing...';
            this.homeSStates.searchStatus.info.isErr=false;
            this.homeSStates.searchTerm.phrase.c.chars=inputData.trim().length;
            let wC:number=0;const wArr:string[]=inputData.trim().split(' ');for(let i=0;i<wArr.length;i++){if(wArr[i].trim().length>0){wC++}};
            this.homeSStates.searchTerm.phrase.c.words=wC;
            isValid(inputData);
            break;
        };
        this.pDOM();
        break;
      //-------------------------------------------------------
      case 'pause':if(this.homeSStates.searchStatus.isPaused){this.scrapeSTimer('resume')}else{this.scrapeSTimer('pause')};break;
      //-------------------------------------------------------
      case 'cancel':this.scrapeSTimer('stop');break;
      //-------------------------------------------------------
      case 'toggleHiddenBox':
        let sbStr:string='';
        if(this.homeSStates.searchBarHidden){this.homeSStates.searchBarHidden=false;sbStr='Show'}else{this.homeSStates.searchBarHidden=true;sbStr='Hide'};
        this.pDOM();await this.doSaveStates();this.evServ.publish('updateBA','Scraper|Search '+sbStr+' Input');
        break;
      //-------------------------------------------------------
      case 'clrstats':this.clearScrapeSearch();break;
    };
    this.pDOM();
  }
/////////////////////////////////////////////////////////
  doScrapeWordSplit():Promise<boolean>{
    this.cCons('(doScrapeWordSplit)...');
    const stSlices=(arr:string[]):string[]=>{let stSRes:string[]=[],workArr:string[]=arr;for(let i=0;i<arr.length;i++){let word:string=arr[i];stSRes.push(word);workArr=arr.slice(i+1,arr.length);for(let r=0;r<workArr.length;r++){word+=' '+workArr[r];stSRes.push(word)}};return stSRes};
    const stWords:string[]=this.homeSStates.searchTerm.phrase.q.split(' ');
    const stSlicesRes:string[]=stSlices(stWords);
    let wGsQObj:HomeSearchTermWGroupsQuery={exact:'',multi:[],single:[],counts:{exact:0,multi:0,single:0}};
    for(let i=0;i<stSlicesRes.length;i++){
      const stSStr:string=stSlicesRes[i],stSArr:string[]=stSStr.split(' '),stSWordLen:number=stSArr.length;
      if(stSWordLen===stWords.length){wGsQObj.exact=stSStr;wGsQObj.counts.exact++}
      else if(stSWordLen===1){
        if(!CommonWordsArr.includes(stSStr)){
          let wgSIndex:number=wGsQObj.single.findIndex(sWO=>sWO.word===stSStr);
          if(wgSIndex===-1){wGsQObj.single.push({word:stSStr,rx:null})};
          wGsQObj.counts.single++
        };
      }else{
        let multWArr:string[]=stSStr.split(' '),multiWComm:boolean[]=[];
        for(let acI=0;acI<multWArr.length;acI++){if(CommonWordsArr.includes(multWArr[acI])){multiWComm.push(true)}else{multiWComm.push(false)}};
        const allComm=():boolean=>{return multiWComm.every((tf:boolean)=>tf===true)};
        if(!allComm()){
          let wgMIndex:number=wGsQObj.multi.findIndex((mWO:HomeSearchTermWGroupMultiObject)=>mWO.len===stSWordLen);
          if(wgMIndex===-1){wGsQObj.multi.push({len:stSWordLen,list:[stSStr],rx:[]})}
          else{wGsQObj.multi[wgMIndex].list.push(stSStr)};
          wGsQObj.counts.multi++;
        };
      };
    };
    wGsQObj.multi=_.orderBy(wGsQObj.multi,['len'], ['desc']);
    this.homeSStates.searchTerm.wGroups.q=wGsQObj;
    this.pDOM();
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async checkAVFiles():Promise<boolean>{
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets');
    const pSD:string=path.join(pSTPath,'sub'),pSJD:string=path.join(pSD,'json'),pSTD:string=path.join(pSD,'text'),subDs:string[]=[pSD,pSJD,pSTD];
    const itemHasAudio=async(targetVidItem:HomeTargetVideo):Promise<HomeScrapeDLType>=>{
      const aPath:string=path.join(pSTPath,'audio/'+targetVidItem.vID+'.mp3');
      const aExist=await this.exists(aPath);
      if(aExist){
        const aSize:any=await this.statSize(aPath);
        if(aSize.r&&aSize.d>0){return Promise.resolve({ext:'mp3',path:aPath,size:aSize.d,err:false})}
        else{if(aExist&&(!aSize.r||aSize.d===0)){await unlink(aPath)};return Promise.resolve({ext:'mp3',path:'',size:0,err:false})};
      }else{return Promise.resolve({ext:'mp3',path:'',size:0,err:false})};
    };
    const itemHasVideo=async(targetVidItem:HomeTargetVideo):Promise<HomeScrapeDLType>=>{
      const vPath:string=path.join(pSTPath,'video/'+targetVidItem.vID+'.mp4');
      const vExist=await this.exists(vPath);
      if(vExist){
        const vSize:any=await this.statSize(vPath);
        if(vSize.r&&vSize.d>0){return Promise.resolve({ext:'mp4',path:vPath,size:vSize.d,err:false})}
        else{if(vExist&&(!vSize.r||vSize.d===0)){await unlink(vPath)};return Promise.resolve({ext:'mp4',path:'',size:0,err:false})};
      }else{return Promise.resolve({ext:'mp4',path:'',size:0,err:false})};
    };
    //scrapeTargetFiles
    let wasSTFChange:boolean=false;
    for(let stI=0;stI<this.homeSStates.scrapeTargets.length;stI++){
      const stItem:HomeTargetItem=this.homeSStates.scrapeTargets[stI];
      for(let vdI=0;vdI<stItem.vData.length;vdI++){
        const vdItem:HomeTargetVideo=stItem.vData[vdI];
        const vdADLType:HomeScrapeDLType=await itemHasAudio(vdItem);
        if(!_.isEqual(vdItem.audio,vdADLType)){this.homeSStates.scrapeTargets[stI].vData[vdI].audio=vdADLType;wasSTFChange=true};
        const vdVDLType:HomeScrapeDLType=await itemHasVideo(vdItem);
        if(!_.isEqual(vdItem.video,vdVDLType)){this.homeSStates.scrapeTargets[stI].vData[vdI].video=vdVDLType;wasSTFChange=true};
      };
    };
    // snipResultsFilesHomeScrapeSnipResults
    let wasSRFChange:boolean=false;
    for(const srTKey of Object.keys(this.homeSStates.scrapeSnipResults)){
      const srGroupTypeArr:HomeScrapeSnipResultsGroup[]=this.homeSStates.scrapeSnipResults[srTKey];
      for(let srGI=0;srGI<srGroupTypeArr.length;srGI++){
        const srWordGroupObj:HomeScrapeSnipResultsGroup=srGroupTypeArr[srGI];
        for(let srI=0;srI<srWordGroupObj.snips.length;srI++){
          const snipItem:HomeScrapeSnipRGItem=srWordGroupObj.snips[srI];
          const snipAVPref:string=snipItem.prevAV.pref;
          const currentPAV:HomeScrapeSnippetPAVObject=snipItem.prevAV[snipAVPref];
          const snipSubIndex:number=snipItem.subMatches.findIndex(sSMO=>sSMO.selected===true);
          let snipSubAVFilePath:string='',snipSubAVObj:HomeScrapeSnippetPAVObject={gotFile:false,filePath:''};
          if(snipAVPref==='a'){snipSubAVFilePath=path.join(pSTPath,'audio/'+snipItem.vId+'-snip'+String(snipSubIndex)+'.mp3')}
          else{snipSubAVFilePath=path.join(pSTPath,'video/'+snipItem.vId+'-snip'+String(snipSubIndex)+'.mp4')};
          const snipFExist:boolean=await this.exists(snipSubAVFilePath),snipFSize:any=await this.statSize(snipSubAVFilePath);
          if(snipFExist&&snipFSize.r&&snipFSize.d>0){snipSubAVObj={gotFile:true,filePath:snipSubAVFilePath}};
          if(!_.isEqual(currentPAV,snipSubAVObj)){this.homeSStates.scrapeSnipResults[srTKey][srGI].snips[srI].prevAV[snipAVPref]=snipSubAVObj;wasSRFChange=true};
        };
      };
    };
    //if(wasSTFChange){this.pDOM();await this.doSaveStates()};
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async xml2JsonTxtFiles(paths:string[]|string):Promise<boolean>{
    this.cCons('(xml2JsonTxtFiles) ')
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets');
    const pSD:string=path.join(pSTPath,'sub'),pSJD:string=path.join(pSD,'json'),pSTD:string=path.join(pSD,'text'),subDs:string[]=[pSD,pSJD,pSTD];
    const tagNamePS=()=>{return 'transcript'},attrValuePS=(avalue:string)=>{return parseFloat(avalue)},fixGrammar=(value:string)=>{return value.replace(/&#39;/gi,'\'')};
    const jsonParseOpts:ParserOptions={attrkey:'time',charkey:'text',explicitRoot:false,tagNameProcessors:[tagNamePS],attrValueProcessors:[attrValuePS],valueProcessors:[fixGrammar]};
    const txtParseOpts:ParserOptions={explicitRoot:false,ignoreAttrs:true,valueProcessors:[fixGrammar]};
    const checkSubDirs=async():Promise<boolean>=>{for(let i=0;i<subDs.length;i++){if(!(await this.exists(subDs[i]))){await this.mkDir(subDs[i])}};return Promise.resolve(true)};
    await checkSubDirs();
    let ps:any;if(typeof paths==='object'&&Array.isArray(paths)){ps=paths}else{if(paths==='all'){ps=await getFilesFromDir(pSD,false,true)}else{ps=paths}};
    for(let i=0;i<ps.length;i++){
      const fnBase:string=path.parse(ps[i]).name;
      if(paths==='all'){
        const xmlFP:string=ps[i];
        for(let stI=0;stI<this.homeSStates.scrapeTargets.length;stI++){
          const stItem:HomeTargetItem=this.homeSStates.scrapeTargets[stI];
          for(let vdI=0;vdI<stItem.vData.length;vdI++){
            const vdItem:HomeTargetVideo=stItem.vData[vdI];
            if(vdItem.vID===fnBase){
              if(!vdItem.hasOwnProperty('sub')||vdItem.sub.err||vdItem.sub.path.length>0||vdItem.sub.size===0){
                let sSize:number=vdItem.sub.size;if(sSize===0){sSize=(await this.statSize(xmlFP)).d};
                this.homeSStates.scrapeTargets[stI].vData[vdI].sub={ext:'xml',path:xmlFP,size:sSize,err:false};
                this.pDOM();await this.doSaveStates();
              };
            };
          };
        };
      };
      const jsonFP:string=path.join(pSJD,fnBase+'.json');
      const txtFP:string=path.join(pSTD,fnBase+'.txt');
      const xmlData:any=await readFile(ps[i],{encoding:'utf-8'});
      try{
        if(!(await this.exists(jsonFP))||(await this.statSize(jsonFP)).d===0){const x2JSONParser=new Parser(jsonParseOpts),jsonObj:any=await x2JSONParser.parseStringPromise(xmlData),jsonStr:any=JSON.stringify(jsonObj,null,2);await writeFile(jsonFP,jsonStr,{encoding:'utf-8'})};
        if(!(await this.exists(txtFP))||(await this.statSize(jsonFP)).d===0){const x2TXTParser=new Parser(txtParseOpts),txtObj:any=await x2TXTParser.parseStringPromise(xmlData),mergedTxt:string=txtObj.text.join(' ');await writeFile(txtFP,mergedTxt,{encoding:'utf-8'})};
      }catch(err){this.cCons('(xml2JsonTxtFiles) ERROR|x2JSON: '+JSON.stringify(err));return Promise.resolve(false)};
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  getMRX(tQ:string):Promise<RegExp>{
    const cArr:any=ContractionsArr;
    let tQRXArr:any=[],tQArr:string[]=[];
    tQ.split(' ').length>0?tQArr=tQ.toLowerCase().split(' '):tQArr=[tQ.toLowerCase()];
    for(let i=0;i<tQArr.length;i++){let isC:boolean=false,tQWord:any=tQArr[i];
      for(let iC=0;iC<cArr.length;iC++){const cC=Object.keys(cArr[iC])[0],cWs=Object.values(cArr[iC])[0];
        if(tQWord===cC){isC=true;
          if(typeof cWs==='string'){tQRXArr.push([tQWord,cWs])}
          else if(Array.isArray(cWs)){let combArr:string[]=[tQWord];for(let cWI=0;cWI<cWs.length;cWI++){combArr.push(String(cWs[cWI]))};tQRXArr.push(combArr)};
        };
      };
      if(!isC){tQRXArr.push(tQWord)};
    };
    let rS:string='';for(let mI=0;mI<tQRXArr.length;mI++){const wItem:string|string[]=tQRXArr[mI];mI===0?rS+='(':rS+='.';typeof wItem==='string'?rS+=tQRXArr[mI]:rS+='(('+wItem[0]+')|('+wItem[1].replace(' ','.')+'))';mI===tQRXArr.length-1?rS+=')':rS+=''};
    const rX:RegExp=new RegExp(`\\b${rS}\\b`,'gmi');
    return Promise.resolve(rX);
  };
/////////////////////////////////////////////////////////
  async doSubScrape():Promise<boolean>{
    this.cCons('(doSubScrape)...');
    this.scrapeSubsSpin=true;
    const getFileTxt=async(p:string):Promise<{gfR:boolean,gfId:string,gfTxt:string}>=>{try{const fTxt:string=await readFile(p,'utf-8');const gFName:string=path.parse(p).name;return Promise.resolve({gfR:true,gfId:gFName,gfTxt:fTxt})}catch(e){console.log('(doSubScrape|getFileTxt) ERROR: '+JSON.stringify(e));return Promise.resolve({gfR:false,gfId:'',gfTxt:''})}};
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets'),pSD:string=path.join(pSTPath,'sub'),pSubTxtDir:string=path.join(pSD,'text'),txtSubFList:any=await getFilesFromDir(pSubTxtDir,false,true);
    const wgExactStr:string=this.homeSStates.searchTerm.wGroups.q.exact,wgMultiArr:HomeSearchTermWGroupMultiObject[]=this.homeSStates.searchTerm.wGroups.q.multi,wgSingleArr:HomeSearchTermWGroupSingleObject[]=this.homeSStates.searchTerm.wGroups.q.single;
    const exactRX:RegExp=await this.getMRX(wgExactStr);
    for(let i=0;i<wgMultiArr.length;i++){const multiGOList:string[]=wgMultiArr[i].list;for(let golI=0;golI<multiGOList.length;golI++){const golWords:string=multiGOList[golI];const golRXRes:RegExp=await this.getMRX(golWords);this.homeSStates.searchTerm.wGroups.q.multi[i].rx.push(golRXRes)}};
    for(let i=0;i<wgSingleArr.length;i++){const singleGOWord:string=wgSingleArr[i].word;const golRXRes:RegExp=await this.getMRX(singleGOWord);this.homeSStates.searchTerm.wGroups.q.single[i].rx=golRXRes};
    //------------------
    let sSubMatchesRes:HomeSubSearchMatches={exact:<HomeSubSearchMatch>{mTxt:wgExactStr,mLen:(wgExactStr.trim().split(' ').length),mIdList:[]},multi:<HomeSubSearchMatch[]>[],single:<HomeSubSearchMatch[]>[],counts:{exact:<number>0,multi:<number>0,single:<number>0}};
    const updRC=(t:string)=>{let ssMCKey:string='';if(t==='e'){ssMCKey='exact'}else{t==='m'?ssMCKey='multi':ssMCKey='single'};sSubMatchesRes.counts[ssMCKey]++;this.homeSStates.subSearchMatches.counts[ssMCKey]++;this.pDOM()};
    //------------------
    for(let i=0;i<txtSubFList.length;i++){
      let{gfR,gfId,gfTxt}=await getFileTxt(txtSubFList[i]);
      if(gfR&&gfId.length>0&&gfTxt.length>0){
        if(sSubMatchesRes.exact.mIdList.length<this.homeSStates.scrapeSnipLimits.exact.maxItems){
          if(gfTxt.match(exactRX)){
            sSubMatchesRes.exact.mIdList.push(gfId);
            updRC('e')
          };
        };
        if(wgMultiArr.length>0){
          for(let mMI=0;mMI<wgMultiArr.length;mMI++){
            const mMItem:HomeSearchTermWGroupMultiObject=wgMultiArr[mMI];
            for(let mMLI=0;mMLI<mMItem.list.length;mMLI++){
              const mMLILen:number=mMItem.len,mMLIWords:string=mMItem.list[mMLI],mMLIRX:RegExp=mMItem.rx[mMLI];
              let mMResGroupItems:number=0;
              const mMResIndex:number=sSubMatchesRes.multi.findIndex((mMRO:HomeSubSearchMatch)=>mMRO.mTxt===mMLIWords);
              if(mMResIndex!==-1){mMResGroupItems=sSubMatchesRes.multi[mMResIndex].mIdList.length};
              if(mMResGroupItems<this.homeSStates.scrapeSnipLimits.multi.maxItems){
                if(gfTxt.match(mMLIRX)){
                  if(!sSubMatchesRes.exact.mIdList.includes(gfId)){
                    if(mMResIndex===-1){sSubMatchesRes.multi.push({mTxt:mMLIWords,mLen:mMLILen,mIdList:[gfId]})}
                    else{sSubMatchesRes.multi[mMResIndex].mIdList.push(gfId)};
                    updRC('m');
                  };
                };
              };
            };
          };
        };
        if(wgSingleArr.length>0){
          for(let mSI=0;mSI<wgSingleArr.length;mSI++){
            const mSItem:HomeSearchTermWGroupSingleObject=wgSingleArr[mSI];
            const mSILen:number=1,mSIWord:string=mSItem.word,mSIRX:RegExp=mSItem.rx;
            let mSResGroupItems:number=0;
            const mSResIndex:number=sSubMatchesRes.single.findIndex((mSRO:HomeSubSearchMatch)=>mSRO.mTxt===mSIWord);
            if(mSResIndex!==-1){mSResGroupItems=sSubMatchesRes.single[mSResIndex].mIdList.length};
            if(mSResGroupItems<this.homeSStates.scrapeSnipLimits.single.maxItems){
              if(gfTxt.match(mSIRX)){
                let inExactList:boolean=false,inMultiList:boolean=false;
                if(sSubMatchesRes.exact.mIdList.includes(gfId)){inExactList=true};
                for(let inMLI=0;inMLI<sSubMatchesRes.multi.length;inMLI++){
                  const checkMList:string[]=sSubMatchesRes.multi[inMLI].mIdList;
                  if(checkMList.includes(gfId)){inMultiList=true};
                };
                if(!inExactList&&!inMultiList){
                  if(mSResIndex===-1){sSubMatchesRes.single.push({mTxt:mSIWord,mLen:mSILen,mIdList:[gfId]})}
                  else{sSubMatchesRes.single[mSResIndex].mIdList.push(gfId)};
                  updRC('s');
                };
              };
            };
          };
        };
      };
    };
    //------------------
    sSubMatchesRes.multi=_.orderBy(sSubMatchesRes.multi,['mLen'],['desc']);
    sSubMatchesRes.single=_.orderBy(sSubMatchesRes.single,['mTxt'].length,['desc']);
    this.homeSStates.subSearchMatches=sSubMatchesRes;
    const ttlCounts:number=this.homeSStates.subSearchMatches.counts.exact+this.homeSStates.subSearchMatches.counts.multi+this.homeSStates.subSearchMatches.counts.single;
    if(ttlCounts>0){this.homeSStates.scrapeSnipResults=await this.getScrapeSnippets(sSubMatchesRes)}
    else{this.homeSStates.scrapeSnipResults={exact:[],multi:[],single:[]}};
    console.log(this.homeSStates.scrapeSnipResults);
    this.scrapeSubsSpin=false;
    this.pDOM();
    await this.doSaveStates();
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async changeSnipLimits(action:string,data:{qType:'exact'|'multi'|'single',limitType?:'items'|'lines',newLimit?:number}){
    let cCT:string='changeSnipLimits('+action+','+data.qType;action==='select'?cCT+=')...':cCT+=','+data.limitType+','+data.newLimit+')...';this.cCons(cCT);
    if(action==='change'){
      const absLimits:any={exact:{items:50,lines:10},multi:{items:25,lines:10},single:{items:25,lines:10}};
      let newLimitValue:number=data.newLimit;
      const absL:number=absLimits[data.qType][data.limitType];
      if(data.newLimit>absL){newLimitValue=absL};
      if(data.newLimit<1){data.limitType==='items'?newLimitValue=0:newLimitValue=1};
      const newLimitTypeKey:string='max'+this.capd(data.limitType);
      this.homeSStates.scrapeSnipLimits[data.qType][newLimitTypeKey]=Number(newLimitValue);
      this.pDOM();
      await this.doSaveStates();
      this.evServ.publish('updateBA','Snips|Limits: Set max '+this.capd(data.qType)+' '+this.capd(data.limitType)+' to '+String(newLimitValue));
    }else{this.snipLimitTypeSelect=data.qType;this.pDOM()};
  }
/////////////////////////////////////////////////////////
  async getScrapeSnippets(matchesResData:HomeSubSearchMatches):Promise<HomeScrapeSnipResults>{
    this.cCons('(getScrapeSnippets) for '+(matchesResData.counts.exact+matchesResData.counts.multi+matchesResData.counts.single)+' Matches (Exact:'+matchesResData.counts.exact+'|Multi:'+matchesResData.counts.multi+'|Single:'+matchesResData.counts.single+')...');
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets'),pSD:string=path.join(pSTPath,'sub'),pSJD:string=path.join(pSD,'json');
    const getMatchSTVideo=(sSMVId:string):Promise<HomeTargetVideo|null>=>{let gMSTV:HomeTargetVideo|null=null;for(let i=0;i<this.homeSStates.scrapeTargets.length;i++){const stVIndex:number=this.homeSStates.scrapeTargets[i].vData.findIndex((sTIV:HomeTargetVideo)=>sTIV.vID===sSMVId);if(stVIndex!==-1){gMSTV=this.homeSStates.scrapeTargets[i].vData[stVIndex];break}};return Promise.resolve(gMSTV)};
    const getSubMatches=(qType:string,jsObj:HomeScrapeSubJSON,mRX:RegExp):Promise<HomeScrapeSnippetSubMatch[]>=>{
      const lineIsV=(l:HomeScrapeSubJSONTranscriptLine):boolean=>{if(l&&!_.isEmpty(l)&&l.hasOwnProperty('text')&&l.text&&typeof l.text==='string'&&l.text.length>0&&l.hasOwnProperty('time')&&l.time&&l.time.hasOwnProperty('start')&&l.time.start&&typeof l.time.start==='number'&&l.time.hasOwnProperty('dur')&&l.time.dur&&typeof l.time.dur==='number'&&l.time.dur>0){return true}else{return false}};
      const qTypeLimit:number=this.homeSStates.scrapeSnipLimits[qType].maxLines;
      let sSSMatches:HomeScrapeSnippetSubMatch[]=[];
      const subTrans:HomeScrapeSubJSONTranscriptLine[]=jsObj.transcript;
      if(jsObj&&jsObj.hasOwnProperty('transcript')){
        for(let sOTI=0;sOTI<subTrans.length;sOTI++){
          if(sSSMatches.length<qTypeLimit){
            const subLine:HomeScrapeSubJSONTranscriptLine=subTrans[sOTI];
            if((lineIsV(subLine))){
              const subLTime:HomeScrapeSubJSONTranscriptLineTime=subLine.time,subLText:string=subLine.text;
              if(subLText.match(mRX)){
                let subMatch:HomeScrapeSnippetSubMatch={times:{start:{secs:Number(subLTime.start),txt:''},stop:{secs:0,txt:''},dur:{secs:Number(subLTime.dur),txt:''}},textLine:subLText,selected:false};
                subMatch.times.start.txt=this.s2T(Math.floor(subMatch.times.start.secs));
                subMatch.times.dur.txt=this.s2T(Math.ceil(subMatch.times.dur.secs));
                subMatch.times.stop.secs=subMatch.times.start.secs+subMatch.times.dur.secs;
                subMatch.times.stop.txt=this.s2T(Math.ceil(subMatch.times.stop.secs));
                sSSMatches.push(subMatch);
              };
            };
            if(sSSMatches.length>0){sSSMatches[0].selected=true};
          };
        };
      };
      return Promise.resolve(sSSMatches);
    };
    /////////////////////////
    const getSSMTypeSnippets=async(qType:string,ssmData:HomeSubSearchMatch|HomeSubSearchMatch[]):Promise<HomeScrapeSnippet[]>=>{
      let ssMTypeSnippets:HomeScrapeSnippet[]=[],ssMProcessDataArr:HomeSubSearchMatch[]=[];
      Array.isArray(ssmData)?ssMProcessDataArr=ssmData:ssMProcessDataArr=[ssmData];
      for(let i=0;i<ssMProcessDataArr.length;i++){
        const ssMPDItem:HomeSubSearchMatch=ssMProcessDataArr[i],ssMPDTxt:string=ssMPDItem.mTxt,ssMPDRx:RegExp=await this.getMRX(ssMPDTxt);
        const ssMPDItemIdList:string[]=ssMPDItem.mIdList;
        idListLoop:for(let ssMIdListI=0;ssMIdListI<ssMPDItemIdList.length;ssMIdListI++){
          const ssMatchVId:string=ssMPDItemIdList[ssMIdListI];
          const stMatchV:HomeTargetVideo=await getMatchSTVideo(ssMatchVId);
          if(!stMatchV){this.cCons('(getScrapeSnippet) ERROR: No Match subScrapeId/scrapTargetId ('+ssMatchVId+')');continue idListLoop};
          let ssSObj:HomeScrapeSnippet={qTxt:ssMPDItem.mTxt,qLen:ssMPDItem.mLen,vId:ssMatchVId,cTitle:stMatchV.info.channel,cAuthor:stMatchV.info.author,vTitle:stMatchV.vTitle,dur:(this.s2T(stMatchV.info.duration)),prevAV:{a:{gotFile:false,filePath:''},v:{gotFile:false,filePath:''},pref:'a'},subMatches:[],subLVis:true};
          const tA:HomeScrapeDLType=stMatchV.audio;if(!tA.err&&(await this.exists(tA.path))&&tA.size>0){ssSObj.prevAV.a={gotFile:true,filePath:tA.path}};
          const tV:HomeScrapeDLType=stMatchV.video;if(!tV.err&&(await this.exists(tV.path))&&tV.size>0){ssSObj.prevAV.v={gotFile:true,filePath:tV.path}};
          const matchSubJSONFPath:string=path.join(pSJD,ssMatchVId+'.json');
          if(!(await this.exists(matchSubJSONFPath))){this.cCons('(getScrapeSnippet) ERROR: SubJSON File !exists: '+matchSubJSONFPath);continue idListLoop};
          const rawMSJSONData:any=await readFile(matchSubJSONFPath,{encoding:'utf-8'});
          if(!(this.isVJSON(rawMSJSONData))){this.cCons('(getScrapeSnippet) ERROR: Invalid JSON Read from File: '+matchSubJSONFPath);continue idListLoop};
          const subJSObject:any=JSON.parse(rawMSJSONData);
          ssSObj.subMatches=await getSubMatches(qType,subJSObject,ssMPDRx);
          if(ssSObj.subMatches.length>0){ssMTypeSnippets.push(ssSObj)};
        };
      };
      return Promise.resolve(ssMTypeSnippets);
    };
    /////////////////////////
    let finalSnipRes:HomeScrapeSnipResults={exact:[],multi:[],single:[]};
    /////////////////////////
    const exactSnips:HomeScrapeSnippet[]=await getSSMTypeSnippets('exact',matchesResData.exact);
    if(exactSnips.length>0){
      for(let i=0;i<exactSnips.length;i++){
        let snipRGItem:HomeScrapeSnippet=exactSnips[i];
        if(i===0){finalSnipRes.exact.push({q:snipRGItem.qTxt,words:snipRGItem.qLen,snips:[],vis:true,avPref:'a'})};
        delete snipRGItem.qTxt;delete snipRGItem.qLen;
        finalSnipRes.exact[0].snips.push(snipRGItem);
      };
    };
    const multiSnips:HomeScrapeSnippet[]=await getSSMTypeSnippets('multi',matchesResData.multi);
    if(multiSnips.length>0){
      for(let i=0;i<multiSnips.length;i++){
        let snipRGItem:HomeScrapeSnippet=multiSnips[i];
        const existRGIndex:number=finalSnipRes.multi.findIndex((rgO:HomeScrapeSnipResultsGroup)=>rgO.q===snipRGItem.qTxt);
        if(existRGIndex===-1){
          let tempRG:HomeScrapeSnipResultsGroup={q:snipRGItem.qTxt,words:snipRGItem.qLen,snips:[],vis:true,avPref:'a'};
          delete snipRGItem.qTxt;delete snipRGItem.qLen;
          tempRG.snips.push(snipRGItem);
          finalSnipRes.multi.push(tempRG);
        }else{delete snipRGItem.qTxt;delete snipRGItem.qLen;finalSnipRes.multi[existRGIndex].snips.push(snipRGItem)};
      };
    };
    const singleSnips:HomeScrapeSnippet[]=await getSSMTypeSnippets('single',matchesResData.single);
    if(singleSnips.length>0){
      for(let i=0;i<singleSnips.length;i++){
        let snipRGItem:HomeScrapeSnippet=singleSnips[i];
        const existRGIndex:number=finalSnipRes.single.findIndex((rgO:HomeScrapeSnipResultsGroup)=>rgO.q===snipRGItem.qTxt);
        if(existRGIndex===-1){
          let tempRG:HomeScrapeSnipResultsGroup={q:snipRGItem.qTxt,words:snipRGItem.qLen,snips:[],vis:true,avPref:'a'};
          delete snipRGItem.qTxt;delete snipRGItem.qLen;
          tempRG.snips.push(snipRGItem);
          finalSnipRes.single.push(tempRG);
        }else{delete snipRGItem.qTxt;delete snipRGItem.qLen;finalSnipRes.single[existRGIndex].snips.push(snipRGItem)};
      };
    };
    /////////////////////////
    // Remove Dupes
    for(const[k,v]of Object.entries(finalSnipRes)){
      if(k!=='exact'){
        const groupTypeArr:HomeScrapeSnipResultsGroup[]=v;
        let prevGroupSnipIds:string[]=[];
        for(let gtOI=0;gtOI<groupTypeArr.length;gtOI++){
          const wgObj:HomeScrapeSnipResultsGroup=groupTypeArr[gtOI];
          let uniqWGSnips:HomeScrapeSnipRGItem[]=[];
          for(let wgsI=0;wgsI<wgObj.snips.length;wgsI++){
            const wgSnip:HomeScrapeSnipRGItem=wgObj.snips[wgsI];
            if(!prevGroupSnipIds.includes(wgSnip.vId)){uniqWGSnips.push(wgSnip)}
          };
          finalSnipRes[k][gtOI].snips=uniqWGSnips;
          prevGroupSnipIds=uniqWGSnips.map(uGSO=>uGSO.vId);
        };
      };
    };
    /////////////////////////
    return Promise.resolve(finalSnipRes);
  }
/////////////////////////////////////////////////////////
  doScrapeVal(status:string,err?:string){
    console.log('doScrapeVal('+status+','+err+')');
    const delBtnEle:any=document.querySelector('#clra-del') as HTMLDivElement;
    const errWrap:any=this.scraperSearchValidErr.nativeElement;
    const errTxt:any=this.scraperSearchValidTxt.nativeElement;
    if(status==='nil'){
      errTxt.innerText='';errWrap.style.display='none';errWrap.style.opacity='0';
      delBtnEle.style.display='none';delBtnEle.style.opacity='0';
    };
    if(status==='ok'){
      errTxt.innerText='';errWrap.style.display='none';errWrap.style.opacity='0';
      delBtnEle.style.display='flex';delBtnEle.style.opacity='1';
    };
    if(status==='err'){
      let errStr:string='';err==='chars'?errStr='C-':errStr='W+';
      delBtnEle.style.display='none';delBtnEle.style.opacity='0';
      errTxt.innerText=errStr;errWrap.style.display='flex';errWrap.style.opacity='1';
    };
    if(status==='err'&&err&&err==='chars'){this.homeSStates.searchStatus.info.txt='3+ Chars Min';this.homeSStates.searchStatus.info.isErr=true};
    if(status==='err'&&err&&err==='words'){this.homeSStates.searchStatus.info.txt='10 Words Max';this.homeSStates.searchStatus.info.isErr=true};
    if(status==='nil'){this.homeSStates.searchStatus.info.txt='ready/waiting';this.homeSStates.searchStatus.info.isErr=false};
    if(status==='ok'){
      this.homeSStates.searchStatus.info.isErr=false;
      if(this.homeSStates.searchStatus.info.txt!=='splitting phrase'&&this.homeSStates.searchStatus.info.txt!=='scraping subs'){this.homeSStates.searchStatus.info.txt=''};
    };
    this.pDOM();
  }
/////////////////////////////////////////////////////////
  async updateTargetCounts():Promise<boolean>{
    this.cCons('(updateTargetCounts)...');
    if(this.homeSStates.scrapeTargets){
      let nSTC:HomeScrapeTargetCounts={all:{count:0,time:{secs:0,str:''}},noCC:{count:0,time:{secs:0,str:''}},notSel:{count:0,time:{secs:0,str:''}},ok:{count:0,time:{secs:0,str:''}}};
      for(let iI=0;iI<this.homeSStates.scrapeTargets.length;iI++){
        const sTO:HomeTargetItem=this.homeSStates.scrapeTargets[iI];
        let itemSubs:number=0,itemSel:number=0;
        for(let vI=0;vI<sTO.vData.length;vI++){nSTC.all.count++;
          const sTVO:HomeTargetVideo=sTO.vData[vI],sTVODurSecs:number=this.t2S(sTVO.duration);
          nSTC.all.time.secs+=sTVODurSecs;
          if(!sTVO.caption){nSTC.noCC.count++;nSTC.noCC.time.secs+=sTVODurSecs}else{itemSubs++};
          if(!sTVO.selected){nSTC.notSel.count++;nSTC.notSel.time.secs+=sTVODurSecs}else{itemSel++};
        };
        if(itemSel===itemSubs){this.homeSStates.scrapeTargets[iI].isSelected='all'}
        else if(itemSel===0){this.homeSStates.scrapeTargets[iI].isSelected='none'}
        else{this.homeSStates.scrapeTargets[iI].isSelected='some'};
      };
      nSTC.ok.count=nSTC.all.count-nSTC.notSel.count;
      nSTC.ok.time.secs=nSTC.all.time.secs-nSTC.notSel.time.secs;
      nSTC.all.time.str=this.s2T(nSTC.all.time.secs);
      nSTC.noCC.time.str=this.s2T(nSTC.noCC.time.secs);
      nSTC.notSel.time.str=this.s2T(nSTC.notSel.time.secs);
      nSTC.ok.time.str=this.s2T(nSTC.ok.time.secs);
      this.homeSStates.scrapeTargetCounts=nSTC;
      this.pDOM();await this.doSaveStates();
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  t2S(timeStr:string):number{let tStrArr:string[]=timeStr.split(':'),fSecs:number=0;if(tStrArr.length===3){fSecs=(Number(tStrArr[0])*3600)+(Number(tStrArr[1])*60)+(Number(tStrArr[2]))}else if(tStrArr.length===2){fSecs=(Number(tStrArr[0])*60)+(Number(tStrArr[1]))}else{fSecs=Number(tStrArr[0])};return fSecs}
/////////////////////////////////////////////////////////
  s2T(secs:number):string{let fStr:string='',tH:string|null,tM:string|null,tS:string|null,hours:number=Math.floor(secs/3600),mins:number=0;if(hours>=1){tH=String(hours);secs=secs-(hours*3600)}else{tH=null};mins=Math.floor(secs/60);if(mins>=1){tM=String(mins);secs=secs-(mins*60)}else{tM=null};if(secs<1){tS=null}else{tS=String(secs)};(tH&&tM&&tM.length===1)?tM='0'+tM:void 0;(tS&&tS.length===1)?tS='0'+tS:void 0;if(tH){fStr+=tH;tM=':'+tM};if(tM){fStr+=tM;tS=':'+tS}else{fStr+='00:'};if(tS){fStr+=tS};if(fStr.includes(':null')){const rX:RegExp=/:null/gi;fStr=fStr.replace(rX,':00')};if(fStr===''){fStr='0'};return fStr};
/////////////////////////////////////////////////////////
  isVJSON(txt:string):boolean{try{JSON.parse(txt)}catch(e){return false}return true};
/////////////////////////////////////////////////////////
  async initProcessScrapeTarget(stItemId:string){
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets'),pInfoPath:string=path.join(pSTPath,'info'),pSubPath:string=path.join(pSTPath,'sub'),pSubTxtPath:string=path.join(pSubPath,'text'),pSubJSONPath:string=path.join(pSubPath,'json'),pAudioPath:string=path.join(pSTPath,'audio'),pVideoPath:string=path.join(pSTPath,'video');
    const getInfo=async(vidId:string):Promise<{r:boolean,d:{info:HomeScrapeDLInfo,ctrack:captionTrack}|null}>=>{const dlInfoRes:any=await this.ytServ.dlInfo(vidId,pInfoPath);if(dlInfoRes.r){return Promise.resolve(dlInfoRes)}else{return Promise.resolve({r:false,d:null})}};
    const getSub=async(vidId:string,ctrack:captionTrack):Promise<HomeScrapeDLType>=>{const gSRes:HomeScrapeDLType=await this.ytServ.dlCaps(vidId,ctrack,pSubPath);return Promise.resolve(gSRes)};
    let udAPC:number=0,udAPTTL:number=0,udAPStart:Date,udAPItemAVG:number,estTRS:number;
    const getTRS=():number=>{return estTRS};
    const getCount=():number=>{return udAPC};
    let cDownProg:any=null;
    const udAddProg=(count:number)=>{
      if(udAPTTL>3){
        if(count===0){this.addTProgTxt='- 0 / '+String(udAPTTL)+' (0%) - est. ?';this.pDOM()}
        if(count===1){udAPStart=new Date();this.addTProgTxt='- '+String(count)+' / '+String(udAPTTL)+' ('+String(Math.floor((count/udAPTTL)*100))+'%) - est. ?';this.pDOM()}
        else if(count===2||count===3){this.addTProgTxt='- '+String(count)+' / '+String(udAPTTL)+' ('+String(Math.floor((count/udAPTTL)*100))+'%) - est. ?';this.pDOM()}
        else if(count>3){
          if(cDownProg===null){
            cDownProg=setInterval(()=>{
              const gC:number=getCount(),gTRS:number=getTRS();
              if(gC===udAPTTL){clearInterval(cDownProg)}
              else{
                const estMOne:number=gTRS-1;
                this.addTProgTxt='- '+String(gC)+' / '+String(udAPTTL)+' ('+String(Math.floor((gC/udAPTTL)*100))+'%) - est. '+this.secs2HMS(estMOne);
                this.pDOM();
              };
          },1000)};
          udAPC=count;
          udAPItemAVG=(this.evServ.ttMS(udAPStart,new Date()))/(count-1);
          estTRS=Math.round(((udAPTTL-count)*udAPItemAVG)/1000);
        }else if(count===udAPTTL){if(cDownProg!==null){clearInterval(cDownProg);cDownProg=null}};
      }else{this.addTProgTxt='- '+String(count)+' / '+String(udAPTTL)+' ('+String(Math.floor((count/udAPTTL)*100))+'%)';this.pDOM()};
    };
    //-------------------
    if(!(await this.exists(pInfoPath))){await this.mkDir(pInfoPath)};
    if(!(await this.exists(pSubPath))){await this.mkDir(pSubPath)};
    const existSTIIndex:number=this.homeSStates.scrapeTargets.findIndex((stI:HomeTargetItem)=>stI.itemID===stItemId);
    let modSTItem:HomeTargetItem=this.homeSStates.scrapeTargets[existSTIIndex],baseVDataArr:any[]=[],apiErr:boolean|null=null;
    const matchSSearchItemIndex:number=this.homeSStates.searchSourceResults[modSTItem.type+'s'].findIndex((ssI:HomeSearchSourceResultItem)=>ssI.id===stItemId);
    this.cCons('(initProcessScrapeTarget): '+modSTItem.itemID+' ('+modSTItem.type+') | SearchListIndex: '+String(matchSSearchItemIndex)+' | ScrapeTargetListIndex: '+String(existSTIIndex)+'...');
    // CHANNEL -----------
    if(modSTItem.type==='channel'){const getChanRes:any=await this.ytServ.getChannel(stItemId);if(getChanRes.r){modSTItem.cData={cID:getChanRes.d.id,cTitle:getChanRes.d.snippet.title,subCount:Number(getChanRes.d.statistics.subscriberCount),videoCount:Number(getChanRes.d.statistics.videoCount),viewCount:Number(getChanRes.d.statistics.viewCount)}}else{apiErr=true;this.cCons('ERROR: [CHANNEL] API Err')}};
    // PLAYLIST ----------
    if(!apiErr&&modSTItem.type==='channel'||modSTItem.type==='playlist'){
      const resCPLRes:any=await this.ytServ.resolveCPL(modSTItem.type,stItemId);
      if(resCPLRes.r){
        let plD:any={plID:resCPLRes.d.id,plTitle:resCPLRes.d.title,videoCount:resCPLRes.d.estimatedItemCount,ttlDur:'',viewCount:resCPLRes.d.views};
        if(resCPLRes.d.estimatedItemCount>this.homeSStates.searchLimits.search.maxresolve){udAPTTL=this.homeSStates.searchLimits.search.maxresolve}else{udAPTTL=resCPLRes.d.estimatedItemCount};
        udAddProg(0);
        let plDTTLDur:number=0;
        for(let i=0;i<resCPLRes.d.items.length;i++){
          const plVid:any=resCPLRes.d.items[i];
          plDTTLDur+=plVid.durationSec;
          baseVDataArr.push({id:plVid.id,title:plVid.title});
        };
        plD.ttlDur=this.s2T(plDTTLDur);
        modSTItem.pData=plD;
      }else{apiErr=true;this.cCons('ERROR: [PLAYLIST] API Err')}
    };
    // VIDEO -------------
    if(modSTItem.type==='video'){baseVDataArr.push({id:stItemId,title:modSTItem.itemTitle})};
    // ITEM VIDEOS -------
    if(!apiErr){
      let stVidList:any[]=baseVDataArr,detailVDataArr:HomeTargetVideo[]=[];
      for(let i=0;i<stVidList.length;i++){
        const stVO:any=stVidList[i];
        let vdO:HomeTargetVideo={vID:stVO.id,vTitle:stVO.title,duration:'0:00',viewCount:0,caption:false,selected:false,info:<HomeScrapeDLInfo>{title:'',channel:'',author:'',views:0,duration:0,ext:'json',path:'',size:0,err:false},sub:<HomeScrapeDLType>{ext:'xml',path:'',size:0,err:false},audio:<HomeScrapeDLType>{ext:'mp3',path:'',size:0,err:false},video:<HomeScrapeDLType>{ext:'mp4',path:'',size:0,err:false}};
        const infoFPath:string=path.join(pInfoPath,vdO.vID+'.json'),infoFExists:boolean=await this.exists(infoFPath);
        let infoFSize:number=0;if(infoFExists){infoFSize=(await this.statSize(infoFPath)).d};
        const subFPath:string=path.join(pSubPath,vdO.vID+'.xml'),subFExists:boolean=await this.exists(subFPath);
        let subFSize:number=0;if(subFExists){subFSize=(await this.statSize(subFPath)).d};
        const subFTxtPath:string=path.join(pSubTxtPath,vdO.vID+'.txt'),subFTxtExists:boolean=await this.exists(subFTxtPath);
        let subFTxtSize:number=0;if(subFTxtExists){subFTxtSize=(await this.statSize(subFTxtPath)).d};
        const subFJSONPath:string=path.join(pSubJSONPath,vdO.vID+'.json'),subFJSONExists:boolean=await this.exists(subFJSONPath);
        let subFJSONSize:number=0;if(subFJSONExists){subFJSONSize=(await this.statSize(subFJSONPath)).d};
        const audioFPath:string=path.join(pAudioPath,vdO.vID+'.mp3'),audioFExists:boolean=await this.exists(audioFPath);
        let audioFSize:number=0;if(audioFExists){audioFSize=(await this.statSize(audioFPath)).d};
        const videoFPath:string=path.join(pVideoPath,vdO.vID+'.mp4'),videoFExists:boolean=await this.exists(videoFPath);
        let videoFSize:number=0;if(videoFExists){videoFSize=(await this.statSize(videoFPath)).d};
        let hasVInfo:boolean|null=null,tempCTrack:captionTrack|null=null;
        // Check Info
        const checkInfoFn=async():Promise<boolean>=>{
          try{
            const infoRawData:any=await readFile(infoFPath,'utf-8');
            if((this.isVJSON(infoRawData))){
              const infObj:any=JSON.parse(infoRawData),cTrack:captionTrack=infObj.player_response.captions.playerCaptionsTracklistRenderer.captionTracks.find((t:any)=>t.languageCode==='en');
              if(cTrack){tempCTrack=cTrack;vdO.caption=true;vdO.selected=true}else{vdO.caption=false;vdO.selected=false};
              const cDeets:VideoDetails=infObj.player_response.videoDetails;
              vdO.duration=this.s2T(Number(cDeets.lengthSeconds));
              vdO.viewCount=Number(cDeets.viewCount);
              vdO.info={title:cDeets.title,channel:cDeets.channelId,author:cDeets.author,views:Number(cDeets.viewCount),duration:Number(cDeets.lengthSeconds),ext:'json',path:infoFPath,size:infoFSize,err:false};
              hasVInfo=true;
              return Promise.resolve(true);
            }else{hasVInfo=false;return Promise.resolve(false)};
          }catch(e){hasVInfo=false;return Promise.resolve(false)};
        };
        if(infoFExists&&infoFSize>0){await checkInfoFn()}else{hasVInfo=false};
        // DL Missing Info?
        if(hasVInfo===null||hasVInfo===false){
          const{r,d}=await getInfo(stVO.id);
          if(r&&d!==null){
            hasVInfo=true;
            if(d.info.duration&&d.info.duration>0){vdO.duration=this.s2T(d.info.duration)};
            if(d.info.views&&d.info.views>0){vdO.viewCount=d.info.views};
            if(d.hasOwnProperty('ctrack')){vdO.caption=true;vdO.selected=true;tempCTrack=d.ctrack}else{vdO.caption=false;vdO.selected=false};
            if(d.hasOwnProperty('info')){vdO.info=d.info};
          }else{vdO.info.err=true};
        };
        // Check Sub - DL If Missing
        if(subFExists&&subFSize>0){
          vdO.sub.path=subFPath;vdO.sub.size=subFSize;
          if(!subFTxtExists||subFTxtSize===0||!subFJSONExists||subFJSONSize===0){await this.xml2JsonTxtFiles(subFPath)};
        }else{
          let lastCTrack:captionTrack|null=null;
          if(tempCTrack!==null){lastCTrack=tempCTrack}
          else{const cIFRes:boolean=await checkInfoFn();if(cIFRes&&tempCTrack!==null){lastCTrack=tempCTrack}};
          if(lastCTrack!==null){
            let subRes:HomeScrapeDLType=await getSub(vdO.vID,tempCTrack);
            if(subRes.path.length>0&&subRes.size===0){
              const lastStatSize:any=await this.statSize(subRes.path);
              if(lastStatSize.r&&lastStatSize.d>0){subRes.size=lastStatSize.d};
              vdO.sub=subRes;
            }else{vdO.sub=subRes};
            if((await this.exists(vdO.sub.path))&&vdO.sub.size>0){
              await this.xml2JsonTxtFiles([vdO.sub.path]);
            };
          }else{vdO.sub.err=true};
        };
        // CHECK AUDIO/VIDEO
        if(audioFExists&&audioFSize>0){vdO.audio.path=audioFPath;vdO.audio.size=audioFSize};
        if(videoFExists&&videoFSize>0){vdO.video.path=videoFPath;vdO.video.size=videoFSize};
        detailVDataArr.push(vdO);
        udAddProg(i+1);
      };
      ////// END LOOP //////
      modSTItem.vData=detailVDataArr;
      const vICapped:number=modSTItem.vData.filter((vO:HomeTargetVideo)=>vO.caption===true).length;
      if(vICapped===modSTItem.vData.length){modSTItem.hasCaps='all';modSTItem.isSelected='all'}
      else{if(vICapped===0){modSTItem.hasCaps='none';modSTItem.isSelected='none'}
      else if(vICapped>0&&vICapped<modSTItem.vData.length){modSTItem.hasCaps='some';modSTItem.isSelected='some'}};
      this.homeSStates.scrapeTargets[existSTIIndex]=modSTItem;
      this.homeSStates.scrapeTargets[existSTIIndex].isLoaded=true;
      this.addTProgTxt='';
      this.rdfUpdateCounts();this.updateTargetCounts();this.pDOM();await this.doSaveStates();
    };
    if(apiErr){
      if(modSTItem.hasOwnProperty('error')&&modSTItem.error===true){
        this.homeSStates.scrapeTargets=this.homeSStates.scrapeTargets.filter((sTI:HomeTargetItem)=>sTI.itemID!==modSTItem.itemID);
        this.homeSStates.searchSourceResults[modSTItem.type+'s'][matchSSearchItemIndex].isBad=true;
        this.homeSStates.searchSourceResults[modSTItem.type+'s'][matchSSearchItemIndex].isTarget=false;
      }else{this.homeSStates.scrapeTargets[existSTIIndex]['error']=true};
    };
  }
/////////////////////////////////////////////////////////
  async searchResAlreadyTarget():Promise<boolean>{
    for(let i=0;i<this.homeSStates.searchSourceResults.channels.length;i++){
      const sSId:string=this.homeSStates.searchSourceResults.channels[i].id;
      if(this.homeSStates.scrapeTargets.findIndex((sTI:HomeTargetItem)=>sTI.itemID===sSId)!==-1){this.homeSStates.searchSourceResults.channels[i].isTarget=true}
    };
    for(let i=0;i<this.homeSStates.searchSourceResults.playlists.length;i++){
      const sSId:string=this.homeSStates.searchSourceResults.playlists[i].id;
      if(this.homeSStates.scrapeTargets.findIndex((sTI:HomeTargetItem)=>sTI.itemID===sSId)!==-1){this.homeSStates.searchSourceResults.playlists[i].isTarget=true}
    };
    for(let i=0;i<this.homeSStates.searchSourceResults.videos.length;i++){
      const sSId:string=this.homeSStates.searchSourceResults.videos[i].id;
      if(this.homeSStates.scrapeTargets.findIndex((sTI:HomeTargetItem)=>sTI.itemID===sSId)!==-1){this.homeSStates.searchSourceResults.videos[i].isTarget=true};
      for(let iV=0;iV<this.homeSStates.scrapeTargets.length;iV++){
        const stIVids:HomeTargetVideo[]=this.homeSStates.scrapeTargets[iV].vData;
        if(stIVids.findIndex(sTIVO=>sTIVO.vID===sSId)!==-1){this.homeSStates.searchSourceResults.videos[i].isTarget=true};
      };
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async scrapeTargetActions(action:string,data?:any): Promise<void>{
    this.cCons('(scrapeTargetActions) [ACTION]: '+action+', [DATA]: {evName:'+data.evName+',evEvent:$event,evData:{?:?}}');
    switch(action){
      case 'toggleVis':
        if(data.evData.type==='channel'){return};
        this.homeSStates.scrapeTargets[data.evData.listIndex].toggled?this.homeSStates.scrapeTargets[data.evData.listIndex].toggled=false:this.homeSStates.scrapeTargets[data.evData.listIndex].toggled=true;
        await this.doSaveStates();this.pDOM();
        break;
      case 'toggleSelect':
        if((data.evData.type==='video'&&!data.evData.video.caption)||((data.evData.type==='playlist'||data.evData.type==='channel')&&data.evData.item.hasCaps==='none')){return}
        else{
          if(data.evData.type==='video'){
            let newSelTxt:string='',newSelV:boolean=this.homeSStates.scrapeTargets[data.evData.itemIndex].vData[data.evData.videoIndex].selected;
            if(this.homeSStates.scrapeTargets[data.evData.itemIndex].vData[data.evData.videoIndex].selected){newSelV=false;newSelTxt='[-]'}else{newSelV=true;newSelTxt='[+]'};
            this.homeSStates.scrapeTargets[data.evData.itemIndex].vData[data.evData.videoIndex].selected=newSelV;
            this.evServ.publish('updateBA','Targets|Select: '+newSelTxt+' Video '+data.evData.video.title);
          }else{
            let newSelTxt:string='',newSelV:string=this.homeSStates.scrapeTargets[data.evData.itemIndex].isSelected;
            if(this.homeSStates.scrapeTargets[data.evData.itemIndex].isSelected==='some'||this.homeSStates.scrapeTargets[data.evData.itemIndex].isSelected==='all'){newSelV='none';newSelTxt='[-]'}else{newSelV='all';newSelTxt='[+]'};
            this.homeSStates.scrapeTargets[data.evData.itemIndex].isSelected=newSelV;
            for(let i=0;i<this.homeSStates.scrapeTargets[data.evData.itemIndex].vData.length;i++){
              if(this.homeSStates.scrapeTargets[data.evData.itemIndex].vData[i].caption){
                if(newSelV==='none'){this.homeSStates.scrapeTargets[data.evData.itemIndex].vData[i].selected=false}
                else{this.homeSStates.scrapeTargets[data.evData.itemIndex].vData[i].selected=true}
              };
            };
            let typeTitle:string='';data.evData.type==='playlist'?typeTitle=this.homeSStates.scrapeTargets[data.evData.itemIndex].pData.plTitle:typeTitle=this.homeSStates.scrapeTargets[data.evData.itemIndex].cData.cTitle;
            this.evServ.publish('updateBA','Targets|Select: '+newSelTxt+' '+this.capd(data.evData.type)+' '+typeTitle);
          };
          await this.updateTargetCounts();
          this.pDOM();
          await this.doSaveStates();
        };
        break;
      case 'add':
        const sSResItem:HomeSearchSourceResultItem=data.evData.item;
        const existCount:number=this.homeSStates.scrapeTargets.filter((sTI:HomeTargetItem)=>sTI.itemID===sSResItem.id).length;
        if(existCount<1&&!sSResItem.isBad){
          this.homeSStates.searchSourceResults[data.evData.type+'s'][data.evData.listIndex].isTarget=true;
          let newSTItem:HomeTargetItem={itemID:data.evData.item.id,itemTitle:data.evData.item.title,type:data.evData.type,toggled:false,hasCaps:'none',isSelected:'none',isLoaded:false,error:false,cData:null,pData:null,vData:null};
          this.homeSStates.scrapeTargets.push(newSTItem);
          this.initProcessScrapeTarget(newSTItem.itemID);
        };
        break;
      case 'retryAdd':const retryItem:HomeTargetItem=data.evData.item,raItemId:string=retryItem.itemID;await this.initProcessScrapeTarget(raItemId);break;
      case 'skipAdd':
        const skipItem:HomeTargetItem=data.evData.item;
        this.homeSStates.scrapeTargets=this.homeSStates.scrapeTargets.filter((sTI:HomeTargetItem)=>sTI.itemID!==skipItem.itemID);
        const sSListIndex:number=this.homeSStates.searchSourceResults[skipItem.type+'s'].findIndex((sSO:HomeSearchSourceResultItem)=>sSO.id===skipItem.itemID);
        if(sSListIndex!==-1){this.homeSStates.searchSourceResults[skipItem.type+'s'][sSListIndex].isTarget=false;this.homeSStates.searchSourceResults[skipItem.type+'s'][sSListIndex].isBad=true};
        this.updateTargetCounts();this.rdfUpdateCounts();this.pDOM();this.doSaveStates();break;
      case 'remove':
        let dDFName:string='';data.evData.type==='video'?dDFName=data.evData.video.vTitle:dDFName=data.evData.item.itemTitle;
        const dType:string=data.evData.type,dDType:string=this.capd(data.evData.type),dDStr:string=dDType+': "'+dDFName+'"';
        const confDelDataRes:string=await ipcRenderer.invoke('do-confirm-delete-target',['deleteTargetData',{name:dDStr}]);
        if(confDelDataRes==='cancel'){this.evServ.publish('updateBA','ScrapeTargets|Remove: Cancelled - '+dDFName)}
        else{
          let delFileIds:string[]=[];
          if(dType==='channel'||dType==='playlist'||(dType==='video'&&data.evData.item.itemID===data.evData.video.vID)){
            this.homeSStates.scrapeTargets=this.homeSStates.scrapeTargets.filter((sTI:HomeTargetItem)=>sTI.itemID!==data.evData.item.itemID);
            const sSListIndex:number=this.homeSStates.searchSourceResults[data.evData.item.type+'s'].findIndex((sSO:HomeSearchSourceResultItem)=>sSO.id===data.evData.item.itemID);
            if(sSListIndex!==-1){this.homeSStates.searchSourceResults[data.evData.item.type+'s'][sSListIndex].isTarget=false};
            for(let i=0;i<data.evData.item.vData.length;i++){delFileIds.push(data.evData.item.vData[i].vID)};
          }else{
            this.homeSStates.scrapeTargets[data.evData.itemIndex].vData=this.homeSStates.scrapeTargets[data.evData.itemIndex].vData.filter((sTVI:HomeTargetVideo)=>sTVI.vID!==data.evData.video.vID);
            delFileIds.push(data.evData.video.vID);
          };
          if(confDelDataRes==='remove&delete'){await this.deleteTargetFiles(delFileIds)};
          this.updateTargetCounts();
          this.rdfUpdateCounts();
          this.pDOM();
          this.doSaveStates();
          this.evServ.publish('updateBA','ScrapeTargets|Removed: '+dDType+' '+dDFName);
        };
        break;
    };
    this.pDOM();
  }
/////////////////////////////////////////////////////////
  async deleteTargetFiles(vidIds:string[]):Promise<boolean>{
    this.cCons('(deleteTargetFiles) IDS - ['+vidIds.join(',')+']...');
    const delF=async(p:string):Promise<boolean>=>{try{await unlink(p);return Promise.resolve(true)}catch(e){this.cCons('(deleteTargetFiles) ERROR ('+p+'): '+JSON.stringify(e));return Promise.resolve(false)}};
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets');
    const iDP:string=path.join(pSTPath,'info'),sDP:string=path.join(pSTPath,'sub'),stDP:string=path.join(sDP,'text'),sjDP:string=path.join(sDP,'json'),aDP:string=path.join(pSTPath,'audio'),vDP:string=path.join(pSTPath,'video');
    const getFP=(type:string,id:string):string=>{
      if(type==='i'){return path.join(iDP,id+'.json')}else if(type==='s'){return path.join(sDP,id+'.xml')}else if(type==='st'){return path.join(stDP,id+'.txt')}else if(type==='sj'){return path.join(sjDP,id+'.json')}else if(type==='a'){return path.join(aDP,id+'.mp3')}else{return path.join(vDP,id+'.mp4')}};
    let stItemVidFileIds:string[]=vidIds;
    for(let vI=0;vI<stItemVidFileIds.length;vI++){
      const iFile:string=getFP('i',stItemVidFileIds[vI]),sFile:string=getFP('s',stItemVidFileIds[vI]),stFile:string=getFP('st',stItemVidFileIds[vI]),sjFile:string=getFP('sj',stItemVidFileIds[vI]),aFile:string=getFP('a',stItemVidFileIds[vI]),vFile:string=getFP('v',stItemVidFileIds[vI]);
      if((await this.exists(iFile))){await delF(iFile)};
      if((await this.exists(sFile))){await delF(sFile)};
      if((await this.exists(stFile))){await delF(stFile)};
      if((await this.exists(sjFile))){await delF(sjFile)};
      if((await this.exists(aFile))){await delF(aFile)};
      const audioDirList:any=await getFilesFromDir(aDP,false,false);
      for(let i=0;i<audioDirList.length;i++){const aFilePath:string|false=audioDirList[i];if(aFilePath&&typeof aFilePath==='string'&&aFilePath.includes(stItemVidFileIds[vI])){await delF(aFilePath)}};
      if((await this.exists(vFile))){await delF(vFile)};
      const videoDirList:any=await getFilesFromDir(vDP,false,false);
      for(let i=0;i<videoDirList.length;i++){const vFilePath:string|false=videoDirList[i];if(vFilePath&&typeof vFilePath==='string'&&vFilePath.includes(stItemVidFileIds[vI])){await delF(vFilePath)}};
    };
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async stProcessActions(action:string,data?:any){
    this.cCons('(stProcessActions) ['+action+']...');
    switch(action){
      case 'mode':let modes:HomeScrapeTargetProcessMode[]=this.homeSStates.stProcessModes,oldModeIndex:number=this.homeSStates.stProcessMode.index,newModeIndex:number=oldModeIndex,dir:string='';
        if(data.type==='change'){dir=data.dir}
        else{const eEv:any=data.event,eKey:any=eEv.key;if(eKey==='ArrowLeft'||eKey==='ArrowRight'){eEv.preventDefault();if(eEv.defaultPrevented){if(eKey==='ArrowLeft'){dir='prev'}else{dir='next'}}}};
        dir==='next'?newModeIndex++:newModeIndex--;
        if(newModeIndex<0){newModeIndex=modes.length-1};
        if(newModeIndex>modes.length-1){newModeIndex=0};
        this.homeSStates.stProcessMode=modes[newModeIndex];
        this.pDOM();
        await this.doSaveStates();
        this.evServ.publish('updateBA','ScrapeTargets|Process: Mode set to '+this.homeSStates.stProcessMode.label);
        break;
      case 'start':this.processInProgress=true;setTimeout(()=>{this.startProcessTargetDL()},250);break;
      case 'stop':this.processInProgress=false;break;
    }
  }
/////////////////////////////////////////////////////////
  async dlSingleTargetMedia(ev:MouseEvent,type:string,vId:string):Promise<boolean>{
    this.cCons('(dlSingleTargetMedia) [$event,'+type+','+vId+']...');
    ev.preventDefault();ev.stopPropagation();
    const tProg=(sBPF:string,aV:string,v?:number)=>{let nO:HomeProg={type:'determinate',buffer:1,perc:0,txt:'0%'},oKey:string='';aV==='a'?oKey='audio':oKey='video';if(sBPF==='b'){nO.buffer=0}else if(sBPF==='p'){nO.perc=v;nO.txt=String(Math.floor((nO.perc)*100))+'%'}else if(sBPF==='f'){nO.perc=1;nO.txt='100%'};this.homeSStates.stProcessProg[oKey]=nO;if(typeof v==='number'&&v>0){this.homeSStates.stProcessProg.item.perc=v;this.homeSStates.stProcessProg.item.txt=String(Math.floor(this.homeSStates.stProcessProg.item.perc*100)+'%')};this.pDOM()};
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets'),pAudioPath:string=path.join(pSTPath,'audio'),pVideoPath:string=path.join(pSTPath,'video');
    const gIs=(vId:string):Promise<{i:number,v:number}|null>=>{let gIRes:any=null;for(let Ti=0;Ti<this.homeSStates.scrapeTargets.length;Ti++){const stItem:HomeTargetItem=this.homeSStates.scrapeTargets[Ti];const vI:number=stItem.vData.findIndex((vO:HomeTargetVideo)=>vO.vID===vId);if(vI!==-1){gIRes={i:Ti,v:vI}}};return Promise.resolve(gIRes)};
    const getAudio=async(vidId:string):Promise<HomeScrapeDLType>=>{tProg('s','a');tProg('b','a');this.evServ.subscribe('stpA'+vidId,stpAData=>{tProg('p','a',stpAData)});const dlAudioRes:HomeScrapeDLType=await this.ytServ.dlAudio(vidId,pAudioPath);this.evServ.destroy('stpA'+vidId);tProg('f','a');return Promise.resolve(dlAudioRes)};
    const getVideo=async(vidId:string):Promise<HomeScrapeDLType>=>{tProg('s','v');tProg('b','v');this.evServ.subscribe('stpV'+vidId,stpVData=>{tProg('p','v',stpVData)});const dlVideoRes:HomeScrapeDLType=await this.ytServ.dlVideo(vidId,pVideoPath);this.evServ.destroy('stpV'+vidId);tProg('f','v');return Promise.resolve(dlVideoRes)};
    const currentDLModeIndex:number=this.homeSStates.stProcessMode.index;
    if(type==='audio'){this.homeSStates.stProcessMode=this.homeSStates.stProcessModes[0]}
    else{this.homeSStates.stProcessMode=this.homeSStates.stProcessModes[1]};
    ;this.processStatus.ttlItems=1;this.processStatus.itemNo=1;
    this.homeSStates.stProcessProg.item.perc=0;this.homeSStates.stProcessProg.item.txt='0%';this.homeSStates.stProcessProg.item.buffer=1;
    this.singleDLItemId=vId;
    this.processInProgress=true;
    this.pDOM();
    const stIndexes:{i:number,v:number}|null=await gIs(vId);
    if(type==='audio'){if(!(await this.exists(pAudioPath))){await this.mkDir(pAudioPath)};const audioTObj:HomeScrapeDLType=await getAudio(vId);this.homeSStates.scrapeTargets[stIndexes.i].vData[stIndexes.v].audio=audioTObj}else{if(!(await this.exists(pVideoPath))){await this.mkDir(pVideoPath)};const videoTObj:HomeScrapeDLType=await getVideo(vId);this.homeSStates.scrapeTargets[stIndexes.i].vData[stIndexes.v].video=videoTObj};
    this.homeSStates.stProcessProg.item.perc=1;this.homeSStates.stProcessProg.item.txt='100%';
    this.singleDLItemId='';
    this.pDOM();this.rdfUpdateCounts();this.doSaveStates();
    setTimeout(()=>{
      this.processInProgress=false;
      this.homeSStates.stProcessMode=this.homeSStates.stProcessModes[currentDLModeIndex];
      this.homeSStates.stProcessProg[type]={type:'determinate',buffer:1,perc:0,txt:'0%'};
      this.pDOM();
    },1500);
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async startProcessTargetDL():Promise<boolean>{
    this.cCons('(startProcessTargetDownload) ...');
    const tProg=(sBPF:string,aV:string,v?:number)=>{let nO:HomeProg={type:'determinate',buffer:1,perc:0,txt:'0%'},oKey:string='';aV==='a'?oKey='audio':oKey='video';if(sBPF==='b'){nO.buffer=0}else if(sBPF==='p'){nO.perc=v;nO.txt=String(Math.floor((nO.perc)*100))+'%'}else if(sBPF==='f'){nO.perc=1,nO.txt='100%'};this.homeSStates.stProcessProg[oKey]=nO;this.pDOM()};
    const inclA=():boolean=>{if(this.homeSStates.stProcessMode.index===1||this.homeSStates.stProcessMode.index===3){return true}else{return false}};
    const inclV=():boolean=>{if(this.homeSStates.stProcessMode.index===2||this.homeSStates.stProcessMode.index===3){return true}else{return false}};
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTPath:string=path.join(pPath,'scrapeTargets'),pSubsPath:string=path.join(pSTPath,'sub'),pAudioPath:string=path.join(pSTPath,'audio'),pVideoPath:string=path.join(pSTPath,'video');
    const gP=(type:string,vId:string):string=>{let dP:string='',ext:string='';if(type==='a'){dP=pAudioPath;ext='.mp3'}else{dP=pVideoPath;ext='.mp4'};const fP:string=path.join(dP,vId+ext);return fP};
    const gIs=(vId:string):Promise<{i:number,v:number}|null>=>{let gIRes:any=null;for(let Ti=0;Ti<this.homeSStates.scrapeTargets.length;Ti++){const stItem:HomeTargetItem=this.homeSStates.scrapeTargets[Ti],vI:number=stItem.vData.findIndex((vO:HomeTargetVideo)=>vO.vID===vId);if(vI!==-1){gIRes={i:Ti,v:vI}}};return Promise.resolve(gIRes)};
    const hasAllD=async(vObj:HomeTargetVideo):Promise<boolean>=>{const aFP:string=gP('a',vObj.vID),vFP:string=gP('v',vObj.vID);if(vObj.audio.path===aFP&&(await this.exists(aFP))&&vObj.audio.size>0&&!vObj.audio.err&&vObj.video.path===vFP&&(await this.exists(vFP))&&vObj.video.size>0&&!vObj.video.err){return Promise.resolve(true)}else{return Promise.resolve(false)}};
    const getAudio=async(vidId:string):Promise<HomeScrapeDLType>=>{tProg('s','a');tProg('b','a');this.evServ.subscribe('stpA'+vidId,stpAData=>{tProg('p','a',stpAData)});const dlAudioRes:HomeScrapeDLType=await this.ytServ.dlAudio(vidId,pAudioPath);this.evServ.destroy('stpA'+vidId);tProg('f','a');return Promise.resolve(dlAudioRes)};
    const getVideo=async(vidId:string):Promise<HomeScrapeDLType>=>{tProg('s','v');tProg('b','v');this.evServ.subscribe('stpV'+vidId,stpVData=>{tProg('p','v',stpVData)});const dlVideoRes:HomeScrapeDLType=await this.ytServ.dlVideo(vidId,pVideoPath);this.evServ.destroy('stpV'+vidId);tProg('f','v');return Promise.resolve(dlVideoRes)};
    //---------------------
    if(!(await this.exists(pSubsPath))){await this.mkDir(pSubsPath)};
    if(inclA()&&!(await this.exists(pAudioPath))){await this.mkDir(pAudioPath)};
    if(inclV()&&!(await this.exists(pVideoPath))){await this.mkDir(pVideoPath)};
    //---------------------
    let processVidsArr:HomeTargetVideo[]=[];
    for(let iI=0;iI<this.homeSStates.scrapeTargets.length;iI++){
      const sTObj:any=this.homeSStates.scrapeTargets[iI];
      if(sTObj.isSelected!=='none'){
        const sTVidsArr:HomeTargetVideo[]=this.homeSStates.scrapeTargets[iI].vData;
        const selVs:HomeTargetVideo[]=sTVidsArr.filter((vO:any)=>vO.selected);
        let selNotAllD:HomeTargetVideo[]=[];
        for(let i=0;i<selVs.length;i++){const selVO:HomeTargetVideo=selVs[i];if((await hasAllD(selVO))){selNotAllD.push(selVs[i])}};
        if(selNotAllD.length>0){processVidsArr.length>0?processVidsArr=processVidsArr.concat(selNotAllD):processVidsArr=selNotAllD};
      };
    };
    //---------------------
    this.processStatus.ttlItems=processVidsArr.length;
    this.homeSStates.stProcessProg.item.perc=0;this.homeSStates.stProcessProg.item.txt='0%';this.homeSStates.stProcessProg.item.buffer=1;this.pDOM();
    let newA:number=0,newV:number=0;
    for(let i=0;i<processVidsArr.length;i++){
      this.processStatus.itemNo=i+1;
      const pVid:HomeTargetVideo=processVidsArr[i],vId:string=pVid.vID,stIndexes:{i:number,v:number}|null=await gIs(vId);
      if(inclA()){const aFP:string=gP('a',vId);if(pVid.audio.path!==aFP||!(await this.exists(aFP))||pVid.audio.size===0||pVid.audio.err){const audioTObj:HomeScrapeDLType=await getAudio(vId);this.homeSStates.scrapeTargets[stIndexes.i].vData[stIndexes.v].audio=audioTObj;newA++}};
      if(inclV()){const vFP:string=gP('v',vId);if(pVid.video.path!==vFP||!(await this.exists(vFP))||pVid.video.size===0||pVid.video.err){const videoTObj:HomeScrapeDLType=await getVideo(vId);this.homeSStates.scrapeTargets[stIndexes.i].vData[stIndexes.v].video=videoTObj;newV++}};
      this.homeSStates.stProcessProg.item.perc+=((i+1)/this.processStatus.ttlItems);
      this.homeSStates.stProcessProg.item.txt=String(Math.floor(this.homeSStates.stProcessProg.item.perc*100)+'%');
      this.pDOM();
    };
    if((newA+newV)>0){let cT:string='(startProcessTargetDL) Added ';if(newA>0){cT+=String(newA)+' Audio '};if(newA>0&&newV>0){cT+='+ '};if(newV>0){cT+=String(newV)+' Video '};cT+='Files';this.cCons(cT);this.pDOM();await this.doSaveStates()};
    this.homeSStates.stProcessProg.item.perc=1;this.homeSStates.stProcessProg.item.txt='100%';this.pDOM();
    this.stProcessActions('stop');
    this.rdfUpdateCounts();
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async dlWholeSnip(groupType:'exact'|'multi'|'single',wgIndex:number,snipIndex:number,snipItem:HomeScrapeSnipRGItem):Promise<HomeScrapeSnipRGItem|false>{
    this.cCons('dlWholeSnip('+groupType+','+wgIndex+','+snipIndex+',snipItem...)...');console.log(snipItem);
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const pSTPath:string=path.join(pPath,'scrapeTargets');
    const pAudioPath:string=path.join(pSTPath,'audio');
    const pVideoPath:string=path.join(pSTPath,'video');
    const sdlDoStart=(t:string,id:string):boolean=>{this.snipPrevDLProg={inProg:true,av:t,vId:id,perc:0,txt:'0%'};this.pDOM();return true};
    const sdlDoStop=():boolean=>{this.snipPrevDLProg.perc=1;this.snipPrevDLProg.txt='100%';this.pDOM();return true};
    const sdlDoReset=():boolean=>{for(const pK of Object.keys(this.snipPrevDLProg)){if(pK==='inProg'){this.snipPrevDLProg[pK]=false}else{this.snipPrevDLProg[pK]=null}};this.pDOM();return true};
    const sdlDoProg=(v:number)=>{this.snipPrevDLProg.perc=v,this.snipPrevDLProg.txt=String(Math.floor((v)*100))+'%';this.pDOM()};
    const updSTarget=async(aOrV:string,vId:string,dlRes:HomeScrapeDLType):Promise<boolean>=>{let updRes:boolean=false,stTypeKey:string='';aOrV==='a'?stTypeKey='audio':stTypeKey='video';for(let i=0;i<this.homeSStates.scrapeTargets.length;i++){const vDIndex:number=this.homeSStates.scrapeTargets[i].vData.findIndex(vDI=>vDI.vID===vId);if(vDIndex!==-1){this.homeSStates.scrapeTargets[i].vData[vDIndex][stTypeKey]=dlRes;updRes=true}};return Promise.resolve(updRes)};
    const dlA=async(aOrV:string,vId:string):Promise<HomeScrapeDLType>=>{sdlDoStart(aOrV,vId);this.evServ.subscribe('stpA'+vId,stpAData=>{sdlDoProg(stpAData)});const dlARes:HomeScrapeDLType=await this.ytServ.dlAudio(vId,pAudioPath);this.evServ.destroy('stpA'+vId);sdlDoStop();setTimeout(()=>{sdlDoReset()},1500);return Promise.resolve(dlARes)};
    const dlV=async(aOrV:string,vId:string):Promise<HomeScrapeDLType>=>{sdlDoStart(aOrV,vId);this.evServ.subscribe('stpV'+vId,stpVData=>{sdlDoProg(stpVData)});const dlVRes:HomeScrapeDLType=await this.ytServ.dlVideo(vId,pVideoPath);this.evServ.destroy('stpV'+vId);sdlDoStop();setTimeout(()=>{sdlDoReset()},1500);return Promise.resolve(dlVRes)};
    //----------
    let dlRes:HomeScrapeDLType;
    if(snipItem.prevAV.pref==='a'){dlRes=await dlA('a',snipItem.vId)}else{dlRes=await dlV('v',snipItem.vId)};
    if(!dlRes.err&&dlRes.path.length>0&&(await this.exists(dlRes.path))){
      this.homeSStates.scrapeSnipResults[groupType][wgIndex].snips[snipIndex].prevAV[snipItem.prevAV.pref]={gotFile:true,filePath:dlRes.path};
      await updSTarget(snipItem.prevAV.pref,snipItem.vId,dlRes);
      this.pDOM();await this.doSaveStates();
      const prevSnip:HomeScrapeSnipRGItem=this.homeSStates.scrapeSnipResults[groupType][wgIndex].snips[snipIndex];
      return Promise.resolve(prevSnip);
    }else{this.cCons('(dlWholeSnip) ERROR: Failed to Update snip.prevAV after DL');return Promise.resolve(false)};
  }
/////////////////////////////////////////////////////////
  cvtW2HPad(w:number):number{return Math.round(((w/16)*9)+6)};
  async waitAnim():Promise<boolean>{return new Promise((resolve)=>{setTimeout(()=>{resolve(true)},500)})};
  async initPrevPlyr():Promise<boolean>{
    const colW:number=document.getElementById('results-wrap-id').offsetWidth;
    let prevPlyrW:number=0,prevPlyrH:number=0,prevWrapW:string=String(colW)+'px',prevWrapH:string='',prevProgW:'0px',prevProgH:string='';
    if(this.prevPlyrType==='a'){prevPlyrW=0;prevPlyrH=0;prevWrapH='64px',prevProgH='64px'}
    else{prevPlyrW=colW;prevPlyrH=this.cvtW2HPad(colW);prevWrapH=String(prevPlyrH)+'px',prevProgH=prevWrapH};
    this.prevPlyr.nativeElement.width=prevPlyrW;this.prevPlyr.nativeElement.height=prevPlyrH;
    this.prevPlyr.nativeElement.style.width=String(prevPlyrW)+'px';this.prevPlyr.nativeElement.style.height=String(prevPlyrH)+'px';
    this.prevProg.nativeElement.style.width=prevProgW;this.prevProg.nativeElement.style.height=prevProgH;
    this.prevPlyrReady=true;
    this.prevPlyrWrap.nativeElement.style.width=prevWrapW;
    this.prevPlyrWrap.nativeElement.style.maxHeight=prevWrapH;this.pDOM();
    this.showWordPeaks=true;
    await this.waitAnim();
    return Promise.resolve(true);
  };
  updPrevProg(wgQ:string,perc:number){
    const colW:number=document.getElementById('results-wrap-id').offsetWidth;
    if((perc*100)<1||(perc*100)>99){this.prevProg.nativeElement.style.display='none';this.prevProg.nativeElement.style.width='0px'}
    else{
      if(this.prevPlyrWordPeaks&&this.prevPlyrWordsArr.length>0){
        const findLastIndex=(a:any[],f:Function)=>(a.map((v,i)=>[i,v]).filter(([i,val])=>f(val,i,a)).pop()||[-1])[0];
        const wpIndex:number=findLastIndex(this.prevPlyrWordPeaks,(wPO)=>perc>wPO.p);
        let pWord:string='...';if(wpIndex<this.prevPlyrWordsArr.length){pWord=this.prevPlyrWordsArr[wpIndex]};
        this.peakPos=Math.round(colW*this.prevPlyrWordPeaks[wpIndex].p).toString()+'px';
        const matchWordsArr:string[]=wgQ.split(' ');
        if(matchWordsArr.includes(pWord)){this.peakWordMatch=true}else{this.peakWordMatch=false};
        this.peakWord=pWord;
      };
      this.pDOM();
      this.prevProg.nativeElement.style.display='block';
      const maxW:number=Math.round(document.getElementById('results-wrap-id').offsetWidth);
      let progW:number=maxW*perc;if(progW<1){progW=1};if(progW>maxW){progW=maxW};
      this.prevProg.nativeElement.style.width=String(progW)+'px';
      this.pDOM();
    };
  };
  async closePrevPlyr():Promise<boolean>{
    this.prevProg.nativeElement.style.display='none';
    this.prevProg.nativeElement.style.width='0px';
    this.showWordPeaks=false;
    this.prevPlyrWrap.nativeElement.style.maxHeight='0px';this.pDOM();
    await this.waitAnim();
    this.prevPlyrReady=false;
    return Promise.resolve(true);
  };
/////////////////////////////////////////////////////////
  async playPreviewSnip(snipPath:string,prevSnip:HomeScrapeSnipRGItem,isGroup:boolean,indexData?:any){
    this.cCons('playPreviewSnip('+snipPath+',prevSnip,indexData)...');
    const colW:number=document.getElementById('results-wrap-id').offsetWidth;
    let rawPWavePath:string|false;
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,audioDir:string=path.join(pPath,'scrapeTargets/audio');
    const updSTarget=async(aOrV:string,vId:string,dlRes:HomeScrapeDLType):Promise<boolean>=>{let updRes:boolean=false,stTypeKey:string='';aOrV==='a'?stTypeKey='audio':stTypeKey='video';for(let i=0;i<this.homeSStates.scrapeTargets.length;i++){const vDIndex:number=this.homeSStates.scrapeTargets[i].vData.findIndex(vDI=>vDI.vID===vId);if(vDIndex!==-1){this.homeSStates.scrapeTargets[i].vData[vDIndex][stTypeKey]=dlRes;updRes=true}};return Promise.resolve(updRes)};
    const doNext=(res:boolean)=>{this.evServ.publish('playGroupNext',res)};
    const updState=(i:string,p:boolean,g:boolean,e:boolean)=>{this.snipPrevPlayState={id:i,isPlay:p,isGroup:g,isErr:e};this.pDOM()};
    const doError=async():Promise<boolean>=>{updState(prevSnip.vId,false,isGroup,true);const sSRes:any=await this.statSize(snipPath);
      if(!(await this.exists(snipPath))||!sSRes.r||sSRes.d===0){this.homeSStates.scrapeSnipResults[indexData.gT][indexData.wI].snips[indexData.sI].prevAV[indexData.avT]={gotFile:false,filePath:''};this.pDOM();await this.doSaveStates()};
      if(isGroup){doNext(false)};
      if(indexData.avT==='a'){if(typeof rawPWavePath==='string'&&(await this.exists(rawPWavePath))){try{await unlink(rawPWavePath)}catch(e){console.log(e)}};this.evServ.destroy('prevHwl'+prevSnip.vId)};
      return new Promise((resolve)=>{setTimeout(()=>{updState(null,false,false,false);resolve(true)},1500)});
    };
    // Get WordPeaks
    let wPeaksFPath:string|null=null;
    if(indexData.avT==='a'){wPeaksFPath=snipPath}
    else{
      const existPrevA:HomeScrapeSnippetPAVObject=this.homeSStates.scrapeSnipResults[indexData.gT][indexData.gI].snips[indexData.sI].prevAV.a;
      if(existPrevA.gotFile&&existPrevA.filePath.length>0){wPeaksFPath=existPrevA.filePath}
      else{const cMPRes:boolean|HomeScrapeDLType=await this.ffServ.cvtMP42MP3(snipPath);
        if(cMPRes){
          wPeaksFPath=cMPRes.path;
          this.homeSStates.scrapeSnipResults[indexData.gT][indexData.gI].snips[indexData.sI].prevAV.a={gotFile:true,filePath:cMPRes.path};
          await updSTarget('a',prevSnip.vId,cMPRes)
        };
      };
    };
    if(wPeaksFPath!==null){
      const getWPeaks:{peaks:HomeSnipWordPeak[],info:any}|false=await this.ffServ.getWordPeaks(wPeaksFPath);
      if(getWPeaks){this.prevPlyrWordPeaks=getWPeaks.peaks;this.prevPlyrWordsArr=prevSnip.subMatches.filter(sMO=>sMO.selected)[0].textLine.trim().split(' ')}
      else{this.prevPlyrWordPeaks=null;this.prevPlyrWordsArr=[]};
    };
    // Get WaveImg?
    if(indexData.avT==='a'){
      const imgId:string=path.basename(wPeaksFPath,'.mp3'),waveImgPath:string=path.join(audioDir,imgId+'-'+String(colW)+'x64wave.png');
      if((await this.exists(waveImgPath))){rawPWavePath=waveImgPath}
      else{rawPWavePath=await this.ffServ.plotAudioWave(snipPath,audioDir,{w:colW,h:64})};
      if(rawPWavePath){this.cleanBGImgSrc=this.sanitizer.bypassSecurityTrustResourceUrl(rawPWavePath)};
      this.prevPlyrType='a'
    }else{this.prevPlyrType='v'};
    const matchQStr:string=this.homeSStates.scrapeSnipResults[indexData.gT][indexData.gI].q;
    let canPlay:boolean=false,ttlMSDur:number=0,startTS:number=0,delayPadPerc:number=0;
    this.prevPlyr.nativeElement.addEventListener('error',async()=>{console.log('[videoPlyr|EVENT] (error)');await doError()});
    this.prevPlyr.nativeElement.addEventListener('emptied',()=>{console.log('[videoPlyr|EVENT] (emptied)');canPlay=false});
    this.prevPlyr.nativeElement.addEventListener('canplaythrough',()=>{console.log('[videoPlyr|EVENT] (canplaythrough)');canPlay=true;this.prevPlyr.nativeElement.play()});
    this.prevPlyr.nativeElement.addEventListener('play',async()=>{console.log('[videoPlyr|EVENT] (play)');if(!this.prevPlyrReady){await this.initPrevPlyr()};updState(prevSnip.vId,true,isGroup,false)});
    this.prevPlyr.nativeElement.addEventListener('loadedmetadata',(lmd)=>{ttlMSDur=(this.prevPlyr.nativeElement.duration*1000);startTS=lmd.timeStamp;delayPadPerc=250/ttlMSDur});
    this.prevPlyr.nativeElement.addEventListener('timeupdate',(p:any)=>{if(canPlay){const progPerc:number=((p.timeStamp-startTS)/ttlMSDur)+delayPadPerc;this.updPrevProg(matchQStr,progPerc)}});
    this.prevPlyr.nativeElement.addEventListener('ended',async()=>{console.log('[videoPlyr|EVENT] (ended)');this.updPrevProg(matchQStr,1);updState(null,false,isGroup,false);this.prevPlyr.nativeElement.removeAllListeners();if(isGroup){doNext(true)}else{await this.closePrevPlyr()}});
    this.cleanPrevSrc=this.sanitizer.bypassSecurityTrustResourceUrl(snipPath);
  }
/////////////////////////////////////////////////////////
  async dlPreviewSnip(saveFilePath:string,subMatchIndex:number,snipItem:HomeScrapeSnipRGItem,data:any):Promise<boolean>{
    this.cCons('dlPreviewSnip('+saveFilePath+','+String(subMatchIndex)+',snipItem [...])...');console.log(snipItem);
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const pSTPath:string=path.join(pPath,'scrapeTargets');
    const pAudioPath:string=path.join(pSTPath,'audio');
    const pVideoPath:string=path.join(pSTPath,'video');
    const trimA=async(path:string):Promise<number|false>=>{const trimSnipRes:any=await this.ffServ.trimAudio(path);if(trimSnipRes!==false){await delF(trimSnipRes.orig.path);await rename(trimSnipRes.trim.path,trimSnipRes.orig.path);return Promise.resolve(trimSnipRes.trim.size)}else{return Promise.resolve(false)}};
    const delF=async(p:string):Promise<boolean>=>{try{await unlink(p);return Promise.resolve(true)}catch(e){this.cCons('(dlPreviewSnip) ERROR ('+p+'): '+JSON.stringify(e));return Promise.resolve(false)}};
    const sdlDoStart=(t:string,id:string):boolean=>{this.snipPrevDLProg={inProg:true,av:t,vId:id,perc:0,txt:'0%'};this.pDOM();return true};
    const sdlDoStop=():Promise<boolean>=>{this.snipPrevDLProg.perc=1;this.snipPrevDLProg.txt='100%';this.pDOM();return new Promise((resolve)=>{setTimeout(()=>{resolve(true)},250)})};
    const sdlDoReset=():boolean=>{for(const pK of Object.keys(this.snipPrevDLProg)){if(pK==='inProg'){this.snipPrevDLProg[pK]=false}else{this.snipPrevDLProg[pK]=null}};this.pDOM();return true};
    const sdlDoProg=(v:number)=>{this.snipPrevDLProg.perc=v,this.snipPrevDLProg.txt=String(Math.floor((v)*100))+'%';this.pDOM()};
    const updSTarget=async(aOrV:string,vId:string,dlRes:HomeScrapeDLType):Promise<boolean>=>{let updRes:boolean=false,stTypeKey:string='';aOrV==='a'?stTypeKey='audio':stTypeKey='video';for(let i=0;i<this.homeSStates.scrapeTargets.length;i++){const vDIndex:number=this.homeSStates.scrapeTargets[i].vData.findIndex(vDI=>vDI.vID===vId);if(vDIndex!==-1){this.homeSStates.scrapeTargets[i].vData[vDIndex][stTypeKey]=dlRes;updRes=true}};return Promise.resolve(updRes)};
    //----------
    const vId:string=snipItem.vId,aOrV:string=data.avPref,evStr:string='ps'+this.capd(aOrV)+vId,snipSubMatch:HomeScrapeSnippetSubMatch=snipItem.subMatches[subMatchIndex];
    sdlDoStart(aOrV,vId);
    let checkBDirPath:string='';aOrV==='a'?checkBDirPath=pAudioPath:checkBDirPath=pVideoPath;
    if(!(await this.exists(checkBDirPath))){await this.mkDir(checkBDirPath)};
    this.evServ.subscribe(evStr,psData=>{sdlDoProg(psData)});
    const dlPrevRes:{r:boolean,d:HomeScrapeDLType}=await this.ytServ.dlTimeRange(vId,aOrV,evStr,saveFilePath,snipSubMatch);
    this.evServ.destroy(evStr);
    await sdlDoStop();
    sdlDoReset();
    if(dlPrevRes.r){
      let dlRes:HomeScrapeDLType=dlPrevRes.d;
      if(aOrV==='a'){const tARes:number|false=await trimA(dlRes.path);if(tARes!==false){dlRes.size=tARes}};
      this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].snips[data.snipIndex].prevAV[aOrV]={gotFile:true,filePath:dlRes.path};
      await updSTarget(aOrV,snipItem.vId,dlRes);
      this.pDOM();await this.doSaveStates();
      console.log('! SNIP DL OK: '+dlRes.path);
      return Promise.resolve(true)
    }else{console.log('! SNIP DL FAILED');return Promise.resolve(false)};
  }
/////////////////////////////////////////////////////////
  async snipPrevExists(aOrV:string,snip:HomeScrapeSnippet):Promise<{r:boolean,path:string|null,subMatchIndex:number|null}>{
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,bPathA:string=path.join(pPath,'scrapeTargets/audio'),bPathV:string=path.join(pPath,'scrapeTargets/video');
    let testSnipFPath:string|null=null,snipPrevBDir:string|null=null,avExt:string|null=null,subMIndex:number|null=null,selSubVIdIndexStr:string|null=null;
    if(aOrV==='a'){snipPrevBDir=bPathA;avExt='.mp3'}else{snipPrevBDir=bPathV;avExt='.mp4'};
    for(let i=0;i<snip.subMatches.length;i++){if(snip.subMatches[i].selected){subMIndex=i;selSubVIdIndexStr=snip.vId+'-snip'+String(i)+avExt}};
    if(snipPrevBDir!==null&&avExt!==null&&subMIndex!==null&&selSubVIdIndexStr!==null){testSnipFPath=path.join(snipPrevBDir,selSubVIdIndexStr)};
    if(testSnipFPath!==null){
      const sPExists:boolean=await this.exists(testSnipFPath);
      if(sPExists){
        const testSize:any=await this.statSize(testSnipFPath);
        if(testSize.r&&testSize.d>0){return Promise.resolve({r:true,path:testSnipFPath,subMatchIndex:subMIndex})}
        else{
          await unlink(testSnipFPath);
          return Promise.resolve({r:false,path:testSnipFPath,subMatchIndex:subMIndex})
        };
      }else{return Promise.resolve({r:false,path:testSnipFPath,subMatchIndex:subMIndex})}
    }else{return Promise.resolve({r:false,path:null,subMatchIndex:null})};
  }
/////////////////////////////////////////////////////////
  async gotAccess(p):Promise<boolean>{
    let gotR:boolean=false,gotW:boolean=false;
    try{await access(p,fs.constants.R_OK);gotR=true}catch(e){console.log('READ access FAILED: '+p)};
    try{await access(p,fs.constants.W_OK);gotW=true}catch(e){console.log('WRITE access FAILED: '+p)};
    if(gotR&&gotW){return Promise.resolve(true)}else{
      console.log('(gotAccess) ERROR: R:'+String(gotR)+',W:'+String(gotW));
      return Promise.resolve(false)
    };
  }
/////////////////////////////////////////////////////////
  async addSnip2Playlist(singleGroup:string,data:any):Promise<boolean>{
    this.cCons('addSnip2Playlist(data)...');
    console.log(data); //{groupType:'exact'|'single'|'multi',wgIndex:number,groupItem:HomeScrapeSnipResultsGroup,snipIndex:number,snipItem:HomeScrapeSnipRGItem}
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const scrapeSubFPath:string=path.join(pPath,'scrapeTargets/sub/json/'+data.snipItem.vId+'.json');
    const copyST2PLM=async(stFPath:string,fileType:'a'|'v'|'s'):Promise<string|false>=>{
      const plMDir:string=this.mainPlayerPtys.plLoaded.dirPaths[fileType];
      let fNameExt:string=path.basename(stFPath);
      let plMFPath:string=path.join(plMDir,fNameExt);
      if((await this.exists(plMFPath))){
        this.cCons('(addSnip2Playlist) Playlist File ('+fileType+') Already Exists - Query Dupe?');
        if(fileType==='v'&&this.mainPlayerPtys.plLoaded.items.length>0){
          const dupePLItem:any[]=this.mainPlayerPtys.plLoaded.items.filter(plO=>plO.path===plMFPath);
          if(dupePLItem.length>0){
            const doDupePrompt:any=await ipcRenderer.invoke('do-show-msg',['dupePLFileQuestion',{name:{file:fNameExt,playlist:this.mainPlayerPtys.plLoaded.name}}]);
            if(doDupePrompt==='cancel'){return Promise.resolve(plMFPath)}
            else{
              const copyfName:string=path.basename(stFPath,'.mp4')+'-'+String(Math.floor(1000+Math.random()*9000))+'.mp4';
              const copyfPath:string=path.join(plMDir,copyfName);
              await copyFile(stFPath,copyfPath);
              return Promise.resolve(copyfPath);
            };
          }else{return Promise.resolve(plMFPath)};
        }else{return Promise.resolve(plMFPath)};
      }else{
        if(!(await this.exists(stFPath))){console.log('scrapeFile !exists');return Promise.resolve(false)}
        else{
          if(!(await this.exists(plMDir))){
            await this.mkDir(plMDir);
            if(!(await this.exists(plMDir))){this.cCons('(addSnip2Playlist) ERROR: plDir !exists&&!created');return Promise.resolve(false)}
          };
          try{await copyFile(stFPath,plMFPath);
            if((await this.exists(plMFPath))){
              const checkSize:{r:boolean,d:number}=await this.statSize(plMFPath);
              if(checkSize.r&&checkSize.d>0){return Promise.resolve(plMFPath)}
              else{this.cCons('(addSnip2Playlist) Playlist File ('+fileType+') [!STATSIZE] ERROR: r='+String(checkSize.r)+',d='+String(checkSize.d));return Promise.resolve(false)};
            }else{this.cCons('(addSnip2Playlist) Playlist File ('+fileType+') [!EXISTS] ERROR');return Promise.resolve(false)};
          }catch(e){console.log(e);return Promise.resolve(false)};
        };
      };
    };
    const doPLQPop=async():Promise<string>=>{
      return new Promise((resolve)=>{
        this.evServ.subscribe('temp-popover-data',(plQPopData:any)=>{let plqRes:string='';if(plQPopData.data==='cancel'||plQPopData.role==='cancel'){plqRes='cancel'}else{plqRes=plQPopData.data};this.evServ.destroy('temp-popover-data');resolve(plqRes)});
        let newPLPopOpts:CompzPopoverOptions={id:'newplq'+this.evServ.strFormat(new Date(),'ddMMyyHHmmss'),type:'btnquery',title:'Create New Playlist?',msg:'Create NEW Playlist or ADD to Current Playlist ('+this.mainPlayerPtys.plLoaded.name+')?',btnQueryBtns:[{role:'cancel',label:'Cancel',action:'cancel'},{role:'action',label:'Use Current',action:'current'},{role:'action',label:'Create New',action:'new'}]};
        this.evServ.publish('do-compz-popover',newPLPopOpts);
      });
    };
    //------------------
    let useNewPLRes:any;
    if(!this.mainPlayerPtys.plLoaded){useNewPLRes='create'}
    else{
      if(singleGroup==='single'){useNewPLRes='current'}
      else{useNewPLRes=await doPLQPop()};
    };
    //------------------
    if(useNewPLRes==='cancel'){this.cCons('(addSnip2Playlist|doPLPop) ERROR|Cancelled');return Promise.resolve(false)}
    else if(useNewPLRes==='create'){await this.plListFileActions('create',null,{mode:'snip',qTxt:data.groupItem.q})};
    //------------------
    let c2MPs:any={a:false,v:false,s:false};
    // SUB -------------
    const c2MResS:any=await copyST2PLM(scrapeSubFPath,'s');
    if(c2MResS){c2MPs.s=c2MResS};
    // MP3 -------------
    const mp3ExistRes:any=await this.snipPrevExists('a',data.snipItem);
    if(mp3ExistRes.r){c2MPs.a=mp3ExistRes.path}
    else{const dlMP3Res:boolean=await this.dlPreviewSnip(mp3ExistRes.path,mp3ExistRes.subMatchIndex,data.snipItem,{groupType:data.groupType,wgIndex:data.wgIndex,snipIndex:data.snipIndex,avPref:'a'});if(dlMP3Res){c2MPs.a=mp3ExistRes.path}};
    if(c2MPs.a){const c2MResA:any=await copyST2PLM(c2MPs.a,'a');c2MPs.a=c2MResA};
    // MP4 -------------
    const mp4ExistRes:any=await this.snipPrevExists('v',data.snipItem);
    if(mp4ExistRes.r){c2MPs.v=mp4ExistRes.path}else{const dlMP4Res:boolean=await this.dlPreviewSnip(mp4ExistRes.path,mp4ExistRes.subMatchIndex,data.snipItem,{groupType:data.groupType,wgIndex:data.wgIndex,snipIndex:data.snipIndex,avPref:'v'});if(dlMP4Res){c2MPs.v=mp4ExistRes.path}};
    if(c2MPs.v){const c2MResV:any=await copyST2PLM(c2MPs.v,'v');c2MPs.v=c2MResV};
    //------------------
    console.log(c2MPs);
    if(c2MPs.a&&c2MPs.v&&c2MPs.s){;
      //------------------
      return new Promise((resolve)=>{
        this.evServ.subscribe('feSyncFinished',async(aTO:any)=>{
          console.log(aTO);
          this.evServ.destroy('feSyncFinished');
          const matchPLDirArr:any[]=aTO.v.filter(o=>o.name===this.mainPlayerPtys.plLoaded.name);
          if(matchPLDirArr.length>0){
            const plDirObj:any=matchPLDirArr[0];
            if(plDirObj.hasOwnProperty('children')&&plDirObj.children.length>0){
              console.log(mp4ExistRes.path);
              const newPLVidArr:any[]=plDirObj.children.filter(o=>o.path===c2MPs.v);
              if(newPLVidArr.length>0){
                const newPLVidFileObj:any=newPLVidArr[0];
                const dupePLVidFileArr:any[]=this.mainPlayerPtys.plLoaded.items.filter(plO=>plO.path===newPLVidFileObj.path);
                if(dupePLVidFileArr.length<1){
                  await this.loadFiles('player',newPLVidFileObj);
                };
              }else{this.cCons('(addSnip2Playlist) ERROR: No Matching Child File in PL Dir (after FeSync)')}
            }else{this.cCons('(addSnip2Playlist) ERROR: No Child Files in PL Dir (after FeSync)')}
            console.log(this.homeSStates.projectPlaylists);
            resolve(true);
          }else{this.cCons('(addSnip2Playlist) ERROR: No Matching PL Dir (after FeSync)')}
        });
        this.evServ.publish('feDoSync',['audio','video','subs']);
      });
    }else{this.cCons('(addSnip2Playlist) ERROR: Failed to Copy A|V|S to /media');console.log(c2MPs);return Promise.resolve(false)}
  }
/////////////////////////////////////////////////////////
  async scrapeResultsActions(action:string,data?:any){
    this.cCons('(scraperActions) ['+action+']...');
    console.log(data);
    switch(action){
      case 'add': //{groupType:'exact'|'single'|'multi',wgIndex:number,groupItem:HomeScrapeSnipResultsGroup,snipIndex:number,snipItem:HomeScrapeSnipRGItem}
        if(!this.homeSStates.playerSectionVis){await this.showHideSection('player')};
        if(this.homeSStates.playerTabToggle!=='list'){this.homeSStates.playerTabToggle='list';this.pDOM()};
        await this.addSnip2Playlist('single',data);
      break;
      case 'addgroup': //{groupType:'exact'|'single'|'multi',wgIndex:number,groupItem:HomeScrapeSnipResultsGroup}
        if(!this.homeSStates.playerSectionVis){await this.showHideSection('player')};
        if(this.homeSStates.playerTabToggle!=='list'){this.homeSStates.playerTabToggle='list';this.pDOM()};
        for(let agI=0;agI<data.groupItem.snips.length;agI++){
          let gData:any=data;
          gData['snipIndex']=agI;
          gData['snipItem']=data.groupItem.snips[agI];
          if(agI===0){await this.addSnip2Playlist('group',data)}
          else{await this.addSnip2Playlist('single',data)};
        };
        const sbT:string='Scrape|AddGroup: Added '+String(data.groupItem.snips.length)+' Items from Group "'+data.groupItem.q+'"';
        this.cCons('(scrapeResultsActions|addgroup): '+sbT);
        this.evServ.publish('updateBA',sbT);
        this.pDOM();await this.doSaveStates();
        break;
      case 'pausepreview':
        if(this.snipPrevPlayState.isPaused){
          this.snipPrevPlayState.isPaused=false;
          this.snipPrevPlayState.isPlay=true;
          this.prevPlyr.nativeElement.play();
        }else{
          this.snipPrevPlayState.isPaused=true;
          this.snipPrevPlayState.isPlay=false;
          this.prevPlyr.nativeElement.pause();
        };
        this.pDOM();
        break;
      case 'togglegroupavpref':
        if(this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].avPref!==data.avType){
          let sbTxt:string='';data.avType==='a'?sbTxt='Audio (MP3)':sbTxt='Video (MP4)';
          this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].avPref=data.avType;
          this.pDOM();await this.doSaveStates();
          this.evServ.publish('updateBA','Scrape|AVPref: Set to '+sbTxt);
        };
        break;
      case 'toggleavpref':
        if(this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].snips[data.snipIndex].prevAV.pref!==data.avType){
          let sbTxt:string='';data.avType==='a'?sbTxt='Audio (MP3)':sbTxt='Video (MP4)';
          this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].snips[data.snipIndex].prevAV.pref=data.avType;
          this.pDOM();await this.doSaveStates();
          this.evServ.publish('updateBA','Scrape|AVPref: Set to '+sbTxt);
        };
        break;
      case 'preview':
        let singleOrGroup:string='';data.hasOwnProperty('isGroup')&&data.isGroup?singleOrGroup='group':singleOrGroup='single';
        let snipObj:HomeScrapeSnipRGItem=data.snipItem;
        let snipPrevPref:string='a';singleOrGroup==='single'?snipPrevPref=data.snipItem.prevAV.pref:snipPrevPref=data.groupItem.avPref;
        let indexDObj:any={gT:data.groupType,gI:data.groupIndex,sI:data.snipIndex,avT:snipPrevPref};
        if(!indexDObj.gI&&data.hasOwnProperty('wgIndex')){indexDObj.gI=data.wgIndex};
        const updSnipPAV=async(gf:boolean,p:string):Promise<boolean>=>{this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].snips[data.snipIndex].prevAV[snipPrevPref]={gotFile:gf,filePath:p};this.pDOM();await this.doSaveStates();return Promise.resolve(true)};
        const checkSPEx:{r:boolean,path:string|null,subMatchIndex:number|null}=await this.snipPrevExists(snipPrevPref,data.snipItem);
        if(!checkSPEx.r&&checkSPEx.path===null){
          await updSnipPAV(false,'');
          this.cCons('(scrapeActions|preview) Failed to Resolve snipPrevExists Path/File');
          if(singleOrGroup==='group'){return Promise.resolve(null)};
        }else{
          if(checkSPEx.r){
            await updSnipPAV(true,checkSPEx.path);
            if(singleOrGroup==='group'){return Promise.resolve({path:checkSPEx.path,snip:snipObj,idata:indexDObj})}
            else{await this.playPreviewSnip(checkSPEx.path,snipObj,false,indexDObj)};
          }else{
            const dlPrevRes:boolean=await this.dlPreviewSnip(checkSPEx.path,checkSPEx.subMatchIndex,data.snipItem,{groupType:data.groupType,wgIndex:data.wgIndex,snipIndex:data.snipIndex,avPref:snipPrevPref});
            if(dlPrevRes){
              await updSnipPAV(true,checkSPEx.path);
              if(singleOrGroup==='group'){return Promise.resolve({path:checkSPEx.path,snip:snipObj,idata:indexDObj})}
              else{await this.playPreviewSnip(checkSPEx.path,snipObj,false,indexDObj)};
            }else{
              await updSnipPAV(false,'');
              this.cCons('(scraperActions|preview) Failed to DL snipSubMatch File');
              if(singleOrGroup==='group'){return Promise.resolve(null)};
            };
          }
        };
        break;
      case 'playgroup':
        let localGroupItem:HomeScrapeSnipResultsGroup=data.groupItem;
        if(!data.groupItem.hasOwnProperty('avPref')||(data.groupItem.avPref!=='a'&&data.groupItem.avPref!=='v')){localGroupItem.avPref='a';this.homeSStates.scrapeSnipResults[data.groupType][data.wgIndex].avPref='a';this.pDOM();await this.doSaveStates()};
        let prevReadyArr:any[]=[];
        for(let i=0;i<localGroupItem.snips.length;i++){
          let prevPrepObj:any={groupType:data.groupType,wgIndex:data.wgIndex,groupItem:localGroupItem,snipIndex:i,snipItem:localGroupItem.snips[i],isGroup:true};
          const prevReadyObj:any=await this.scrapeResultsActions('preview',prevPrepObj);
          if(prevReadyObj!==null){prevReadyArr.push(prevReadyObj)}
        };
        if(prevReadyArr.length>0){
          let gPlayIndex:number=0,nextSnipPrev:any;
          this.evServ.subscribe('playGroupNext',async(pGNext:boolean)=>{
            if(pGNext){
              gPlayIndex++;
              if(gPlayIndex<prevReadyArr.length){
                nextSnipPrev=prevReadyArr[gPlayIndex];
                this.playPreviewSnip(nextSnipPrev.path,nextSnipPrev.snip,true,nextSnipPrev.idata);
              }else{
                this.evServ.destroy('playGroupNext');
                await this.closePrevPlyr();
                let avStr:string='';nextSnipPrev.idata.avT==='a'?avStr='Audio/MP3':avStr='Video/MP4';
                const sbStr:string='Previewed '+String(prevReadyArr.length)+' '+this.capd(nextSnipPrev.idata.gT)+' Group Items ('+avStr+')';
                this.cCons('(scrapeResultsActions|playgroup) '+sbStr);this.evServ.publish('updateBA','Preview|Group '+sbStr);
              };
            }else{
              this.evServ.destroy('playGroupNext');
              await this.closePrevPlyr();
              let avStr:string='';nextSnipPrev.idata.avT==='a'?avStr='Audio/MP3':avStr='Video/MP4';
              const sbStr:string='ERROR @ '+String((gPlayIndex+1))+'/'+String(prevReadyArr.length)+': '+nextSnipPrev.vId+' ('+avStr+')';
              this.cCons('(scrapeResultsActions|playgroup) '+sbStr);this.evServ.publish('updateBA','Preview|Group '+sbStr);
            };
          });
          nextSnipPrev=prevReadyArr[gPlayIndex];
          this.playPreviewSnip(nextSnipPrev.path,nextSnipPrev.snip,true,nextSnipPrev.idata);
        }else{this.cCons('(scrapeResultsActions|playgroup) No prevFile Paths Returned: Aborted')};
        break;
      case 'removegroup':
        this.homeSStates.scrapeSnipResults[data.type]=this.homeSStates.scrapeSnipResults[data.type].filter((wgI:HomeScrapeSnipResultsGroup)=>wgI.q!==data.q);
        this.pDOM();
        await this.doSaveStates();
        this.evServ.publish('updateBA','ScrapeResults: Removed '+data.q+' ('+String(data.len)+' Word Group)');
        break;
      case 'togglewordgroup':
        let newTWGState:string='';
        if(this.homeSStates.scrapeSnipResults[data.type][data.wgIndex].vis){this.homeSStates.scrapeSnipResults[data.type][data.wgIndex].vis=false;newTWGState='Collapsed'}else{this.homeSStates.scrapeSnipResults[data.type][data.wgIndex].vis=true;newTWGState='Expanded'};
        this.pDOM();
        await this.doSaveStates();
        this.evServ.publish('updateBA','Scrape|VisToggle: Group '+newTWGState);
        break;
      case 'togglesublines':
        let newTSLState:string='';
        if(this.homeSStates.scrapeSnipResults[data.type][data.wgIndex].snips[data.snipIndex].subLVis){this.homeSStates.scrapeSnipResults[data.type][data.wgIndex].snips[data.snipIndex].subLVis=false;newTSLState='Collapsed'}else{this.homeSStates.scrapeSnipResults[data.type][data.wgIndex].snips[data.snipIndex].subLVis=true;newTSLState='Expanded'};
        this.pDOM();
        await this.doSaveStates();
        this.evServ.publish('updateBA','Scrape|VisToggle: Sublines '+newTSLState);
        break;
      case 'removesnip':
        this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips=this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips.filter((sIO:HomeScrapeSnipRGItem)=>sIO.vTitle!==data.snipItem.vTitle);
        this.pDOM();
        await this.doSaveStates();
        this.evServ.publish('updateBA','ScrapeResults: Removed '+this.capd(data.type)+' Match ('+data.snipItem.vTitle+')');
        break;
      case 'selectsubmatch':
        if(data.subMatchItem.selected){return}
        else{
          const subMatchList:HomeScrapeSnippetSubMatch[]=this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips[data.snipIndex].subMatches;
          for(let i=0;i<subMatchList.length;i++){if(i===data.subMatchIndex){this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips[data.snipIndex].subMatches[i].selected=true}else{this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips[data.snipIndex].subMatches[i].selected=false}};
          const aOrVPref:string=data.snipItem.prevAV.pref;
          const gotSubMPrevRes:{r:boolean,path:string|null,subMatchIndex:number|null}=await this.snipPrevExists(aOrVPref,data.snipItem);
          if(gotSubMPrevRes.r){this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips[data.snipIndex].prevAV[aOrVPref]={gotFile:true,filePath:gotSubMPrevRes.path}}
          else{this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips[data.snipIndex].prevAV[aOrVPref]={gotFile:false,filePath:''}};
          this.pDOM();
          await this.doSaveStates();
          const newSnipNoStr:string=String((data.subMatchIndex+1)),newSnipTimes:HomeScrapeSnippetSubMatchTimes=this.homeSStates.scrapeSnipResults[data.type][data.groupIndex].snips[data.snipIndex].subMatches[data.subMatchIndex].times,cCSnipTStr:string='('+newSnipTimes.start.txt+' > '+newSnipTimes.stop.txt+')';
          this.evServ.publish('updateBA','Scraper|SubMatch: Selected #'+newSnipNoStr+' '+cCSnipTStr);
        };
        break;
    }
  }
/////////////////////////////////////////////////////////
  async scrapeResHeadsVisFn(headName?:string){
    if(headName){this.homeSStates.searchScrapeResHeadsVis[headName]?this.homeSStates.searchScrapeResHeadsVis[headName]=false:this.homeSStates.searchScrapeResHeadsVis[headName]=true};
    this.pDOM();await this.doSaveStates();
  }
/////////////////////////////////////////////////////////
  async rdfUpdateCounts(){
    this.cCons('(rdfUpdateCounts)...');
    const cvtBytes=(bs:number):string=>{
      const sizes:string[]=['Bytes','KB','MB','GB','TB'];
      if(bs===0){return 'N/A'};
      const i:number=(Math.floor(Math.log(bs)/Math.log(1024)));
      if(i===0){return bs+' '+sizes[i]};
      return (bs/Math.pow(1024,i)).toFixed(1)+' '+sizes[i]
    };
    const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath;
    const tKeys:string[]=['sub','audio','video'];
    let tPaths:string[]=[];for(let i=0;i<tKeys.length;i++){const tP:string=path.join(pPath,'scrapeTargets/'+tKeys[i]);tPaths.push(tP)};
    for(let iD=0;iD<tPaths.length;iD++){
      if((await this.exists(tPaths[iD]))){
        try{
          const dirList:any=await readdir(tPaths[iD]);
          if(dirList&&dirList.length>0){
            let oFiles:number=0,oSize:number=0,oWordsDur:number=0;
            for(let iF=0;iF<dirList.length;iF++){
              oFiles++;
              const fileP:string=path.join(tPaths[iD],dirList[iF]);
              const sizeRes:any=await this.statSize(fileP);
              if(sizeRes.r&&sizeRes.d>0){oSize+=Number(sizeRes.d)};
              if(tKeys[iD]==='sub'){
                const subBaseFName:string=path.basename(dirList[iF],'.xml');
                const subTxtFName:string=subBaseFName+'.txt';
                const subTxtFPath:string=path.join(pPath,'scrapeTargets/sub/text/'+subTxtFName);
                if((await this.exists(subTxtFPath))){
                  try{const fRawData:any=await readFile(subTxtFPath);if(fRawData){const fWords:number=fRawData.toString().split(' ').length;if(fWords>0){oWordsDur+=fWords}}}
                  catch(e){console.log('(rdfUpdateCounts|Sub|readFile (Word Count) ERROR: '+e)}
                };
              }else{const fDurSecs:number=await this.ffServ.getMediaDur(fileP);if(fDurSecs>0){oWordsDur+=fDurSecs}};
            };
            let wordsDurStr:string='';if(tKeys[iD]==='sub'){wordsDurStr=oWordsDur.toLocaleString()}else{const roundSecs:number=Math.round(oWordsDur);wordsDurStr=this.s2T(roundSecs)};
            if(this.homeSStates.rdfSummary[iD].wordsdur!==wordsDurStr){this.homeSStates.rdfSummary[iD].wordsdur=wordsDurStr};
            if(this.homeSStates.rdfSummary[iD].size!==cvtBytes(oSize)){this.homeSStates.rdfSummary[iD].size=cvtBytes(oSize)};
            if(this.homeSStates.rdfSummary[iD].files!==oFiles){this.homeSStates.rdfSummary[iD].files=oFiles};
          };
        }catch(e){this.cCons('(rdfUpdateCounts) ERROR: '+JSON.stringify(e));console.log('Error Reading: '+tPaths[iD])};
      };
    };
    this.pDOM();
    await this.doSaveStates();
  }
/////////////////////////////////////////////////////////
  async rdfSummaryOpenDir(typeId:string){this.cCons('(rdfSummaryOpenDir) ['+typeId+']...');const pPath:string=(await ipcRenderer.invoke('getCurrentProject')).d.projectDirPath,pSTTypePath:string=path.join(pPath,'scrapeTargets/'+typeId);ipcRenderer.send('openWindowsDir',[pSTTypePath])}
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
}

