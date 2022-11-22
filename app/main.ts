/////////////////////////////////////////////////////////
// IMPORTS
/////////////////////////////////////////////////////////
import {AllCompzStates,AppStates,HomeStates,AppProject,AppPaths,defCompzAppPaths,defAppStates,defCompzProject,ExportedProjectInfo,ImportedProjectCounts} from './appTypes';
import {access,stat,readFile,writeFile,mkdir,readdir,rename,copyFile} from 'fs/promises';
import { cp } from 'fs-extra';
import {app,screen,Menu,shell,BrowserWindow,ipcMain,Tray,dialog,globalShortcut,OpenDialogOptions,SaveDialogOptions,MessageBoxOptions,MenuItemConstructorOptions,IpcMainEvent,Point,Rectangle,PopupOptions,session,FileFilter,OpenDialogReturnValue,net} from 'electron';
import {initialize,enable} from '@electron/remote/main';
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
import {spawn} from 'child_process';
import contextMenu from 'electron-context-menu';
import * as path from 'path';
import { Stats } from 'fs';
import * as url from 'url';
import * as del from 'del';
const Store=require('electron-store');
const AdmZip=require('adm-zip');
const _= require('lodash');
/////////////////////////////////////////////////////////
// STATIC SETTINGS/OBJECTS
/////////////////////////////////////////////////////////
let compzWin:BrowserWindow|null=null;
let compzDevTools:BrowserWindow|null=null;
let compzChildWin:BrowserWindow|null=null;
let compzTray:Tray|null=null;
let compzRoute:string|null;
let mmDDMenus:any={};
let mmDDXPos:any={wrap:{start:36,end:272},file:36,edit:73,tools:112,window:160,help:227};
let wCBox:any={left:0,right:0,top:0,bottom:0};
const mmZone=():any=>{const sP:Point=screen.getCursorScreenPoint();if(sP.x>=(wCBox.left+mmDDXPos.wrap.start)&&sP.x<=(wCBox.left+mmDDXPos.wrap.end)&&sP.y>=wCBox.top&&sP.y<=(wCBox.top+32)){return {z:true,p:sP}}else{return {z:false,p:null}}};
let mmDDOpen:string|null=null;
let mTrackInt:any;
let childWasOpen:boolean=false;
let myWinMode:'prod'|'dev'|'random'='dev';
let myClearDirsMode:boolean=true;
let cWinOpts:Electron.BrowserWindowConstructorOptions={x:0,y:0,width:0,height:0,transparent:true,frame:false,icon:path.join(__dirname,'../dist/assets/icons/favicon.png'),titleBarStyle:'hidden',webPreferences:{nodeIntegration:true,nodeIntegrationInWorker:true,nodeIntegrationInSubFrames:true,webSecurity:false,allowRunningInsecureContent:true,webgl:true,plugins:true,backgroundThrottling:false,sandbox:false,contextIsolation:false,spellcheck:false}};
let devAppArea:any={x:0,y:0,width:0,height:0};
let prodAppArea:any={x:0,y:0,width:0,height:0};
let randomAppArea:any={x:0,y:0,width:0,height:0};
let scsActive:boolean=false;
let gpuInfo:any=null;
let userIPRegLang:any=null;
const devEditArea:any={x:0,y:0,width:2060,height:1400};
/////////////////////////////////////////////////////////
// DEV/TROUBLESHOOTING/CONSOLE
/////////////////////////////////////////////////////////
const evCons=(evSource:'a'|'w'|'d',evName:string,evOb?:any)=>{let sTxt:string='',sIco:string='';if(evSource==='a'){sTxt='App';sIco='🧮'}else if(evSource==='w'){sTxt='Window';sIco='🥛'}else{sTxt='DevTools';sIco='🛠️'};console.log('⚗️ [main|'+sTxt+' Event] - '+evName.toUpperCase());if(evOb){console.log(evOb)}};
const udAppSB=(t:string)=>{compzWin.webContents.send('update-sb',[t])};
let appConsReady:boolean=false;
const appCons=(m:any)=>{let aCMsgOpts:any={msg:m,type:typeof m};typeof m==='string'?aCMsgOpts.msg='⚗️ [main|console.log] '+m:aCMsgOpts.msg=m;if(appConsReady&&compzWin!==null){compzWin.webContents.send('appCons',[aCMsgOpts])}else{console.log(aCMsgOpts.msg)}};
const onCxtCCons=()=>{
  console.log('appContextSection: '+appContextSection+',homeContextSection: '+homeContextSection+',homeContextArea: '+homeContextArea);
  console.log('feContextFile: '+feContextFile);
  console.log('plContextFile: '+plContextFile);
  console.log('pjContextFile: '+pjContextFile);
  console.log('playerFileLoaded: '+playerFileLoaded);
  console.log('editorFile: '+editorFile)
};
/////////////////////////////////////////////////////////
// GET/TEST UTILITY VARS & FNS
/////////////////////////////////////////////////////////
let fileRWInProg:boolean=false;
const allPsV=async(pO:any):Promise<boolean>=>{
  let allV:boolean=true;
  for(const p of Object.values(pO)){
    console.log(p);
    if(p===null){allV=false;console.log(p+' = null')}
    else{
      if(typeof p==='string'){
        const exist:boolean=await exists(p);
        if(!exist){allV=false};
        console.log(p+' exists: '+String(exist));
      }else if(typeof p==='object'){
        for(const p2 of Object.values(p)){
          if(p2===null){allV=false;console.log(p2+' = null')}
          else{
            if(typeof p2==='string'){
              const exist2:boolean=await exists(p2);
              if(!exist2){allV=false};
              console.log(p2+' exists: '+String(exist2));
            }
          }
        }
      }
    }
  };
  return Promise.resolve(allV);
};
const exists=async(path:string):Promise<boolean>=>{try{await access(path);return true}catch{return false}};
const isJSON=(data:any):Promise<boolean>=>{if(typeof data!=='string')return Promise.resolve(false);try{const result=JSON.parse(data);const type=Object.prototype.toString.call(result);return Promise.resolve(type==='[object Object]'||type==='[object Array]');}catch(err){return Promise.resolve(false)}};
function isDiff(newObject:any,oldObject:any):any{function changes(object:any,base:any){return _.transform(object,function(result:any,value:any,key:any){if(!_.isEqual(value,base[key])){result[key]=(_.isObject(value)&&_.isObject(base[key]))?changes(value,base[key]):value}})};const diffRes:object=changes(newObject,oldObject);if(_.isEmpty(diffRes)){return {r:false}}else{return {r:true,d:diffRes}}};
const icoP=(p:string):string=>{return path.join(__dirname,'../dist/'+p)};
/////////////////////////////////////////////////////////
// PATHS VARIABLES & FNS
/////////////////////////////////////////////////////////
let compzAppPaths:AppPaths|null=null;
let defaultProject:AppProject|null=null;
let userProjects:AppProject[]|null=null;
let currentProject:AppProject|null=null;
/////////////////////////////////////////////////////////
// CONTEXT MENU GVARS
/////////////////////////////////////////////////////////
let mainCMIsOpen:boolean=false;
let fileExplorerIsOpen:boolean|null=null;
let cmOpts:object|null=null;
let appContextSection:string|null=null;
let homeContextSection:string|null;
let homeContextArea:string|null;
let feContextFile:any|null=null;
let plContextFile:any|null=null;
let pjContextFile:any|null=null;
let playerFileLoaded:any|null=null;
let plMarkedFiles:any|null=null;
let editorFile:any|null=null;
let editorShouldSave:boolean|null=null;
/////////////////////////////////////////////////////////
// WIN/APP CTRL
/////////////////////////////////////////////////////////
const winCtrl=(action:string)=>{
  if(!app||!compzWin){return}else{
    if(action==='quit'||action==='close'){app.quit()}
    else if(action==='hide'||action==='tray'){compzWin.hide()}
    else if(action==='show'){compzWin.show()}
    else if(action==='min'){if(compzWin.isMinimizable&&!compzWin.isMinimized()){compzWin.minimize()}}
    else if(action==='max'){if(compzWin.isMaximizable&&!compzWin.isMaximized()){compzWin.maximize()}}
    else if(action==='restore'){
      if(myWinMode==='prod'){compzWin.setBounds(prodAppArea)}
      else if(myWinMode==='dev'){compzWin.setBounds(devAppArea)}
      else if(myWinMode==='random'){compzWin.setBounds(randomAppArea)}
    }
  }
};
/////////////////////////////////////////////////////////
// MAIN APP MENU
/////////////////////////////////////////////////////////
function mmDDFn(ddName:string,fnName:string,data?:any){
  appCons('(mmDDFn) '+ddName+' > '+fnName);
  let ddData:any|null=null;if(data){ddData=data};
  compzWin.webContents.send('mm-dd-fn',[ddName,fnName,ddData]);
}
//-------------------------------------------------------
const isPLoaded=():boolean=>{if(currentProject!==null&&currentProject&&typeof currentProject==='object'){return true}else{return false}};
const isFEOpen=():boolean=>{return fileExplorerIsOpen};
//-------------------------------------------------------
function mmDDOpts(ddName:string):MenuItemConstructorOptions[]{
  const mmDDOptObjs:any={
    file:<MenuItemConstructorOptions[]>[
      {type:'separator'},
        {label:'New Project',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-newblankproject-ico.png'),accelerator:'Ctrl+N',click:()=>{mmDDFn('file','newblankproject',null)}},
        {label:'Import Project',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-importproject-ico.png'),accelerator:'Ctrl+Alt+N',click:()=>{mmDDFn('file','importproject',null)}},
      {type:'separator'},
        {label:'Open Project',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-openproject-ico.png'),accelerator:'Ctrl+O',click:()=>{mmDDFn('file','openproject',null)}},
        {label:'Open Playlist',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-openplaylist-ico.png'),accelerator:'Ctrl+Shift+O',click:()=>{mmDDFn('file','openplaylist',null)}},
        {label:'Open File',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-openfile-ico.png'),accelerator:'Ctrl+Shift+Alt+O',click:()=>{mmDDFn('file','openfile',null)}},
      {type:'separator'},
      {label:'Find/Sync Media',visible:true,enabled:isPLoaded(),type:'submenu',icon:icoP('assets/compz-mmdd-file-findsyncmedia-ico.png'),submenu:
        [
          {label:'All Files',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-findsyncmedia-all-ico.png'),click:()=>{mmDDFn('file','findsyncmedia-all',null)}},
          {label:'Audio Files',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-findsyncmedia-audio-ico.png'),click:()=>{mmDDFn('file','findsyncmedia-audio',null)}},
          {label:'Subtitle Files',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-findsyncmedia-subs-ico.png'),click:()=>{mmDDFn('file','findsyncmedia-subs',null)}},
          {label:'Video Files',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-findsyncmedia-video-ico.png'),click:()=>{mmDDFn('file','findsyncmedia-video',null)}}
        ]
      },
      {type:'separator'},
        {label:'Save',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-save-ico.png'),accelerator:'Ctrl+S',click:()=>{mmDDFn('file','save',null)}},
        {label:'Save As...',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-saveas-ico.png'),accelerator:'Ctrl+Shift+S',click:()=>{mmDDFn('file','saveas',null)}},
        {label:'Export Project',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-export-ico.png'),accelerator:'Ctrl+Shift+E',click:()=>{mmDDFn('file','exportproject',null)}},
      {type:'separator'},
      {label:'Preferences',visible:true,enabled:true,type:'submenu',icon:icoP('assets/compz-mmdd-file-preferences-ico.png'),submenu:
        [
          {label:'General Settings',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-generalsettings-ico.png'),accelerator:'Ctrl+,',click:()=>{mmDDFn('file','preferences-generalsettings',null)}},
          {label:'Manage Media Folders',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-managemediafolders-ico.png'),accelerator:'Ctrl+.',click:()=>{mmDDFn('file','preferences-managemediafolders',null)}},
          {label:'Add/Remove File Types',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-addremovefiletypes-ico.png'),click:()=>{mmDDFn('file','preferences-addremovefiletypes',null)}},
          {label:'Clear Cache',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-file-purgecache.png'),click:()=>{mmDDFn('file','preferences-clearcache',null)}},
        ]
      },
      {type:'separator'},
        {label:'Close Project',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-closeproject.png'),accelerator:'Ctrl+F4',click:()=>{mmDDFn('file','closeproject',null)}},
        {label:'Close Playlist',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-closeplaylist.png'),accelerator:'Ctrl+Shift+F4',click:()=>{mmDDFn('file','closeplaylist',null)}},
        {label:'Close File',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-file-closefile.png'),accelerator:'Ctrl+Shift+Alt+F4',click:()=>{mmDDFn('file','closefile',null)}},
      {type:'separator'},
        {label:'Exit',visible:true,icon:icoP('assets/cm-compz-win-exit-ico.png'),type:'normal',click:()=>{winCtrl('quit')}}
    ],
    edit:<MenuItemConstructorOptions[]>[
      {label:'Undo',role:'undo',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-edit-undo-ico.png')},
      {label:'Redo',role:'redo',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/compz-mmdd-edit-redo-ico.png')},
      {type:'separator'},
      {label:'Cut',role:'cut',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/cm-edit-cut-ico.png')},
      {label:'Copy',role:'copy',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/cm-edit-copy-ico.png')},
      {label:'Paste',role:'paste',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/cm-edit-paste-ico.png')},
      {label:'Select All',role:'selectAll',visible:true,enabled:isPLoaded(),type:'normal',icon:icoP('assets/cm-edit-selectall-ico.png')}
    ],
    tools:<MenuItemConstructorOptions[]>[
      {label:'File Explorer',visible:true,enabled:isPLoaded(),type:'checkbox',checked:isFEOpen(),accelerator:'Ctrl+F',click:()=>{
        let newState:boolean|null=null;isFEOpen()?newState=false:newState=true;
        compzWin.webContents.send('sc-fe-toggle',[newState]);
      }},
      {label:'Playback',visible:true,enabled:isPLoaded(),icon:icoP('assets/compz-mmdd-tools-playback-ico.png'),type:'submenu',submenu:
        [
          {label:'Manage Playlists',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-manageplaylists-ico.png'),click:()=>{}},
          {label:'MMPEG Settings',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-mmpegsettings-ico.png'),click:()=>{}},
          {label:'Volume Settings',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-volumesettings-ico.png'),click:()=>{}},
        ]
      },
      {label:'Editing',visible:true,enabled:isPLoaded(),icon:icoP('assets/compz-mmdd-tools-editing-ico.png'),type:'submenu',submenu:
        [
          {label:'Preview Quality',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-previewquality-ico.png'),click:()=>{}},
          {label:'Subtitle Editors',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-subtitleeditors-ico.png'),click:()=>{}},
          {label:'System A/V Settings',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-systemav-ico.png'),click:()=>{}},
        ]
      },
      {label:'Scraping',visible:true,enabled:isPLoaded(),icon:icoP('assets/compz-mmdd-tools-scraping-ico.png'),type:'submenu',submenu:
        [
          {label:'Manage Sources',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-managesources-ico.png'),click:()=>{}},
          {label:'Data/Time Limits',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-datatimelimits-ico.png'),click:()=>{}},
          {label:'Tree/Level Depths',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-tools-treeleveldepth-ico.png'),click:()=>{}},
        ]
      },
      {type:'separator'},
      {label:'Manage Plugins',visible:true,enabled:true,icon:icoP('assets/compz-mmdd-tools-manageplugins-ico.png'),type:'normal',click:()=>{}},
    ],
    window:<MenuItemConstructorOptions[]>[
      {label:'Maximize Window',visible:true,enabled:true,icon:icoP('assets/cm-compz-win-max-ico.png'),type:'normal',click:()=>{winCtrl('max')}},
      {label:'Minimize Window',visible:true,enabled:true,icon:icoP('assets/cm-compz-win-min-ico.png'),type:'normal',click:()=>{winCtrl('min')}},
      {label:'Reset Window',visible:true,enabled:true,icon:icoP('assets/cm-compz-win-reset-ico.png'),type:'normal',click:()=>{winCtrl('restore')}},
      {label:'Hide in Tray',visible:true,enabled:true,icon:icoP('assets/cm-compz-win-hide-ico.png'),type:'normal',click:()=>{winCtrl('tray')}},
      {label:'Reload App',visible:true,enabled:true,icon:icoP('assets/cm-compz-win-reload-ico.png'),role:'forceReload',type:'normal'},
      {type:'separator'},
      {label:'Zoom Level',role:'zoom',visible:true,enabled:true,icon:icoP('assets/compz-mmdd-window-zoomlevel-ico.png')},
      {label:'Reset Zoom',role:'resetZoom',visible:true,enabled:true,icon:icoP('assets/compz-mmdd-window-reset-zoom-ico.png')},
      {label:'Zoom In',role:'zoomIn',visible:true,enabled:true,icon:icoP('assets/compz-mmdd-window-reset-zoom-in.png')},
      {label:'Zoom Out',role:'zoomOut',visible:true,enabled:true,icon:icoP('assets/compz-mmdd-window-reset-zoom-out.png')}
    ],
    help:<MenuItemConstructorOptions[]>[
      {label:'Open DevTools',role:'toggleDevTools',icon:icoP('assets/compz-mmdd-help-devtools-ico.png')},
      {label:'View Processes',role:'toggleDevTools',icon:icoP('assets/compz-mmdd-help-viewprocesses-ico.png')},
      {type:'separator'},
      {label:'Check for Updates...',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-help-updates-ico.png'),click:()=>{}},
      {type:'separator'},
      {label:'About Comp0Z1te',visible:true,enabled:true,type:'normal',icon:icoP('assets/compz-mmdd-help-about-ico.png'),role:'about'}
    ]
  };
  const resMMDDOpts:MenuItemConstructorOptions[]=mmDDOptObjs[ddName];
  return resMMDDOpts;
}
//-------------------------------------------------------
/////////////////////////////////////////////////////////
// CONTEXT MENU
/////////////////////////////////////////////////////////
const capd=(s:string):string=>{if(s){return s.charAt(0).toUpperCase()+s.slice(1)}else{return ''}};
const acsIsVis=(aCSName:string):boolean=>{if(aCSName==='dev'){if(myWinMode==='dev'||myWinMode==='random'){return true}else{return false}}else{if(appContextSection===aCSName){return true}else{return false}}};
const hcsIsVis=(hCSName:string):boolean=>{if(homeContextSection===hCSName){return true}else{return false}};
const hcaIsVis=(hCAName:string):boolean=>{if(homeContextArea===hCAName){return true}else{return false}};
const feFile=():any=>{if(feContextFile&&feContextFile!==null){return feContextFile}else{return {}}};
const feFileName=():string=>{let fName:string='';if(acsIsVis('mscwappfileexplorer')){fName=feContextFile.name};return fName};
const feFilePath=():string=>{let fPath:string='';if(acsIsVis('mscwappfileexplorer')){fPath=feContextFile.path};return fPath};
const feFileType=():string=>{let fType:string='';if(acsIsVis('mscwappfileexplorer')){fType=feContextFile.type};return fType};
const feBDir=():any=>{let bdObj:any={lc:'',capd:''};if(acsIsVis('mscwappfileexplorer')){bdObj.lc=feContextFile.path.split('/')[1];bdObj.capd=capd(bdObj.lc)};return bdObj};
const feASV=():string=>{let asvRes:string='';const bMs:string[]=['audio','subs','video'],mBDStr:string=feContextFile.path.replace(path.join(currentProject.projectDirPath,'media/'),'').split('\\')[0];if(bMs.includes(mBDStr)){asvRes=mBDStr};return asvRes};
const feFileLabels=():any=>{let fLs:any={ftype:'',fname:''},sNCharLimit:number=0,sNSuffix:string='';if(!acsIsVis('mscwappfileexplorer')||!feContextFile){return fLs}else{if(feContextFile.type==='directory'){fLs.ftype='Folder';sNCharLimit=13;sNSuffix='/*)'}else{fLs.ftype='File';sNCharLimit=15;sNSuffix=')'};feContextFile.name.length>sNCharLimit?fLs.fname='('+feContextFile.name.substring(0,10)+'...'+sNSuffix:fLs.fname='('+feContextFile.name+sNSuffix;return fLs}};
const plFile=():any=>{if(plContextFile){return plContextFile}else{return {}}};
const plFileType=():string=>{if(acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList')&&plContextFile){return plContextFile.type}else{return ''}};
const plCanMark=():boolean=>{if(!plContextFile){return false}else{if(!plMarkedFiles){return true}else{if(plMarkedFiles.hasOwnProperty(plContextFile.path)){if(!plMarkedFiles[plContextFile.path]){return true}else{return false}}else{return true}}}};
const plCanUnMark=():boolean=>{if(!plContextFile){return false}else{if(!plMarkedFiles){return false}else{if(plMarkedFiles.hasOwnProperty(plContextFile.path)){if(!plMarkedFiles[plContextFile.path]){return false}else{return true}}else{return false}}}};
const plFileLabels=():any=>{let fLs:any={ftype:'',fname:''},sNCharLimit:number=0,sNSuffix:string='';if(!acsIsVis('mscwapphome')||!hcsIsVis('hcsPlayer')||!hcaIsVis('hcaPlayList')||!plContextFile){return fLs}else{if(plContextFile.type==='directory'){fLs.ftype='Folder';sNCharLimit=13;sNSuffix='/*)'}else{fLs.ftype='File';sNCharLimit=15;sNSuffix=')'};plContextFile.name.length>sNCharLimit?fLs.fname='('+plContextFile.name.substring(0,20)+'...'+sNSuffix:fLs.fname='('+plContextFile.name+sNSuffix;return fLs}};
const plyrFileIsLoaded=():boolean=>{if(playerFileLoaded!==null&&!_.isEmpty(playerFileLoaded)){return true}else{return false}};
const plyrFile=():any=>{if(playerFileLoaded){return playerFileLoaded}else{return {}}};
const plyrFileLabel=():string=>{let fname:string='',sNCharLimit:number=0,sNSuffix:string='';if(!acsIsVis('mscwapphome')||!hcsIsVis('hcsPlayer')||!hcaIsVis('hcaPlayTrackHeader')||!playerFileLoaded){return fname}else{sNCharLimit=25;sNSuffix=')';playerFileLoaded.name.length>sNCharLimit?fname='('+playerFileLoaded.name.substring(0,20)+'...'+sNSuffix:fname='('+playerFileLoaded.name+sNSuffix;return fname}};
const pjFileExplDir=():string=>{let pjdPath:string=path.join(app.getPath('documents'),'compzProjects');if(pjContextFile&&pjContextFile.hasOwnProperty('projectDirPath')&&pjContextFile.projectDirPath&&(exists(pjContextFile.projectDirPath))){pjdPath=pjContextFile.projectDirPath};return pjdPath};
const pjFileName=():string=>{let fName:string='';if(pjContextFile&&pjContextFile.hasOwnProperty('projectName')){fName=pjContextFile.projectName};return fName};
const pjProjectObj=():AppProject=>{if(pjContextFile){return pjContextFile}else{return {projectName:'',projectDirPath:'',projectPrefsPath:'',projectLastMod:0}}};
const pjFolderPath=():string=>{let pPath:string='';if(pjContextFile&&pjContextFile.hasOwnProperty('projectName')){pPath=path.basename(pjContextFile.projectDirPath)};return pPath};
const cmBuild=():Promise<boolean>=>{
  let baseCMOpts:any={showLookUpSelection:false,showSearchWithGoogle:false,showCopyImage:false,showCopyImageAddress:false,showSaveImage:false,showSaveImageAs:false,showSaveLinkAs:false,showInspectElement:false,showServices:false,
  prepend:(dA,ps,bW,e)=>
    [
      // DevItems /////////////////////////////////////////////////////////
      {label:'Development',visible:acsIsVis('dev'),icon:icoP('assets/cm-dev-ico.png'),type:'submenu',submenu:
        [
          {label:'Show DActions',visible:acsIsVis('dev'),enabled:true,type:'normal',icon:icoP('assets/cm-fe-duplicate-ico.png'),click:()=>{console.log(dA)}},
          {label:'Show Params',visible:acsIsVis('dev'),type:'normal',click:()=>{console.log(ps)}},
          {label:'Show BWindow',visible:acsIsVis('dev'),type:'normal',click:()=>{console.log(bW)}},
          {label:'Show Event',visible:acsIsVis('dev'),type:'normal',click:()=>{console.log(e)}}
        ]
      },
      // TitleBarContext //////////////////////////////////////////////////
      {type:'separator',visible:acsIsVis('mscwapptitlebar')},
      // FEContext ////////////////////////////////////////////////////////
      {type:'separator',visible:acsIsVis('mscwappfileexplorer')},
      {label:'View in Explorer',visible:acsIsVis('mscwappfileexplorer'),icon:icoP('assets/cm-fe-reveal-ico.png'),type:'normal',click:()=>{shell.showItemInFolder(compzAppPaths.app+'\\'+feFile().path.replace(/\//g,'\\'))}},
      {label:'Add '+feFileLabels().ftype+' '+feFileLabels().fname+' to Player/list',visible:acsIsVis('mscwappfileexplorer')&&feASV()!=='subs',enabled:true,icon:icoP('assets/cm-fe-load-player-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-add2playlist',[feFile()])}},
      {label:'Duplicate '+feFileLabels().ftype+' '+feFileLabels().fname,visible:acsIsVis('mscwappfileexplorer'),enabled:(feFileType()==='file'),icon:icoP('assets/cm-fe-duplicate-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-duplicate',feContextFile)}},
      {label:'Delete '+feFileLabels().ftype+' '+feFileLabels().fname,visible:acsIsVis('mscwappfileexplorer'),icon:icoP('assets/cm-fe-delete-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-delete',{type:feFileType(),bdir:feBDir().lc,path:feFilePath()})}},
      {label:'Rename '+feFileLabels().ftype+' '+feFileLabels().fname,visible:acsIsVis('mscwappfileexplorer'),icon:icoP('assets/cm-fe-rename-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-togglerename',{bdir:feBDir().lc,path:feFilePath(),name:feFileName()})}},
      {label:'Clear Folder '+feFileLabels().fname,visible:acsIsVis('mscwappfileexplorer')&&feFileLabels().ftype==='Folder',icon:icoP('assets/cm-fe-cleardir-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-cleardir',{bdir:feBDir().lc,path:feFilePath()})}},
      {label:'Refresh/Sync '+feBDir().capd+' Files',visible:acsIsVis('mscwappfileexplorer'),icon:icoP('assets/cm-fe-refresh-folder-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-sync',[feBDir().lc])}},
      {label:'Refresh/Sync All Files',visible:acsIsVis('mscwappfileexplorer'),icon:icoP('assets/cm-fe-refresh-all-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-fe-sync',['audio','subs','video'])}},
      // Launcher //////////////////////////////////////////////////////////
        {type:'separator',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsLauncher')},
        {label:'Explore Folder: ../'+pjFolderPath(),visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsLauncher')&&hcaIsVis('hcaProjectList'),enabled:true,icon:icoP('assets/cm-fe-reveal-ico.png'),type:'normal',click:()=>{shell.showItemInFolder((pjFileExplDir()))}},
        {label:'Delete '+pjFileName(),visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsLauncher')&&hcaIsVis('hcaProjectList'),enabled:true,icon:icoP('assets/cm-fe-delete-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('launch-cm-projectlist-delete',[pjFileName()])}},
        {label:'Duplicate '+pjFileName(),visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsLauncher')&&hcaIsVis('hcaProjectList'),enabled:true,icon:icoP('assets/cm-launcher-projectlist-duplicate-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('launch-cm-projectlist-duplicate',[pjFileName()])}},
        {label:'Export '+pjFileName(),visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsLauncher')&&hcaIsVis('hcaProjectList'),enabled:true,icon:icoP('assets/compz-mmdd-file-export-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('launch-cm-projectlist-export',[pjProjectObj()])}},
        {label:'Rename '+pjFileName(),visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsLauncher')&&hcaIsVis('hcaProjectList'),enabled:true,icon:icoP('assets/cm-fe-rename-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('launch-cm-projectlist-rename',[pjProjectObj()])}},
      // HomeContext ///////////////////////////////////////////////////////
        // Player ------------------------------
          {type:'separator',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')},
          // >>> PlayList
          {label:'Edit '+plFileLabels().ftype+' '+plFileLabels().fname,visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),enabled:(plFileType()==='file'),icon:icoP('assets/cm-fe-load-editor-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-edit',['home','hcsPlayer','hcaPlayList','edit',plFile()])}},
          {label:'Rename '+plFileLabels().ftype+' '+plFileLabels().fname,visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),enabled:(plFileType()==='file'),icon:icoP('assets/cm-fe-rename-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-rename',['home','hcsPlayer','hcaPlayList','rename',plFile()])}},
          {label:'Remove '+plFileLabels().ftype+' '+plFileLabels().fname,visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),enabled:(plFileType()==='file'),icon:icoP('assets/cm-home-player-playlist-remove-item-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-remove',['home','hcsPlayer','hcaPlayList','remove',plFile()])}},
          {label:'View Info '+plFileLabels().fname,visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),enabled:(plFileType()==='file'),icon:icoP('assets/cm-home-player-playlist-viewinfo-item-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-viewinfo',['home','hcsPlayer','hcaPlayList','viewinfo',plFile()])}},
          {label:'Mark '+plFileLabels().fname,visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),enabled:plCanMark(),icon:icoP('assets/cm-home-player-playlist-mark-item-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-mark',['home','hcsPlayer','hcaPlayList','mark',plFile()])}},
          {label:'Unmark '+plFileLabels().fname,visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),enabled:plCanUnMark(),icon:icoP('assets/cm-home-player-playlist-unmark-item-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-mark',['home','hcsPlayer','hcaPlayList','unmark',plFile()])}},
          {label:'Clear List',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayList'),icon:icoP('assets/cm-home-player-playlist-clearall-item-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-clearall',['home','hcsPlayer','hcaPlayList','clearall'])}},
          // >>> Equaliser
          {label:'Equaliser Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayEqualiser'),type:'normal',click:()=>{console.log('Home > Equaliser')}},
          // >>> TrackHeader
          {label:'View Info '+plyrFileLabel(),visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayTrackHeader')&&plyrFileIsLoaded(),enabled:true,icon:icoP('assets/cm-home-player-playlist-viewinfo-item-ico.png'),type:'normal',click:()=>{compzWin.webContents.send('cm-player-playlist-viewinfo',['home','hcsPlayer','hcaPlayTrackHeader','viewinfo',plyrFile()])}},
          // >>> Vis Area
          {label:'Media Vis Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayVis'),type:'normal',click:()=>{console.log('Home > Media Vis')}},
          // >>> TrackProgress
          {label:'ProgressBar Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayProgressBar'),type:'normal',click:()=>{console.log('Home > Progress Bar')}},
          // >>> PlayerStatusBox
          {label:'hcaPlayStatus Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayStatus'),type:'normal',click:()=>{console.log('Home > Play Status')}},
          // >>> PlayerActionBtns
          {label:'PlayerCtrlBtns Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayerCtrlBtns'),type:'normal',click:()=>{console.log('Home > Play Ctrl Btns')}},
          // >>> PlayerVolume
          {label:'hcaPlayerVolCtrl Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('hcsPlayer')&&hcaIsVis('hcaPlayerVolCtrl'),type:'normal',click:()=>{console.log('Home > Play Ctrl Btns')}},
        // Editor ------------------------------
          {type:'separator',visible:acsIsVis('mscwapphome')&&hcsIsVis('editor')},
          {label:'Editor Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('editor'),type:'normal',click:()=>{console.log('Home > Action #2')}},
        // Scraper -----------------------------
      {type:'separator',visible:acsIsVis('mscwapphome')&&hcsIsVis('scraper')},
      {label:'Scraper Action',visible:acsIsVis('mscwapphome')&&hcsIsVis('scraper'),type:'normal',click:()=>{console.log('Home > Action #1')}},
      // StatusBarContext //////////////////////////////////////////////////
      {type:'separator',visible:acsIsVis('mscwappstatusbar')},
      {label:'StatusBar Action #1',visible:acsIsVis('mscwappstatusbar'),type:'normal',click:()=>{console.log('StatusBar > Action #1')}},
      {label:'StatusBar Action #2',visible:acsIsVis('mscwappstatusbar'),type:'normal',click:()=>{console.log('StatusBar > Action #2')}},
      // StandardEditing //////////////////////////////////////////////////
      {type:'separator',visible:true},
      {label:'Copy',visible:true,enabled:ps.selectionText.trim().length>0&&ps.editFlags.canCopy,icon:icoP('assets/cm-edit-copy-ico.png'),role:'copy',type:'normal'},
      {label:'Cut',visible:true,enabled:ps.selectionText.trim().length>0&&ps.editFlags.canCut,icon:icoP('assets/cm-edit-cut-ico.png'),role:'cut',type:'normal'},
      {label:'Paste',visible:true,enabled:ps.editFlags.canPaste,icon:icoP('assets/cm-edit-paste-ico.png'),role:'paste',type:'normal'},
      {label:'Select All',visible:true,enabled:ps.editFlags.canSelectAll,icon:icoP('assets/cm-edit-selectall-ico.png'),role:'selectAll',type:'normal'},
      // WinControl ////////////////////////////////////////////////////////
      {type:'separator',visible:true},
      {label:'comp0Z1te',visible:true,icon:icoP('assets/cm-compz-ico.png'),type:'submenu',submenu:
        [
          {label:'Maximize Window',visible:true,icon:icoP('assets/cm-compz-win-max-ico.png'),type:'normal',click:()=>{winCtrl('max')}},
          {label:'Minimize Window',visible:true,icon:icoP('assets/cm-compz-win-min-ico.png'),type:'normal',click:()=>{winCtrl('min')}},
          {label:'Reset Window',visible:true,icon:icoP('assets/cm-compz-win-reset-ico.png'),type:'normal',click:()=>{winCtrl('restore')}},
          {label:'Hide in Tray',visible:true,icon:icoP('assets/cm-compz-win-hide-ico.png'),type:'normal',click:()=>{winCtrl('tray')}},
          {label:'Reload App',visible:true,icon:icoP('assets/cm-compz-win-reload-ico.png'),role:'forceReload',type:'normal'},
          {label:'Exit App',visible:true,icon:icoP('assets/cm-compz-win-exit-ico.png'),type:'normal',click:()=>{winCtrl('quit')}}
        ]
      }
    ]
  };
  cmOpts=baseCMOpts;
  return Promise.resolve(true);
};
/////////////////////////////////////////////////////////
async function clearAppDirs():Promise<boolean>{
  const appDataDir:string=path.relative(__dirname,app.getPath('userData'));
  const absolProjDir:string=path.join(app.getPath('documents'),'compzProjects');
  const appProjsDir:string=path.relative(__dirname,absolProjDir);
  del.sync([path.posix.join(appDataDir,'/*/'),path.posix.join('!',appDataDir,'Session Storage')],{force:true});
  del.sync(appProjsDir,{force:true});
  return Promise.resolve(true);
}
/////////////////////////////////////////////////////////
async function initNetIPRegion():Promise<boolean>{
  let ipaD:any,gotData:boolean,ptys:string[]=['ip','city','region','region_code','country','country_code','languages'],ipRegLang:any={};
  if(!userIPRegLang){
    return new Promise((resolve)=>{
      const ipa=spawn('curl',['https://ipapi.co/json/']);
      ipa.stdout.on('data',(data)=>{let ipdRaw:Buffer=Buffer.from(data),json:any=decoder.write(ipdRaw),ipdObj:any=JSON.parse(json);ipaD=ipdObj;gotData=true});
      ipa.stderr.on('end',()=>{if(gotData){for(let i=0;i<ptys.length;i++){ipaD[ptys[i]]?ipRegLang[ptys[i]]=ipaD[ptys[i]]:ipaD[ptys[i]]=null};userIPRegLang=ipRegLang;resolve(true)}else{resolve(false)}});
      ipa.on('close',code=>{if(code!==0){console.log('Error Code: '+code)}});
      ipa.on('error',error=>{console.log('IPA|ERROR: '+error.name+': '+error.message)});
    });
  }
}
/////////////////////////////////////////////////////////
async function initCompz():Promise<boolean>{
  if(!compzWin){
    initNetIPRegion();
    await initPathChecks();
    await initDisplay();
    await createWindow();
  };
  return Promise.resolve(true)
}
/////////////////////////////////////////////////////////
app.disableHardwareAcceleration();
if(!gpuInfo){gpuInfo=app.getGPUInfo('basic')};
app.on('ready',async()=>{await initCompz();evCons('a','ready')});
app.on('browser-window-focus',()=>{evCons('a','browser-window-focus')});
app.on('browser-window-blur',()=>{evCons('a','browser-window-blur')});
app.on('web-contents-created',()=>{evCons('a','web-contents-created')});
app.on('gpu-info-update',()=>{evCons('a','gpu-info-update')});
app.on('open-file',(e)=>{e.preventDefault();evCons('a','open-file',e)});
app.on('did-become-active',()=>{evCons('a','did-become-active');scs(true)});
app.on('window-all-closed',async()=>{evCons('a','window-all-closed');if(myClearDirsMode){await clearAppDirs()};app.exit()});
app.on('will-quit',async()=>{evCons('a','will-quit');scs(false);if(myClearDirsMode){await clearAppDirs()}});
app.on('before-quit',async(e)=>{evCons('a','before-quit');
  e.preventDefault();
  compzWin.webContents.send('app-will-quit');
  const qSave=async():Promise<string>=>{return Promise.resolve((await doDialog('msgbox',['saveQuestion',editorFile])))};
  const qExitFn=async()=>{if((await doDialog('msgbox',['exitQuestion']))!=='cancel'){if(myClearDirsMode){await clearAppDirs()};app.exit()}else{udAppSB('Exit comp0Z1te: Canceled');if(childWasOpen){childWasOpen=false;childWinAction('create',null)}}};
  const waitSave=async():Promise<boolean>=>{let saveDoneFn:any;return new Promise((resolve)=>{saveDoneFn=()=>{resolve(true);ipcMain.removeListener('editorSaveDone',saveDoneFn)};ipcMain.on('editorSaveDone',saveDoneFn);compzWin.webContents.send('editorDoSaveClose')})};
  if(!editorFile||!editorShouldSave){qExitFn()}
  else{
    switch((await qSave())){
      case 'cancel':udAppSB('File Save ► Exit: Canceled');break;
      case 'no':if(myClearDirsMode){await clearAppDirs()};app.exit();break;
      default:await waitSave();if(myClearDirsMode){await clearAppDirs()};app.exit();break;
    }
  }
});
app.on('quit',async()=>{evCons('a','quit');scs(false);if(myClearDirsMode){await clearAppDirs()}});
/////////////////////////////////////////////////////////
// APP INITS
/////////////////////////////////////////////////////////
async function createWindow():Promise<boolean> {
  try{
    compzWin=new BrowserWindow(cWinOpts);
    let pathIndex='./index.html';if((await exists(path.join(__dirname,'../dist/index.html')))){pathIndex='../dist/index.html'};
    compzWin.loadURL(url.format({pathname:path.join(__dirname,pathIndex),protocol:'file:',slashes:true}));
    initialize();enable(compzWin.webContents);Store.initRenderer();
    if(!compzTray){await initTray()};
    if(!cmOpts){await cmBuild();contextMenu(cmOpts)}else{contextMenu(cmOpts)};
    scs(true);
    if(myWinMode==='dev'||myWinMode==='random'){
      if(!compzDevTools){
        await initUserPrefs();
        compzDevTools=new BrowserWindow;
        compzWin.webContents.setDevToolsWebContents(compzDevTools.webContents);
        compzWin.webContents.openDevTools({mode:'detach',activate:false});
        compzWin.webContents.once('did-finish-load',()=>{
          if(myWinMode==='dev'){compzDevTools.setPosition(375,115,false);compzDevTools.setSize(1460,900,false)}
          else if(myWinMode==='random'){compzDevTools.setPosition(175,105,false);compzDevTools.setSize(950,650,false)};
        });
        compzWin.webContents.on('devtools-closed',async()=>{evCons('d','devtools-closed');if(myClearDirsMode){await clearAppDirs()};app.exit()});
        compzWin.webContents.on('devtools-focused',()=>{evCons('d','devtools-focused');scs(false)});
        compzWin.webContents.on('before-input-event',(e:Electron.Event,input:Electron.Input)=>{if(input.type==='keyUp'&&input.key==='Alt'){e.preventDefault();if(e.defaultPrevented){mmDDFn('alt','ddaltsc','alt')}}});
      };
      compzWin.webContents.on('context-menu',()=>{onCxtCCons();mainCMIsOpen=true;compzWin.webContents.send('main-context-menu-open',[true]);evCons('w','context-menu')});
    };
    compzWin.on('focus',()=>{evCons('w','focus');scs(true)});
    compzWin.on('blur',()=>{evCons('w','blur');scs(false)});
    compzWin.on('closed',()=>{evCons('w','closed');if(compzWin){compzWin=null};scs(false)});
    setTimeout(async()=>{
      if(myWinMode==='prod'){compzWin.setBounds(prodAppArea)}
      else if(myWinMode==='dev'){compzWin.setBounds(devAppArea)}
      else if(myWinMode=='random'){compzWin.setBounds(randomAppArea)};
      compzWin.restore();compzWin.show();compzWin.focus();
    },400);
    return Promise.resolve(true)
  }catch(e){console.log('[app/main.ts|createWindow] ERROR: '+JSON.stringify(e));return Promise.resolve(false)}
};
//-------------------------------------------------------
async function childWinAction(action:string,data?:any):Promise<boolean>{
  const getCCWBounds=():any=>{let winOpts:any={x:cWinOpts.x,y:cWinOpts.y,width:cWinOpts.width,height:cWinOpts.height};const wBs:any=compzWin.getBounds();if(wBs&&!_.isEqual(wBs,winOpts)){winOpts=wBs};const cCBs:any={x:Math.round(winOpts.x+((winOpts.width-((winOpts.width*0.3)+0))/2)),y:Math.round(winOpts.y+((winOpts.height-((winOpts.height*0.3)+0))/2)),width:Math.round((winOpts.width*0.3)+0),height:Math.round((winOpts.height*0.3)+0)};return cCBs};
  switch(action){
    case 'create':
      if(compzChildWin===null){
        const cCBs:any=getCCWBounds();
        compzChildWin=new BrowserWindow({x:cCBs.x,y:cCBs.y,width:cCBs.width,height:cCBs.height,parent:compzWin,icon:path.join(__dirname,'../dist/assets/icons/favicon.png'),transparent:true,frame:false,titleBarStyle:'hidden',modal:true,show:false,movable:true,minimizable:true,maximizable:true,webPreferences:{nodeIntegration:true,contextIsolation:false,spellcheck:false}});
        if(compzChildWin.menuBarVisible){compzChildWin.removeMenu()};
        compzChildWin.loadFile((path.join(compzAppPaths.app,'launcher.html')));
        compzChildWin.once('ready-to-show',()=>{
          const nowBs:any=compzChildWin.getBounds(),getBs:any=getCCWBounds();if(!_.isEqual(nowBs,getBs)){compzChildWin.setBounds(getBs)};
          compzChildWin.webContents.send('childwin-data',['data']);
        });
        compzChildWin.webContents.openDevTools({mode:'detach',activate:false});
      };
      break;
    case 'close':if(compzChildWin!==null){if(!compzChildWin.isClosable){compzChildWin.setClosable(true)};compzChildWin.close()};break;
    case 'show':if(compzChildWin!==null){const scCWasVis:boolean=compzChildWin.isVisible();if(!scCWasVis){compzChildWin.show()}};break;
    case 'hide':if(compzChildWin!==null){const hcCWasVis:boolean=compzChildWin.isVisible();if(hcCWasVis){compzChildWin.hide()}};break;
    case 'bounds':if(compzChildWin!==null){const nowBs:any=compzChildWin.getBounds(),getBs:any=getCCWBounds();if(!_.isEqual(nowBs,getBs)){compzChildWin.setBounds(getBs)};break}
  };
  return Promise.resolve(true);
}
//-------------------------------------------------------
const initPathChecks=async():Promise<boolean>=>{
  const readF=async(p:string):Promise<any>=>{try{const rR:string=await readFile(p,{encoding:'utf-8'});if(rR&&(await isJSON(rR))){return Promise.resolve({r:true,d:JSON.parse(rR)})}else{return Promise.resolve({r:false})}}catch(e){console.log(e);return Promise.resolve({r:false})}};
  const writeF=async(p:string,d:any):Promise<boolean>=>{let fD:string='';typeof d!=='string'?fD=JSON.stringify(d):fD=d;try{await writeFile(p,fD,{encoding:'utf-8'});return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}};
  const mkPDirs=async(newPName:string):Promise<boolean>=>{
    const pPath:string=path.join(app.getPath('documents'),'compzProjects/'+capd(newPName.toLowerCase()));
    const pDirPs:string[]=['exports','playlists','media','media/audio','media/subs','media/video'];
    try{await mkdir(pPath,{recursive:true});for(let i=0;i<pDirPs.length;i++){await mkdir(path.join(pPath,pDirPs[i]))};return Promise.resolve(true)}catch{return Promise.resolve(false)}
  };
  const wPPrefsF=async(newPName:string):Promise<boolean>=>{const lcNewPName:string=newPName.toLowerCase(),capdNewPName:string=capd(lcNewPName),newPPrefsFPath:string=path.join(app.getPath('documents'),'compzProjects/'+capdNewPName+'/'+lcNewPName+'Prefs.json'),newPPrefsFData:string=JSON.stringify(defCompzProject);try{await writeFile(newPPrefsFPath,newPPrefsFData,{encoding:'utf-8'});return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}};
  const pathsFP:string=path.join(app.getPath('userData'),'compzPaths.json');
  console.log(pathsFP);
  if((await exists(pathsFP))){
    const rFRes:any=await readF(pathsFP);
    if(rFRes.r){
      const pathsObj:any=rFRes.d;
      console.log(JSON.stringify(pathsObj));
      if((await allPsV(pathsObj))){compzAppPaths=rFRes.d}
      else{console.log('Tested Invalid');compzAppPaths=null}
    }else{console.log('Read Paths File Failed');compzAppPaths=null}
  }else{console.log('Paths File Missing!');compzAppPaths=null};
  if(!compzAppPaths){
    let defCAPs:AppPaths=defCompzAppPaths;
    defCAPs.app=app.getAppPath();
    for(const k of Object.keys(defCAPs.binary)){
      let defP:string='';if(k.startsWith('ff')){defP=path.join(defCAPs.app,'binary/ffmpeg/bin/'+k+'.exe')}else{defP=path.join(defCAPs.app,'binary/youtube-dl/youtube-dl.exe')};
      if((await exists(defP))){defCAPs.binary[k]=defP}else{console.log('!!! MISSING BINARY - '+k+' - !!!')}
    };
    const uSPs:any[]=['appData','userData','desktop','documents','downloads'];
    for(let i=0;i<uSPs.length;i++){defCAPs[uSPs[i]]=app.getPath(uSPs[i])};
    compzAppPaths=defCAPs;if((await allPsV(defCAPs))){await writeF(pathsFP,defCAPs)}
  };
  if(!defaultProject||!userProjects){
    const cProjBDP:string=path.join(app.getPath('documents'),'compzProjects');
    if(!(await exists(cProjBDP))){
      const defPDirs:string[]=['default','meowcats123','spanishflea'];
      for(let i=0;i<defPDirs.length;i++){if((await mkPDirs(defPDirs[i]))){await wPPrefsF(defPDirs[i])}}
    };
    let projFilesRes:any={defaultProjectFile:null,userProjectFiles:[],ttlUPFs:0};
    for(let f of await readdir(cProjBDP,{withFileTypes:true})){
      if(f.isDirectory()){
        const aProjDirPath:string=path.join(cProjBDP,f.name),aProjLCName:string=f.name.toLowerCase();
        if((await readdir(aProjDirPath)).includes(aProjLCName+'Prefs.json')){
          const aProjPrefsPath:string=path.join(aProjDirPath,aProjLCName+'Prefs.json'),aProjDirPrefsStat:any=await stat(aProjPrefsPath);
          if(aProjDirPrefsStat&&aProjDirPrefsStat.size>0){
            let pfObj:any={projectName:aProjLCName,projectDirPath:aProjDirPath,projectPrefsPath:aProjPrefsPath,projectLastMod:0};
            pfObj.projectLastMod=Math.round(Math.max(...[aProjDirPrefsStat.atime,aProjDirPrefsStat.mtime,aProjDirPrefsStat.ctime])/1000);
            if(pfObj.projectName==='default'){projFilesRes.defaultProjectFile=pfObj}else{projFilesRes.userProjectFiles.push(pfObj);projFilesRes.ttlUPFs++}
          }
        }
      }
    };
    if(projFilesRes.ttlUPFs>0){projFilesRes.userProjectFiles=_.orderBy(projFilesRes.userProjectFiles,['projectLastMod'],['desc'])};
    if(!projFilesRes.defaultProjectFile){await mkPDirs('default');await wPPrefsF('default');projFilesRes.defaultProjectFile={projectName:'default',projectDirPath:path.join(app.getPath('documents'),'compzProjects/Default'),projectPrefsPath:path.join(app.getPath('documents'),'compzProjects/Default/defaultPrefs.json'),projectLastMod:Math.floor(Date.now()/1000)}};
    defaultProject=projFilesRes.defaultProjectFile;
    userProjects=projFilesRes.userProjectFiles;
  };
  ///// TEMP SUBS /////
 /*  if(!(await exists('C:\\Users\\PC\\Documents\\compzProjects\\Meowcats123\\scrapeTargets')&&(exists('C:\\Users\\PC\\SubBU\\scrapeTargets')))){
    await mkdir('C:\\Users\\PC\\Documents\\compzProjects\\Meowcats123\\scrapeTargets',{recursive:true});
    cp('C:\\Users\\PC\\SubBU\\scrapeTargets','C:\\Users\\PC\\Documents\\compzProjects\\Meowcats123\\scrapeTargets',{recursive:true},(err)=>{if(err){console.log(err)}});
  }; */
  /////
  return Promise.resolve(true);
}
//-------------------------------------------------------
const syncUProjects=async(returnData?:boolean):Promise<any>=>{
  const cProjBDP:string=path.join(app.getPath('documents'),'compzProjects');
  let userProjectFiles:AppProject[]=[],ttlUPFs:number=0;
  for(let f of await readdir(cProjBDP,{withFileTypes:true})){
    if(f.isDirectory()){
      const aProjDirPath:string=path.join(cProjBDP,f.name),aProjLCName:string=f.name.toLowerCase();
      if((await readdir(aProjDirPath)).includes(aProjLCName+'Prefs.json')){
        const aProjPrefsPath:string=path.join(aProjDirPath,aProjLCName+'Prefs.json'),aProjDirPrefsStat:any=await stat(aProjPrefsPath);
        if(aProjDirPrefsStat&&aProjDirPrefsStat.size>0){
          let pfObj:any={projectName:aProjLCName,projectDirPath:aProjDirPath,projectPrefsPath:aProjPrefsPath,projectLastMod:0};
          pfObj.projectLastMod=Math.round(Math.max(...[aProjDirPrefsStat.atime,aProjDirPrefsStat.mtime,aProjDirPrefsStat.ctime])/1000);
          if(pfObj.projectName!=='default'){userProjectFiles.push(pfObj);ttlUPFs++}
        }
      }
    }
  };
  if(ttlUPFs>0){userProjectFiles=_.orderBy(userProjectFiles,['projectLastMod'],['desc'])};
  userProjects=userProjectFiles;
  if(returnData&&returnData===true){return Promise.resolve(userProjectFiles)}
  else{return Promise.resolve(true)}
}
//-------------------------------------------------------
ipcMain.handle('manage-projects',async(e:any,args:any[])=>{
  const mPAction:string=args[0];let mPData:any|null=null;if(args[1]){mPData=args[1]};
  const mPRes:any=await manageProjects(mPAction,mPData);
  return mPRes;
});
const manageProjects=async(action:string,data?:any):Promise<any>=>{appCons('(manageProjects('+action+'))...');
  const aPDP:string=path.join(app.getPath('documents'),'compzProjects');
  const delPFiles=async(pName:string):Promise<{r:boolean,d:any}>=>{
    const capdPName:string=capd(pName),dPDPath:string=path.join(aPDP,capdPName);
    if(!(exists(dPDPath))){return Promise.resolve({r:false,d:'Project folder not found'})}
    else{
      try{await del.default(dPDPath,{force:true});return Promise.resolve({r:true,d:null})}
      catch{return Promise.resolve({r:false,d:'Unspecified Error'})}
    }
  };
  const mkPDirs=async(newPName:string):Promise<boolean>=>{
    const pPath:string=path.join(app.getPath('documents'),'compzProjects/'+capd(newPName.toLowerCase()));
    const pDirPs:string[]=['exports','playlists','media','media/audio','media/subs','media/video'];
    try{await mkdir(pPath,{recursive:true});for(let i=0;i<pDirPs.length;i++){await mkdir(path.join(pPath,pDirPs[i]))};return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}
  };
  const readPrefsF=async(ppath:string):Promise<any>=>{try{const rR:string=await readFile(ppath,{encoding:'utf-8'});if(rR&&(await isJSON(rR))){return Promise.resolve({r:true,d:JSON.parse(rR)})}else{return Promise.resolve({r:false})}}catch(e){console.log(e);return Promise.resolve({r:false})}};
  const wPPrefsF=async(newPName:string,newPPrefsPath:string|null):Promise<boolean>=>{
    const lcNewPName:string=newPName.toLowerCase(),capdNewPName:string=capd(lcNewPName),newPPrefsFPath:string=path.join(aPDP,capdNewPName+'/'+lcNewPName+'Prefs.json');
    let newPPrefsFData:string='';
    if(newPPrefsPath!==null){const rPFRes:any=await readPrefsF(newPPrefsPath);if(rPFRes.r){newPPrefsFData=JSON.stringify(rPFRes.d)}}
    else{newPPrefsFData=JSON.stringify(defCompzProject)};
    try{await writeFile(newPPrefsFPath,newPPrefsFData,{encoding:'utf-8'});return Promise.resolve(true)}
    catch(e){console.log(e);return Promise.resolve(false)}
  };
  const doCreateNP=async(projectName:string,usePrefsPath:string|null):Promise<boolean>=>{
    const npName:string=projectName;
    const npPrefsPth:string|null=usePrefsPath;
    const capdNPN:string=capd(npName);
    const nPDPath:string=path.join(aPDP,capdNPN);
    const nPPPath:string=path.join(aPDP,npName+'Prefs.json');
    if(!(await exists(nPDPath))){await mkPDirs(npName)};
    if(!(await exists(nPPPath))){await wPPrefsF(npName,npPrefsPth)};
    const newProj:AppProject={projectName:npName,projectDirPath:nPDPath,projectPrefsPath:nPPPath,projectLastMod:Math.round((new Date()).getTime()/1000)};
    let newProjIsV:boolean=true;console.log(newProjIsV);
    if(Object.keys(newProj).length!==4){newProjIsV=false};
    if(Object.values(newProj).length!==4){newProjIsV=false};
    if(typeof newProj.projectName!=='string'||newProj.projectName.length<1){newProjIsV=false};
    if(typeof newProj.projectDirPath!=='string'||!(exists(newProj.projectDirPath))){newProjIsV=false};
    if(typeof newProj.projectPrefsPath!=='string'||!(exists(newProj.projectPrefsPath))){newProjIsV=false};
    if(typeof newProj.projectLastMod!=='number'){newProjIsV=false};
    if(newProjIsV){return Promise.resolve(true)}
    else{return Promise.resolve(false)}
  };
  //--------------------
  let ePRes:any={r:false,d:null};
  switch(action){
    case 'list': //data=?/null
      const getPList:AppProject[]=await syncUProjects(true);if(typeof getPList==='object'&&Array.isArray(getPList)){ePRes.r=true;ePRes.d=getPList};
      break;
    case 'create': //data={projectName:<string>,prefsPath<string>:string} | returns {r:boolean,d:AppProject}
      let npName:string=data.projectName;
      let npPrefsPth:string=null;if(data.prefsPath!==null){npPrefsPth=data.prefsPath};
      if(userProjects.filter(uPO=>uPO.projectName===npName).length!==0){
        const doOWrite:string=await doDialog('msgbox',['overwriteQuestion',{name:npName}]);
        if(doOWrite==='no'){npName='comp0Z1teproject-'+String(Math.round((new Date()).getTime()/1000)).toLowerCase()}
      };
      const doCreateRes:boolean=await doCreateNP(npName,npPrefsPth);
      if(doCreateRes){
        const syncUProjListRes:AppProject[]=await syncUProjects(true);
        const matchNPArr:AppProject[]=syncUProjListRes.filter(uPO=>uPO.projectName===npName);
        if(matchNPArr.length===1){ePRes={r:true,d:matchNPArr[0]}}
        else{appCons('[manage-projects|create] ERROR: Created Project ('+npName+') NOT in userProjects SYNC LIST')}
      }else{appCons('[manage-projects|create] ERROR: Failed to Create New Project ('+npName+')')};
      break;
    case 'duplicate': //data={clonedProjectName:string,baseProjectPrefsPath:string} | returns {r:boolean,d:clonedProject<AppProject>|error<string>}
      const doDupRes:boolean=await doCreateNP(data.clonedProjectName,data.baseProjectPrefsPath);
      if(doDupRes){
        const syncUProjListRes:AppProject[]=await syncUProjects(true);
        const matchNPArr:AppProject[]=syncUProjListRes.filter(uPO=>uPO.projectName===data.clonedProjectName);
        if(matchNPArr.length===1){ePRes={r:true,d:matchNPArr[0]}}
        else{appCons('[manage-projects|duplicate] ERROR: Duplicate Project ('+data.clonedProjectName+') NOT in userProjects SYNC LIST')}
      }else{appCons('[manage-projects|duplicate] ERROR: Failed to Duplicate New Project ('+data.clonedProjectName+')')};
      break;
    case 'delete': //data=projectName:string | returns {r:boolean,d:null|error<string>}
      const delPName:string=data;
      const doDelete:string=await doDialog('msgbox',['deleteProjectQuestion',{name:delPName}]);
      if(doDelete==='cancel'){ePRes.r=false;ePRes.d='Cancelled'}
      else{ePRes=await delPFiles(delPName);await syncUProjects()};
      break;
    case 'import': //data-null | returns | {r:boolean,d:AppProject|null}
      const ipRes:any=await importProject();
      ePRes=ipRes;
      break;
    case 'export': //data=projectObj:AppProject | returns {r:boolean,d:expProjectInfo:ExportedProjectInfo}
      const cEPRes:any=await createExpProject(data);
      if(cEPRes.r){doExportSuccess(cEPRes.d);ePRes={r:true,d:cEPRes.d}}
      else{doExportError(data)}
      break;
    case 'rename': //data={project:AppProject,newName:string} | return {r:boolean,d:AppProject}
      const rnPRes:any=await renameProject(data.project,data.newName);
      if(rnPRes.r){ePRes=rnPRes};
      break;
    default:appCons('(manageProjects) [ERROR]: Unknown Action ('+action+')')
  };
  return Promise.resolve(ePRes)
}
//-------------------------------------------------------
  async function importProject():Promise<any>{
    const cvtBytes=(bs:number):string=>{const sizes:string[]=['Bytes','KB','MB','GB','TB'];if(bs==0){return 'N/A'};const i:number=(Math.floor(Math.log(bs)/Math.log(1024)));if(i==0){return bs+' '+sizes[i]};return (bs/Math.pow(1024,i)).toFixed(1)+' '+sizes[i]};
    const selectZipDialog=():Promise<any>=>{
      const cProjBDP:string=path.join(app.getPath('documents'),'compzProjects');
      const selImpFileRes:string[]|undefined=dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(),{defaultPath:cProjBDP,title:'Import Project',buttonLabel:'Import',filters:[{name:'Comp0Z1te Export File',extensions:['zip']}],properties:['openFile','showHiddenFiles']});
      if(selImpFileRes!==undefined&&Array.isArray(selImpFileRes)&&selImpFileRes.length>0){return Promise.resolve({r:true,d:selImpFileRes[0]})}else{return Promise.resolve({r:false,d:null})};
    };
    const checkZipValid=async(zipPath:string):Promise<any>=>{
      let errArr:string[]=[];
      let impProj:AppProject={projectName:'',projectDirPath:'',projectPrefsPath:'',projectLastMod:0};
      let impPCs:ImportedProjectCounts={files:0,folders:0,total:0,sizeNo:0,sizeStr:''};
      try{
        const zipStatObj:Stats=await stat(zipPath);
        if(zipStatObj&&zipStatObj.size>0){impPCs.sizeNo=zipStatObj.size;impPCs.sizeStr=cvtBytes(zipStatObj.size)};
        if(zipStatObj&&zipStatObj.ctimeMs>0){impProj.projectLastMod=Math.round(zipStatObj.ctimeMs/1000)};
        const tempImpZipDir:string=path.join(app.getPath('documents'),'compzProjects');
        const impZip=new AdmZip(zipPath);
        let impPrefsFName:string,impPrefsEntryName:string|null=null,impPrefsTempPath:string='';
        for(const zE of impZip.getEntries()){impPCs.total++;zE.isDirectory?impPCs.folders++:impPCs.files++;if(zE.entryName.includes('Prefs.json')){impPrefsFName=String(zE.name);impPrefsEntryName=String(zE.entryName)}};
        if(impPrefsEntryName!==null){
          await impZip.extractEntryTo(impPrefsEntryName,tempImpZipDir,false,true);
          impPrefsTempPath=path.join(tempImpZipDir,impPrefsFName);
          if((await exists(impPrefsTempPath))){
            const prefsStatObj:Stats=await stat(impPrefsTempPath);
            if(prefsStatObj.size>0){
              impProj.projectName=impPrefsFName.replace('Prefs.json','');
              impProj.projectDirPath=path.join(app.getPath('documents'),'compzProjects/'+capd(impProj.projectName));
              impProj.projectPrefsPath=path.join(app.getPath('documents'),'compzProjects/'+capd(impProj.projectName)+'/'+impProj.projectName+'Prefs.json');
              await del.default(impPrefsTempPath,{force:true});
              return Promise.resolve({r:true,d:{project:impProj,counts:impPCs}})
            }else{errArr.push('• Empty/corrupt project preferences file (0 Bytes)');appCons(errArr.join(','));return Promise.resolve({r:false,d:errArr})}
          }else{errArr.push('• Failed to extract project preferences file (test)');appCons(errArr.join(','));return Promise.resolve({r:false,d:errArr})}
        }else{errArr.push('• Invalid/missing project preferences file (*Prefs.json)');appCons(errArr.join(','));return Promise.resolve({r:false,d:errArr})}
      }catch(e){errArr.push('• Locked/corrupt exported project file (*.zip)');appCons(errArr.join(',')+' - [ERROR]: '+e);return Promise.resolve({r:false,d:errArr})}
    };
    const checkOverwrite=async(importProject:AppProject):Promise<any>=>{
      let checkedImpProject:AppProject=importProject;
      if((await exists(importProject.projectDirPath))){
        const owriteResI:number=dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),{message:'A project named '+importProject.projectName+' already exists.\nIf you proceed it will be replaced/overwritten.\nOVERWRITE or RENAME project when importing?',type:'warning',buttons:['Overwrite','Rename'],defaultId:1,title:'Existing Project',cancelId:1,icon:icoP('assets/app-dialog-overwriteprompt-ico.png')});
        if(owriteResI===0){return Promise.resolve({didChange:false,project:checkedImpProject})}
        else{
          checkedImpProject.projectName+=get4DigitLabel();
          checkedImpProject.projectDirPath+=get4DigitLabel();
          checkedImpProject.projectPrefsPath=checkedImpProject.projectName.replace('Prefs.json','')+get4DigitLabel()+'Prefs.json';
          return Promise.resolve({didChange:true,project:checkedImpProject})
        }
      }else{return Promise.resolve({didChange:false,project:checkedImpProject})}
    }
    const extractZip=async(zipPath:string,impProject:AppProject,didChange:boolean):Promise<boolean>=>{
      try{
        await mkdir(impProject.projectDirPath,{recursive:true});
        const impZip=new AdmZip(zipPath);
        const outputDir=impProject.projectDirPath;
        await impZip.extractAllTo(outputDir);
        if(didChange){
          const oldPrefsPath:string=path.join(impProject.projectDirPath,impProject.projectName.substring(0,impProject.projectName.length-4)+'Prefs.json');
          const newPrefsPath:string=impProject.projectPrefsPath;
          await rename(oldPrefsPath,newPrefsPath);
        };
        return Promise.resolve(true)
      }catch(e){appCons('(importProject|extractZip) [ERROR]: '+e);return Promise.resolve(false)};
    };
    const selImpProjPath:any=await selectZipDialog();
    if(selImpProjPath.r){
      const checkZipVRes:any=await checkZipValid(selImpProjPath.d);
      if(checkZipVRes.r){
        let impP:AppProject=checkZipVRes.d.project,impPDidChange:boolean|null=null;
        const impCs:ImportedProjectCounts=checkZipVRes.d.counts;
        const checkOWRes:any=await checkOverwrite(impP);
        if(checkOWRes.didChange){impP=checkOWRes.project;impPDidChange=true}else{impPDidChange=false};
        const extractZRes:boolean=await extractZip(selImpProjPath.d,impP,impPDidChange);
        if(extractZRes){
          const doOpen:string=await doImportSuccess(selImpProjPath.d,impP,impCs);
          if(doOpen==='open'){return Promise.resolve({r:true,d:impP})}
          else{return Promise.resolve({r:true,d:null})}
        }else{
          appCons('(importProject|extractZip) Extracting Zip Failed');
          let allErrs:string[]=[];if(!checkZipVRes.r&&checkZipVRes.d.length>0){allErrs=checkZipVRes.d};allErrs.push('Zip Extraction Failed');
          doImportError(path.basename(selImpProjPath.d),allErrs);
          return Promise.resolve({r:false})
        }
      }else{
        appCons('(importProject|checkZipValid) Zip Invalid: '+checkZipVRes.d.join(','));
        let allErrs:string[]=[];if(!checkZipVRes.r&&checkZipVRes.d.length>0){allErrs=checkZipVRes.d};allErrs.push('Import Zip Invalid');
        doImportError(path.basename(selImpProjPath.d),allErrs);
        return Promise.resolve({r:false})
      }
    }else{appCons('(importProject|selectZipDialog) File Select Cancelled/Failed');return Promise.resolve({r:false})}
  }
//-------------------------------------------------------
async function renameProject(project:AppProject,nName:string):Promise<any>{
  const oldPDirPath:string=project.projectDirPath;
  const newPDirPath:string=path.join(app.getPath('documents'),'compzProjects/'+capd(nName));
  const oldPPrefsPath:string=path.join(newPDirPath,project.projectName+'Prefs.json');
  const newPPrefsPath:string=path.join(newPDirPath,nName+'Prefs.json');
  const copyDelProject=async():Promise<boolean>=>{
    try{
      await rename(oldPDirPath,newPDirPath);
      await rename(oldPPrefsPath,newPPrefsPath);
      if((await exists(oldPDirPath))){await del.default(oldPDirPath,{force:true})};
      appCons('(renameProject|copyDelProject) [SUCCESS]: Copied '+oldPDirPath+' > '+newPDirPath+',Renamed '+oldPPrefsPath+' > '+newPPrefsPath+',Deleted '+oldPDirPath);
      return Promise.resolve(true);
    }catch(e){appCons('(renameProject|copyDelProject) [ERROR]: '+e);return Promise.resolve(false)}
  };
  const cdpRes:boolean=await copyDelProject();
  if(cdpRes){
    const getPListRes:AppProject[]=await syncUProjects(true);
    if(typeof getPListRes==='object'&&Array.isArray(getPListRes)&&getPListRes.length>0){
      const matchRNArr:AppProject[]=getPListRes.filter(pO=>pO.projectName===nName);
      if(matchRNArr.length===1){return Promise.resolve({r:true,d:matchRNArr[0]})}
      else{appCons('(renameProject|matchRenamedP) [ERROR]: No Projects in New List Matched Renamed Project');return Promise.resolve({r:true,data:null})}
    }else{appCons('(renameProject|syncUProjects) [ERROR]: No Projects in New List');return Promise.resolve({r:true,data:null})}
  }else{appCons('(renameProject|copyDelProject) [ERROR]');return Promise.resolve({r:true,data:null})}
}
//-------------------------------------------------------
function getUTSLabel(label:string):string{return (label+'-'+String(Math.round((new Date()).getTime()/1000))).toLowerCase()};
function get4DigitLabel():string{return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)}
//-------------------------------------------------------
async function createExpProject(project:AppProject):Promise<any>{
  const cvtBytes=(bs:number):string=>{const sizes:string[]=['Bytes','KB','MB','GB','TB'];if(bs==0){return 'N/A'};const i:number=(Math.floor(Math.log(bs)/Math.log(1024)));if(i==0){return bs+' '+sizes[i]};return (bs/Math.pow(1024,i)).toFixed(1)+' '+sizes[i]};
  const expZipFName:string='export'+get4DigitLabel()+project.projectName+'.zip';
  const tempExpZipPath:string=path.join(app.getPath('documents'),'compzProjects/'+expZipFName);
  const usrExpZipPath:string=path.join(project.projectDirPath,'exports/'+expZipFName);
  let zInfo:ExportedProjectInfo={project:project,zipPath:usrExpZipPath,zipFiles:<string[]>[],zipCounts:{files:<number>0,folders:<number>0,total:<number>0,sizeNo:<number>0,sizeStr:<string>''}};
  const createZip=async():Promise<boolean>=>{
    try{
      const cZip=new AdmZip();cZip.addLocalFolder(project.projectDirPath);cZip.writeZip(tempExpZipPath);
      appCons('(createExpProject|createZip) [SUCCESS]: Created '+tempExpZipPath);
      return Promise.resolve(true)
    }catch(e){appCons('(createExpProject|createZip) [ERROR]: '+e);return Promise.resolve(false)}
  };
  const readZip=async():Promise<boolean>=>{
    try{
      const rZip=new AdmZip(tempExpZipPath);
      for(const zE of rZip.getEntries()){zInfo.zipCounts.total++;zE.isDirectory?zInfo.zipCounts.folders++:zInfo.zipCounts.files++;zInfo.zipFiles.push(zE.name)};
      appCons('(createExpProject|readZip) [SUCCESS]: Read '+tempExpZipPath);
      return Promise.resolve(true)
    }catch(e){appCons('(createExpProject|readZip) [ERROR]: '+e);return Promise.resolve(false)}
  };
  const mvDelZip=async():Promise<boolean>=>{
    try{
      await rename(tempExpZipPath,usrExpZipPath);
      await del.default(tempExpZipPath,{force:true});
      const sObj:Stats=await stat(usrExpZipPath);
      if(sObj.size>0){zInfo.zipCounts.sizeNo=sObj.size;zInfo.zipCounts.sizeStr=cvtBytes(sObj.size)};
      appCons('(createExpProject|mvDelZip) [SUCCESS]: Moved '+tempExpZipPath+' > '+usrExpZipPath+',Deleted '+tempExpZipPath);
      return Promise.resolve(true)
    }catch(e){appCons('(createExpProject|mvDelZip) [ERROR]: '+e);return Promise.resolve(false)}
  };
  const createZRes:boolean=await createZip();
  if(createZRes){const readZRes:any=await readZip();
    if(readZRes){const moveDelZRes:boolean=await mvDelZip();
      if(moveDelZRes){return Promise.resolve({r:true,d:zInfo})}
      else{return Promise.resolve({r:false,d:null})}
    }else{return Promise.resolve({r:false,d:null})}
  }else{return Promise.resolve({r:false,d:null})}
}
//-------------------------------------------------------
const scs=(tf:boolean):void=>{if(tf){if(!scsActive){shortCutRegs('register')}}else{if(scsActive){shortCutRegs('unregister')}}}
const shortCutRegs=(action:string):void=>{
  if(action==='register'){
    //---------------------------------------
    globalShortcut.register('Alt+F',()=>{mmDDFn('alt','ddaltsc','file')});
    globalShortcut.register('Alt+E',()=>{mmDDFn('alt','ddaltsc','edit')});
    globalShortcut.register('Alt+T',()=>{mmDDFn('alt','ddaltsc','tools')});
    globalShortcut.register('Alt+W',()=>{mmDDFn('alt','ddaltsc','window')});
    globalShortcut.register('Alt+H',()=>{mmDDFn('alt','ddaltsc','help')});
    //---------------------------------------
    globalShortcut.register('Ctrl+N',()=>{mmDDFn('file','newblankproject',null)});
    globalShortcut.register('Ctrl+Alt+N',()=>{mmDDFn('file','importproject',null)});
    globalShortcut.register('Ctrl+O',()=>{mmDDFn('file','openproject',null)});
    globalShortcut.register('Ctrl+Shift+O',()=>{if(currentProject!==null){mmDDFn('file','openplaylist',null)}});
    globalShortcut.register('Ctrl+Shift+Alt+O',()=>{if(currentProject!==null){mmDDFn('file','openfile',null)}});
    globalShortcut.register('Ctrl+S',()=>{if(currentProject!==null){mmDDFn('file','save',null)}});
    globalShortcut.register('Ctrl+Shift+S',()=>{if(currentProject!==null){mmDDFn('file','saveas',null)}});
    globalShortcut.register('Ctrl+Shift+E',()=>{if(currentProject!==null){mmDDFn('file','exportproject',null)}});
    globalShortcut.register('Ctrl+,',()=>{mmDDFn('file','preferences-generalsettings',null)});
    globalShortcut.register('Ctrl+.',()=>{mmDDFn('file','preferences-managemediafolders',null)});
    globalShortcut.register('Ctrl+F4',()=>{mmDDFn('file','closeproject',null)});
    globalShortcut.register('Ctrl+Shift+F4',()=>{if(currentProject!==null){mmDDFn('file','closeplaylist',null)}});
    globalShortcut.register('Ctrl+Shift+Alt+F4',()=>{if(currentProject!==null){mmDDFn('file','closefile',null)}});
    globalShortcut.register('Alt+F4',()=>{winCtrl('quit')});
    //---------------------------------------
    globalShortcut.register('Alt+F4',()=>{winCtrl('quit')});
    //---------------------------------------
    globalShortcut.register('Ctrl+F',()=>{if(currentProject!==null){
      let newState:boolean|null=null;if(fileExplorerIsOpen===null){newState=true}else{fileExplorerIsOpen?newState=false:newState=true};
      compzWin.webContents.send('sc-fe-toggle',[newState])};
    });
    globalShortcut.register('Ctrl+Z',()=>{compzWin.webContents.send('sc-undo')});
    globalShortcut.register('Ctrl+Y',()=>{compzWin.webContents.send('sc-redo')});
    globalShortcut.register('Ctrl+C',()=>{compzWin.webContents.send('sc-copy')});
    globalShortcut.register('Ctrl+X',()=>{compzWin.webContents.send('sc-cut')});
    globalShortcut.register('Ctrl+V',()=>{compzWin.webContents.send('sc-paste')});
    globalShortcut.register('Ctrl+A',()=>{compzWin.webContents.send('sc-selectAll')});
    globalShortcut.register('Ctrl+Alt+O',()=>{compzWin.webContents.send('sc-open-file',['All Files'])});
    globalShortcut.register('Ctrl+Alt+S',()=>{compzWin.webContents.send('sc-save-file',['All Files'])});
    scsActive=true;
  }else{globalShortcut.unregisterAll();scsActive=false};
};
//-------------------------------------------------------
const initDisplay=():Promise<boolean>=>{
  if(cWinOpts.width===0||cWinOpts.height===0){
    const pDisplay:Electron.Display=screen.getPrimaryDisplay();
    const{width,height}=pDisplay.workAreaSize;
    if(myWinMode==='prod'){
      (width-80)>1600?cWinOpts.width=1600:cWinOpts.width=(width-80);
      cWinOpts.height=(height-80);
      (width-80)>1600?cWinOpts.x=(width-1600)/2:cWinOpts.x=40;
      cWinOpts.y=40;
      prodAppArea={x:cWinOpts.x,y:cWinOpts.y,width:cWinOpts.width,height:cWinOpts.height}
    }else if(myWinMode==='dev'){
      cWinOpts.width=width-devEditArea.width-10;
      cWinOpts.height=height-10;
      cWinOpts.x=devEditArea.width+5;
      cWinOpts.y=5;
      devAppArea={x:cWinOpts.x,y:cWinOpts.y,width:cWinOpts.width,height:cWinOpts.height}
    }else if(myWinMode==='random'){
      cWinOpts.width=width-10;
      cWinOpts.height=height-10;
      cWinOpts.x=5;
      cWinOpts.y=5;
      randomAppArea={x:cWinOpts.x,y:cWinOpts.y,width:cWinOpts.width,height:cWinOpts.height}
    }
  }else{return Promise.resolve(true)}
};
//-------------------------------------------------------
const initUserPrefs=async():Promise<boolean>=>{
  try{
    if(myWinMode==='dev'||myWinMode==='random'){
      let myDTBs={};myWinMode==='dev'?myDTBs={height:900,width:1460,x:375,y:115}:myDTBs={height:650,width:950,x:175,y:105};
      const userDataPath=app.getPath('userData'),devPrefsPath=path.join(userDataPath,'Preferences');
      if((await exists(devPrefsPath))){
        let devPrefsData:any=JSON.parse((await readFile(devPrefsPath,'utf-8')));
        devPrefsData.electron.devtools.bounds=myDTBs;
        await writeFile(devPrefsPath,JSON.stringify(devPrefsData));
        return Promise.resolve(true);
      }else{return Promise.resolve(false)};
    }else{return Promise.resolve(false)}
  }catch(e){console.log('[app/main.ts|initUserPrefs] ERROR: '+JSON.stringify(e));return Promise.resolve(false)}
};
//-------------------------------------------------------
const initTray=():Promise<boolean>=>{
  try{
    compzTray=new Tray(path.join(__dirname,'../dist/assets/clogo.png'));
    const contextMenu=Menu.buildFromTemplate([{label:'Show App',click:()=>{winCtrl('show')}},{label:'Quit',click:()=>{winCtrl('quit')}}]);
    compzTray.setToolTip('comp0Z1te Options');
    compzTray.setContextMenu(contextMenu);
    ipcMain.on('tray',()=>{winCtrl('hide')});
    ipcMain.on('min',()=>{winCtrl('min')});
    ipcMain.on('max',()=>{winCtrl('max')});
    ipcMain.on('restore',()=>{winCtrl('restore')});
    ipcMain.on('close',()=>{winCtrl('quit')});
    return Promise.resolve(true);
  }catch(e){return Promise.resolve(false)}
};
/////////////////////////////////////////////////////////
const doDialog=async(type:string,args:any[]):Promise<any>=>{
  const getExts=(type:string):string[]=>{let resArr:string[]=[];for(let i=0;i<defAppStates.mediaFileExts[type].length;i++){resArr.push((defAppStates.mediaFileExts[type][i].replace('.','')))};return resArr};
  const dDFilters:any[]=[{name:'All Files',extensions:['*']},{name:'Audio Files',extensions:getExts('audio')},{name:'Subtitle Files',extensions:getExts('subs')},{name:'Video Files',extensions:getExts('video')}];
  const projFilters:any=[{name:'Comp0Z1te Project Files',extensions:['json','0z1']}];
  let dDRes:any;
  switch(type){
    case 'editorsaveas':
      const saFilePath:string=args[0];
      const saDOpts:SaveDialogOptions={defaultPath:saFilePath,title:'Save Edit As',buttonLabel:'Save',properties:['showHiddenFiles','createDirectory','dontAddToRecent']};
      let saFRes:string|undefined=dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(),saDOpts);
      if(saFRes!==undefined){dDRes=saFRes}else{dDRes=null};
      break;
    case 'save':
      const bdirPath:string=path.join(currentProject.projectDirPath,'media/'+args[0].bdir);
      const sfPath:string=bdirPath+'/'+args[0].name;
      const saveDOpts:SaveDialogOptions={defaultPath:sfPath,title:'Save File As',buttonLabel:'Save',filters:dDFilters,properties:['showHiddenFiles','createDirectory','dontAddToRecent']};
      let dSFRes:string|undefined=dialog.showSaveDialogSync(BrowserWindow.getFocusedWindow(),saveDOpts);
      if(dSFRes!==undefined){dDRes=dSFRes}else{dDRes=null};
      break;
    case 'open':
      if(args[0]==='project'){
        const cProjBDP:string=path.join(app.getPath('documents'),'compzProjects');
        const openDOpts:OpenDialogOptions={defaultPath:cProjBDP,title:'Open Project File',buttonLabel:'Open Project',filters:projFilters,properties:['openFile','showHiddenFiles']};
        const dOFRes:string[]|undefined=dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(),openDOpts);
        if(dOFRes!==undefined){dDRes=dOFRes}else{dDRes=[]};
      }else if(args[0]==='audio'||args[0]==='subs'||args[0]==='video'){
        let afPath:string='',afFilters:FileFilter[]=[],capdBDir:string=capd(args[0]);if(capdBDir==='Subs'){capdBDir='Subtitle'};
        if(args[0]==='audio'){afPath=app.getPath('music');afFilters.push(dDFilters[1])}
        else if(args[0]==='subs'){afPath=app.getPath('documents');afFilters.push(dDFilters[2])}
        else if(args[0]==='video'){afPath=app.getPath('videos');afFilters.push(dDFilters[3])}
        else{afPath=app.getPath('home');afFilters=dDFilters[0]};
        const openDOpts:OpenDialogOptions={defaultPath:afPath,title:'Add '+capdBDir+' Files',buttonLabel:'Add Files',filters:afFilters,properties:['openFile','multiSelections','showHiddenFiles']};
        const dOFRes:OpenDialogReturnValue=await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),openDOpts);
        dDRes=dOFRes;
      };
      break;
    case 'msgbox':
      const getN=():string=>{
        const tN=(o:any):boolean=>{if(o&&typeof o==='object'&&o.hasOwnProperty('name')&&o.name){return true}else{return false}};
        if(tN(args[1])){return args[1].name
        }else if(tN(editorFile)){return editorFile.name}else{return 'this file'}
      };
      const mBTKey:string=args[0];
      const mBFileN:any=getN();
      const mBFixList=():string=>{let str:string='';if(args[0]==='fixMissingFilesQuestion'){str=args[1].list};return str};
      const msgBoxTypes:any={
        saveEditAVQuestion:{message:'Save changes to '+mBFileN+' and update playlist?',type:'question',buttons:['Yes','No','Cancel'],defaultId:0,title:'Save Editor Changes',cancelId:2,icon:icoP('assets/app-dialog-saveprompt-ico.png')},
        saveQuestion:{message:'Save changes to '+mBFileN+'?',type:'question',buttons:['Yes','No','Cancel'],defaultId:0,title:'Save Changes',cancelId:2,icon:icoP('assets/app-dialog-saveprompt-ico.png')},
        exitQuestion:{message:'Exit comp0z1te?',type:'question',buttons:['Yes','No'],defaultId:0,title:'Confirm Exit',cancelId:1,icon:icoP('assets/app-dialog-exitprompt-ico.png')},
        overwriteQuestion:{message:mBFileN+' already exists.\nDo you want to replace it?',type:'warning',buttons:['Yes','No'],defaultId:1,title:'Overwrite File',cancelId:1,icon:icoP('assets/app-dialog-overwriteprompt-ico.png')},
        newBlankProjectQuestion:{message:'Close '+mBFileN+' and start a\nNew Blank Project?',type:'warning',buttons:['New Project','Cancel'],defaultId:0,title:'Confirm New Project',cancelId:1,icon:icoP('assets/app-dialog-newprojectprompt-ico.png')},
        importProjectQuestion:{message:mBFileN+' is or includes files stored outside\nComp0Z1te\'s User Project Directory.\nDo you want to import the Project?',type:'warning',buttons:['Import','Cancel'],defaultId:0,title:'Confirm Import Project',cancelId:1,icon:icoP('assets/app-dialog-importprompt-ico.png')},
        deleteProjectQuestion:{message:'Delete Project '+mBFileN+'?\nThis action is permanent and CANNOT be undone.',type:'warning',buttons:['Delete Project','Cancel'],defaultId:1,title:'Confirm Delete Project',cancelId:1,icon:icoP('assets/app-dialog-deleteprojectprompt-ico.png')},
        deletePlaylistQuestion:{message:'Delete Playlist '+mBFileN+'?\nThis action is permanent and CANNOT be undone.',type:'warning',buttons:['Delete','Cancel'],defaultId:1,title:'Confirm Delete Playlist',cancelId:1,icon:icoP('assets/app-dialog-deleteprojectprompt-ico.png')},
        deleteTargetData:{message:'Removing '+mBFileN+' ...\nALSO DELETE item\'s media files from disk?\n*WARNING* This action CANNOT be undone.',type:'question',buttons:['Remove Only','Remove & Delete','Cancel'],defaultId:0,title:'Remove/Delete Options',cancelId:2,icon:icoP('assets/app-dialog-deleteprojectprompt-ico.png')},
        fixMissingFilesQuestion:{message:'Project '+mBFileN+' has missing/empty files (see below)\nShould we attempt to fix these issues?\n\n'+mBFixList(),type:'warning',buttons:['Attempt Fix','Cancel'],defaultId:0,title:'Missing/Empty Files',cancelId:1,icon:icoP('assets/app-dialog-fixprojectprompt-ico.png')},
        dupePLFileQuestion:{title:'Duplicate File',message:'File '+mBFileN.file+' already exists in Playlist '+mBFileN.playlist+'\nAdd another copy anyway?',type:'warning',icon:icoP('assets/dialog-warning-ico-1024.png'),buttons:['Cancel','Add Copy'],defaultId:1,cancelId:0}
      };
      let popWin:BrowserWindow|null=null;
      if(compzWin&&compzWin.focusable){compzWin.focus();popWin=compzWin}
      else{
        const availWins:BrowserWindow[]=BrowserWindow.getAllWindows();
        if(availWins.length>0){for(let i=0;i<availWins.length;i++){const thisWin:BrowserWindow=availWins[i];console.log(thisWin);if(thisWin.isFocusable){if(!thisWin.isFocused){thisWin.focus()};popWin=thisWin}}};
      };
      const mbDResI:number=dialog.showMessageBoxSync(popWin,msgBoxTypes[mBTKey]);
      dDRes=msgBoxTypes[mBTKey].buttons[mbDResI].toLowerCase().replace(/\s+/g,'');
      break;
    default:const cT:string='(main|doDialog) !UNKNOWN! Dialog Type: '+type;appCons(cT);console.log(cT);
  };
  return Promise.resolve(dDRes);
}
/////////////////////////////////////////////////////////
ipcMain.handle('doErr',async(e:any,args:any[])=>{
  await doError(args[0],args[1]);
  return true
});
const doError=async(errTitle:string,errMsg:string):Promise<boolean>=>{
  const errBoxOpts:MessageBoxOptions={message:errMsg,type:'error',buttons:['OK'],defaultId:0,title:errTitle};
  dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),errBoxOpts);
  return Promise.resolve(true);
}
/////////////////////////////////////////////////////////
ipcMain.handle('doWarn',async(e:any,args:any[])=>{
  await doWarn(args[0],args[1]);
  return true
});
const doWarn=async(warnTitle:string,warnMsg:string):Promise<boolean>=>{
  const warnBoxOpts:MessageBoxOptions={message:warnMsg,type:'warning',buttons:['OK'],defaultId:0,title:warnTitle};
  dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),warnBoxOpts);
  return Promise.resolve(true);
}
/////////////////////////////////////////////////////////
const doSuccess=async(okTitle:string,okMsg:string):Promise<boolean>=>{
  const okBoxOpts:MessageBoxOptions={message:okMsg,type:'info',buttons:['OK'],defaultId:0,title:okTitle};
  dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),okBoxOpts);
  return Promise.resolve(true);
}
/////////////////////////////////////////////////////////
const doExportError=async(project:AppProject):Promise<boolean>=>{
  const errBoxOpts:MessageBoxOptions={title:'Export Project Error',message:'Failed to export project ('+project.projectName+')\nCheck file permissions,ensure no files are\nin use/locked and try again.',type:'error',buttons:['OK'],defaultId:0};
  dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),errBoxOpts);
  return Promise.resolve(true);
}
/////////////////////////////////////////////////////////
const doExportSuccess=(expZInfo:ExportedProjectInfo)=>{
  const expSuccessOpts:MessageBoxOptions={
    title:'Export Project Result',
    message:'PROJECT '+expZInfo.project.projectName+' EXPORTED SUCCESSFULLY:\n\n• Export: '+path.basename(expZInfo.zipPath)+'\n• Path: '+expZInfo.project.projectDirPath+'/exports\n• Count: '+String(expZInfo.zipCounts.folders)+'/'+String(expZInfo.zipCounts.files)+'/'+String(expZInfo.zipCounts.total)+' (folders/files/total)\n• Size: '+String(expZInfo.zipCounts.sizeNo)+' Bytes ('+expZInfo.zipCounts.sizeStr+')',
    type:'info',
    buttons:['View','OK'],
    defaultId:1,
  };
  const msgBoxResI:number=dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),expSuccessOpts);
  if(msgBoxResI===0){shell.showItemInFolder(expZInfo.zipPath)};
};
/////////////////////////////////////////////////////////
const doImportError=async(projectName:string,errs:string[])=>{
  let aMsg:string='Failed to export project ('+projectName+'):\n';for(let i=0;i<errs.length;i++){aMsg+=errs[i]+'\n'};
  const errBoxOpts:MessageBoxOptions={title:'Import Project Error',message:aMsg,type:'error',buttons:['OK'],defaultId:0};
  dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),errBoxOpts);
}
/////////////////////////////////////////////////////////
const doImportSuccess=(zipPath:string,project:AppProject,impCounts:ImportedProjectCounts):Promise<string>=>{
  const expSuccessOpts:MessageBoxOptions={
    title:'Import Project Result',
    message:'PROJECT '+project.projectName+' IMPORTED SUCCESSFULLY:\n\n• Import: '+path.basename(zipPath)+'\n• Path: '+project.projectDirPath+'\n• Count: '+String(impCounts.folders)+'/'+String(impCounts.files)+'/'+String(impCounts.total)+' (folders/files/total)\n• Size: '+String(impCounts.sizeNo)+' Bytes ('+impCounts.sizeStr+')',
    type:'info',
    buttons:['Open Now','OK'],
    defaultId:1,
  };
  const msgBoxResI:number=dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(),expSuccessOpts);
  if(msgBoxResI===0){return Promise.resolve('open')}else{return Promise.resolve('ok')}
};
/////////////////////////////////////////////////////////
// IPC HANDLERS
/////////////////////////////////////////////////////////
function mTrack(tf:boolean){
  if(tf){
    if(mTrackInt!==null){clearInterval(mTrackInt);mTrackInt=null};
    mTrackInt=setInterval(async()=>{const{z,p}=mmZone();
      if(z){
        let ddN:string='';const relX:number=p.x-wCBox.left,xpVArr:number[]=Object.values(mmDDXPos),xpKArr:string[]=Object.keys(mmDDXPos);
        for(let i=0;i<xpVArr.length;i++){
          const ddXStart:number=xpVArr[i];let ddXEnd:number=0;
          ((xpVArr.length-1)===i)?ddXEnd=mmDDXPos.wrap.end:ddXEnd=xpVArr[(i+1)];
          if(relX>=ddXStart&&relX<ddXEnd){ddN=xpKArr[i]}
        };
        if(ddN!==mmDDOpen){
          clearInterval(mTrackInt);mTrackInt=null;
          mmDDAction(null,mmDDOpen,'close');
          compzWin.webContents.send('mm-dd-open',[ddN]);
          mmDDAction(null,ddN,'open')
        }
      }
    },100);
  }else{clearInterval(mTrackInt)}
}
//-------------------------------------------------------
async function mmDDAction(ddEvent:IpcMainEvent|null,ddName:string,ddAction:string){
  let ddMenu:Menu|null=null;
  if(ddAction==='open'){
    const ddOpts:MenuItemConstructorOptions[]=mmDDOpts(ddName);
    ddMenu=Menu.buildFromTemplate(ddOpts);mmDDMenus[ddName]=ddMenu;
    ddMenu.on('menu-will-show',()=>{mmDDOpen=ddName;mTrack(true)});
    ddMenu.on('menu-will-close',(e:Electron.Event)=>{
      mTrack(false);
      e.preventDefault();
      if(e.defaultPrevented){
        const{z,p}=mmZone();
        if(z){
          let ddN:string='';const relX:number=p.x-wCBox.left,xpVArr:number[]=Object.values(mmDDXPos),xpKArr:string[]=Object.keys(mmDDXPos);
          for(let i=0;i<xpVArr.length;i++){
            const ddXStart:number=xpVArr[i];let ddXEnd:number=0;
            if((xpVArr.length-1)===i){ddXEnd=mmDDXPos.wrap.end}else{ddXEnd=xpVArr[(i+1)]};
            if(relX>=ddXStart&&relX<ddXEnd){ddN=xpKArr[i]};
          };
          if(ddN!==mmDDOpen){mmDDOpen=null;compzWin.webContents.send('mm-dd-open',[null])};
        }else{mmDDOpen=null;compzWin.webContents.send('mm-dd-open',[null])}
      }else{mmDDOpen=null;compzWin.webContents.send('mm-dd-open',[null])}
    });
    let popOpts:PopupOptions={window:compzWin,x:mmDDXPos[ddName],y:32};
    if(ddEvent){popOpts.window=BrowserWindow.fromWebContents(ddEvent.sender)};
    ddMenu.popup(popOpts)
  }else if(ddAction==='close'){ddMenu=mmDDMenus[ddName];ddMenu.closePopup();mmDDOpen=null;compzWin.webContents.send('mm-dd-open',[null])}
}
//-------------------------------------------------------
ipcMain.on('mm-update-xpos',async(e:any,args:any[])=>{const wBs:Rectangle=compzWin.getBounds();wCBox.left=wBs.x;wCBox.right=wBs.x+wBs.width;wCBox.top=wBs.y;wCBox.bottom=wBs.y+wBs.height;mmDDXPos=args[0]});
//-------------------------------------------------------
ipcMain.on('mm-dd-action',async(e:any,args:any[])=>{const ddE:IpcMainEvent=e,ddN:string=args[0],ddA:string=args[1];await mmDDAction(ddE,ddN,ddA)});
//-------------------------------------------------------
ipcMain.handle('do-childwin',async(e:any,args:any[]):Promise<any>=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-childwin - '+args[0]);
  const cwAction:string=args[0];let cwData:any|null=null;if(args[1]){cwData=args[1]};
  await childWinAction(cwAction,cwData);return Promise.resolve(true)
});
//-------------------------------------------------------
ipcMain.handle('prompt-save-editor-file',async(e:any,args:any[]):Promise<any>=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: prompt-save-editor-file');
  const dSMDRes:any=await doDialog('msgbox',args);return Promise.resolve(dSMDRes)
});
//-------------------------------------------------------
ipcMain.handle('do-show-msg',async(e:any,args:any[]):Promise<any>=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-show-msg');
  const dSMDRes:any=await doDialog('msgbox',args);return Promise.resolve(dSMDRes)
});
//-------------------------------------------------------
ipcMain.handle('editor-save-as',async(e:any,args:any[])=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: editor-save-as');
  const dSFDRes:any=await doDialog('editorsaveas',args);return Promise.resolve(dSFDRes)
});
//-------------------------------------------------------
ipcMain.handle('do-save-file',async(e:any,args:any[])=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-save-file');
  const dSFDRes:any=await doDialog('save',args);return Promise.resolve(dSFDRes)
});
//-------------------------------------------------------
ipcMain.handle('do-open-file',async(e:any,args:any[])=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-open-file');
  const dOFDRes:any=await doDialog('open',args);return Promise.resolve(dOFDRes)
});
//-------------------------------------------------------
ipcMain.handle('do-confirm-delete-target',async(e:any,args:any[]):Promise<string>=>{
  console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-confirm-delete-target');
  const dCDTRes:any=await doDialog('msgbox',args);return Promise.resolve(dCDTRes)
});
//-------------------------------------------------------
ipcMain.on('childwin-action',async(e:any,args:any[])=>{
  console.log('[main|IPCHandlers] (childwin-action) - '+String(args[0]).toUpperCase()+'...');
  switch(args[0]){
    case 'close':childWinAction('close');break;
    case 'show':childWinAction('show',null);break;
  }
})
//-------------------------------------------------------
ipcMain.on('app-contents-cmd',async(e:any,args:any[])=>{
  console.log('[main|IPCHandlers] (app-contents-cmd) - '+String(args[0]).toUpperCase()+'...');
  switch(args[0]){
    case 'undo':compzWin.webContents.undo();break;
    case 'redo':compzWin.webContents.redo();break;
    case 'cut':compzWin.webContents.cut();break;
    case 'copy':compzWin.webContents.copy();break;
    case 'paste':compzWin.webContents.paste();break;
    case 'selectAll':compzWin.webContents.selectAll();break;
  };
});
//-------------------------------------------------------
ipcMain.on('fe-shouldsave-file',async(e:any,args:any[])=>{editorShouldSave=args[0]});
ipcMain.on('home-editor-file',async(e:any,args:any[])=>{editorFile=args[0];if(args[0]===null){editorShouldSave=false}});
//-------------------------------------------------------
const ctxtConsOn:boolean=false;
const ctxtReg=(r:string)=>{
  if(ctxtConsOn){
    let acsN:string='',hcsN:string='',hcaN:string='';
    if(r==='acs'){acsN='*NEW*'}else if(r==='hcs'){hcsN='*NEW*'}else{hcaN='*NEW*'};
    const cRC:string=`
    | Context REGION CHANGE: --------------------------------
    | appContextSection:  `+appContextSection+`     `+acsN+`
    | homeContextSection: `+homeContextSection+`    `+hcsN+`
    | homeContextArea:    `+homeContextArea+`       `+hcaN+`
    | -------------------------------------------------------
    `;console.log(cRC);
  }
};
const ctxtFile=(f:string)=>{
  if(ctxtConsOn){
    let fecfN:string='',plcfN:string='',pjcfFN:string='',pflN:string='',fecfFN:string='null',plcfFN:string='null',pjcfN:string='null',pflFN:string='null';
    if(feContextFile){fecfFN=feContextFile.name};
    if(plContextFile){plcfFN=plContextFile.name};
    if(pjContextFile){pjcfFN=pjContextFile.projectName};
    if(playerFileLoaded){pflFN=playerFileLoaded.name};
    if(f==='fecf'){fecfN='*NEW*'}else if(f==='plcf'){plcfN='*NEW*'}else if(f==='pfl'){pflN='*NEW*'}else if(f==='pjcf'){};
    const cFC:string=`
    | Context FILE CHANGE: -------------------------------
    | feContextFile:    `+fecfFN+`         `+fecfN+`
    | plContextFile:    `+plcfFN+`         `+plcfN+`
    | pjContextFile:    `+pjcfFN+`         `+pjcfN+`
    | playerFileLoaded: `+pflFN+`          `+pflN+`
    | ----------------------------------------------------
    `;console.log(cFC);
  }
};
const ctxtBlock=(chan:string,gVarName:string)=>{if(ctxtConsOn){console.log('Change to '+gVarName+' via #'+chan+' [BLOCKED] (mainCMIsOpen===TRUE)')}};
ipcMain.on('open-winFE',async(e:any,args:any[])=>{shell.showItemInFolder(args[0])});
//-------------------------------------------------------
ipcMain.on('set-compz-route',async(e:any,args:any[])=>{compzRoute=args[0];compzWin.webContents.send('new-compz-route',[compzRoute]);appCons('[NEW|ROUTE]: '+compzRoute)});
ipcMain.handle('get-compz-route',async()=>{return compzRoute});
//-------------------------------------------------------
async function checkCurrentProject(args:any[]){
  console.log('[main] currentProject [CHECK]: '+args[0].projectName+' - Checking Data...');
  const ckFiles=async():Promise<any>=>{
    let misPs:string[]=[];
    const pPath:string=args[0].projectDirPath,pPPath:string=args[0].projectPrefsPath,pDirPs:string[]=['exports','playlists','media','media/audio','media/subs','media/video'];
    if(!(exists(pPath))){misPs.push(pPath)};
    if(!(exists(pPPath))){misPs.push(pPPath)};
    for(let i=0;i<pDirPs.length;i++){if(!(exists(path.join(pPath,pDirPs[i])))){misPs.push(path.join(pPath,pDirPs[i]))}};
    if(misPs.length>0){return Promise.resolve({r:false,d:misPs})}else{return Promise.resolve({r:true,d:null})}
  };
  const{r,d}=await ckFiles();
  if(!r){
    let missListStr:string='';
    if(d.includes('.json')||d.includes('.0z1')){
      const pP:string=d.filter((p:string)=>(p.includes('.json')||p.includes('.0z1')))[0],pPFN:string=path.basename(pP);
      if(!(exists(args[0].projectPrefsPath))){missListStr+='• Missing Project Prefences File (../'+pPFN+')\n'}
      else{missListStr+='• Empty Project Prefences File ('+pPFN+')\n'}
    };
    for(let i=0;i<d.length;i++){if(!d[i].includes('.json')&&!d[i].includes('.0z1')){const bD:string=path.basename(d[i]);let mL:string='• Missing '+capd(bD)+' Folder (../';if(bD==='audio'||bD==='subs'||bD==='video'){missListStr+=mL+'media/'+bD+')\n'}else{missListStr+=mL+''+bD+')\n'}}};
    const doFixRes:string=await doDialog('msgbox',['fixMissingFilesQuestion',{name:args[0].projectName,list:missListStr}]);
    if(doFixRes!=='cancel'){
      const mkDir=async(dPath:string):Promise<boolean>=>{try{await mkdir(dPath,{recursive:true});return Promise.resolve(true)}catch{return Promise.resolve(false)}};
      const wPrefs=async(fPath:string):Promise<boolean>=>{const newPPrefsFData:string=JSON.stringify(defCompzProject);try{await writeFile(fPath,newPPrefsFData,{encoding:'utf-8'});return Promise.resolve(true)}catch(e){console.log(e);return Promise.resolve(false)}};
      for(let i=0;i<d.length;i++){if(!d[i].includes('.json')&&!d[i].includes('.0z1')){await mkDir(d[i])}else{wPrefs(d[i])}};
    }
  }
}
//-------------------------------------------------------
ipcMain.on('set-current-project',async(e:any,args:any[])=>{
  if(args[0]!==null){
    currentProject=args[0];
    if(currentProject&&!_.isEmpty(currentProject)){
      console.log('[main] currentProject [SET]: '+currentProject.projectName+' - currentProject SET!');
      compzWin.webContents.send('current-project-loaded',[currentProject]);
    }else{
      console.log('[main] currentProject [ERROR]: args[0] !== Valid Project Object');
      console.log(args[0]);
    };
    checkCurrentProject(args);
  }else{console.log('[main] currentProject [SET]: to null - Resetting GVars...');currentProject=null;mainCMIsOpen=false;fileExplorerIsOpen=false;cmOpts=null;appContextSection=null;homeContextSection=null;homeContextArea=null;feContextFile=null;plContextFile=null;pjContextFile=null;playerFileLoaded=null;plMarkedFiles=null;editorFile=null;editorShouldSave=null;compzWin.webContents.send('current-project-loaded',[null])}
});
//-------------------------------------------------------
ipcMain.handle('clearcache',async()=>{try{await session.defaultSession.clearCache();doSuccess('Clear Cache','Session cache cleared successfully');return true}catch(e){appCons('(IPCHandler|clearcache) ERROR: '+e);return false}});
ipcMain.on('fe-is-open',async(e:any,args:any[])=>{const oldState:boolean|null=fileExplorerIsOpen;if(args[0]!==fileExplorerIsOpen){fileExplorerIsOpen=args[0];if(oldState!==null){compzWin.webContents.send('fe-is-open-changed',[fileExplorerIsOpen])}}});
ipcMain.handle('is-fe-open',async()=>{return fileExplorerIsOpen});
//-------------------------------------------------------
ipcMain.on('app-context-section',async(e:any,args:any[])=>{if(!mainCMIsOpen){appContextSection=args[0];ctxtReg('acs');await cmBuild()}else{ctxtBlock('app-context-section','appContextSection')}});
ipcMain.on('home-context-section',async(e:any,args:any[])=>{if(!mainCMIsOpen){homeContextSection=args[0];ctxtReg('hcs');await cmBuild()}else{ctxtBlock('home-context-section','homeContextSection')}});
ipcMain.on('home-context-area',async(e:any,args:any[])=>{if(!mainCMIsOpen){homeContextArea=args[0];ctxtReg('hca');await cmBuild()}else{ctxtBlock('home-context-area','homeContextArea')}});
ipcMain.on('cm-isopen',async(e:any,args:any[])=>{if(mainCMIsOpen!==args[0]){mainCMIsOpen=args[0];console.log('Changed mainCMIsOpen='+String(args[0])+' via #cm-isopen')}});
//-------------------------------------------------------
ipcMain.on('fe-context-file',async(e:any,args:any[])=>{if(!mainCMIsOpen){feContextFile=args[0];ctxtFile('fecf');await cmBuild()}else{ctxtBlock('fe-context-file','feContextFile')}});
ipcMain.on('pl-context-file',async(e:any,args:any[])=>{if(!mainCMIsOpen){plContextFile=args[0];ctxtFile('plcf');await cmBuild()}else{ctxtBlock('pl-context-file','plContextFile')}});
ipcMain.on('pj-context-file',async(e:any,args:any[])=>{if(!mainCMIsOpen){pjContextFile=args[0];ctxtFile('pjcf');await cmBuild()}else{ctxtBlock('pj-context-file','pjContextFile')}});
ipcMain.on('player-file-loaded',async(e:any,args:any[])=>{playerFileLoaded=args[0];ctxtFile('pfl');await cmBuild()});
ipcMain.handle('get-player-file-loaded',async(e:any,args)=>{
  if(playerFileLoaded){appCons('[ipcMain|Handle|get-player-file-loaded] - FOUND playerFileLoaded - Returning fileObj');return playerFileLoaded}else{appCons('[ipcMain|Handle|get-player-file-loaded] - No playerFileLoaded (null) - Returning NULL');return null}
});
ipcMain.on('pl-marked-files',async(e:any,args:any[])=>{plMarkedFiles=args[0];await cmBuild()});
//-------------------------------------------------------
ipcMain.on('appConsReady',async(e:any)=>{if(!appConsReady){appConsReady=true}});
//-------------------------------------------------------
ipcMain.handle('getCompzPaths',async():Promise<AppPaths|null>=>{return compzAppPaths});
ipcMain.handle('getFFPath',async(e:any,args:any[]):Promise<{r:boolean,d:string|null}>=>{
  let ffPathRes:{r:boolean,d:string|null}={r:false,d:null};
  if(compzAppPaths!==null&&compzAppPaths.hasOwnProperty('binary')){
    if(compzAppPaths.binary.hasOwnProperty(args[0])){
      if(typeof compzAppPaths.binary[args[0]]==='string'&&compzAppPaths.binary[args[0]].trim().length>0){ffPathRes={r:true,d:compzAppPaths.binary[args[0]].trim()}}
      else{appCons('(IPCHandle|getFFPath) ERROR: compzAppPaths.binary.'+args[0]+'==="" (blank)')}
    }else{appCons('(IPCHandle|getFFPath) ERROR: compzAppPaths missing property '+args[0])}
  }else{appCons('(IPCHandle|getFFPath) ERROR: compzAppPaths===null||compzAppPaths missing binary property')}
  return Promise.resolve(ffPathRes);
});
//-------------------------------------------------------
ipcMain.handle('getYTDLPath',async():Promise<{r:boolean,d:string|null}>=>{
  let ytdlPathRes:{r:boolean,d:string|null}={r:false,d:null};
  if(compzAppPaths!==null&&compzAppPaths.hasOwnProperty('binary')){
    if(compzAppPaths.binary.hasOwnProperty('ytdl')){
      if(typeof compzAppPaths.binary['ytdl']==='string'&&compzAppPaths.binary['ytdl'].trim().length>0){ytdlPathRes={r:true,d:compzAppPaths.binary['ytdl'].trim()}}
      else{appCons('(IPCHandle|getYTDLPath) ERROR: compzAppPaths.binary.ytdl==="" (blank)')}
    }else{appCons('(IPCHandle|getYTDLPath) ERROR: compzAppPaths missing property ytdl')}
  }else{appCons('(IPCHandle|getYTDLPath) ERROR: compzAppPaths===null||compzAppPaths missing binary property')}
  return Promise.resolve(ytdlPathRes);
});
//-------------------------------------------------------
ipcMain.handle('getIPRegionLang',async()=>{if(userIPRegLang){return userIPRegLang}else{await initNetIPRegion();if(userIPRegLang){return userIPRegLang}else{return null}}});
ipcMain.handle('getAppPath',async()=>{return compzAppPaths.app});
ipcMain.handle('getProjectsPath',async()=>{return path.join(app.getPath('documents'),'compzProjects')});
ipcMain.handle('isProjectLoaded',async()=>{if(currentProject!==null&&typeof currentProject==='object'&&!_.isEmpty(currentProject)){return true}else{return false}});
ipcMain.handle('getDefaultProjectPath',async()=>{return defaultProject.projectDirPath});
ipcMain.handle('getUserProjects',async(e:any,args?:any[])=>{if(args&&args[0]&&args[0]==='sync'){await syncUProjects();return userProjects}else{return userProjects}});
ipcMain.handle('getCurrentProject',async(e:any,args?:any[])=>{if(currentProject){return {r:true,d:currentProject}}else{return {r:false,data:null}}});
ipcMain.handle('getMediaPath',async()=>{
  let mPRes:string='';
  if(currentProject){mPRes=path.join(currentProject.projectDirPath,'media')}
  else{appCons('(IPCHandle|getMediaPath) ERROR: currentProject.projectDirPath - NOT FOUND')};
  return mPRes;
});
ipcMain.handle('getBDirPath',async(e:any,args:any[])=>{
  console.log('[ipcHandle|getBDirPath] args[0]= '+args[0]);
  let bdirPRes:string='';
  if(currentProject&&currentProject.hasOwnProperty('projectDirPath')&&currentProject.projectDirPath){
    console.log('[ipcHandle|getBDirPath] Found Project & currentDirPath: '+currentProject.projectDirPath);
    bdirPRes=path.join(currentProject.projectDirPath,'media/'+args[0]);
    console.log('[ipcHandle|getBDirPath] Set Result to: '+bdirPRes);
  }else{
    appCons('(IPCHandle|getBDirPath) ERROR: currentProject.projectDirPath - NOT FOUND')
  };
  return bdirPRes;
});
//-------------------------------------------------------
ipcMain.on('openWindowsDir',async(e:any,args:any[])=>{shell.showItemInFolder(args[0])});
//-------------------------------------------------------
ipcMain.handle('readProjPrefsFile',async(e:any,args:any[]):Promise<{r:boolean,d:any}>=>{
  if((await exists(currentProject.projectPrefsPath))){
      const rAPFStr:string=await readFile(currentProject.projectPrefsPath,'utf-8');
      const rAPFObj:AllCompzStates=JSON.parse(rAPFStr);
      if(args&&args.length>0&&args[0]){
        if(args[0]==='app'){const resD:AppStates=rAPFObj.appStates;return Promise.resolve({r:true,d:resD})}
        else if(args[0]==='home'){const resD:HomeStates=rAPFObj.homeStates;return Promise.resolve({r:true,d:resD})}
        else{return Promise.resolve({r:false,d:null})}
      }else{return Promise.resolve({r:true,d:rAPFObj})}
  }else{return Promise.resolve({r:false,d:null})}
});
ipcMain.handle('writeProjPrefsFile',async(e:any,args:any[])=>{
  if(!fileRWInProg){fileRWInProg=true;
    const pFileObjKey:string|null=args[1];const pFileData:any=args[0];
    const readExistPF=async():Promise<any>=>{
      try{
        const rAPFRes:any=await readFile(currentProject.projectPrefsPath,'utf-8');
        if(typeof rAPFRes==='object'){return Promise.resolve({r:true,d:rAPFRes})}
        else if(typeof rAPFRes==='string'&&(await isJSON(rAPFRes))){
          const tO:any=JSON.parse(rAPFRes);
          if(typeof tO==='object'){return Promise.resolve({r:true,d:tO})}else{return Promise.resolve({r:false,d:null})}
        }
      }catch(e){console.log(e);return Promise.resolve({r:false,d:null})}
    };
    if(pFileObjKey==='appStates'||pFileObjKey==='homeStates'){
      const rEPFRes:any=await readExistPF();
      if(rEPFRes.r){
        let existPFData:any=rEPFRes.d;
        let compPFData:any;pFileObjKey===null?compPFData=rEPFRes.d:compPFData=rEPFRes.d[pFileObjKey];
        if(!_.isEqual(compPFData,pFileData)){
          const diffRes:any=isDiff(pFileData,compPFData);
          if(diffRes.r){
            existPFData.prefsLastMod=Math.round((new Date()).getTime()/1000);
            existPFData[pFileObjKey]=pFileData;
            const newPFData:string=JSON.stringify(existPFData);
            try{const wNewPFRes=writeFile(currentProject.projectPrefsPath,newPFData,'utf-8');await wNewPFRes;fileRWInProg=false;return true}
            catch(e){appCons('[main|ipcMain.handle] (writeProjPrefsFile) [ERROR]: '+JSON.stringify(e));fileRWInProg=false;return false}
          }else{fileRWInProg=false;return true}
        }else{fileRWInProg=false;return true}
      }else{appCons('(writeProjPrefsFile) [ERROR]: Failed to Read Existing compzPrefs.json - Aborted');fileRWInProg=false;return false}
    }else{
      appCons('(writeProjPrefsFile) Will-Quit-Quick-Save...');
      const newPFData:string=JSON.stringify(pFileData);
      try{const wNewPFRes=writeFile(currentProject.projectPrefsPath,newPFData,'utf-8');await wNewPFRes;fileRWInProg=false;return true}
      catch(e){appCons('[main|ipcMain.handle] (writeProjPrefsFile) [ERROR]: '+JSON.stringify(e));fileRWInProg=false;return false}
    }
  }else{fileRWInProg=false;return false}
});
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////


