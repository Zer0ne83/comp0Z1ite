import { ExportedProjectInfo } from './../appTypes';
import { Component,OnInit, AfterViewInit, ApplicationRef, ChangeDetectorRef, ElementRef, ViewChild, Renderer2, HostListener} from '@angular/core';
import { LoadingController, LoadingOptions } from '@ionic/angular';
import { Router, ActivatedRoute, Navigation, NavigationEnd, Event, NavigationStart, NavigationError } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { EventsService } from '../events.service';
import { ipcRenderer } from 'electron';
import {access,stat,readFile,writeFile,mkdir,readdir} from 'fs/promises';
import * as path from 'path';
import { AppProject, defCompzProject, LaunchInitParams, CompzPopoverOptions } from '../appTypes';
const _ = require('lodash');
/////////////////////////////////////////////////////////
@Component({selector:'app-launcher',templateUrl:'./launcher.component.html',styleUrls:['./launcher.component.scss']})
/////////////////////////////////////////////////////////
export class LauncherComponent implements OnInit, AfterViewInit {
  @HostListener('load') launcherLoad(){const hlM:string='[LAUNCHER|HOSTLISTENER]: LOADED';console.log(hlM);this.cCons(hlM)};
  @HostListener('unload') launcherUnload(){const hlM:string='[LAUNCHER|HOSTLISTENER]: UNLOADED';console.log(hlM);this.cCons(hlM)};
/////////////////////////////////////////////////////////
  @ViewChild('hcsLauncher') hcsLauncher:ElementRef<HTMLDivElement>;
  @ViewChild('hcaProjectList') hcaProjectList:ElementRef<HTMLDivElement>;
  @ViewChild('newProjBtn') newProjBtn:ElementRef;
  @ViewChild('openProjBtn') openProjBtn:ElementRef;
  @ViewChild('newProjInput') newProjInput:ElementRef<HTMLInputElement>;
  @ViewChild('back2ProjsBtn') back2ProjsBtn:ElementRef;
  @ViewChild('startProjBtn') startProjBtn:ElementRef;
  bouncedESCQ=_.debounce(()=>this.bouncedESCQuit(),1500,{});
/////////////////////////////////////////////////////////
  routesParamsOnce:boolean=false;
  compzRoute:string|null=null;
  launcherInitParams:any|null=null;
  launchCMIsOpen:boolean=false;
  launchScreen:number=1;
  refreshingUPList:boolean=false;
  userProjs:AppProject[]=[];
  userProjsData:any[]=[];
  selectedProj:AppProject|null=null;
  newPIV:string='';
  newProjValid:boolean|null=null;
  loadingProj:AppProject|null=null;
  isLoadingProj:boolean=false;
  loadPerc:number=0;
  escQuitCount:number=0;
/////////////////////////////////////////////////////////
  constructor(
    private logger:NGXLogger,
    private evServ:EventsService,
    private changeDet:ChangeDetectorRef,
    private router:Router
  ) { }
/////////////////////////////////////////////////////////
  async ngOnInit(){this.cCons('ngOnInit()...');
    if(!this.routesParamsOnce){
      this.router.events.subscribe(async(event:Event)=>{
        if(event instanceof NavigationEnd){
          const neP:string=event.url.replace('/','');
          if(neP.length>0&&neP!==this.compzRoute){
            this.compzRoute=neP;ipcRenderer.send('set-compz-route',[this.compzRoute]);this.cCons('[LAUNCHER|ROUTE] >>> '+this.compzRoute);
            if(this.compzRoute!=='launcher'){this.launcherInitParams=null;this.cCons('[LAUNCHER|INITPARAMS] Cleared (null)')};
          }
        }
      });
      this.routesParamsOnce=true;
    }
  }
/////////////////////////////////////////////////////////
  async ngAfterViewInit(){this.cCons('AfterViewInit()...');
    if(!this.compzRoute||this.compzRoute.trim().length<1){
      this.compzRoute=this.router.url.replace('/','');
      ipcRenderer.send('set-compz-route',[this.compzRoute]);
    };
    await this.launcherIPCListeners();
    await this.checkInitPs();
    await this.fetchProjects(null);
  }
/////////////////////////////////////////////////////////
  async checkInitPs(){this.cCons('(checkInitPs)...');
    const gCNRes:Navigation=this.router.getCurrentNavigation();
    if(gCNRes&&gCNRes.hasOwnProperty('extras')&&!_.isEmpty(gCNRes.extras)&&gCNRes.extras.hasOwnProperty('state')&&gCNRes.extras.state){
      this.launcherInitParams=gCNRes.extras.state.homeInitParams;
      this.cCons('[LAUNCHER|INITPARAMS] New!');
    }else{this.launcherInitParams=null};
    if(this.launcherInitParams){await this.actionInitPs();return Promise.resolve(true)}
  }
/////////////////////////////////////////////////////////
  async actionInitPs(){this.cCons('(actionInitPs)...');
    this.logger.info(this.launcherInitParams);
  }
/////////////////////////////////////////////////////////
  async fetchProjects(isSync:'sync'|null):Promise<boolean>{ this.cCons('fetchProjects()...');
    const getUProjs:AppProject[]|null=await ipcRenderer.invoke('getUserProjects',[isSync]);
    if(getUProjs!==null&&Array.isArray(getUProjs)&&getUProjs.length>0){await this.renderProjects(getUProjs);return Promise.resolve(true)}
    else{this.userProjs=[];this.userProjsData=[];return Promise.resolve(true)}
  }
/////////////////////////////////////////////////////////
  async renderProjects(rawList:AppProject[]):Promise<boolean>{
    let refreshDone:boolean=false;
    if(this.refreshingUPList){setTimeout(()=>{refreshDone=true},2000)};
    let userProjs:AppProject[]=[],userProjsData:any[]=[];
    for(let i=0;i<rawList.length;i++){
      const upObj:AppProject=rawList[i];
      userProjs.push(upObj);
      if(upObj.projectLastMod>0){userProjsData.push({lastModDateTxt:this.evServ.strFormat((this.evServ.dUT(upObj.projectLastMod)),'dd/MM/yy HH:mm:ss')})}
      else{userProjsData.push({lastModDateTxt:''})};
    };
    if(!this.refreshingUPList){
      this.userProjs=userProjs;
      this.userProjsData=userProjsData;
      if(this.refreshingUPList){this.refreshingUPList=false};
      return Promise.resolve(true);
    }else{
      return new Promise(resolve=>{
        const waitRReady=setInterval(async()=>{
          if(refreshDone){
            clearInterval(waitRReady);
            this.userProjs=userProjs;
            this.userProjsData=userProjsData;
            this.refreshingUPList=false;
            resolve(true)
          }
        },200)
      })
    }
  }
/////////////////////////////////////////////////////////
  launcherIPCListeners():Promise<boolean>{ this.cCons('(launcherIPCListeners)...');
    ipcRenderer.on('new-compz-route',(e:any,args:any[])=>{if(this.compzRoute!==args[0]){this.compzRoute=args[0]}});
    ipcRenderer.on('main-context-menu-open',async()=>{if(!this.launchCMIsOpen){this.launchCMIsOpen=true}});
    ipcRenderer.on('launch-cm-projectlist-delete',async(e:any,args:any[])=>{
      const delPRes:any=await ipcRenderer.invoke('manage-projects',['delete',args[0]]);
      if(delPRes.r){await this.fetchProjects('sync');this.evServ.publish('updateBA','Deleted Project ('+args[0]+')');this.pDOM()}
      else{this.evServ.publish('updateBA','(!) Delete Project - '+delPRes.d)}
    });
    ipcRenderer.on('launch-cm-projectlist-duplicate',async(e:any,args:any[])=>{this.doDuplicateProject(args[0])});
    ipcRenderer.on('launch-cm-projectlist-export',async(e:any,args:any[])=>{this.doExportProject(args[0])});
    ipcRenderer.on('launch-cm-projectlist-rename',async(e:any,args:any[])=>{this.doRenameProject(args[0])});
    ipcRenderer.on('mm-dd-fn',async(e:any,args:any[])=>{
      if(this.compzRoute==='launcher'){
        const launchMMDDFns:string[]=['newblankproject','openproject'];
        if(launchMMDDFns.includes(args[1])){
          this.cCons('(launcherIPCListeners) [mm-dd-fn] '+args[0]+' > '+args[1]);if(args[2]){console.log(args[2])};
          const fn:string=args[1];
          switch(fn){
            case 'newblankproject':this.selectProjEvents('startProj',null,'mmDD');break;
            case 'openproject':
              const openFileRes:any=await ipcRenderer.invoke('do-open-file',['project']);
              let oFPath:string|null=null;
              if(typeof openFileRes==='string'){oFPath=openFileRes}
              else if(typeof openFileRes==='object'&&Array.isArray(openFileRes)&&openFileRes.length>0){oFPath=openFileRes[0]}
              else{oFPath=null};
              if(oFPath){
                const knownUserPs:AppProject[]=await ipcRenderer.invoke('getUserProjects','sync');
                let matchUP:AppProject|null=null;
                if(knownUserPs.length>0){const matchUPArr:AppProject[]=knownUserPs.filter(uP=>uP.projectPrefsPath===oFPath);if(matchUPArr.length>0){matchUP=matchUPArr[0]}};
                if(matchUP){await this.selectProjEvents('openProj',null,matchUP)}
                else{
                  const promptImpRes:string=await ipcRenderer.invoke('do-show-msg',['importProjectQuestion',{name:path.basename(oFPath)}]);
                  if(promptImpRes!=='cancel'){ipcRenderer.invoke('manage-projects',['import'])}
                  else{this.evServ.publish('updateBA','Import Project|Cancelled')}
                }
              }else{
                ipcRenderer.send('do-error',['Error Opening Project','Unspecified Path']);
                this.evServ.publish('updateBA','Open Project|Error (Unspecified Path)')
              }
              break;
            default:this.cCons('(mm-dd-fn): '+fn);
          }
        }
      }
    });
    return Promise.resolve(true)
  }
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
  hcsMouseClick(){if(this.launchCMIsOpen){this.launchCMIsOpen=false};ipcRenderer.send('cm-isopen',[false])}
  hcaMouseEnter(aName:string){
    if(this.launchCMIsOpen){this.launchCMIsOpen=false};ipcRenderer.send('cm-isopen',[false]);
    ipcRenderer.send('home-context-area',[aName])
  }
  pjListMouseEnter(){ipcRenderer.send('home-context-section',['hcsLauncher'])}
  pjListMouseLeave(){if(!this.launchCMIsOpen){ipcRenderer.send('pj-context-file',[null]),ipcRenderer.send('home-context-area',[null])}}
/////////////////////////////////////////////////////////
  cCons(txt:string){this.logger.info('[launcher|cCons|logger.info] '+txt)}
  //-----------------------------------------------------
  pDOM(){this.changeDet.detectChanges()}
  //-----------------------------------------------------
  async exists(path:string):Promise<boolean>{try{await access(path);return Promise.resolve(true)}catch{return Promise.resolve(false)}}
  //-----------------------------------------------------
  capd(s:string):string{if(s){return s.charAt(0).toUpperCase()+s.slice(1)}else{return ''}}
  //-----------------------------------------------------
  async bouncedESCQuit(){this.escQuitCount=0;this.cCons('(bouncedESCQuit) COUNT RESET [0]')};
/////////////////////////////////////////////////////////
  async openFE2UserProjects(){this.cCons('(openFE2UserProjects)...');
    const upPath:string=await ipcRenderer.invoke('getProjectsPath');
    ipcRenderer.send('open-winFE',[upPath]);
  }
  async refreshUserProjects():Promise<boolean>{this.cCons('(refreshUserProjects)...');
    this.refreshingUPList=true;
    const{r,d}=await ipcRenderer.invoke('manage-projects',['list']);
    if(r){await this.renderProjects(d);return Promise.resolve(true)}
    else{this.refreshingUPList=false;return Promise.resolve(false)}
  }
/////////////////////////////////////////////////////////
  async selectProjEvents(eName:string,ev:any|null,data:any|null):Promise<boolean>{
    const isVStr=():boolean=>{const testN:string=this.newPIV.trim();if(testN.length>0&&this.evServ.isVFN(testN)){return true}else{return false}};
    const doVDOM=(isV:boolean):Promise<boolean>=>{if(isV){this.newProjValid=true;if(this.startProjBtn.nativeElement.disabled){this.startProjBtn.nativeElement.disabled=false};this.pDOM();return Promise.resolve(true)}else{if(this.newProjInput.nativeElement.value.trim().length>0){this.newProjValid=false}else{this.newProjValid=null};if(!this.startProjBtn.nativeElement.disabled){this.startProjBtn.nativeElement.disabled=true};this.pDOM();return Promise.resolve(true)}};
    const resetLaunch=():Promise<boolean>=>{this.selectedProj=null;this.newProjInput.nativeElement.value='';this.newPIV='';this.newProjValid=null;this.startProjBtn.nativeElement.disabled=true;this.launchScreen=1;this.openProjBtn.nativeElement.disabled=true;this.isLoadingProj=false;this.loadPerc=0;this.loadingProj=null;return Promise.resolve(true)};
    const loadHome=async(tLP:AppProject):Promise<boolean>=>{
      return new Promise(resolve=>{
        this.evServ.subscribe('appProjectReady',async()=>{
          this.cCons('[launch|Event|APP] Received Event app -> launcher - projectReady!');
          await resetLaunch();
          this.evServ.destroy('appProjectReady');
          this.router.navigate(['home'],{state:{homeInitParams:{project:tLP}}});
          resolve(true)
        });
        ipcRenderer.send('set-current-project',[tLP]);
      })
    };
    //-----------------------------
    switch(eName){
      case 'newProj':
        this.launchScreen=2;this.newPIV='comp0Z1teproject-'+String(Math.round((new Date()).getTime()/1000));this.newProjInput.nativeElement.value=this.newPIV;
        await doVDOM(true);this.pDOM();
        if(!this.newProjInput.nativeElement.focus){this.newProjInput.nativeElement.focus()};this.newProjInput.nativeElement.select();
        break;
      case 'openProj':
        data&&data!==null&&typeof data==='object'&&!_.isEmpty(data)?this.loadingProj=data:this.loadingProj=this.selectedProj;
        this.isLoadingProj=true;
        const doOProgPerc=setInterval(async()=>{this.loadPerc+=10;if(this.loadPerc===100){clearInterval(doOProgPerc);await loadHome(this.loadingProj)}},100);
        break;
      case 'back2Projs':resetLaunch();break;
      case 'startProj':
        let npName:string='';if(data==='mmDD'){npName='comp0Z1teproject-'+String(Math.round((new Date()).getTime()/1000)).toLowerCase()}else{npName=this.newPIV.toLowerCase()};
        const createPRes:any=await ipcRenderer.invoke('manage-projects',['create',{projectName:npName,prefsPath:null}]);
        if(createPRes.r){
          this.loadingProj=createPRes.d;this.isLoadingProj=true;this.pDOM();
          const doNProgPerc=setInterval(async()=>{this.loadPerc+=10;
            if(this.loadPerc===100){
              clearInterval(doNProgPerc);
              await loadHome(this.loadingProj)
            }
          },100)
        }else{
          ipcRenderer.send('do-error',['New Project: Error','Failed to create New Project ('+npName+')']);
          await resetLaunch()
        }
        break;
      case 'selectUItem':
        if(_.isEqual(this.selectedProj,this.userProjs[data])){this.selectedProj=null;if(!this.openProjBtn.nativeElement.disabled){this.openProjBtn.nativeElement.disabled=true}}
        else{this.selectedProj=this.userProjs[data];if(this.openProjBtn.nativeElement.disabled){this.openProjBtn.nativeElement.disabled=false}};
        this.pDOM();break;
      case 'keyup':if(data!==this.newPIV){this.newPIV=data};const kuVStrRes:boolean=isVStr();await doVDOM(kuVStrRes);break;
      case 'keydown':
        const kE:any=ev,kEStr:string=kE.key;
        if(kEStr==='Escape'||kEStr==='Enter'){
          kE.preventDefault();
          if(kE.defaultPrevented){
            if(kEStr==='Escape'){
              if(this.launchScreen===1){
                if(this.selectedProj!==null){
                  this.selectedProj=null;
                  if(!this.openProjBtn.nativeElement.disabled){this.openProjBtn.nativeElement.disabled=true}
                }else{this.bouncedESCQ();this.escQuitCount++;if(this.escQuitCount===3){ipcRenderer.send('close')}}
              }else if(this.launchScreen===2){await this.selectProjEvents('back2Projs',null,null)}
            }else if(kEStr==='Enter'){
              if(this.launchScreen===1){
                if(typeof data==='string'){
                  if(data==='newProjBtn'){await this.selectProjEvents('newProj',null,null)};
                  if(data==='openProjBtn'&&this.selectedProj!==null&&!this.openProjBtn.nativeElement.disabled){await this.selectProjEvents('openProj',null,null)};
                }else{
                  if(this.selectedProj===null){this.selectedProj=this.userProjs[data]}
                  else{
                    if(this.selectedProj.projectName===this.userProjs[data].projectName){this.selectedProj=null}
                    else{this.selectedProj=this.userProjs[data]}
                  };
                  if(this.selectedProj!==null){if(this.openProjBtn.nativeElement.disabled){this.openProjBtn.nativeElement.disabled=false}};
                }
              }else if(this.launchScreen===2){
                if(data==='back2ProjsBtn'){await this.selectProjEvents('back2Projs',null,null)};
                if(data==='startProjBtn'&&this.newProjValid&&!this.startProjBtn.nativeElement.disabled){await this.selectProjEvents('startProj',null,null)};
                if(data==='clrBtn'){await this.selectProjEvents('clear',null,null)};
                if(data==='genBtn'){await this.selectProjEvents('gen',null,null)};
              }
            }
          }
        };
        break;
      case 'clear':this.newProjInput.nativeElement.value='';this.newPIV='';await doVDOM(false);break;
      case 'gen':this.newPIV='comp0Z1teproject-'+String(Math.round((new Date()).getTime()/1000));this.newProjInput.nativeElement.value=this.newPIV;await doVDOM(true);break;
      case 'cm':this.launchCMIsOpen=true;ipcRenderer.send('cm-isopen',[true]);break;
      case 'me':if(this.launchCMIsOpen){this.launchCMIsOpen=false};ipcRenderer.send('cm-isopen',[false]);ipcRenderer.send('pj-context-file',[data]);break;
    };
    this.pDOM();
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  async doExportProject(project:AppProject):Promise<boolean>{ this.cCons('(doExportProject) ['+project.projectName+']...');
    this.evServ.publish('compz-loading-action',{action:'present',opts:{animated:true,spinner:'dots',duration:0,message:'Exporting '+project.projectName+'...',showBackdrop:true,backdropDismiss:false,cssClass:'compz-loader-class'}});
    await ipcRenderer.invoke('manage-projects',['export',project]);
    this.evServ.publish('compz-loading-action',{action:'dismiss'});
    return Promise.resolve(true);
  }
/////////////////////////////////////////////////////////
  doRenameProject(project:AppProject){this.cCons('(doRenameProject) ['+project.projectName+']...');
    const rnPopOpts:CompzPopoverOptions={id:'input-'+String(Math.round((new Date()).getTime()/1000)),type:'input',title:'Rename Project',msg:'Enter a new name for your project',inputLabel:'New Name',okTxt:'Rename',inputInitValue:project.projectName};
    this.evServ.subscribe('temp-popover-data',async resData=>{
      this.evServ.destroy('temp-popover-data');
      if(resData.role==='ok'){
        const rnPRes:any=await ipcRenderer.invoke('manage-projects',['rename',{project:project,newName:resData.data.toLowerCase()}]);
        if(rnPRes.r){
          let newRNProj:AppProject=rnPRes.d;
          const oldPIndex:number=this.userProjs.findIndex(pO=>pO.projectName===project.projectName);
          if(oldPIndex!==-1){this.userProjs.splice(oldPIndex,1);this.userProjsData.splice(oldPIndex,1)};
          this.userProjs.push(newRNProj);
          this.userProjsData.push({lastModDateTxt:this.evServ.strFormat((this.evServ.dUT(newRNProj.projectLastMod)),'dd/MM/yy HH:mm:ss')})
          this.evServ.publish('updateBA','Renamed Project ('+project.projectName+' ▶ '+newRNProj.projectName+')');
          this.pDOM();
          const waitEleLoop=setInterval(()=>{const nPEle:HTMLElement=document.querySelector('#upid'+String((this.userProjs.length-1)));if(nPEle){nPEle.focus({preventScroll:true});if(nPEle.focus){clearInterval(waitEleLoop);this.pDOM()}}},200);
        }else{this.evServ.publish('updateBA','Rename Project - Failed')}
      }else{
        if(resData.role==='cancel'){this.evServ.publish('updateBA','Rename Project - Cancelled')}
        else{this.evServ.publish('updateBA','Rename Project - Failed')}
      }
    });
    this.evServ.publish('do-compz-popover',rnPopOpts);
  }
/////////////////////////////////////////////////////////
  doDuplicateProject(baseProjectName:string){this.cCons('(doDuplicateProject)...');
    const clonePPrefsPath:string=this.userProjs.filter(pO=>pO.projectName===baseProjectName)[0].projectPrefsPath;
    const dupPopOpts:CompzPopoverOptions={id:'input-'+String(Math.round((new Date()).getTime()/1000)),type:'input',title:'Duplicate Project',msg:'Enter a name for your duplicated project',inputLabel:'Project Name'};
    this.evServ.subscribe('temp-popover-data',async resData=>{
      this.evServ.destroy('temp-popover-data');
      if(resData.role==='ok'){
        const dupPRes:any=await ipcRenderer.invoke('manage-projects',['duplicate',{clonedProjectName:resData.data,baseProjectPrefsPath:clonePPrefsPath}]);
        if(dupPRes.r){
          let newDupProj:AppProject=dupPRes.d;
          this.userProjs.push(newDupProj);
          this.userProjsData.push({lastModDateTxt:this.evServ.strFormat((this.evServ.dUT(newDupProj.projectLastMod)),'dd/MM/yy HH:mm:ss')})
          this.evServ.publish('updateBA','Duplicated Project ('+baseProjectName+' ▶ '+newDupProj.projectName+')');
          this.pDOM();
          const waitEleLoop=setInterval(()=>{const nPEle:HTMLElement=document.querySelector('#upid'+String((this.userProjs.length-1)));if(nPEle){nPEle.focus({preventScroll:true});if(nPEle.focus){clearInterval(waitEleLoop);this.pDOM()}}},200);
        }else{this.evServ.publish('updateBA','Duplicate Project - Failed')}
      }else{
        if(resData.role==='cancel'){this.evServ.publish('updateBA','Duplicate Project - Cancelled')}
        else{this.evServ.publish('updateBA','Duplicate Project - Failed')}
      }
    });
    this.evServ.publish('do-compz-popover',dupPopOpts);
  }
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
}

