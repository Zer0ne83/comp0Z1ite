import { YTubeService } from './ytube.service';
import { FFMPEGService } from './ffmpeg.service';
import { Component, OnInit, AfterViewInit, ApplicationRef, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { InputPopoverPage } from './inputPopover/inputPopover.page';
import { LoadingController, LoadingOptions } from '@ionic/angular';
import { StorageService } from './storage.service';
import { Router, ActivatedRoute, NavigationEnd, Event, NavigationStart, NavigationError } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { MenuController, ModalController, ModalOptions } from '@ionic/angular';
import { EventsService } from './events.service';
import { HowlerService } from './viz.service';
import { clipboard, ipcRenderer, IpcRendererEvent } from 'electron';
import { unlink, readdir, rm } from 'fs-extra';
import { access, copyFile, rename } from 'fs/promises';
import getFolderSize from 'get-folder-size';
import directoryTree from 'directory-tree';
import { DirectoryTree, DirectoryTreeCallback } from 'directory-tree';
import * as path from 'path';
import { AppStates, defAppStates, HomeStates, defHomeStates, AllCompzStates, AppProject, LaunchInitParams, CompzPopoverOptions, AppFeBaseDirPaths, AppPaths } from './appTypes';
const _ = require('lodash');
/////////////////////////////////////////////////////////
@Component({selector:'app-root',templateUrl:'./app.component.html',styleUrls:['./app.component.scss']})
/////////////////////////////////////////////////////////
export class AppComponent implements OnInit,AfterViewInit{
/////////////////////////////////////////////////////////
  @HostListener('load') launcherLoad(){const hlM:string='[APP|HOSTLISTENER]: LOADED';console.log(hlM);this.cCons(hlM)};
  @HostListener('unload') launcherUnload(){const hlM:string='[APP|HOSTLISTENER]: UNLOADED';console.log(hlM);this.cCons(hlM)};
  @ViewChild('compzAppWrap') compzAppWrap:ElementRef<HTMLDivElement>;
  @ViewChild('wrapMMDD') wrapMMDD:ElementRef<HTMLDivElement>;
  @ViewChild('fileMMDD') fileMMDD:ElementRef<HTMLDivElement>;
  @ViewChild('editMMDD') editMMDD:ElementRef<HTMLDivElement>;
  @ViewChild('toolsMMDD') toolsMMDD:ElementRef<HTMLDivElement>;
  @ViewChild('windowMMDD') windowMMDD:ElementRef<HTMLDivElement>;
  @ViewChild('helpMMDD') helpMMDD:ElementRef<HTMLDivElement>;
  @ViewChild('mscwapptitlebar') mscwapptitlebar:ElementRef<HTMLDivElement>;
  @ViewChild('mscwappstatusbar') mscwappstatusbar:ElementRef<HTMLDivElement>;
  @ViewChild('mscwappfileexplorer') mscwappfileexplorer:ElementRef<HTMLDivElement>;
  @ViewChild('mscwapphome') mscwapphome:ElementRef<HTMLDivElement>;
  @ViewChild('compzContextMenu') compzCM:ElementRef<HTMLDivElement>;
  @ViewChild('feSearchInput') feSearchInput:ElementRef<HTMLInputElement>;
  @ViewChild('rnInputAudioLvl1File') rnInputAudioLvl1File:ElementRef<HTMLInputElement>;
  @ViewChild('rnInputAudioLvl1DirC') rnInputAudioLvl1DirC:ElementRef<HTMLInputElement>;
  @ViewChild('rnInputAudioLvl1DirE') rnInputAudioLvl1DirE:ElementRef<HTMLInputElement>;
  debouncedSearch=_.debounce(()=>this.getFeSearchResults(),500,{});
  debouncedSaveStates=_.debounce(()=>this.bouncedSS(),2000,{});
  feBDs:string[]=['audio','subs','video'];
  cwSections:string[]=['mscwapptitlebar','mscwappstatusbar','mscwappfileexplorer','mscwapphome'];
/////////////////////////////////////////////////////////
  appSStates:AppStates=defAppStates;
  appProject:AppProject|null=null;
  routesParamsOnce:boolean=false;
  compzRoute:string|null=null;
/////////////////////////////////////////////////////////
  appCMIsOpen:boolean=false;
  compzPopIsShowing:boolean=false;
  compzLoadIsShowing:boolean=false;
  compzLoad:HTMLIonLoadingElement|null;
  mmDDOpen:string|null=null;
  mmDDAltHL:boolean=false;
  eCmds:any={allArr:['copy','cut','paste','undo','redo','selectAll'],copy:false,cut:false,paste:false,undo:false,redo:false,selectAll:false};
  feIsRefresh:any={audio:false,subs:false,video:false,all:false};
  fePromptAddFile:boolean=false;
  //-----------------------------------------------------
  appMouseInSection:string='';
  ddPointListenerFn:any;
  appTxtSelection:any={txt:'',section:''};
  mmDDHovered:string='';
  feItemHovered:string='';
  feItemSelected:string='';
/////////////////////////////////////////////////////////
  constructor(
    private logger:NGXLogger,
    private appRef:ApplicationRef,
    private evServ:EventsService,
    private storeServ:StorageService,
    private changeDet:ChangeDetectorRef,
    private menuCtrl:MenuController,
    private renderer:Renderer2,
    private router:Router,
    private modalCtrl:ModalController,
    private loadCtrl:LoadingController,
    private howlServ:HowlerService,
    private ffServ:FFMPEGService,
    private ytServ:YTubeService
  ){ }
/////////////////////////////////////////////////////////
  async ngOnInit(){this.cCons('(ngOnInit)...');
    const gotCPRes:null|AppPaths=await ipcRenderer.invoke('getCompzPaths');
    if(gotCPRes!==null){
      this.ffServ.setPaths(gotCPRes);
      this.howlServ.hwlSetPaths(gotCPRes);
      this.ytServ.setPaths(gotCPRes);
    };
  }
  //-----------------------------------------------------
  async ngAfterViewInit(){
    await this.getMenuBarPos();
    await this.appIPCListeners();
    await this.appEVServChannels();
    await this.appDOMListeners();
  }
/////////////////////////////////////////////////////////
  async initAppSStates():Promise<boolean>{
    await this.getSaveStates();
    if(this.appProject){
      if(this.appSStates.feArrangeWin==='equal'){this.updateWinMax(true)};
      await this.fileExpFns('sync',['audio','subs','video']);
      return Promise.resolve(true);
    }else{return Promise.resolve(false)}
  }
  //-----------------------------------------------------
  async getSaveStates():Promise<boolean>{
    if(this.appProject){
      const readAppPrefs:any=await ipcRenderer.invoke('readProjPrefsFile',['app']);
      if(readAppPrefs.r){
        this.appSStates=readAppPrefs.d;
        for(const[k,v] of Object.entries(defAppStates)){if(!this.appSStates.hasOwnProperty(k)){this.appSStates[k]=v}};
        if((await ipcRenderer.invoke('is-fe-open'))!==this.appSStates.feIsOpen){ipcRenderer.send('fe-is-open',[this.appSStates.feIsOpen]);this.evServ.publish('homeFeIsOpen',this.appSStates.feIsOpen)};
        return Promise.resolve(true);
      }else{this.cCons('(getSaveStates|IPC->readProjPrefsFile) ERROR: Read File (compzPrefs.json): !FAILED! - Using Default (defAppStates)');return Promise.resolve(false)}
    }else{return Promise.resolve(false)}
  }
  //-----------------------------------------------------
  invokeHomeCPSData(){this.evServ.publish('invoke-home-cps-data',true);this.cCons('(invokeHomeCPSData) [EVSERV|EVENT] - Sent Invocation [app] > [home]')};
  //-----------------------------------------------------
  async doSaveAllStates(allSSData:AllCompzStates):Promise<boolean>{this.cCons('(doSaveAllStates)...');
    if(this.appProject){
      const writeProjPrefsRes:boolean=await ipcRenderer.invoke('writeProjPrefsFile',[allSSData,null]);
      this.evServ.publish('save-all-cps-data-finish',writeProjPrefsRes);
      if(writeProjPrefsRes){return Promise.resolve(true)}else{this.cCons('(doSaveStates|IPC->writeAllCompzPrefsFile): FAIL');return Promise.resolve(false)}
    };
    return Promise.resolve(true);
  }
  //-----------------------------------------------------
  async bouncedSS(){
    if(this.appProject){
      const writeAppPrefs:boolean=await ipcRenderer.invoke('writeProjPrefsFile',[this.appSStates,'appStates']);
      if(writeAppPrefs){return Promise.resolve(true)}else{this.cCons('(doSaveStates|IPC->writeProjPrefsFile): FAIL');return Promise.resolve(false)}
    };
    return Promise.resolve(true);
  }
  //-----------------------------------------------------
  async doSaveStates():Promise<boolean>{this.debouncedSaveStates();return Promise.resolve(true)}
/////////////////////////////////////////////////////////
  async appIPCListeners():Promise<boolean>{
    ipcRenderer.on('appCons',(e:any,args:any[])=>{this.appCons(args[0])});
    ipcRenderer.send('appConsReady',true);
    ipcRenderer.on('new-compz-route',(e:any,args:any[])=>{this.cCons('(new-compz-route): Set to: '+args[0]);this.compzRoute=args[0]});
    ipcRenderer.on('current-project-loaded',async(e:any,args:any[])=>{
      if(args[0]){
        this.appProject=args[0];
        await this.initAppSStates();
        this.cCons('[appProjectReady|App]: '+this.appProject.projectName);
        this.evServ.publish('appProjectReady',true);
      }
    });
    ipcRenderer.on('mm-dd-open',(e:any,args:any[])=>{
      this.mmDDOpen=args[0];
      if(this.mmDDOpen===null&&this.mmDDAltHL){this.mmDDAltHL=false};
      const nEKeys:string[]=['file','edit','tools','window','help'];
      for(let i=0;i<nEKeys.length;i++){const neK:string=String(nEKeys[i]+'MMDD');if(this[neK].nativeElement.classList.contains('mmdd-hover')){this[neK].nativeElement.classList.remove('mmdd-hover')}};
      this.pDOM();
    });
    ipcRenderer.on('mm-dd-fn',async(e:any,args:any[])=>{let d:any|null=null;args[2]?d=args[2]:d=null;await this.appMMDDFns(args[0],args[1],d)});
    ipcRenderer.on('update-sb',(e:any,args:any[])=>{this.updateBarAction(args[0])});
    ipcRenderer.on('main-context-menu-open',()=>{if(!this.appCMIsOpen){this.appCMIsOpen=true}});
    ipcRenderer.on('sc-fe-toggle',(e:IpcRendererEvent,args:any[])=>{this.toggleFE(args[0])});
    ipcRenderer.on('sc-open-file',(e:IpcRendererEvent,args:any[])=>{ipcRenderer.invoke('do-open-file',args)});
    ipcRenderer.on('sc-save-file',(e:IpcRendererEvent,args:any[])=>{ipcRenderer.invoke('do-save-file',args)});
    ipcRenderer.on('sc-copy',async()=>{await this.cboardActions('copy','shortcut')});
    ipcRenderer.on('sc-cut',async()=>{await this.cboardActions('cut','shortcut')});
    ipcRenderer.on('sc-paste',async()=>{await this.cboardActions('paste','shortcut')});
    ipcRenderer.on('sc-undo',async()=>{await this.cboardActions('undo','shortcut')});
    ipcRenderer.on('sc-redo',async()=>{await this.cboardActions('redo','shortcut')});
    ipcRenderer.on('sc-selectAll',async()=>{await this.cboardActions('selectAll','shortcut')});
    const cmFECmds:string[]=['sync','togglerename','delete','cleardir'];
    for(let i=0;i<cmFECmds.length;i++){ipcRenderer.on('cm-fe-'+cmFECmds[i],(e:any,args:any[])=>{this.fileExpFns(cmFECmds[i],args)})};
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
  async appMMDDFns(ddName:string,ddFn:string,data?:any):Promise<boolean>{
    const nEKeys:string[]=['file','edit','tools','window','help'];
    const appMMDDFns:string[]=['ddaltsc','newblankproject','openproject','closeproject','importproject','preferences-clearcache'];
    if(!appMMDDFns.includes(ddFn)){return Promise.resolve(true)};
    switch(ddName){
      case 'alt':
        if(data==='alt'){
          if(this.mmDDAltHL){
            if(this.mmDDOpen){const cDD:string=this.mmDDOpen;this.mmDDOpen=null;ipcRenderer.send('mm-dd-action',[cDD,'close'])};
            for(let i=0;i<nEKeys.length;i++){const neK:string=String(nEKeys[i]+'MMDD');if(this[neK].nativeElement.focus){this[neK].nativeElement.blur()}};
            this.mmDDAltHL=false
          }else{this.mmDDAltHL=true;this.fileMMDD.nativeElement.focus()}
        }else{
          if(!this.mmDDAltHL){this.mmDDAltHL=true;this.menuBarDDClick(data)}
          else{
            if(this.mmDDOpen!==null){const cDD:string=this.mmDDOpen;this.mmDDOpen=null;ipcRenderer.send('mm-dd-action',[cDD,'close'])};
            if(this.mmDDAltHL){this.mmDDAltHL=false}
          }
        };
        this.pDOM();
        break;
      case 'file':
        switch(ddFn){
          case 'newblankproject':
            if(this.compzRoute==='home'){
              if(this.appProject){
                const awaitSave=async():Promise<boolean>=>{return new Promise(resolve=>{this.evServ.subscribe('save-all-cps-data-finish',(saveRes:boolean)=>{this.cCons('(apMMDDFns|newblankproject) SaveAllStates - RESULT: '+String(saveRes));resolve(true)});this.invokeHomeCPSData()})};
                await awaitSave();
              };
              this.evServ.subscribe('temp-popover-data',async resData=>{
                this.evServ.publish('compz-loading-action',{action:'present',opts:null});
                this.evServ.destroy('temp-popover-data');
                if(resData.role==='ok'){
                  const npName:string=resData.data;
                  const createPRes:any=await ipcRenderer.invoke('manage-projects',['create',{projectName:npName,prefsPath:null}]);
                  if(createPRes.r){
                    const newProj:AppProject=createPRes.d;
                    ipcRenderer.send('set-current-project',[newProj]);
                    this.evServ.publish('updateBA','New Project: '+newProj.projectName);
                    this.evServ.publish('compz-loading-action',{action:'dismiss',opts:null});
                  }else{const eM:string[]=['New Project Error','Failed to create new project ('+npName+')'];ipcRenderer.send('do-error',eM);this.evServ.publish('updateBA',eM[0]+': '+eM[1]);this.evServ.publish('compz-loading-action',{action:'dismiss',opts:null});}
                }else{if(resData.role==='cancel'){this.evServ.publish('updateBA','Rename Project: Cancelled')}else{const eM:string[]=['New Project Error','Failed to create new project'];ipcRenderer.send('do-error',eM);this.evServ.publish('updateBA',eM[0]+': '+eM[1])};this.evServ.publish('compz-loading-action',{action:'dismiss',opts:null})}
              });
              this.evServ.publish('do-compz-popover',{id:'input-'+String(Math.round((new Date()).getTime()/1000)),type:'input',title:'New Project',msg:'Enter a name for your project',inputLabel:'Project Name'});
            };
            break;
          case 'openproject':
            if(this.compzRoute==='home'){
              if(this.appProject){
                const awaitSave=async():Promise<boolean>=>{return new Promise(resolve=>{this.evServ.subscribe('save-all-cps-data-finish',(saveRes:boolean)=>{this.cCons('(apMMDDFns|newblankproject) SaveAllStates - RESULT: '+String(saveRes));resolve(true)});this.invokeHomeCPSData()})};
                await awaitSave();
              };
              const openFileRes:any=await ipcRenderer.invoke('do-open-file',['project']);
              let oFPath:string|null=null;
              if(typeof openFileRes==='string'&&openFileRes.length>0){oFPath=openFileRes}
              else if(typeof openFileRes==='object'&&Array.isArray(openFileRes)&&openFileRes.length>0){oFPath=openFileRes[0]}
              else{oFPath=null};
              if(oFPath){
                this.evServ.publish('compz-loading-action',{action:'present',opts:null});
                const knownUserPs:AppProject[]=await ipcRenderer.invoke('getUserProjects','sync');
                let matchUP:AppProject|null=null;
                if(knownUserPs.length>0){
                  const matchUPArr:AppProject[]=knownUserPs.filter(uP=>uP.projectPrefsPath===oFPath);
                  if(matchUPArr.length>0){matchUP=matchUPArr[0]}
                };
                if(matchUP){
                  const newProj:AppProject=matchUP;
                  ipcRenderer.send('set-current-project',[newProj]);
                  this.evServ.publish('updateBA','New Project: '+newProj.projectName);
                  setTimeout(()=>{this.evServ.publish('compz-loading-action',{action:'dismiss',opts:null})},1000);
                }else{
                  this.evServ.publish('compz-loading-action',{action:'dismiss',opts:null});
                  const promptImpRes:string=await ipcRenderer.invoke('do-show-msg',['importProjectQuestion',{name:path.basename(oFPath)}]);
                  if(promptImpRes!=='cancel'){ipcRenderer.invoke('manage-projects',['import'])}
                  else{this.evServ.publish('updateBA','Import Project|Cancelled')}
                }
              }else{ipcRenderer.send('do-error',['Error Opening Project','Unspecified Path']);this.evServ.publish('updateBA','Open Project|Error (Unspecified Path)')}
            };
            break;
          case 'importproject':
            const ipRes:any=await ipcRenderer.invoke('manage-projects',['import']);
            if(ipRes.r&&ipRes.d!==null){
              this.evServ.publish('compz-loading-action',{action:'present',opts:null});
              const imptdProj:AppProject=ipRes.d;
              this.evServ.destroy('appProjectReady');
              this.evServ.subscribe('appProjectReady',async()=>{
                this.evServ.destroy('appProjectReady');
                this.cCons('[LAUNCH|RECEIVED EVENT] appProjectReady!');
                this.evServ.publish('updateBA','Open Imported Project: '+imptdProj.projectName);
                this.evServ.publish('compz-loading-action',{action:'dismiss',opts:null});
                if(this.compzRoute!=='home'){this.router.navigate(['home'])};
              });
              ipcRenderer.send('set-current-project',[imptdProj]);
            }
            break;
          case 'closeproject':
            const awaitSave=async():Promise<boolean>=>{return new Promise(resolve=>{this.evServ.subscribe('save-all-cps-data-finish',(saveRes:boolean)=>{this.cCons('(apMMDDFns|newblankproject) SaveAllStates - RESULT: '+String(saveRes));resolve(true)});this.invokeHomeCPSData()})};
            await awaitSave();
            this.appSStates=defAppStates;
            const closePName:string=this.appProject.projectName;
            this.appProject=null;
            ipcRenderer.send('set-current-project',[null]);
            this.updateBarAction('Closed Project: '+closePName);
            this.router.navigate(['launcher']);
            break;
          case 'preferences-clearcache':await ipcRenderer.invoke('clearcache');break;
        };
        break;
      case 'edit':
        break;
      case 'tools':
        break;
      case 'window':
        break;
      case 'help':
        break;
      default:this.cCons('(appMMDDFns) [ERROR]: Unknown Fn ('+ddFn+') for DDMenu '+ddName);
    }
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async compzLoadingAction(action:string,opts?:LoadingOptions|null){
    if(action==='present'){
      let clOpts:LoadingOptions|null=null;
      opts&&opts!==null?clOpts=opts:clOpts={animated:true,spinner:'dots',duration:0,showBackdrop:true,backdropDismiss:false,cssClass:'compz-loader-class'};
      this.compzLoad=await this.loadCtrl.create(clOpts);
      await this.compzLoad.present();this.compzLoadIsShowing=true
    }else{this.compzLoad.dismiss();this.compzLoadIsShowing=false};
  }
/////////////////////////////////////////////////////////
  async showCompzPopover(cpOpts:CompzPopoverOptions){this.cCons('(showCompzPopover)')
    const showCPObj:ModalOptions={component:InputPopoverPage,componentProps:cpOpts,showBackdrop:true,backdropDismiss:false,cssClass:'compz-popover-class',animated:true,mode:'md',keyboardClose:false,id:cpOpts.id};
    const sCPop:HTMLIonModalElement=await this.modalCtrl.create(showCPObj);
    await sCPop.present();this.cCons('(showCompzPopover) [OPEN] compzPopover ID: '+cpOpts.id);
    const sCPopRes:any=await sCPop.onDidDismiss();
    this.cCons('(showCompzPopover) [CLOSE] (Success) compzPopover ID: '+cpOpts.id+' | '+sCPopRes.data+' | '+sCPopRes.role);
    this.evServ.publish('temp-popover-data',sCPopRes);
  }
/////////////////////////////////////////////////////////
  tabCloseFE(){this.evServ.publish('feToggle',false)};
/////////////////////////////////////////////////////////
  appEVServChannels():Promise<boolean>{
    this.evServ.subscribe('compz-loading-action',claData=>{this.compzLoadingAction(claData.action,claData.opts)});
    this.evServ.subscribe('do-compz-popover',dcPOpts=>{this.showCompzPopover(dcPOpts)});
    this.evServ.subscribe('updateBA',aTxt=>{this.updateBarAction(aTxt)});
    this.evServ.subscribe('feToggle',(tf:boolean)=>{this.toggleFE(tf)});
    this.evServ.subscribe('fePromptAddFiles',()=>{this.fePromptAddFile=true;this.changeDet.detectChanges();setTimeout(()=>{this.fePromptAddFile=false;this.changeDet.detectChanges()},500)});
    this.evServ.subscribe('feDoSync',dirsArr=>{this.fileExpFns('sync',dirsArr)});
    this.evServ.subscribe('home-contents-cmd',async(ccData)=>{
      this.cCons('(cbActions|home-contents-cmd) home > EVENT > app: '+ccData.cmd);
      const cDone=(cmd:string)=>{this.evServ.publish('home-contents-cmd-done',cmd)};
      switch(ccData.cmd){
        case 'copy':await this.cboardActions('copy','UI');cDone(ccData.cmd);break;
        case 'cut':await this.cboardActions('cut','UI');cDone(ccData.cmd);break;
        case 'paste':await this.cboardActions('paste','UI');cDone(ccData.cmd);break;
        case 'undo':await this.cboardActions('undo','UI');cDone(ccData.cmd);break;
        case 'redo':await this.cboardActions('redo','UI');cDone(ccData.cmd);break;
        case 'selectAll':
          if(ccData.hasOwnProperty('selector')&&ccData.selector){await this.cboardActions('selectAll','UI',ccData.selector)}
          else{await this.cboardActions('selectAll','UI')};
          cDone(ccData.cmd);
          break;
        default:break
      };
    });
    this.evServ.subscribe('handle-home-cps-data',(homeCPSData:HomeStates)=>{
      const saveAllSSObj:AllCompzStates={appStates:this.appSStates,homeStates:homeCPSData};
      this.doSaveAllStates(saveAllSSObj);
    });
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
  async appDOMListeners():Promise<boolean>{
    const canExec=(cmd:string):boolean=>{return (document.queryCommandEnabled(cmd))};
    document.onselectionchange=()=>{
      let aTSSec:string|null=null;this.appMouseInSection!==''?aTSSec=this.appMouseInSection:aTSSec='';
      this.appTxtSelection={txt:document.getSelection().toString(),section:aTSSec};
      for(let i=0;i<this.eCmds.allArr.length;i++){const cK:string=this.eCmds.allArr[i];this.eCmds[cK]=canExec(cK)};
      this.evServ.publish('appTxtSelection',{txtSelection:this.appTxtSelection,eCmds:this.eCmds});
    };
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
  mscwMouseEnter(sName:string){
    if(this.appCMIsOpen){this.appCMIsOpen=false}{ipcRenderer.send('cm-isopen',[false])};
    this.appMouseInSection=sName;ipcRenderer.send('app-context-section',[sName])
  };
  mscwMouseClick(){if(this.appCMIsOpen){this.appCMIsOpen=false};ipcRenderer.send('cm-isopen',[false])};
/////////////////////////////////////////////////////////
  feListMouseLeave(){if(!this.appCMIsOpen){ipcRenderer.send('fe-context-file',[null])}}
  //-----------------------------------------------------
  feItemMouseEvents(event:string,itemObj:any){
    if(!this.appSStates.feRename.feRenameItem!==null){
      switch(event){
        case 'me':
          if(this.appCMIsOpen){this.appCMIsOpen=false}{ipcRenderer.send('cm-isopen',[false])};
          this.feItemHovered=itemObj.path;
          ipcRenderer.send('fe-context-file',[itemObj]);
          break;
        case 'ml':if(!this.appCMIsOpen){this.feItemHovered=''};break;
        case 'click':this.feItemSelected=itemObj.path;break;
        case 'cm':this.appCMIsOpen=true;ipcRenderer.send('cm-isopen',[true]);break;
        default:break
      }
    }
  }
/////////////////////////////////////////////////////////
  appCons(mOpts:any){if(mOpts.type==='string'){this.logger.info(mOpts.msg)}else{this.logger.info('⚗️ [main|console.log] OBJECT:');this.logger.info(mOpts.msg)}};
  //-----------------------------------------------------
  cCons(txt:string){this.logger.info('[app|cCons|logger.info] '+txt)};
  //-----------------------------------------------------
  pDOM(){this.changeDet.detectChanges()};
  //-----------------------------------------------------
  capd(s:string):string{return s.charAt(0).toUpperCase()+s.slice(1)};
  async exists(path:string):Promise<boolean>{try{await access(path);return true}catch{return false}};
  //-----------------------------------------------------
  cvBs(b:number):Promise<any>{const sz=['bytes','KB','MB','GB','TB'];if(b===0){return Promise.resolve({no:0,suffix:'N/A'})}else{const i:number=(Math.floor(Math.log(b)/Math.log(1024)));if(i===0){return Promise.resolve(b+sz[i])}else{return Promise.resolve({no:(b/Math.pow(1024,i)).toFixed(0),suffix:sz[i]})}}}
  //-----------------------------------------------------
  updateBarAction(actionTxt:string) {
    const hatStr:string='('+this.evServ.strFormat(new Date(),'HH:mm:ss')+')';
    const sTO=async():Promise<boolean>=>{this.appSStates.statusBar.barA2HInProg=true;return new Promise(resolve=>{this.appSStates.statusBar.barWait=setTimeout(()=>{clearTimeout(this.appSStates.statusBar.barWait);this.appSStates.statusBar.barA2HInProg=false;resolve(true);this.pDOM()},3000)})};
    const fTO=async():Promise<boolean>=>{return new Promise(resolve=>{const quick=setTimeout(()=>{clearTimeout(quick);resolve(true);this.pDOM()},250)})};
    const doAnim=async(msg:string|null)=>{this.appSStates.statusBar.barA2HAnim=true;if((await fTO())){this.appSStates.statusBar.barHistoryTxt=this.appSStates.statusBar.barActionTxt;this.appSStates.statusBar.barHATime=hatStr;this.appSStates.statusBar.barActionTxt=null;this.appSStates.statusBar.barA2HAnim=false;this.appSStates.statusBar.barActionTxt=msg}};
    const updateBar=async(msg:string)=>{if(this.appSStates.statusBar.barActionTxt===null){this.appSStates.statusBar.barActionTxt=msg}else{doAnim(msg)};if((await sTO())){doAnim(null)};await this.doSaveStates()};
    if(this.appSStates.statusBar.barA2HInProg){clearTimeout(this.appSStates.statusBar.barWait);this.appSStates.statusBar.barA2HInProg=false};
    updateBar(actionTxt);
  }
  //-----------------------------------------------------
  async winBtnEvents(action:string){
    ipcRenderer.send(action);
    let sbTxt:string='App|Window: ';
    switch(action){
      case 'min':sbTxt+='Minimised';break;
      case 'max':sbTxt+='Maximised';this.appSStates.isMaxed=true;await this.doSaveStates();break;
      case 'restore':sbTxt+='Restored';this.appSStates.isMaxed=false;await this.doSaveStates();break;
      case 'tray':sbTxt+='Sent to Tray';break;
      case 'close':sbTxt+='Closed';break;
    };
    this.updateBarAction(sbTxt)
  }
  //-----------------------------------------------------
  async getMenuBarPos(){this.cCons('getMenuBarPos()...');
    const testNE=(dN:string):boolean=>{if(this[dN+'MMDD'].nativeElement){return true}else{return false}};
    const hasNE=(dN:string):Promise<boolean>=>{return new Promise((resolve)=>{let wlCount:number=0,wlTO:number=3000;const wLoop=setInterval(async()=>{if((testNE(dN))){clearInterval(wLoop);resolve(true)}else{wlCount+=200;if(wlCount>wlTO){clearInterval(wLoop);resolve(false)}}},200)})};
    let mmXPosObj:any={wrap:{start:36,end:272},file:36,edit:73,tools:112,window:160,help:227};
    for(const ddName of Object.keys(mmXPosObj)){
      const hNE:boolean=await hasNE(ddName);
      if(hNE){const tNE=this[ddName+'MMDD'].nativeElement;
        if(tNE){const tNERect:any=tNE.getBoundingClientRect();
          if(tNERect){
            if(ddName==='wrap'){mmXPosObj[ddName].start=Math.round(Number(tNERect.x));mmXPosObj[ddName].end=Math.round(Number(tNERect.x)+Number(tNERect.width))}
            else{mmXPosObj[ddName]=Math.round(Number(tNERect.x))}
          }
        }
      }
    };
    ipcRenderer.send('mm-update-xpos',[mmXPosObj]);
  }
  //-----------------------------------------------------
  menuBarDDMouse(enterLeave:string,mmDDName:string){
    if(enterLeave==='enter'){if(this.mmDDHovered!==mmDDName){this.mmDDHovered=mmDDName}}
    else{if(this.mmDDHovered===mmDDName){this.mmDDHovered=''}};
  }
  async menuBarDDClick(ddName:string){this.cCons('(menuBarDDClick) ['+ddName+']');
    if(this.mmDDOpen!==ddName){this.mmDDOpen=ddName;ipcRenderer.send('mm-dd-action',[ddName,'open'])}
    else{this.mmDDOpen=null;ipcRenderer.send('mm-dd-action',[ddName,'close'])}
  }
  menuBarDDKey(kbEvent:any,ddName:string){this.cCons('(menuBarDDKey) ['+ddName+']');
    if(kbEvent.key==='Enter'){kbEvent.preventDefault();if(kbEvent.defaultPrevented){this.menuBarDDClick(ddName)}};
    if(kbEvent.key==='Escape'){
      kbEvent.preventDefault();
      if(kbEvent.defaultPrevented){
        const nEKeys:string[]=['file','edit','tools','window','help'];
        for(let i=0;i<nEKeys.length;i++){const neK:string=String(nEKeys[i]+'MMDD');if(this[neK].nativeElement.focus){this[neK].nativeElement.blur()}};
        if(this.mmDDAltHL){this.mmDDAltHL=null};
        if(this.mmDDOpen){if(this.mmDDOpen){const cDD:string=this.mmDDOpen;this.mmDDOpen=null;ipcRenderer.send('mm-dd-action',[cDD,'close'])}}
      }
    }
  }
  //-----------------------------------------------------
  async toggleFE(tf:boolean){
    if(this.appSStates.feIsOpen!==tf){this.appSStates.feIsOpen=tf};
    if((await ipcRenderer.invoke('is-fe-open'))!==tf){ipcRenderer.send('fe-is-open',[tf])};
    this.evServ.publish('homeFeIsOpen',tf);
    await this.doSaveStates();this.pDOM();
  }
  //-----------------------------------------------------
  async updateWinMax(init?:boolean):Promise<boolean>{ this.cCons('(updateWinMax)...');
    const search_hhS:number=32,std_hhS:number=42;
    let sS:number=0,sH:number=0,hhS:number=0;
    if(init){hhS=std_hhS;sS=3;sH=0}
    else{
      this.appSStates.feSearch.feShowSearch?hhS=search_hhS:hhS=std_hhS;
      for(let i=0;i<this.feBDs.length;i++){this.appSStates.feDirVis[this.feBDs[i]][this.appSStates['feTree'+this.capd(this.feBDs[i])].path]?sS++:sH++}
    };
    const newMaxStr:string='calc((100vh - (108px + ('+String(sS*hhS)+'px) + ('+String(sH*24)+'px))) / '+String(sS)+')';
    if(this.appSStates.feEqualWinMax!==newMaxStr){this.appSStates.feEqualWinMax=newMaxStr;await this.doSaveStates();this.pDOM()};
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
  async cboardActions(action:string,method:string,data?:any):Promise<boolean>{
    this.logger.info('[app|cbActions] ('+action+','+method+')...');
    switch(action){
      case 'copy':
        const cCBTxt:string=clipboard.readText(),cSelTxt:string=this.appTxtSelection.txt;
        if(cSelTxt&&typeof (cSelTxt)==='string'&&cSelTxt!==''&&cCBTxt!==cSelTxt){
          let bAT:string='';cSelTxt.length>20?bAT=cSelTxt.substring(0,20)+'...':bAT=cSelTxt;console.log(bAT);const dCCT:string='Copy|Clipboard: via '+this.capd(method)+': "'+bAT+'"';
          clipboard.writeText(cSelTxt);this.updateBarAction(dCCT);this.cCons('(cbActions|doCopy) '+dCCT)
        }else{const dCCT:string='Copy|Clipboard via '+this.capd(method)+': No Selection';clipboard.clear();this.updateBarAction(dCCT);this.cCons('(cbActions|doCopy) '+dCCT)};
        break;
      case 'cut':
        const pSelTxt:string=document.getSelection().toString();
        if(pSelTxt.length>0){
          let bAT:string='';pSelTxt.length>20?bAT=pSelTxt.substring(0,20)+'...':bAT=pSelTxt;const dCuCT:string='Cut|Selection via '+this.capd(method)+': "'+bAT+'"';
          ipcRenderer.send('app-contents-cmd',['cut']);this.updateBarAction(dCuCT);this.cCons('(cbActions|doCut) '+dCuCT)
        }else{const dCuCT:string='Cut|Selection via '+this.capd(method)+': No Selection';this.updateBarAction(dCuCT);this.cCons('(cbActions|doCut) '+dCuCT)};
        break;
      case 'paste':
        const pCBTxt:string=clipboard.readText();
        if(pCBTxt&&typeof (pCBTxt)==='string'&&pCBTxt!==''){
          let bAT:string='';pCBTxt.length>20?bAT=pCBTxt.substring(0,20)+'...':bAT=pCBTxt;const dPCTxt:string='Paste|Clipboard via '+this.capd(method)+': "'+bAT+'"';
          ipcRenderer.send('app-contents-cmd',['paste']);this.updateBarAction(dPCTxt);this.logger.info('(cbActions|doPaste) '+dPCTxt)
        }else{const dPCTxt:string='Paste|Clipboard via '+this.capd(method)+': Clipboard Empty';this.updateBarAction(dPCTxt);this.cCons('(cbActions|doPaste) '+dPCTxt)};
        break;
      case 'undo':ipcRenderer.send('app-contents-cmd',['undo']);const dUCT:string='Undo|History via '+this.capd(method);this.updateBarAction(dUCT);this.cCons('(cbActions|Undo) '+dUCT);break;
      case 'redo':ipcRenderer.send('app-contents-cmd',['redo']);const dRCT:string='Redo|History via '+this.capd(method);this.updateBarAction(dRCT);this.cCons('(cbActions|Redo) '+dRCT);break;
      case 'selectAll':
        let saEle:any;data?saEle=document.querySelector(data):saEle=this[this.appMouseInSection].nativeElement;
        const baseSACT:string='SelectAll|Selection via '+this.capd(method);
        const checkSAEle=():boolean=>{if(saEle){return true}else{return false}};
        const selAll=():boolean=>{const s=window.getSelection(),r:Range=document.createRange();r.selectNodeContents(saEle);s.removeAllRanges();s.addRange(r);return true};
        const resGood=():boolean=>{this.updateBarAction(baseSACT);this.cCons('(cbActions|Selection) '+baseSACT);return true};
        const resBad=():boolean=>{this.updateBarAction(baseSACT+': Error');this.cCons('(cbActions|Selection) '+baseSACT+': Error');return true};
        const sA=()=>{return new Promise((resolve)=>{let wLCount:number=0;const wLoop=setInterval(()=>{if(checkSAEle()){clearInterval(wLoop);const sARes:boolean=selAll();if(sARes){resGood()}else{resBad()};resolve(sARes)}else{wLCount++;if(wLCount===5){clearInterval(wLoop);resBad();resolve(false)}}},200)})};
        await sA();break;
      default:break
    };
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
  async feDoRename(newName:string) {
    this.appSStates.feRename.feRenameFSInProg=true;await this.doSaveStates();this.pDOM();
    const appP:string=await ipcRenderer.invoke('getAppPath');
    const rawFP:string=this.appSStates.feRename.feRenameVals.path.replace(/\//g,'\\').replace('\\'+this.appSStates.feRename.feRenameVals.name,'')+'\\',niceFP:string=appP+'\\'+rawFP;
    const bDirStr:string=this.appSStates.feRename.feRenameVals.path.split('/')[1],bTreeStr:string='feTree'+this.capd(bDirStr);
    await rename(niceFP+this.appSStates.feRename.feRenameVals.name,niceFP+newName);
    let rawBTree:any=directoryTree('media/'+bDirStr,this.appSStates.feTreeOpts);
    const oDir:string=this.appSStates.feItemOrder[bDirStr].dir;
    let oBy:string='';this.appSStates.feItemOrder[bDirStr].by==='ext'?oBy='extension':oBy=this.appSStates.feItemOrder[bDirStr].by;
    rawBTree.children=_.orderBy(rawBTree.children,[oBy],[oDir]);
    for(let i=0;i<rawBTree.children.length;i++){if(rawBTree.children[i].hasOwnProperty('children')){rawBTree.children[i]['children']=_.orderBy(rawBTree.children[i]['children'],[oBy],[oDir])}};
    this.appSStates[bTreeStr]=rawBTree;
    await this.doSaveStates();this.pDOM();this.updateBarAction('Renamed to '+newName);
    const newFP:string=this.appSStates.feRename.feRenameVals.path.replace(this.appSStates.feRename.feRenameVals.name,newName);
    await this.fileExpFns('togglerename',{path:newFP});

  };
  feCancRename(fpath:string){this.fileExpFns('togglerename',fpath);this.updateBarAction('Rename Cancelled/Unchanged');this.cCons('Rename Cancelled/Unchanged')};
/////////////////////////////////////////////////////////
  async fileExpFns(action:string,data:any):Promise<boolean>{this.cCons('(fileExpFns) - '+action);
    switch(action){
      case 'sync':
        let sCT:string[]=[];for(let i=0;i<data.length;i++){sCT.push('Dir: '+data[i]+' ('+this.appSStates.feItemOrder[data[i]].by+'|'+this.appSStates.feItemOrder[data[i]].dir+')')};
        if(data.length===3){this.feIsRefresh.all=true};
        this.cCons('(fileExpFns) SYNC: '+sCT.join(', '));
        const capDNs:string[]=data.map((d:string)=>this.capd(d));
        this.updateBarAction('Syncing Folders: '+capDNs.join(', ')+'...');
        let ttlSzCount:any={count:{file:0,dir:0},size:{no:0,suffix:''}};
        for(let i=0;i<data.length;i++){
          const bDir:string=data[i];const bTree:string='feTree'+this.capd(bDir);
          this.appSStates.feDataStats[bDir].count.file=0;this.appSStates.feDataStats[bDir].count.dir=0;this.appSStates.feDataStats[bDir].size={no:'',suffix:''};this.feIsRefresh[bDir]=true;
          this.pDOM();
          const dtFileCBack:DirectoryTreeCallback=(fileItem)=>{
            fileItem['path']=path.normalize(fileItem['path']);
            this.appSStates.feDataStats[bDir].count.file++;ttlSzCount.count.file++;
          };
          const dtDirCBack:DirectoryTreeCallback=(dirItem)=>{
            dirItem['path']=path.normalize(dirItem['path']);
            this.appSStates.feDataStats[bDir].count.dir++;ttlSzCount.count.dir++;
            if(!this.appSStates.feDirVis[bDir].hasOwnProperty(dirItem.path)){
              this.appSStates.feDirVis[bDir][dirItem.path]=true
            }
          };
          const projMediaDir:string=await ipcRenderer.invoke('getMediaPath');
          let rawTree:any=directoryTree(path.normalize(path.join(projMediaDir,bDir)),this.appSStates.feTreeOpts,dtFileCBack,dtDirCBack);
          if(!rawTree.hasOwnProperty('children')){this.appSStates[bTree]=rawTree}
          else{
            const oDir:string=this.appSStates.feItemOrder[data[i]].dir;
            let oBy:string='';this.appSStates.feItemOrder[data[i]].by==='ext'?oBy='extension':oBy=this.appSStates.feItemOrder[data[i]].by;
            rawTree.children=_.orderBy(rawTree.children,[oBy],[oDir]);
            for(let i=0;i<rawTree.children.length;i++){if(rawTree.children[i].hasOwnProperty('children')){rawTree.children[i]['children']=_.orderBy(rawTree.children[i]['children'],[oBy],[oDir])}};
            this.appSStates[bTree]=rawTree;
          };
          const ttlSize:number=await getFolderSize.loose(path.join(projMediaDir,bDir));
          ttlSzCount.size.no+=ttlSize;
          this.appSStates.feDataStats[bDir].size=(await this.cvBs(ttlSize));
          setTimeout(()=>{this.pDOM();this.feIsRefresh[bDir]=false},250);
          if(this.appSStates.feSearch.feShowSearch&&this.appSStates.feSearch.feSearchMatches!==null){const buSVal=this.appSStates.feSearch.feSearchVal;this.appSStates.feSearch.feSearchVal='';this.feSearchEvent('keyup',null,buSVal)};
          if((this.appSStates.feDataStats[bDir].count.file+this.appSStates.feDataStats[bDir].count.dir)<1){
            const feSTDAllIndex:number=this.appSStates.feSearch.tdData.feSearchTDAll.findIndex(o=>o.bdir===bDir);const feSTDTrueIndex:number=this.appSStates.feSearch.tdData.feSearchTDsTrue.findIndex(o=>o.bdir===bDir);
            if(feSTDAllIndex!==-1){this.appSStates.feSearch.tdData.feSearchTDAll[feSTDAllIndex].isDisabled=true};if(feSTDTrueIndex!==-1){this.appSStates.feSearch.tdData.feSearchTDsTrue[feSTDTrueIndex].isDisabled=true};
          };
          await this.doSaveStates();this.pDOM();
        };
        if(this.appSStates.feArrangeWin==='equal'){this.updateWinMax()};
        let doneSzAll:any=ttlSzCount;
        doneSzAll.size=(await this.cvBs(ttlSzCount.size.no));
        this.appSStates.feDataStats.all=doneSzAll;
        if(this.feIsRefresh.all){this.feIsRefresh.all=false};
        await this.doSaveStates();this.pDOM();this.updateBarAction('Sync Completed');
        this.evServ.publish('feSyncFinished',{a:this.appSStates.feTreeAudio.children,v:this.appSStates.feTreeVideo.children,s:this.appSStates.feTreeSubs.children});
        break;
      case 'order':
        let dC:boolean=false;const allBD:string[]=['audio','subs','video'];
        if(data.type==='by'){dC=true;const byOpts:string[]=['type','name','size','ext'],nowBy:string=this.appSStates.feItemOrder[data.bdir]['by'],nowI:number=byOpts.findIndex(b=>b===nowBy);let newI:number=0;data.dir==='prev'?newI=nowI-1:newI=nowI+1;let fI:number=0;newI===-1?fI=3:fI=newI;newI===4?fI=0:fI=newI;this.appSStates.feItemOrder[data.bdir]['by']=byOpts[fI]}
        else if(data.type==='dir'){dC=true;this.appSStates.feItemOrder[data.bdir]['dir']==='asc'?this.appSStates.feItemOrder[data.bdir]['dir']='desc':this.appSStates.feItemOrder[data.bdir]['dir']='asc'}
        else if(data.type==='search'){const sOrdObj:any={by:'name',dir:'asc'};
          for(let i=0;i<allBD.length;i++){
            if(data.action==='open'){this.appSStates.feSearch.fePreSearchOrder[allBD[i]]=this.appSStates.feItemOrder[allBD[i]];if(_.isEqual(this.appSStates.feItemOrder[allBD[i]],sOrdObj)){dC=false}else{this.appSStates.feItemOrder[allBD[i]]=sOrdObj;dC=true}}else if(data.action==='close'){if(_.isEqual(sOrdObj,this.appSStates.feSearch.fePreSearchOrder[allBD[i]])){dC=false}else{this.appSStates.feItemOrder[allBD[i]]=this.appSStates.feSearch.fePreSearchOrder[allBD[i]];dC=true}}
          }
        };
        if(data.type!=='search'){if(dC){await this.fileExpFns('sync',[data.bdir])};this.updateBarAction('Reorder '+this.capd(data.bdir)+' files by '+this.appSStates.feItemOrder[data.bdir]['by']+' ('+this.appSStates.feItemOrder[data.bdir]['dir']+')')}else{if(dC){await this.fileExpFns('sync',allBD);await this.storeServ.set('feItemOrder',this.appSStates.feItemOrder)}};
        await this.doSaveStates();this.pDOM();
        break;
      case 'togglewin':
        this.appSStates.feArrangeWin==='equal'?this.appSStates.feArrangeWin='combined':this.appSStates.feArrangeWin='equal';
        if(this.appSStates.feArrangeWin==='equal'){this.updateWinMax()};
        this.updateBarAction('File View Updated: '+this.capd(this.appSStates.feArrangeWin));
        await this.doSaveStates();this.pDOM();
        break;
      case 'togglesearch':let doOpen:boolean|null=null;this.appSStates.feSearch.feShowSearch?doOpen=false:doOpen=true;if(doOpen){this.feResetSearch('open')}else{this.feResetSearch('close')};this.pDOM();break;
      case 'collapseall':
        let collDs:string='';if(data.bdir==='all'){const allBD:string[]=['audio','subs','video'];for(let i=0;i<allBD.length;i++){for(const[k,v]of Object.entries(this.appSStates.feDirVis[allBD[i]])){if(v){this.appSStates.feDirVis[allBD[i]][k]=false}}}}else{collDs=this.capd(data.bdir);for(const[k,v]of Object.entries(this.appSStates.feDirVis[data.bdir])){if(v&&k!=='media/'+data.bdir){this.appSStates.feDirVis[data.bdir][k]=false}}};
        if(this.appSStates.feArrangeWin==='equal'){this.updateWinMax()};
        this.updateBarAction('Collapse all '+collDs+' subdirectories');
        await this.doSaveStates();this.pDOM();
        break;
      case 'expandall':
        let expDs:string='';
        if(data.bdir==='all'){const allBD:string[]=['audio','subs','video'];for(let i=0;i<allBD.length;i++){for(const[k,v]of Object.entries(this.appSStates.feDirVis[allBD[i]])){if(!v){this.appSStates.feDirVis[allBD[i]][k]=true}}}}else{expDs=this.capd(data.bdir);for(const[k,v]of Object.entries(this.appSStates.feDirVis[data.bdir])){if(!v){this.appSStates.feDirVis[data.bdir][k]=true}}};
        if(this.appSStates.feArrangeWin==='equal'){this.updateWinMax()};
        this.updateBarAction('Expand all '+expDs+' subdirectories');
        await this.doSaveStates();this.pDOM();
        break;
      case 'toggledir':
        this.appSStates.feDirVis[data.bdir][data.path]?this.appSStates.feDirVis[data.bdir][data.path]=false:this.appSStates.feDirVis[data.bdir][data.path]=true;
        if(this.appSStates.feArrangeWin==='equal'){this.updateWinMax()};
        await this.doSaveStates();this.pDOM();
        break;
      case 'togglerename':
        if(!this.appSStates.feRename.feIsRenaming){
          if(this.feItemSelected!==data.path){this.feItemSelected!==data.path};
          this.appSStates.feRename.feRenameVals={path:data.path,name:data.name,type:data.type};this.appSStates.feRename.feRenameName=data.name;
          this.appSStates.feRename.feRenameItem=data.path;
          this.appSStates.feRename.feIsRenaming=true
        }else{
          let didChange:boolean|null=null;
          this.appSStates.feRename.feRenameName!==data.name?didChange=true:didChange=false;
          this.appSStates.feRename.feRenameVals={};
          this.appSStates.feRename.feRenameName='';
          this.appSStates.feRename.feRenameItem=null;
          this.appSStates.feRename.feIsRenaming=false;
          this.appSStates.feRename.feRenameFSInProg=false;
          if(this.feItemSelected!==data.path){this.feItemSelected=data.path};
          if(didChange){
            this.appSStates.feRename.feDidRename=data.path;
            setTimeout(async()=>{this.appSStates.feRename.feDidRename=null;await this.doSaveStates();this.pDOM()},1500)
          }
        };
        await this.doSaveStates();this.pDOM();
        break;
      case 'addfile':
        let didAddNs:string[]=[];
        const doCPF=async(fP:string,tP:string):Promise<boolean>=>{
          this.cCons('(addFile|doCPF): Copying from '+fP+' to '+tP);
          try{
            await copyFile(fP,tP);
            didAddNs.push(path.basename(fP));
            return Promise.resolve(true)
          }catch(e){this.cCons('(fileExpFns|addfile) ERROR: '+JSON.stringify(e));return Promise.resolve(false)}
        };
        const dOFRes:any=await ipcRenderer.invoke('do-open-file',[data.bdir]);
        if(dOFRes.canceled){this.updateBarAction('Add File(s) Cancelled')}
        else{
          this.cCons('(addFile|dOFRes) Do Open File Result: ');
          console.log(dOFRes);
          if(dOFRes.filePaths&&dOFRes.filePaths.length>0){
            console.log('data.bdir = '+data.bdir);
            const saveBDirP:string=await ipcRenderer.invoke('getBDirPath',[data.bdir]);this.cCons('(addFile) saveBDirPath: '+saveBDirP);
            for(let i=0;i<dOFRes.filePaths.length;i++){
              const fromFPath:string=dOFRes.filePaths[i];this.cCons('(addFile) fromFPath: '+fromFPath);
              const toFPath:string=path.join(saveBDirP,path.basename(fromFPath));this.cCons('(addFile) toFPath: '+toFPath);
              if((await this.exists(toFPath))){this.cCons('(addFile) Already Exists: TRUE! - Showing Overwrite Conf...');
                const dOW:string=await ipcRenderer.invoke('do-show-msg',['overwriteQuestion',{name:path.basename(fromFPath)}]);
                if(dOW==='yes'){await doCPF(fromFPath,toFPath)}
              }else{
                this.cCons('(addFile) Already Exists: FALSE - Copying File...');
                await doCPF(fromFPath,toFPath)
              }
            };
            await this.fileExpFns('sync',[data.bdir]);
            this.updateBarAction('Added '+didAddNs.length+' File(s) to '+this.capd(data.bdir)+' Folder');
            this.pDOM();
          }else{this.updateBarAction('Add File(s) Failed: Path/Access Error(s)')};
        };
        break;
      case 'duplicate':
        const bdir:string=data.path.split('/')[1],rawFP:string=data.path.replace(/\//g,'\\').replace('\\'+data.name,'')+'\\',appP:string=await ipcRenderer.invoke('getAppPath'),pOnly:string=appP+'\\'+rawFP;
        const fExists=async(p:string):Promise<boolean>=>{try{await access(p);return Promise.resolve(true)}catch{return Promise.resolve(false)}};
        const newFPath=async(pO:string,oFN:string,ext:string):Promise<string>=>{const oFNNoExt:string=oFN.replace(ext,'');let fNFN:string='';for(let i=1;i<1000;i++){const testNNPath:string=pO+oFNNoExt+'('+String(i)+')'+ext,testExists:boolean=await fExists(testNNPath);if(!testExists){fNFN=testNNPath;break}};if(fNFN!==(pO+oFN)){return Promise.resolve(fNFN)}else{return Promise.resolve((pO+oFN))}};
        const newFPRes:string=await newFPath(pOnly,data.name,data.extension);
        try{await copyFile(pOnly+data.name,newFPRes)}catch(err){this.cCons('(fileExpFns|copyFile) Err: '+JSON.stringify(err))};
        await this.fileExpFns('sync',[bdir]);
        this.updateBarAction('Copied File: '+data.path+' to '+newFPRes);
        this.pDOM();
        break;
      case 'delete':
        if(data.type==='file'){try{await unlink(data.path)}catch(err){this.cCons('(fileExpFns) Err: '+JSON.stringify(err))}}
        else{try{await rm(data.path,{recursive:true,force:true})}catch(err){this.cCons('(fileExpFns) Err: '+JSON.stringify(err))}};
        await this.fileExpFns('sync',[data.bdir]);
        this.updateBarAction('Deleted '+this.capd(data.type)+': '+data.path);
        this.pDOM();
        break;
      case 'cleardir':
        const dlRes:string[]=await readdir(data.path);
        if(dlRes.length>0){let okC:number=0,errC:number=0;
          for(let i=0;i<dlRes.length;i++){try{await unlink(data+'/'+dlRes[i]);okC++}catch(err){errC++;this.cCons('(fileExpFns) Err: '+JSON.stringify(err))}};
          await this.fileExpFns('sync',[data.bdir]);
          let resT:string='Cleared '+String(okC)+'/'+String(dlRes.length)+' files';errC>0?resT+=' - '+String(errC)+' Errors':resT=resT;this.evServ.publish('updateBA',resT);
          this.pDOM()
        }else{this.updateBarAction('No files to delete ('+data+')');return Promise.resolve(true)};
      break;
    };
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
  async feRenameEvent(eName:string,eEvent:any,inputTxt:string){
    if(this.appSStates.feSearch.feShowSearch||this.appSStates.feRename.feRenameItem===null||this.appSStates.feRename.feRenameFSInProg){return}
    else{this.appSStates.feRename.feRenameName=inputTxt.trim();
      switch(eName){
        case 'change':
          let isE:boolean|null=null,isS:boolean|null=null;this.appSStates.feRename.feRenameName===''?isE=true:isE=false;this.appSStates.feRename.feRenameName===this.appSStates.feRename.feRenameVals.name?isS=true:isS=false;
          if(!isE&&!isS){this.cCons('(feRenameEvent) CHANGE->feDoRename...');this.feDoRename(this.appSStates.feRename.feRenameName)}
          else{this.cCons('(feRenameEvent) CHANGE->feCancRename...');this.feCancRename(this.appSStates.feRename.feRenameVals.path)};
          break;
        case 'blur':break;case 'keyup':break;
        case 'keydown':if(eEvent.key==='Escape'){eEvent.preventDefault();eEvent.stopPropagation();this.feCancRename(this.appSStates.feRename.feRenameVals.path)};break;
      }
    }
  }
/////////////////////////////////////////////////////////
  async feSearchEvent(eName:string,eEvent:KeyboardEvent,data:any){
    switch(eName){
      default: this.cCons('(feSearchEvent): eName !NOT FOUND!: '+eName.toUpperCase());
      case 'clear':this.feResetSearch('clear');break;
      case 'keydown':if(eEvent.key==='Escape'){eEvent.preventDefault();eEvent.stopPropagation();this.feResetSearch('close')};break;
      case 'keyup':
        if(data===this.appSStates.feSearch.feSearchVal||data.trim()===''){if(data.trim()===''){this.feResetSearch('empty')};return};
        this.appSStates.feSearch.feSearchInProg=true;
        this.debouncedSearch();
        break;
      case 'tdchange':
        for(const k of Object.keys(this.appSStates.feSearch.tdData.feSearchTDIndic)){
          if((this.appSStates.feSearch.tdData.feSearchTDsTrue.filter(o=>o.bdir===k)).length>0){
            this.appSStates.feSearch.tdData.feSearchTDIndic[k]=true;
            if(!this.appSStates.feDirVis[k]['media/'+k]){this.appSStates.feDirVis[k]['media/'+k]=true}
          }else{
            this.appSStates.feSearch.tdData.feSearchTDIndic[k]=false;
            if(this.appSStates.feDirVis[k]['media/'+k]){this.appSStates.feDirVis[k]['media/'+k]=false}
          }
        };
        if(this.appSStates.feArrangeWin==='equal'){await this.updateWinMax()};
        await this.doSaveStates();this.pDOM();
        break;
      case 'tdfinish':
        for(const k of Object.keys(this.appSStates.feSearch.tdData.feSearchTDIndic)){if((this.appSStates.feSearch.tdData.feSearchTDsTrue.filter(o=>o.bdir===k)).length>0){this.appSStates.feSearch.tdData.feSearchTDIndic[k]=true}else{this.appSStates.feSearch.tdData.feSearchTDIndic[k]=false}};
        await this.doSaveStates();this.pDOM();
        break;
      case 'filter':
        let modA:string='';
        if(!this.appSStates.feSearch.filterData.feFilterOut[data.ext]['hide']){this.appSStates.feSearch.filterData.feFilterOut[data.ext]['hide']=true;modA='(-) '+String(data.count)+' '+data.ext}
        else{this.appSStates.feSearch.filterData.feFilterOut[data.ext]['hide']=false;modA='(+) '+String(data.count)+' '+data.ext};
        this.updateBarAction('Filter Results '+modA);
        let hasAFs:boolean=false,afCount:number=0;
        for(const[k,v]of Object.entries(this.appSStates.feSearch.filterData.feFilterOut)){if(v['hide']){hasAFs=true;afCount+=v['count']}};
        if(hasAFs){this.appSStates.feSearch.filterData.feAFCount=afCount;this.appSStates.feSearch.filterData.feHasActiveFilters=true}
        else{this.appSStates.feSearch.filterData.feAFCount=0;this.appSStates.feSearch.filterData.feHasActiveFilters=false};
        await this.doSaveStates();this.pDOM();
      break;
    }
  };
/////////////////////////////////////////////////////////
  async feResetSearch(mode:string):Promise<boolean> {
    if(this.appSStates.feRename.feRenameItem!==null){return};
    const clInputs=():Promise<boolean>=>{this.appSStates.feSearch.feSearchVal='';this.feSearchInput.nativeElement.value='';return Promise.resolve(true)};
    const clMatches=():Promise<boolean>=>{this.appSStates.feSearch.feSearchMatches=null;this.appSStates.feSearch.feSearchMatchData=null;this.appSStates.feSearch.filterData.feSearchFilters=[];this.appSStates.feSearch.filterData.feFilterOut={};this.appSStates.feSearch.filterData.feHasActiveFilters=false;this.appSStates.feSearch.filterData.feAFCount=0;this.appSStates.feSearch.feGhostDirs={};this.appSStates.feSearch.tdData.feSearchHideBlock={audio:false,subs:false,video:false};return Promise.resolve(true)};
    const toggleSearch=async(sHF:string):Promise<boolean>=>{
      if(this.appSStates.feSearch.feSearchInProg=true){this.appSStates.feSearch.feSearchInProg=false};
      switch(sHF){
        case 'show': this.appSStates.feSearch.feShowSearch=true;setTimeout(()=>{this.feSearchInput.nativeElement.focus()},500);break;
        case 'hide': this.appSStates.feSearch.feShowSearch=false;for(let i=0;i<this.feBDs.length;i++){if(!this.appSStates.feDirVis[this.feBDs[i]]['media/'+this.feBDs[i]]){this.appSStates.feDirVis[this.feBDs[i]]['media/'+this.feBDs[i]]=true}};if(this.appSStates.feArrangeWin==='equal'){await this.updateWinMax()};break;
        case 'focus': setTimeout(()=>{this.feSearchInput.nativeElement.focus()},500);break;
      };
      return Promise.resolve(true);
    };
    switch(mode){
      default: this.cCons('(feResetSearch) Mode !NOT KNOWN!: '+mode);
      case 'open': this.fileExpFns('order',{type:'search',action:'open'});await clMatches();await clInputs();await toggleSearch('show');break;
      case 'close': this.fileExpFns('order',{type:'search',action:'close'});await clMatches();await clInputs();await toggleSearch('hide');break;
      case 'clear': await clMatches();await clInputs();await toggleSearch('focus');break;
      case 'update': await clMatches();break;
      case 'empty': this.appSStates.feSearch.feSearchVal='';await clMatches();break
    };
    await this.doSaveStates();this.pDOM();
    if(mode!=='update'){this.updateBarAction(this.capd(mode)+' Search')};
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async getFeSearchResults():Promise<boolean> { this.cCons('(getFeSearchResults) for: '+this.feSearchInput.nativeElement.value);
    if(!this.appSStates.feSearch.feShowSearch||this.appSStates.feRename.feRenameItem!==null){return};
    await this.feResetSearch('update');
    const inputTxt:string=this.feSearchInput.nativeElement.value;
    this.appSStates.feSearch.feSearchVal=inputTxt;
    let searchTreeArr:any[]=[];
    if(this.appSStates.feSearch.tdData.feSearchTDsTrue.length>0){for(let i=0;i<this.appSStates.feSearch.tdData.feSearchTDsTrue.length;i++){if(!this.appSStates.feSearch.tdData.feSearchTDsTrue[i].isDisabled){searchTreeArr.push(this.appSStates['feTree'+this.appSStates.feSearch.tdData.feSearchTDsTrue[i].label])}}};
    const testFn=(fN:string,sT:string):boolean=>{if(sT.includes('*')){const rX:any=new RegExp('^'+sT.replace(/\*/gi,'.*')+'$');if(fN.match(rX)!==null){return true}else{return false}}else{if(fN.toLowerCase().includes(sT.toLowerCase())){return true}else{return false}}};
    let mObj:any={matches:{},alldirs:[],filters:[],hblock:{audio:true,subs:true,video:true},counts:{all:{total:0,dir:0,file:0},nomatch:{total:0,dir:0,file:0},match:{total:0,dir:0,file:0}}};
    const doDI=async(bTree:object,sVal:string):Promise<boolean>=>{
      function dI(obj:any,txt:string) {
        mObj.counts.all.total++;obj.type==='directory'?mObj.counts.all.dir++:mObj.counts.all.file++;
        if(obj.type==='directory'&&obj.hasOwnProperty('children')&&obj.children.length>0&&!mObj.alldirs.includes(obj.path)){mObj.alldirs.push(obj.path)};
        if(testFn(obj.name,txt)){mObj.counts.match.total++;
          obj.type==='directory'?mObj.counts.match.dir++:mObj.counts.match.file++;
          mObj.matches[String(obj.path)]=true;
          if(mObj.hblock[obj.path.split('/')[1]]){mObj.hblock[obj.path.split('/')[1]]=false};
          if(obj.type==='file'){
            const fIndex:number=mObj.filters.findIndex((fO:any)=>fO.ext==='file');
            if(fIndex!==-1){mObj.filters[fIndex].count++}else{mObj.filters.push({ext:'file',count:1})};
            const extIndex:number=mObj.filters.findIndex((eO:any)=>eO.ext===String(obj.extension));
            if(extIndex!==-1){mObj.filters[extIndex].count++}else{mObj.filters.push({ext:String(obj.extension),count:1})}
          }else{
            const fIndex:number=mObj.filters.findIndex((fO:any)=>fO.ext==='folder');
            if(fIndex!==-1){mObj.filters[fIndex].count++}else{mObj.filters.push({ext:'folder',count:1})};
          }
        }else{mObj.counts.nomatch.total++;obj.type==='directory'?mObj.counts.nomatch.dir++:mObj.counts.nomatch.file++;mObj.matches[String(obj.path)]=false};
        if(obj.type==='directory'){if(obj.hasOwnProperty('children')&&obj.children.length>0){for(let i=0;i<obj.children.length;i++){dI(obj.children[i],txt)}}};
      };
      dI(bTree,sVal);
      return Promise.resolve(true);
    };
    for(let i=0;i<searchTreeArr.length;i++){const sT:any=searchTreeArr[i];console.log('Start '+sT.path+' Tree...');await doDI(sT,this.appSStates.feSearch.feSearchVal);console.log('Finish '+sT.path+' Tree.')};
    const sMObj:any=mObj,matchesObj:any=sMObj.matches,allDsArr:string[]=sMObj.alldirs,filtersArr:any[]=sMObj.filters,hBlockObj:any=sMObj.hblock,countsObj:any=sMObj.counts;
    this.appSStates.feSearch.feSearchMatchData=countsObj;
    this.appSStates.feSearch.feSearchMatches=matchesObj;
    this.appSStates.feSearch.tdData.feSearchHideBlock=hBlockObj;
    await this.doSaveStates();this.pDOM();
    let filterOutObj:any={};
    const getFilters=(fArr:any[]):Promise<any>=>{let gF:object={};for(let i=0;i<fArr.length;i++){gF[fArr[i]['ext']]={hide:false,count:fArr[i]['count']}};return Promise.resolve({r:!_.isEmpty(gF),d:gF})};
    const fRes:any=await getFilters(filtersArr);if(fRes.r){filterOutObj=fRes.d};
    this.appSStates.feSearch.filterData.feSearchFilters=filtersArr;this.appSStates.feSearch.filterData.feFilterOut=filterOutObj;
    await this.doSaveStates();this.pDOM();
    let ghostDirsObj:any={};
    const getGhosts=(adArr:string[],amObj:any):Promise<any>=>{
      let mGhostArr:string[]=[],uGhostsArr:string[]=[],fGhostsObj:any={};
      for(let i=0;i<adArr.length;i++){const dirPath:string=adArr[i];for(const[mPath,isMatch]of Object.entries(amObj)){const matchDirOnly:string=mPath.replace(('/'+mPath.split('/')[mPath.split('/').length-1]),'');if(isMatch&&matchDirOnly.includes(dirPath)&&!mGhostArr.includes(dirPath)){mGhostArr.push(dirPath)}}};
      for(let i=0;i<mGhostArr.length;i++){if(mGhostArr.filter(gP=>gP.includes(mGhostArr[i])).length===1){uGhostsArr.push(mGhostArr[i])}};
      for(let i=0;i<adArr.length;i++){fGhostsObj[adArr[i]]={show:uGhostsArr.includes(adArr[i]),label:adArr[i].replace('media/'+adArr[i].split('/')[1]+'/','').split('/')}};
      return Promise.resolve({r:!_.isEmpty(fGhostsObj),d:fGhostsObj});
    };
    const gRes:any=await getGhosts(allDsArr,matchesObj);if(gRes.r){ghostDirsObj=gRes.d};
    this.appSStates.feSearch.feGhostDirs=ghostDirsObj;
    await this.doSaveStates();this.pDOM();
    if(this.appSStates.feSearch.feSearchMatchData.match.total<1){this.updateBarAction('No Items Matched')}
    else{this.updateBarAction(String(this.appSStates.feSearch.feSearchMatchData.match.total)+' Items Matched ('+String(this.appSStates.feSearch.feSearchMatchData.match.file)+'-'+String(this.appSStates.feSearch.feSearchMatchData.match.dir)+')')};
    await this.doSaveStates();this.pDOM();
    setTimeout(async()=>{this.appSStates.feSearch.feSearchInProg=false;await this.doSaveStates();this.pDOM()},250);
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
}
