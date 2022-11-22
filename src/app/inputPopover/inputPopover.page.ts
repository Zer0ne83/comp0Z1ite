import { AppProject, CompzPopoverQueryBtn } from './../appTypes';
import { ipcRenderer } from 'electron';
import { NGXLogger } from 'ngx-logger';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CompzPopover } from '../appTypes';
import { EventsService } from '../events.service';
////////////////////////////////////////////////////////////////////////////////////////////////////
@Component({selector:'app-inputPopover',templateUrl:'./inputPopover.page.html',styleUrls:[]})
////////////////////////////////////////////////////////////////////////////////////////////////////
export class InputPopoverPage implements OnInit, AfterViewInit {
////////////////////////////////////////////////////////////////////////////////////////////////////
  @ViewChild('helpBtn') helpBtn:ElementRef<HTMLButtonElement>;
  @ViewChild('compzPopoverInput') compzPopoverInput:ElementRef<HTMLInputElement>;
  @ViewChild('cancelActionBtn') cancelActionBtn:ElementRef<HTMLButtonElement>;
  @ViewChild('okActionBtn') okActionBtn:ElementRef<HTMLButtonElement>;
////////////////////////////////////////////////////////////////////////////////////////////////////
  popRawParams:any|null=null;
  popoverObject:CompzPopover|null=null;
  popReady:boolean=false;
  popId:string|null=null;
  popType:'input'|'alert'|'btnquery'|null=null;
  popTitle:string='';
  popHelpDisabled:boolean=true;
  popHelpTxt:string|null=null;
  popIco:string=''
  popMsg:string|any[]='';
  popMsgIsList:boolean=false;
  popInvalidStrs:string[]=[];
  popInputLabel:string='';
  popInputPH:string|null=null;
  popInitValue:string|null=null;
  popInputValue:string='';
  popInputFocus:boolean=false;
  popInputValid:boolean|null=null;
  popInputInvalidTxt:string|null=null;
  popCancelBtnTxt:string='Cancel';
  popOKBtnTxt:string='OK';
  popBtnQueryBtns:CompzPopoverQueryBtn[]=[];
  resData:any|null=null;
  userProjects:AppProject[]=[];
////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(
    private logger:NGXLogger,
    private modalCtrl:ModalController,
    private navParams:NavParams,
    private evServ:EventsService,
    private changeDet:ChangeDetectorRef
  ) { }
////////////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit() {this.cCons('(ngOnInit)...')}
////////////////////////////////////////////////////////////////////////////////////////////////////
  async initPop():Promise<boolean>{this.cCons('(initPop)...');
    this.popRawParams=this.navParams.data;
    this.popId=this.popRawParams.id;
    this.popType=this.popRawParams.type;
    if(this.popType==='input'){
      if(this.popRawParams.hasOwnProperty('inputLabel')){this.popInputLabel=this.popRawParams.inputLabel};
      if(this.popRawParams.hasOwnProperty('inputPH')){this.popInputLabel=this.popRawParams.inputPH};
      if(this.popRawParams.hasOwnProperty('inputInitValue')){this.popInitValue=this.popRawParams.inputInitValue};
      if(this.popRawParams.hasOwnProperty('invalidStrs')){this.popInvalidStrs=this.popRawParams.invalidStrs};
    };
    if(this.popType==='btnquery'){
      if(this.popRawParams.hasOwnProperty('btnQueryBtns')){this.popBtnQueryBtns=this.popRawParams.btnQueryBtns};
    }
    this.popTitle=this.popRawParams.title;
    if(this.popRawParams.hasOwnProperty('msgIsList')&&this.popRawParams.msgIsList){this.popMsgIsList=true};
    this.popMsg=this.popRawParams.msg;
    if(this.popRawParams.hasOwnProperty('okTxt')){this.popOKBtnTxt=this.popRawParams.okTxt};
    if(this.popRawParams.hasOwnProperty('cancelTxt')){this.popOKBtnTxt=this.popRawParams.cancelTxt};
    if(this.popRawParams.hasOwnProperty('help')){this.popHelpDisabled=false;this.popHelpTxt=this.popRawParams.help};
    if(this.popRawParams.hasOwnProperty('icon')){this.popIco=this.popRawParams.icon}
    else{this.popIco='assets/compz-popover-default'+this.popType+'-ico.png'};
    this.userProjects=await ipcRenderer.invoke('getUserProjects');
    return Promise.resolve(true);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////
  async ngAfterViewInit(){this.cCons('(ngAfterViewInit)...');
    await this.initPop();
    ipcRenderer.send('popover-action',[{popType:this.popType,popId:this.popId,showing:true}]);
    const remIonPageLoop=setInterval(async()=>{
      if(document.querySelector('app-inputpopover')){
        clearInterval(remIonPageLoop);
        document.querySelector('app-inputpopover').classList.remove('ion-page');
        this.popReady=true;
        if(this.popType==='input'){
          await this.setInitFocus();
        };
      }
    },100);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////
  cCons(t:string){this.logger.info('[inputPopover] '+t)}
  //--------------------------------------------------
  pDOM(){this.changeDet.detectChanges()};
  //--------------------------------------------------
  setInitFocus():Promise<boolean>{
    const initNEs:any={input:<HTMLInputElement>this.compzPopoverInput.nativeElement,alert:<HTMLButtonElement>this.cancelActionBtn.nativeElement,btnquery:<HTMLButtonElement>this.okActionBtn.nativeElement};
    const initFEle:any=initNEs[this.popType];
    return new Promise(resolve=>{
      const waitEleLoop=setInterval(async()=>{
        if(initFEle){
          initFEle.focus({preventScroll:true});
          if(initFEle.focus){
            if(this.popType==='input'&&this.popInitValue!==null&&(await this.chkInputV(this.popInitValue))){
              initFEle.value=this.popInitValue;
              if(initFEle.value===this.popInitValue){
                initFEle.select();
                if(window.getSelection().toString().trim()===this.popInitValue.trim()){
                  clearInterval(waitEleLoop);
                  this.pDOM();
                  resolve(true);
                };
              };
            }else{clearInterval(waitEleLoop);resolve(true)};
          };
        };
      },200);
    });
  };
  //--------------------------------------------------
  isFNWinValid(fileName:string):boolean{if(this.evServ.isVFN(fileName)){return true}else{return false}};
  //--------------------------------------------------
  projNameExists(fileName:string):boolean{if(this.userProjects.length<1){return false}else{const matchNo:number=this.userProjects.filter(pO=>pO.projectName===fileName.toLowerCase()).length;if(matchNo>0){return true}else{return false}}};
  //--------------------------------------------------
  hasInvalidStr(txt:string):boolean{if(this.popInvalidStrs.length>0){if(this.popInvalidStrs.includes(txt)){return true}else{return false}}else{return false}}
  //--------------------------------------------------
  chkInputV(chkTxt?:string):Promise<boolean>{
    let cTxt:string='';chkTxt&&chkTxt.length>0?cTxt=chkTxt:cTxt=this.popInputValue;
    if(cTxt.trim().length>0&&this.isFNWinValid(cTxt)&&!this.hasInvalidStr(cTxt)&&!this.projNameExists(cTxt)){this.popInputValid=true;this.popInputInvalidTxt=null;if(this.okActionBtn.nativeElement.disabled){this.okActionBtn.nativeElement.disabled=false}}
    else{
      if(!this.isFNWinValid(cTxt)){this.popInputValid=false;this.popInputInvalidTxt='invalid chars'}
      else if(this.hasInvalidStr(cTxt)){this.popInputValid=false;this.popInputInvalidTxt='playlist exists'}
      else if(this.projNameExists(cTxt)){this.popInputValid=false;this.popInputInvalidTxt='project exists'};
      if(!this.okActionBtn.nativeElement.disabled){this.okActionBtn.nativeElement.disabled=true}
    };
    return Promise.resolve(true);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////
  async inputEvent(evName:string,evEvent:KeyboardEvent,evData:string){this.cCons('[inputData] ('+evName+',$event,'+evData+')...');
    switch(evName){
      case 'fi':this.popInputFocus=true;if(evData!==this.popInputValue){this.popInputValue=evData};await this.chkInputV();break;
      case 'fo':this.popInputFocus=false;if(evData!==this.popInputValue){this.popInputValue=evData};await this.chkInputV();break;
      case 'ch':if(evData!==this.popInputValue){this.popInputValue=evData};await this.chkInputV();break;
      case 'kd':
        if(evEvent.key==='Escape'||evEvent.key==='Enter'){
          evEvent.preventDefault();
          if(evEvent.defaultPrevented){
            if(evEvent.key==='Escape'){this.closePopover('cancel')}
            else if(evEvent.key==='Enter'){
              if(evData!==this.popInputValue){this.popInputValue=evData};await this.chkInputV();
              if(this.popInputValid===true){this.closePopover('ok')}
            }
          }
        };
        break;
      case 'ku':if(evData!==this.popInputValue){this.popInputValue=evData;this.chkInputV()};break;
    }
  }
////////////////////////////////////////////////////////////////////////////////////////////////////
  actionBtn(action:'ok'|'cancel'){this.cCons('[actionBtn] ('+action+')...');this.closePopover(action)}
  queryActionBtn(action:string|null,role:string){
    this.cCons('[queryActionBtn] (actionStr:'+action+',roleStr:'+String(role)+')...');
    this.modalCtrl.dismiss(action,role,this.popId);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////
  closePopover(btnAction:any){this.cCons('[closePopover] (closeData)...');
    let closeRole:string|null=null;btnAction==='cancel'?closeRole='cancel':closeRole='ok';
    if(closeRole==='ok'){
      if(this.popType==='input'){
        if(this.popInputValue.trim().length>0&&this.popInputValid){this.resData=this.popInputValue}
        else{return}
      };
    }else{
      if(this.popType==='input'){
        this.resData='cancel';closeRole='cancel';
      };
    };
    this.modalCtrl.dismiss(this.resData,closeRole,this.popId);
  }
////////////////////////////////////////////////////////////////////////////////////////////////////
  toggleHelp(){this.cCons('(toggleHelp)...')}
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
}
