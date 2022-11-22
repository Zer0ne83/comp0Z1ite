import { captionTrack } from 'ytdl-core';
import { DirectoryTree, DirectoryTreeOptions } from 'directory-tree';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Howl } from 'howler';
import { FFProbeBoolean } from 'ffprobe';
//////////////////////////////////////////////////
///// COMPZ TYPES
//////////////////////////////////////////////////
export type LaunchInitParams={type:'new'|'open'|'import',openProject?:AppProject,importPath?:string}
export type CompzPopover={popType:'input'|'alert'|'btnquery',popId:string,showing:boolean}
export type CompzPopoverOptions={id:string,type:'input'|'alert'|'btnquery',title:string,msg:string|any[],msgIsList?:boolean,okTxt?:string,cancelTxt?:string,help?:string,icon?:string,inputLabel?:string,inputInitValue?:string,inputPH?:string,invalidStrs?:string[],btnQueryBtns?:CompzPopoverQueryBtn[]};
export type CompzPopoverQueryBtn={role:'action'|'cancel'|'ok',label:string,action:string|null}
export type ExportedProjectInfo={project:AppProject,zipPath:string,zipFiles:string[],zipCounts:ExportedProjectCounts}
export type ExportedProjectCounts={files:number,folders:number,total:number,sizeNo:number,sizeStr:string}
export type ImportedProjectInfo={project:AppProject,zipPath:string,zipFiles:string[],zipCounts:ExportedProjectCounts}
export type ImportedProjectCounts={files:number,folders:number,total:number,sizeNo:number,sizeStr:string}
export type HowlPlaylistItem={no:string,id:number,name:string,path:string,data:any,howl:Howl|null}
export type HowlUserOpts={volume:number,loop:boolean,mute:boolean,rate:number}
export type HowlProgressObj={prog:{n:number,s:string},dur:{n:number,s:string},perc:{n:number,s:string}}
//////////////////////////////////////////////////
///// APP PATHS
//////////////////////////////////////////////////
// AppPaths TYPE
export type AppPaths={app:string|null,binary:{ffmpeg:string|null,ffplay:string|null,ffprobe:string|null,ytdl:string|null},appData:string|null,userData:string|null,desktop:string|null,documents:string|null,downloads:string|null}
// AppPaths DEFAULT OBJECT
export const defCompzAppPaths:AppPaths|null={app:null,binary:{ffmpeg:null,ffplay:null,ffprobe:null,ytdl:null},appData:null,userData:null,desktop:null,documents:null,downloads:null}
//////////////////////////////////////////////////
///// APP STATES
//////////////////////////////////////////////////
// Types
export type AppProject={projectName:string,projectDirPath:string,projectPrefsPath:string,projectLastMod:number}
export type AppMediaFileExts={audio:string[],subs:string[],video:string[]}
export type AppStatusBar={barActionTxt:string|null,barHATime:string,barHistoryTxt:string|null,barA2HInProg:boolean,barA2HAnim:boolean,barWait:any}
export type AppFeItemOrder={audio:AppFeItemOrderObject,subs:AppFeItemOrderObject,video:AppFeItemOrderObject}
export type AppFeItemOrderObject={by:'type'|'name'|'size'|'ext',dir:'asc'|'desc'}
export type AppFeDataStats={audio:AppFeDataStatsObject,subs:AppFeDataStatsObject,video:AppFeDataStatsObject,all:AppFeDataStatsObject}
export type AppFeDataStatsObject={count:{file:number,dir:number},size:{no:string,suffix:string}}
export type AppFeBaseDirPaths={audio:string,subs:string,video:string}
export type AppFeDirVis={audio:any,subs:any,video:any}
export type AppFeSearch={
  feShowSearch:boolean,
  fePreSearchOrder:AppFeItemOrder,
  feSearchInProg:boolean,
  feSearchVal:string,
  feSearchMatches:any|null,
  feSearchMatchData:any|null,
  feGhostDirs:any,
  tdData:AppSearchTDData,
  filterData:AppSearchFilterData
}
export type AppSearchTDData={
  feSearchTDOpts:IDropdownSettings,
  feSearchTDsTrue:AppSearchTDSObject[],
  feSearchTDAll:AppSearchTDSObject[],
  feSearchTDIndic:AppSearchTDIndicObject,
  feSearchHideBlock:AppSearchHideBlockObject
}
export type AppSearchTDSObject={bdir:string,label:string,isDisabled:boolean}
export type AppSearchTDIndicObject={audio:boolean,subs:boolean,video:boolean}
export type AppSearchHideBlockObject={audio:boolean,subs:boolean,video:boolean}
export type AppSearchFilterData={feSearchFilters:string[],feHasActiveFilters:boolean,feAFCount:number,feFilterOut:any}
export type AppFeRename={feIsRenaming:boolean,feDidRename:string|null,feRenameFSInProg:boolean,feRenameItem:string|null,feRenameVals:any,feRenameName:string}
//////////////////////////////////////////////////
// AppStates TYPE
export type AppStates={
  mediaFileExts:AppMediaFileExts,
  isMaxed:boolean,
  statusBar:AppStatusBar,
  feIsOpen:boolean,
  feArrangeWin:'equal'|'combined',
  feEqualWinMax:string,
  feItemOrder:AppFeItemOrder|null,
  feTreeOpts:DirectoryTreeOptions,
  feTreeAudio:DirectoryTree|null,
  feTreeSubs:DirectoryTree|null,
  feTreeVideo:DirectoryTree|null,
  feDataStats:AppFeDataStats,
  feDirVis:AppFeDirVis,
  feSearch:AppFeSearch,
  feRename:AppFeRename
}
//////////////////////////////////////////////////
// AppStates DEFAULT OBJECT
export const defAppStates:AppStates={
  mediaFileExts:{
    audio:['.mp3','.aac','.flac','.wav','.aiff','.dsd','.pmc','.mid'],
    subs:['.srt','.ssa','.ttml','.sbv','.dfxp','.vtt','.txt'],
    video:['.mpg','.mpeg','.mp4','.mp2','.webm','.ogg','.m4p','.m4v','.avi','wmv','.mov']
  },
  isMaxed:false,
  statusBar:{barActionTxt:null,barHATime:'',barHistoryTxt:null,barA2HInProg:false,barA2HAnim:false,barWait:null},
  feIsOpen:false,
  feArrangeWin:'equal',
  feEqualWinMax:'',
  feItemOrder:{audio:{by:'type',dir:'asc'},subs:{by:'type',dir:'asc'},video:{by:'type',dir:'asc'}},
  feTreeOpts:{attributes:['type','extension','birthtime','atime','mtime','ctime'],normalizePath:true,depth:3},
  feTreeAudio:null,
  feTreeSubs:null,
  feTreeVideo:null,
  feDataStats:{audio:{count:{file:0,dir:0},size:{no:'',suffix:''}},subs:{count:{file:0,dir:0},size:{no:'',suffix:''}},video:{count:{file:0,dir:0},size:{no:'',suffix:''}},all:{count:{file:0,dir:0},size:{no:'',suffix:''}}},
  feDirVis:{audio:{},subs:{},video:{}},
  feSearch:{
    feShowSearch:false,
    fePreSearchOrder:{audio:{by:'type',dir:'asc'},subs:{by:'type',dir:'asc'},video:{by:'type',dir:'asc'}},
    feSearchInProg:false,
    feSearchVal:'',
    feSearchMatches:null,
    feSearchMatchData:null,
    feGhostDirs:{},
    tdData:{
      feSearchTDOpts:{singleSelection:false,idField:'bdir',textField:'label',enableCheckAll:false,allowSearchFilter:false,itemsShowLimit:0,limitSelection:3,closeDropDownOnSelection:false,showSelectedItemsAtTop:false,defaultOpen:false,allowRemoteDataSearch:false},
      feSearchTDsTrue:[{bdir:'audio',label:'Audio',isDisabled:false},{bdir:'subs',label:'Subs',isDisabled:false},{bdir:'video',label:'Video',isDisabled:false}],
      feSearchTDAll:[{bdir:'audio',label:'Audio',isDisabled:false},{bdir:'subs',label:'Subs',isDisabled:false},{bdir:'video',label:'Video',isDisabled:false}],
      feSearchTDIndic:{audio:true,subs:true,video:true},
      feSearchHideBlock:{audio:false,subs:false,video:false}
    },
    filterData:{feSearchFilters:[],feHasActiveFilters:false,feAFCount:0,feFilterOut:{}}
  },
  feRename:{feIsRenaming:false,feDidRename:null,feRenameFSInProg:false,feRenameItem:null,feRenameVals:{},feRenameName:''}
}
//////////////////////////////////////////////////
///// HOME STATES
//////////////////////////////////////////////////
// Types
export type HomeIPRegLan={ip:string,city:string,region:string,region_code:string,country:string,country_code:string,languages:string}
export type HomeSectionHs={player:string,editor:string,scraper:string}
export type HomePPLDurNiceBytes={no:number,txt:string,suffix:string}
export type HomePPLDurObject={no:number,txt:string}
export type HomePPLItem={
  atime:Date,
  bdir:string,
  birthtime:Date,
  cname:string,
  ctime:Date,
  dur:HomePPLDurObject,
  extension:string,
  fsize:HomePPLDurNiceBytes,
  mtime:Date,
  name:string,
  path:string,
  type:string,
  isSnip:boolean,
  //----------
  index?:number,
  codec_name?: string | undefined,
  codec_long_name?: string | undefined,
  profile?: string | undefined;
  codec_type?: 'video' | 'audio' | 'images' | undefined,
  codec_time_base: string,
  codec_tag_string: string,
  codec_tag: string,
  extradata?: string | undefined,
  width?: number | undefined,
  height?: number | undefined,
  coded_width?: number | undefined,
  coded_height?: number | undefined,
  closed_captions?: FFProbeBoolean | undefined,
  has_b_frames?: number | undefined,
  sample_aspect_ratio?: string | undefined,
  display_aspect_ratio?: string | undefined,
  pix_fmt?: string | undefined,
  level?: number | undefined,
  color_range?: string | undefined,
  color_space?: string | undefined,
  color_transfer?: string | undefined,
  color_primaries?: string | undefined,
  chroma_location?: string | undefined,
  field_order?: string | undefined,
  timecode?: string | undefined,
  refs?: number | undefined,
  sample_fmt?: string | undefined,
  sample_rate?: number | undefined,
  channels?: number | undefined,
  channel_layout?: string | undefined,
  bits_per_sample?: number | undefined,
  id?: string,
  r_frame_rate?: string,
  avg_frame_rate?: string,
  time_base: string,
  start_pts?: number | undefined,
  start_time?: number | undefined,
  duration_ts?: string | undefined,
  duration?: number | undefined,
  bit_rate?: number | undefined,
  max_bit_rate?: number | undefined,
  bits_per_raw_sample?: number | undefined,
  nb_frames?: number | undefined,
  nb_read_frames?: number | undefined,
  nb_read_packets?: number | undefined,
  is_avc?: number | undefined,
  nal_length_size?: number | undefined,
  disposition?: {
    default?: number,
    dub?: number,
    original?: number,
    comment?: number,
    lyrics?: number,
    karaoke?: number,
    forced?: number,
    hearing_impaired?: number,
    visual_impaired?: number,
    clean_effects?: number,
    attached_pic?: number,
    timed_thumbnails?: number | undefined,
  },
  tags?: {
    language?: string | undefined,
    handler_name?: string | undefined,
    creation_time?: string | undefined,
    [tag: string]: string | undefined,
  }
}
export type HomeProjectPlaylistDirPaths={a:string,v:string,s:string}
export type HomeProjectPlaylist={name:string,items:HomePPLItem[],dirPaths:HomeProjectPlaylistDirPaths,isLoaded:boolean}
export type HomePLHData={tsize:{no:number,txt:string,suffix:string},tdur:{no:number,txt:string}}
export type HomePLSort={by:string|null,dir:string|null}
export type HomeECMDs={allArr:string[],copy:boolean,cut:boolean,paste:boolean,undo:boolean,redo:boolean,selectAll:boolean}
export type HomeTSelO={txt:string,section:string}
export type HomeSubBoxLs={focusin:Function|null,focus:Function|null,focusout:Function|null,blur:Function|null}
export type HomeETBS={o:HomeETBDataObj,n:HomeETBDataObj,canEdit:boolean,hasFocus:boolean,didChange:boolean,isTyping:boolean}
export type HomeETBDataObj={data:string|null,counts:{lines:number,words:number,chars:number}}
export type HomeETBAV={o:{data:any|null},n:{data:any|null},canEdit:boolean,hasFocus:boolean,didChange:boolean}
export type HomePlayerCtrls={play:boolean,pause:boolean,stop:boolean,loop:boolean};
export type HomeTLTick={l:string,m:string};
export type HomeScrubHead={init:boolean,pos:number,isDrag:boolean};
export type HomePlayerPtys={plLoaded:HomeProjectPlaylist|null,isLoaded:boolean,isListen:boolean,canPlay:boolean,playerStatusTxt:string,ttlMSDur?:number,startTS?:number,delayPadPerc?:number,elapsedVal:string,durationVal:string,timelineTicks:HomeTLTick[],cursorSeekInfo:any,backFWDLeftX:any,scrubHead:HomeScrubHead,progressVal:number,volumeVal:number,volumeTxt:string,rateVal:number,isMute:boolean,isLoop:boolean};
export type HomeSearchSource={id:string,value:string,checked:boolean};
export type HomeScrapeFormat={id:string,value:string,checked:boolean};
export type HomeSearchLimitTime={minutes:number,seconds:number};
export type HomeSearchNoLimit={time:boolean,data:boolean};
export type HomeSearchSearchLimits={maxmatch:number,maxresolve:number,orderby:string};
export type HomeSearchScrapeLimits={time:HomeSearchLimitTime,data:number,nolimit:HomeSearchNoLimit};
export type HomeSearchLimits={scrape:HomeSearchScrapeLimits,search:HomeSearchSearchLimits};
export type HomeSearchSourceMatches={c:number,p:number,v:number};
export type HomeSearchSourceResultItem={type:string,id:string,date:string,title:string,thumb:string,isTarget:boolean,isBad:boolean};
export type HomeSearchSourceResults={channels:HomeSearchSourceResultItem[],playlists:HomeSearchSourceResultItem[],videos:HomeSearchSourceResultItem[],matches:HomeSearchSourceMatches};
export type HomeSearchStatusTime={date:Date|null,txt:string};
export type HomeSearchStatusCounter={remainTime:number,remainTStr:string,execTime:number,execTStr:string};
export type HomeProg={type:string,buffer:number,perc:number,txt:string};
export type HomeSearchStatusInfo={txt:string,isErr:boolean};
export type HomeSearchStatus={inProgress:boolean,isPaused:boolean,sTime:HomeSearchStatusTime,eTime:HomeSearchStatusTime,startTime:number,deadlineTime:number,pauseTimeRemain:number,pauseTimeExec:number,counter:HomeSearchStatusCounter,progress:HomeProg,info:HomeSearchStatusInfo};
export type HomeSearchScrapeResHeadsVis={exact:boolean,multi:boolean,single:boolean};
export type HomeSearchTermWGroupsCounts={exact:number,multi:number,single:number};
export type HomeSearchTermWGroupSingleObject={word:string,rx:RegExp};
export type HomeSearchTermWGroupMultiObject={len:number,list:string[],rx:RegExp[]};
export type HomeSearchTermWGroupsQuery={exact:string,multi:HomeSearchTermWGroupMultiObject[],single:HomeSearchTermWGroupSingleObject[],counts:HomeSearchTermWGroupsCounts};
export type HomeSearchTermWGroups={q:HomeSearchTermWGroupsQuery}
export type HomeSearchTermPhraseCounts={chars:number,words:number};
export type HomeSearchTermPhrase={q:string,c:HomeSearchTermPhraseCounts};
export type HomeSearchTerm={phrase:HomeSearchTermPhrase,wGroups:HomeSearchTermWGroups};
export type HomeScrapeSubJSONTranscriptLineTime={start:number,dur:number};
export type HomeScrapeSubJSONTranscriptLine={text:string,time:HomeScrapeSubJSONTranscriptLineTime};
export type HomeScrapeSubJSON={transcript:HomeScrapeSubJSONTranscriptLine[]};
export type HomeSubSearchMatch={mTxt:string,mLen:number,mIdList:string[]};
export type HomeSubSearchMatches={exact:HomeSubSearchMatch,multi:HomeSubSearchMatch[],single:HomeSubSearchMatch[],counts:{exact:number,multi:number,single:number}};
export type HomeScrapeSnippetSubMatchTimeObject={secs:number,txt:string};
export type HomeScrapeSnippetSubMatchTimes={start:HomeScrapeSnippetSubMatchTimeObject,dur:HomeScrapeSnippetSubMatchTimeObject,stop:HomeScrapeSnippetSubMatchTimeObject};
export type HomeScrapeSnippetSubMatch={times:HomeScrapeSnippetSubMatchTimes,textLine:string,selected:boolean};
export type HomeScrapeSnippetPAVObject={gotFile:boolean,filePath:string};
export type HomeScrapeSnippetPAV={a:HomeScrapeSnippetPAVObject,v:HomeScrapeSnippetPAVObject,pref:string};
export type HomeScrapeSnippet={qTxt:string,qLen:number,vId:string,cTitle:string,cAuthor:string,vTitle:string,dur:string,prevAV:HomeScrapeSnippetPAV,subMatches:HomeScrapeSnippetSubMatch[],subLVis:boolean};
export type HomeScrapeSnippets={exact:HomeScrapeSnippet[],multi:HomeScrapeSnippet[],single:HomeScrapeSnippet[]};
export type HomeScrapeSnipRGItem={vId:string,cTitle:string,vTitle:string,dur:string,prevAV:HomeScrapeSnippetPAV,subMatches:HomeScrapeSnippetSubMatch[],subLVis:boolean};
export type HomeScrapeSnipResultsGroup={q:string,words:number,snips:HomeScrapeSnipRGItem[],vis:boolean,avPref:string};
export type HomeScrapeSnipResults={exact:HomeScrapeSnipResultsGroup[],multi:HomeScrapeSnipResultsGroup[],single:HomeScrapeSnipResultsGroup[]};
export type HomeScrapeSnipLimits={exact:{maxItems:number,maxLines:number},multi:{maxItems:number,maxLines:number},single:{maxItems:number,maxLines:number}};
export type HomeScrapeTargetTimeObj={secs:number,str:string};
export type HomeScrapeTargetCountObj={count:number,time:HomeScrapeTargetTimeObj};
export type HomeScrapeTargetCounts={all:HomeScrapeTargetCountObj,noCC:HomeScrapeTargetCountObj,notSel:HomeScrapeTargetCountObj,ok:HomeScrapeTargetCountObj};
export type HomeScrapeTargetProcessProg={item:HomeProg,audio:HomeProg,video:HomeProg};
export type HomeScrapeTargetProcessMode={index:number,id:string,label:string};
export type HomeDLDSObject={id:string,files:number,size:string,wordsdur:string};
export type HomeScrapeDLInfo={title:string,channel:string,author:string,views:number,duration:number,ext:string,path:string,size:number,err:boolean};
export type HomeScrapeDLType={ext:string,path:string,size:number,err:boolean};
export type HomeTargetChannelData={cID:string,cTitle:string,subCount:number,videoCount:number,viewCount:number};
export type HomeTargetPlaylistData={plID:string,plTitle:string,videoCount:number,ttlDur:string,viewCount:number};
export type HomeTargetVideo={vID:string,vTitle:string,duration:string,viewCount:number,caption:boolean,selected:boolean,info:HomeScrapeDLInfo,sub:HomeScrapeDLType,audio:HomeScrapeDLType,video:HomeScrapeDLType};
export type HomeTargetItem={itemID:string,itemTitle:string,type:string,toggled:boolean,hasCaps:string,isSelected:string,isLoaded:boolean,error:boolean,cData:HomeTargetChannelData|null,pData:HomeTargetPlaylistData|null,vData:HomeTargetVideo[]|null};
export type HomeSnipWordPeak={v:number,s:number,p:number};
export type HomeEditorCrop={cname:string,dur:number,name:string,path:string};
export type HomeEditorDelete={cname:string,dur:number,name:string,path:string};
export type HomeEditorEdit={cname:string,dur:number,name:string,path:string};
export type HomeEditorFile={
  pl:{
    plProjIndex:number,
    plObj:HomeProjectPlaylist,
    plFileIndex:number,
    plFileObj:HomePPLItem
  },
  edit:HomeEditorEdit,
  undo:HomeEditorCrop|HomeEditorDelete|HomeEditorEdit|null
};
export type HomeEditProgObj={prog:{n:number,s:string},dur:{n:number,s:string},perc:{n:number,s:string}};
export type HomeThumbObjectTime={s:number,e:number};
export type HomeThumbObject={time:HomeThumbObjectTime,path:string};
export type HomeEditSelectRangeTTL={time:number,perc:number};
export type HomeEditSelectRangeObject={pos:number,time:number};
export type HomeEditSelectRange={start:HomeEditSelectRangeObject,end:HomeEditSelectRangeObject,ttl:HomeEditSelectRangeTTL};
export type HomeEditDrawClick={x:number,y:number,t:number};
export type HomeEditDrawTTL={time:number,perc:number};
export type HomeEditDrawClicks={start:HomeEditDrawClick,end:HomeEditDrawClick,ttl:HomeEditDrawTTL};
export type HomeEditTick={value:number,show:boolean};
//////////////////////////////////////////////////
// HomeStates TYPE
export type HomeStates={
  ipRegionLang:HomeIPRegLan,
  playerSectionVis:boolean,
  editorSectionVis:boolean,
  scraperSectionVis:boolean,
  sectionHs:HomeSectionHs,
  homeFeIsOpen:boolean,
  playerTabToggle:'list'|'eq',
  projectPlaylists:HomeProjectPlaylist[],
  plHData:HomePLHData,
  plSort:HomePLSort,
  plRepeat:boolean,
  plMarkedItems:any,
  playerFile:HomePPLItem|null,
  etbAV:HomeETBAV,
  eCmds:HomeECMDs,
  tSelO:HomeTSelO,
  editorFile:HomeEditorFile|null,
  editorToolbox:'subs'|'av'|null,
  subBoxLs:HomeSubBoxLs,
  etbSubs:HomeETBS,
  etbSubsReset:HomeETBS,
  etbSelection:string,
  etbFindIsOpen:boolean
  etbFindIsCs:boolean,
  etbFindVal:string,
  etbReplaceVal:string,
  etbLastOState:any|null,
  etbFindResultsCount:number|null,
  searchMode:string,
  searchSources:HomeSearchSource[],
  scrapeFormat:HomeScrapeFormat[],
  searchLimits:HomeSearchLimits,
  searchData:any[],
  searchSourceResults:HomeSearchSourceResults,
  searchStatus:HomeSearchStatus,
  searchScrapeResHeadsVis:HomeSearchScrapeResHeadsVis,
  searchTerm:HomeSearchTerm,
  scrapeTargets:HomeTargetItem[],
  scrapeTargetCounts:HomeScrapeTargetCounts,
  resolveMaxNo:number,
  searchBarHidden:boolean,
  stProcessProg:HomeScrapeTargetProcessProg,
  stProcessModes:HomeScrapeTargetProcessMode[],
  stProcessMode:HomeScrapeTargetProcessMode,
  rdfSummary:HomeDLDSObject[],
  subSearchMatches:HomeSubSearchMatches,
  scrapeSnippets:HomeScrapeSnippets,
  scrapeSnipResults:HomeScrapeSnipResults,
  scrapeSnipLimits:HomeScrapeSnipLimits
}
//////////////////////////////////////////////////
// HomeStates DEFAULT OBJECT
export const defHomeStates:HomeStates={
  ipRegionLang:{ip:'',city:'',region:'',region_code:'',country:'',country_code:'',languages:''},
  playerSectionVis:true,
  editorSectionVis:true,
  scraperSectionVis:true,
  sectionHs:{player:'calc((100vh - 74px) / 3)',editor:'calc((100vh - 74px) / 3)',scraper:'calc((100vh - 74px) / 3)'},
  homeFeIsOpen:false,
  playerTabToggle:'list',
  projectPlaylists:[],
  plHData:{tsize:{no:0,txt:'-',suffix:'-'},tdur:{no:0,txt:'-'}},
  plSort:{by:null,dir:'asc'},
  plRepeat:true,
  plMarkedItems:{},
  playerFile:null,
  etbAV:{o:{data:null},n:{data:null},canEdit:false,hasFocus:false,didChange:false},
  eCmds:{allArr:['copy','cut','paste','undo','redo','selectAll'],copy:false,cut:false,paste:false,undo:false,redo:false,selectAll:false},
  tSelO:{txt:'',section:''},
  editorFile:null,
  editorToolbox:'av',
  subBoxLs:{focusin:null,focus:null,focusout:null,blur:null},
  etbSubs:{o:{data:null,counts:{lines:0,words:0,chars:0}},n:{data:null,counts:{lines:0,words:0,chars:0}},canEdit:false,hasFocus:false,didChange:false,isTyping:false},
  etbSubsReset:{o:{data:null,counts:{lines:0,words:0,chars:0}},n:{data:null,counts:{lines:0,words:0,chars:0}},canEdit:false,hasFocus:false,didChange:false,isTyping:false},
  etbSelection:'',
  etbFindIsOpen:false,
  etbFindIsCs:false,
  etbFindVal:'',
  etbReplaceVal:'',
  etbLastOState:null,
  etbFindResultsCount:null,
  searchMode:'search',
  searchSources:[{id:'Channels',value:'channels',checked:true},{id:'Playlists',value:'playlists',checked:true},{id:'Videos',value:'videos',checked:true}],
  scrapeFormat:[{id:'Audio',value:'audio',checked:true},{id:'Video',value:'video',checked:false},{id:'Both',value:'both',checked:false}],
  searchLimits:{scrape:{time:{minutes:0,seconds:30},data:250,nolimit:{time:false,data:false}},search:{maxmatch:50,maxresolve:50,orderby:'relevance'}},
  searchData:[],
  searchSourceResults:{channels:[],playlists:[],videos:[],matches:{c:0,p:0,v:0}},
  searchStatus:{inProgress:false,isPaused:false,sTime:{date:null,txt:''},eTime:{date:null,txt:''},startTime:0,deadlineTime:0,pauseTimeRemain:0,pauseTimeExec:0,counter:{remainTime:0,remainTStr:'',execTime:0,execTStr:''},progress:{type:'determinate',buffer:1,perc:0,txt:''},info:{txt:'ready/waiting',isErr:false}},
  searchScrapeResHeadsVis:{exact:true,multi:true,single:true},
  searchTerm:{phrase:{q:'',c:{chars:0,words:0}},wGroups:{q:{exact:'',multi:[],single:[],counts:{exact:0,multi:0,single:0}}}},
  scrapeTargets:[],
  scrapeTargetCounts:{all:{count:0,time:{secs:0,str:''}},noCC:{count:0,time:{secs:0,str:''}},notSel:{count:0,time:{secs:0,str:''}},ok:{count:0,time:{secs:0,str:''}}},
  resolveMaxNo:50,
  searchBarHidden:false,
  stProcessProg:{item:{type:'determinate',buffer:1,perc:0,txt:'0%'},audio:{type:'determinate',buffer:1,perc:0,txt:'0%'},video:{type:'determinate',buffer:1,perc:0,txt:'0%'}},
  stProcessModes:[{index:0,id:'audio',label:'audio only'},{index:1,id:'video',label:'video only'},{index:2,id:'audiovideo',label:'audio+video'}],
  stProcessMode:{index:0,id:'audio',label:'audio only'},
  rdfSummary:[{id:'sub',files:0,size:'-',wordsdur:'-'},{id:'audio',files:0,size:'-',wordsdur:'-'},{id:'video',files:0,size:'-',wordsdur:'-'}],
  subSearchMatches:{exact:null,multi:[],single:[],counts:{exact:0,multi:0,single:0}},
  scrapeSnipLimits:{exact:{maxItems:10,maxLines:3},multi:{maxItems:3,maxLines:1},single:{maxItems:1,maxLines:1}},
  scrapeSnippets:{exact:[],multi:[],single:[]},
  scrapeSnipResults:{exact:[],multi:[],single:[]}
}
//////////////////////////////////////////////////
///// COMPZ STATES
//////////////////////////////////////////////////
// CompzStates TYPE
export type AllCompzStates={appStates:AppStates,homeStates:HomeStates}
//////////////////////////////////////////////////
// CompzStates DEFAULT OBJECT
export const defCompzProject:AllCompzStates={appStates:defAppStates,homeStates:defHomeStates}
//////////////////////////////////////////////////
export const CommonWordsArr=['the','be','to','of','and','a','in','that','have','I','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us'];
export const ContractionsArr=[
  {'aren\'t':'are not'},
  {'can\'t':'cannot'},
  {'couldn\'t':'could not'},
  {'could\'ve':'could have'},
  {'didn\'t':'did not'},
  {'doesn\'t':'does not'},
  {'don\'t':'do not'},
  {'hadn\'t':'had not'},
  {'hasn\'t':'has not'},
  {'haven\'t':'have not'},
  {'he\'d':['he had','he would']},
  {'he\'ll':['he will','he shall']},
  {'he\'s':['he is','he has']},
  {'I\'d':['I had','I would']},
  {'I\'ll':['I will','I shall']},
  {'I\'m':'I am'},
  {'I\'ve':'I have'},
  {'isn\'t':'is not'},
  {'it\'d':'it would'},
  {'it\'ll':['it shall','it will']},
  {'it\'s':['it is','it has']},
  {'let\'s':'let us'},
  {'ma\'am':'madam'},
  {'mightn\'t':'might not'},
  {'might\'ve':'might have'},
  {'mustn\'t':'must not'},
  {'must\'ve':'must have'},
  {'needn\'t':'need not'},
  {'ne\'er':'never'},
  {'o\'er':'over'},
  {'ol\'':'old'},
  {'oughtn\'t':'ought not'},
  {'shan\'t':'shall not'},
  {'she\'d':['she had','she would']},
  {'she\'ll':['she will','she shall']},
  {'she\'s':['she is','she has']},
  {'shouldn\'t':'should not'},
  {'should\'ve':'should have'},
  {'that\'d':'that would'},
  {'that\'s':['that is','that has']},
  {'there\'d':['there had','there would']},
  {'there\'ll':['there shall','there will']},
  {'there\'s':['there has','there is']},
  {'they\'d':['they had','they would']},
  {'they\'ll':['they will','they shall']},
  {'they\'re':'they are'},
  {'they\'ve':'they have'},
  {'\'twas':'it was'},
  {'wasn\'t':'was not'},
  {'we\'d':['we had','we would']},
  {'we\'ll':'we will'},
  {'we\'re':'we are'},
  {'we\'ve':'we have'},
  {'weren\'t':'were not'},
  {'what\'ll':['what will','what shall']},
  {'what\'re':'what are'},
  {'what\'s':['what is','what has','what does']},
  {'what\'ve':'what have'},
  {'where\'d':'where did'},
  {'where\'s':['where is','where has']},
  {'who\'d':['who had','who would']},
  {'who\'ll':['who will','who shall']},
  {'who\'s':['who is','who has']},
  {'who\'ve':'who have'},
  {'why\'d':'why did'},
  {'won\'t':'will not'},
  {'wouldn\'t':'would not'},
  {'would\'ve':'would have'},
  {'you\'d':['you had','you would']},
  {'you\'ll':['you will','you shall']},
  {'you\'re':'you are'},
  {'you\'ve':'you have'},
  {'somebody\'s':'somebody is'},
  {'someone\'d':['someone had','someone would']},
  {'someone\'ll':['someone shall','someone will']},
  {'someone\'s':['someone has','someone is']},
  {'something\'d':'something had'},
  {'something\'ll':['something shall','something will']},
  {'something\'s':['something has','something is']},
  {'that\'ll':'that will'},
  {'there\'d\'ve':'there would have'},
  {'there\'re':'there are'},
  {'they\'d\'ve':'they would have'},
  {'when\'s':'when is'},
  {'where\'ve':'where have'},
  {'who\'d\'ve':'who would have'},
  {'who\'re':'who are'},
  {'why\'re':'why are'},
  {'why\'s':['why has','why is']},
  {'won\'t\'ve':'will not have'},
  {'wouldn\'t\'ve':'would not have'},
  {'you\'d\'ve':'you would have'}
];
//////////////////////////////////////////////////
//////////////////////////////////////////////////
