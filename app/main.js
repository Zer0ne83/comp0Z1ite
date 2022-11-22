"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/////////////////////////////////////////////////////////
// IMPORTS
/////////////////////////////////////////////////////////
const appTypes_1 = require("./appTypes");
const promises_1 = require("fs/promises");
const electron_1 = require("electron");
const main_1 = require("@electron/remote/main");
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
const child_process_1 = require("child_process");
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
const path = __importStar(require("path"));
const url = __importStar(require("url"));
const del = __importStar(require("del"));
const Store = require('electron-store');
const AdmZip = require('adm-zip');
const _ = require('lodash');
/////////////////////////////////////////////////////////
// STATIC SETTINGS/OBJECTS
/////////////////////////////////////////////////////////
let compzWin = null;
let compzDevTools = null;
let compzChildWin = null;
let compzTray = null;
let compzRoute;
let mmDDMenus = {};
let mmDDXPos = { wrap: { start: 36, end: 272 }, file: 36, edit: 73, tools: 112, window: 160, help: 227 };
let wCBox = { left: 0, right: 0, top: 0, bottom: 0 };
const mmZone = () => { const sP = electron_1.screen.getCursorScreenPoint(); if (sP.x >= (wCBox.left + mmDDXPos.wrap.start) && sP.x <= (wCBox.left + mmDDXPos.wrap.end) && sP.y >= wCBox.top && sP.y <= (wCBox.top + 32)) {
    return { z: true, p: sP };
}
else {
    return { z: false, p: null };
} };
let mmDDOpen = null;
let mTrackInt;
let childWasOpen = false;
let myWinMode = 'dev';
let myClearDirsMode = true;
let cWinOpts = { x: 0, y: 0, width: 0, height: 0, transparent: true, frame: false, icon: path.join(__dirname, '../dist/assets/icons/favicon.png'), titleBarStyle: 'hidden', webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, nodeIntegrationInSubFrames: true, webSecurity: false, allowRunningInsecureContent: true, webgl: true, plugins: true, backgroundThrottling: false, sandbox: false, contextIsolation: false, spellcheck: false } };
let devAppArea = { x: 0, y: 0, width: 0, height: 0 };
let prodAppArea = { x: 0, y: 0, width: 0, height: 0 };
let randomAppArea = { x: 0, y: 0, width: 0, height: 0 };
let scsActive = false;
let gpuInfo = null;
let userIPRegLang = null;
const devEditArea = { x: 0, y: 0, width: 2060, height: 1400 };
/////////////////////////////////////////////////////////
// DEV/TROUBLESHOOTING/CONSOLE
/////////////////////////////////////////////////////////
const evCons = (evSource, evName, evOb) => { let sTxt = '', sIco = ''; if (evSource === 'a') {
    sTxt = 'App';
    sIco = '🧮';
}
else if (evSource === 'w') {
    sTxt = 'Window';
    sIco = '🥛';
}
else {
    sTxt = 'DevTools';
    sIco = '🛠️';
} ; console.log('⚗️ [main|' + sTxt + ' Event] - ' + evName.toUpperCase()); if (evOb) {
    console.log(evOb);
} };
const udAppSB = (t) => { compzWin.webContents.send('update-sb', [t]); };
let appConsReady = false;
const appCons = (m) => { let aCMsgOpts = { msg: m, type: typeof m }; typeof m === 'string' ? aCMsgOpts.msg = '⚗️ [main|console.log] ' + m : aCMsgOpts.msg = m; if (appConsReady && compzWin !== null) {
    compzWin.webContents.send('appCons', [aCMsgOpts]);
}
else {
    console.log(aCMsgOpts.msg);
} };
const onCxtCCons = () => {
    console.log('appContextSection: ' + appContextSection + ',homeContextSection: ' + homeContextSection + ',homeContextArea: ' + homeContextArea);
    console.log('feContextFile: ' + feContextFile);
    console.log('plContextFile: ' + plContextFile);
    console.log('pjContextFile: ' + pjContextFile);
    console.log('playerFileLoaded: ' + playerFileLoaded);
    console.log('editorFile: ' + editorFile);
};
/////////////////////////////////////////////////////////
// GET/TEST UTILITY VARS & FNS
/////////////////////////////////////////////////////////
let fileRWInProg = false;
const allPsV = (pO) => __awaiter(void 0, void 0, void 0, function* () {
    let allV = true;
    for (const p of Object.values(pO)) {
        console.log(p);
        if (p === null) {
            allV = false;
            console.log(p + ' = null');
        }
        else {
            if (typeof p === 'string') {
                const exist = yield exists(p);
                if (!exist) {
                    allV = false;
                }
                ;
                console.log(p + ' exists: ' + String(exist));
            }
            else if (typeof p === 'object') {
                for (const p2 of Object.values(p)) {
                    if (p2 === null) {
                        allV = false;
                        console.log(p2 + ' = null');
                    }
                    else {
                        if (typeof p2 === 'string') {
                            const exist2 = yield exists(p2);
                            if (!exist2) {
                                allV = false;
                            }
                            ;
                            console.log(p2 + ' exists: ' + String(exist2));
                        }
                    }
                }
            }
        }
    }
    ;
    return Promise.resolve(allV);
});
const exists = (path) => __awaiter(void 0, void 0, void 0, function* () { try {
    yield (0, promises_1.access)(path);
    return true;
}
catch (_a) {
    return false;
} });
const isJSON = (data) => { if (typeof data !== 'string')
    return Promise.resolve(false); try {
    const result = JSON.parse(data);
    const type = Object.prototype.toString.call(result);
    return Promise.resolve(type === '[object Object]' || type === '[object Array]');
}
catch (err) {
    return Promise.resolve(false);
} };
function isDiff(newObject, oldObject) { function changes(object, base) { return _.transform(object, function (result, value, key) { if (!_.isEqual(value, base[key])) {
    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
} }); } ; const diffRes = changes(newObject, oldObject); if (_.isEmpty(diffRes)) {
    return { r: false };
}
else {
    return { r: true, d: diffRes };
} }
;
const icoP = (p) => { return path.join(__dirname, '../dist/' + p); };
/////////////////////////////////////////////////////////
// PATHS VARIABLES & FNS
/////////////////////////////////////////////////////////
let compzAppPaths = null;
let defaultProject = null;
let userProjects = null;
let currentProject = null;
/////////////////////////////////////////////////////////
// CONTEXT MENU GVARS
/////////////////////////////////////////////////////////
let mainCMIsOpen = false;
let fileExplorerIsOpen = null;
let cmOpts = null;
let appContextSection = null;
let homeContextSection;
let homeContextArea;
let feContextFile = null;
let plContextFile = null;
let pjContextFile = null;
let playerFileLoaded = null;
let plMarkedFiles = null;
let editorFile = null;
let editorShouldSave = null;
/////////////////////////////////////////////////////////
// WIN/APP CTRL
/////////////////////////////////////////////////////////
const winCtrl = (action) => {
    if (!electron_1.app || !compzWin) {
        return;
    }
    else {
        if (action === 'quit' || action === 'close') {
            electron_1.app.quit();
        }
        else if (action === 'hide' || action === 'tray') {
            compzWin.hide();
        }
        else if (action === 'show') {
            compzWin.show();
        }
        else if (action === 'min') {
            if (compzWin.isMinimizable && !compzWin.isMinimized()) {
                compzWin.minimize();
            }
        }
        else if (action === 'max') {
            if (compzWin.isMaximizable && !compzWin.isMaximized()) {
                compzWin.maximize();
            }
        }
        else if (action === 'restore') {
            if (myWinMode === 'prod') {
                compzWin.setBounds(prodAppArea);
            }
            else if (myWinMode === 'dev') {
                compzWin.setBounds(devAppArea);
            }
            else if (myWinMode === 'random') {
                compzWin.setBounds(randomAppArea);
            }
        }
    }
};
/////////////////////////////////////////////////////////
// MAIN APP MENU
/////////////////////////////////////////////////////////
function mmDDFn(ddName, fnName, data) {
    appCons('(mmDDFn) ' + ddName + ' > ' + fnName);
    let ddData = null;
    if (data) {
        ddData = data;
    }
    ;
    compzWin.webContents.send('mm-dd-fn', [ddName, fnName, ddData]);
}
//-------------------------------------------------------
const isPLoaded = () => { if (currentProject !== null && currentProject && typeof currentProject === 'object') {
    return true;
}
else {
    return false;
} };
const isFEOpen = () => { return fileExplorerIsOpen; };
//-------------------------------------------------------
function mmDDOpts(ddName) {
    const mmDDOptObjs = {
        file: [
            { type: 'separator' },
            { label: 'New Project', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-newblankproject-ico.png'), accelerator: 'Ctrl+N', click: () => { mmDDFn('file', 'newblankproject', null); } },
            { label: 'Import Project', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-importproject-ico.png'), accelerator: 'Ctrl+Alt+N', click: () => { mmDDFn('file', 'importproject', null); } },
            { type: 'separator' },
            { label: 'Open Project', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-openproject-ico.png'), accelerator: 'Ctrl+O', click: () => { mmDDFn('file', 'openproject', null); } },
            { label: 'Open Playlist', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-openplaylist-ico.png'), accelerator: 'Ctrl+Shift+O', click: () => { mmDDFn('file', 'openplaylist', null); } },
            { label: 'Open File', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-openfile-ico.png'), accelerator: 'Ctrl+Shift+Alt+O', click: () => { mmDDFn('file', 'openfile', null); } },
            { type: 'separator' },
            { label: 'Find/Sync Media', visible: true, enabled: isPLoaded(), type: 'submenu', icon: icoP('assets/compz-mmdd-file-findsyncmedia-ico.png'), submenu: [
                    { label: 'All Files', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-findsyncmedia-all-ico.png'), click: () => { mmDDFn('file', 'findsyncmedia-all', null); } },
                    { label: 'Audio Files', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-findsyncmedia-audio-ico.png'), click: () => { mmDDFn('file', 'findsyncmedia-audio', null); } },
                    { label: 'Subtitle Files', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-findsyncmedia-subs-ico.png'), click: () => { mmDDFn('file', 'findsyncmedia-subs', null); } },
                    { label: 'Video Files', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-findsyncmedia-video-ico.png'), click: () => { mmDDFn('file', 'findsyncmedia-video', null); } }
                ]
            },
            { type: 'separator' },
            { label: 'Save', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-save-ico.png'), accelerator: 'Ctrl+S', click: () => { mmDDFn('file', 'save', null); } },
            { label: 'Save As...', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-saveas-ico.png'), accelerator: 'Ctrl+Shift+S', click: () => { mmDDFn('file', 'saveas', null); } },
            { label: 'Export Project', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-export-ico.png'), accelerator: 'Ctrl+Shift+E', click: () => { mmDDFn('file', 'exportproject', null); } },
            { type: 'separator' },
            { label: 'Preferences', visible: true, enabled: true, type: 'submenu', icon: icoP('assets/compz-mmdd-file-preferences-ico.png'), submenu: [
                    { label: 'General Settings', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-generalsettings-ico.png'), accelerator: 'Ctrl+,', click: () => { mmDDFn('file', 'preferences-generalsettings', null); } },
                    { label: 'Manage Media Folders', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-managemediafolders-ico.png'), accelerator: 'Ctrl+.', click: () => { mmDDFn('file', 'preferences-managemediafolders', null); } },
                    { label: 'Add/Remove File Types', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-addremovefiletypes-ico.png'), click: () => { mmDDFn('file', 'preferences-addremovefiletypes', null); } },
                    { label: 'Clear Cache', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-file-purgecache.png'), click: () => { mmDDFn('file', 'preferences-clearcache', null); } },
                ]
            },
            { type: 'separator' },
            { label: 'Close Project', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-closeproject.png'), accelerator: 'Ctrl+F4', click: () => { mmDDFn('file', 'closeproject', null); } },
            { label: 'Close Playlist', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-closeplaylist.png'), accelerator: 'Ctrl+Shift+F4', click: () => { mmDDFn('file', 'closeplaylist', null); } },
            { label: 'Close File', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-file-closefile.png'), accelerator: 'Ctrl+Shift+Alt+F4', click: () => { mmDDFn('file', 'closefile', null); } },
            { type: 'separator' },
            { label: 'Exit', visible: true, icon: icoP('assets/cm-compz-win-exit-ico.png'), type: 'normal', click: () => { winCtrl('quit'); } }
        ],
        edit: [
            { label: 'Undo', role: 'undo', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-edit-undo-ico.png') },
            { label: 'Redo', role: 'redo', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/compz-mmdd-edit-redo-ico.png') },
            { type: 'separator' },
            { label: 'Cut', role: 'cut', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/cm-edit-cut-ico.png') },
            { label: 'Copy', role: 'copy', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/cm-edit-copy-ico.png') },
            { label: 'Paste', role: 'paste', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/cm-edit-paste-ico.png') },
            { label: 'Select All', role: 'selectAll', visible: true, enabled: isPLoaded(), type: 'normal', icon: icoP('assets/cm-edit-selectall-ico.png') }
        ],
        tools: [
            { label: 'File Explorer', visible: true, enabled: isPLoaded(), type: 'checkbox', checked: isFEOpen(), accelerator: 'Ctrl+F', click: () => {
                    let newState = null;
                    isFEOpen() ? newState = false : newState = true;
                    compzWin.webContents.send('sc-fe-toggle', [newState]);
                } },
            { label: 'Playback', visible: true, enabled: isPLoaded(), icon: icoP('assets/compz-mmdd-tools-playback-ico.png'), type: 'submenu', submenu: [
                    { label: 'Manage Playlists', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-manageplaylists-ico.png'), click: () => { } },
                    { label: 'MMPEG Settings', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-mmpegsettings-ico.png'), click: () => { } },
                    { label: 'Volume Settings', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-volumesettings-ico.png'), click: () => { } },
                ]
            },
            { label: 'Editing', visible: true, enabled: isPLoaded(), icon: icoP('assets/compz-mmdd-tools-editing-ico.png'), type: 'submenu', submenu: [
                    { label: 'Preview Quality', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-previewquality-ico.png'), click: () => { } },
                    { label: 'Subtitle Editors', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-subtitleeditors-ico.png'), click: () => { } },
                    { label: 'System A/V Settings', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-systemav-ico.png'), click: () => { } },
                ]
            },
            { label: 'Scraping', visible: true, enabled: isPLoaded(), icon: icoP('assets/compz-mmdd-tools-scraping-ico.png'), type: 'submenu', submenu: [
                    { label: 'Manage Sources', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-managesources-ico.png'), click: () => { } },
                    { label: 'Data/Time Limits', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-datatimelimits-ico.png'), click: () => { } },
                    { label: 'Tree/Level Depths', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-tools-treeleveldepth-ico.png'), click: () => { } },
                ]
            },
            { type: 'separator' },
            { label: 'Manage Plugins', visible: true, enabled: true, icon: icoP('assets/compz-mmdd-tools-manageplugins-ico.png'), type: 'normal', click: () => { } },
        ],
        window: [
            { label: 'Maximize Window', visible: true, enabled: true, icon: icoP('assets/cm-compz-win-max-ico.png'), type: 'normal', click: () => { winCtrl('max'); } },
            { label: 'Minimize Window', visible: true, enabled: true, icon: icoP('assets/cm-compz-win-min-ico.png'), type: 'normal', click: () => { winCtrl('min'); } },
            { label: 'Reset Window', visible: true, enabled: true, icon: icoP('assets/cm-compz-win-reset-ico.png'), type: 'normal', click: () => { winCtrl('restore'); } },
            { label: 'Hide in Tray', visible: true, enabled: true, icon: icoP('assets/cm-compz-win-hide-ico.png'), type: 'normal', click: () => { winCtrl('tray'); } },
            { label: 'Reload App', visible: true, enabled: true, icon: icoP('assets/cm-compz-win-reload-ico.png'), role: 'forceReload', type: 'normal' },
            { type: 'separator' },
            { label: 'Zoom Level', role: 'zoom', visible: true, enabled: true, icon: icoP('assets/compz-mmdd-window-zoomlevel-ico.png') },
            { label: 'Reset Zoom', role: 'resetZoom', visible: true, enabled: true, icon: icoP('assets/compz-mmdd-window-reset-zoom-ico.png') },
            { label: 'Zoom In', role: 'zoomIn', visible: true, enabled: true, icon: icoP('assets/compz-mmdd-window-reset-zoom-in.png') },
            { label: 'Zoom Out', role: 'zoomOut', visible: true, enabled: true, icon: icoP('assets/compz-mmdd-window-reset-zoom-out.png') }
        ],
        help: [
            { label: 'Open DevTools', role: 'toggleDevTools', icon: icoP('assets/compz-mmdd-help-devtools-ico.png') },
            { label: 'View Processes', role: 'toggleDevTools', icon: icoP('assets/compz-mmdd-help-viewprocesses-ico.png') },
            { type: 'separator' },
            { label: 'Check for Updates...', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-help-updates-ico.png'), click: () => { } },
            { type: 'separator' },
            { label: 'About Comp0Z1te', visible: true, enabled: true, type: 'normal', icon: icoP('assets/compz-mmdd-help-about-ico.png'), role: 'about' }
        ]
    };
    const resMMDDOpts = mmDDOptObjs[ddName];
    return resMMDDOpts;
}
//-------------------------------------------------------
/////////////////////////////////////////////////////////
// CONTEXT MENU
/////////////////////////////////////////////////////////
const capd = (s) => { if (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
else {
    return '';
} };
const acsIsVis = (aCSName) => { if (aCSName === 'dev') {
    if (myWinMode === 'dev' || myWinMode === 'random') {
        return true;
    }
    else {
        return false;
    }
}
else {
    if (appContextSection === aCSName) {
        return true;
    }
    else {
        return false;
    }
} };
const hcsIsVis = (hCSName) => { if (homeContextSection === hCSName) {
    return true;
}
else {
    return false;
} };
const hcaIsVis = (hCAName) => { if (homeContextArea === hCAName) {
    return true;
}
else {
    return false;
} };
const feFile = () => { if (feContextFile && feContextFile !== null) {
    return feContextFile;
}
else {
    return {};
} };
const feFileName = () => { let fName = ''; if (acsIsVis('mscwappfileexplorer')) {
    fName = feContextFile.name;
} ; return fName; };
const feFilePath = () => { let fPath = ''; if (acsIsVis('mscwappfileexplorer')) {
    fPath = feContextFile.path;
} ; return fPath; };
const feFileType = () => { let fType = ''; if (acsIsVis('mscwappfileexplorer')) {
    fType = feContextFile.type;
} ; return fType; };
const feBDir = () => { let bdObj = { lc: '', capd: '' }; if (acsIsVis('mscwappfileexplorer')) {
    bdObj.lc = feContextFile.path.split('/')[1];
    bdObj.capd = capd(bdObj.lc);
} ; return bdObj; };
const feASV = () => { let asvRes = ''; const bMs = ['audio', 'subs', 'video'], mBDStr = feContextFile.path.replace(path.join(currentProject.projectDirPath, 'media/'), '').split('\\')[0]; if (bMs.includes(mBDStr)) {
    asvRes = mBDStr;
} ; return asvRes; };
const feFileLabels = () => { let fLs = { ftype: '', fname: '' }, sNCharLimit = 0, sNSuffix = ''; if (!acsIsVis('mscwappfileexplorer') || !feContextFile) {
    return fLs;
}
else {
    if (feContextFile.type === 'directory') {
        fLs.ftype = 'Folder';
        sNCharLimit = 13;
        sNSuffix = '/*)';
    }
    else {
        fLs.ftype = 'File';
        sNCharLimit = 15;
        sNSuffix = ')';
    }
    ;
    feContextFile.name.length > sNCharLimit ? fLs.fname = '(' + feContextFile.name.substring(0, 10) + '...' + sNSuffix : fLs.fname = '(' + feContextFile.name + sNSuffix;
    return fLs;
} };
const plFile = () => { if (plContextFile) {
    return plContextFile;
}
else {
    return {};
} };
const plFileType = () => { if (acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList') && plContextFile) {
    return plContextFile.type;
}
else {
    return '';
} };
const plCanMark = () => { if (!plContextFile) {
    return false;
}
else {
    if (!plMarkedFiles) {
        return true;
    }
    else {
        if (plMarkedFiles.hasOwnProperty(plContextFile.path)) {
            if (!plMarkedFiles[plContextFile.path]) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
} };
const plCanUnMark = () => { if (!plContextFile) {
    return false;
}
else {
    if (!plMarkedFiles) {
        return false;
    }
    else {
        if (plMarkedFiles.hasOwnProperty(plContextFile.path)) {
            if (!plMarkedFiles[plContextFile.path]) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
} };
const plFileLabels = () => { let fLs = { ftype: '', fname: '' }, sNCharLimit = 0, sNSuffix = ''; if (!acsIsVis('mscwapphome') || !hcsIsVis('hcsPlayer') || !hcaIsVis('hcaPlayList') || !plContextFile) {
    return fLs;
}
else {
    if (plContextFile.type === 'directory') {
        fLs.ftype = 'Folder';
        sNCharLimit = 13;
        sNSuffix = '/*)';
    }
    else {
        fLs.ftype = 'File';
        sNCharLimit = 15;
        sNSuffix = ')';
    }
    ;
    plContextFile.name.length > sNCharLimit ? fLs.fname = '(' + plContextFile.name.substring(0, 20) + '...' + sNSuffix : fLs.fname = '(' + plContextFile.name + sNSuffix;
    return fLs;
} };
const plyrFileIsLoaded = () => { if (playerFileLoaded !== null && !_.isEmpty(playerFileLoaded)) {
    return true;
}
else {
    return false;
} };
const plyrFile = () => { if (playerFileLoaded) {
    return playerFileLoaded;
}
else {
    return {};
} };
const plyrFileLabel = () => { let fname = '', sNCharLimit = 0, sNSuffix = ''; if (!acsIsVis('mscwapphome') || !hcsIsVis('hcsPlayer') || !hcaIsVis('hcaPlayTrackHeader') || !playerFileLoaded) {
    return fname;
}
else {
    sNCharLimit = 25;
    sNSuffix = ')';
    playerFileLoaded.name.length > sNCharLimit ? fname = '(' + playerFileLoaded.name.substring(0, 20) + '...' + sNSuffix : fname = '(' + playerFileLoaded.name + sNSuffix;
    return fname;
} };
const pjFileExplDir = () => { let pjdPath = path.join(electron_1.app.getPath('documents'), 'compzProjects'); if (pjContextFile && pjContextFile.hasOwnProperty('projectDirPath') && pjContextFile.projectDirPath && (exists(pjContextFile.projectDirPath))) {
    pjdPath = pjContextFile.projectDirPath;
} ; return pjdPath; };
const pjFileName = () => { let fName = ''; if (pjContextFile && pjContextFile.hasOwnProperty('projectName')) {
    fName = pjContextFile.projectName;
} ; return fName; };
const pjProjectObj = () => { if (pjContextFile) {
    return pjContextFile;
}
else {
    return { projectName: '', projectDirPath: '', projectPrefsPath: '', projectLastMod: 0 };
} };
const pjFolderPath = () => { let pPath = ''; if (pjContextFile && pjContextFile.hasOwnProperty('projectName')) {
    pPath = path.basename(pjContextFile.projectDirPath);
} ; return pPath; };
const cmBuild = () => {
    let baseCMOpts = { showLookUpSelection: false, showSearchWithGoogle: false, showCopyImage: false, showCopyImageAddress: false, showSaveImage: false, showSaveImageAs: false, showSaveLinkAs: false, showInspectElement: false, showServices: false,
        prepend: (dA, ps, bW, e) => [
            // DevItems /////////////////////////////////////////////////////////
            { label: 'Development', visible: acsIsVis('dev'), icon: icoP('assets/cm-dev-ico.png'), type: 'submenu', submenu: [
                    { label: 'Show DActions', visible: acsIsVis('dev'), enabled: true, type: 'normal', icon: icoP('assets/cm-fe-duplicate-ico.png'), click: () => { console.log(dA); } },
                    { label: 'Show Params', visible: acsIsVis('dev'), type: 'normal', click: () => { console.log(ps); } },
                    { label: 'Show BWindow', visible: acsIsVis('dev'), type: 'normal', click: () => { console.log(bW); } },
                    { label: 'Show Event', visible: acsIsVis('dev'), type: 'normal', click: () => { console.log(e); } }
                ]
            },
            // TitleBarContext //////////////////////////////////////////////////
            { type: 'separator', visible: acsIsVis('mscwapptitlebar') },
            // FEContext ////////////////////////////////////////////////////////
            { type: 'separator', visible: acsIsVis('mscwappfileexplorer') },
            { label: 'View in Explorer', visible: acsIsVis('mscwappfileexplorer'), icon: icoP('assets/cm-fe-reveal-ico.png'), type: 'normal', click: () => { electron_1.shell.showItemInFolder(compzAppPaths.app + '\\' + feFile().path.replace(/\//g, '\\')); } },
            { label: 'Add ' + feFileLabels().ftype + ' ' + feFileLabels().fname + ' to Player/list', visible: acsIsVis('mscwappfileexplorer') && feASV() !== 'subs', enabled: true, icon: icoP('assets/cm-fe-load-player-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-add2playlist', [feFile()]); } },
            { label: 'Duplicate ' + feFileLabels().ftype + ' ' + feFileLabels().fname, visible: acsIsVis('mscwappfileexplorer'), enabled: (feFileType() === 'file'), icon: icoP('assets/cm-fe-duplicate-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-duplicate', feContextFile); } },
            { label: 'Delete ' + feFileLabels().ftype + ' ' + feFileLabels().fname, visible: acsIsVis('mscwappfileexplorer'), icon: icoP('assets/cm-fe-delete-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-delete', { type: feFileType(), bdir: feBDir().lc, path: feFilePath() }); } },
            { label: 'Rename ' + feFileLabels().ftype + ' ' + feFileLabels().fname, visible: acsIsVis('mscwappfileexplorer'), icon: icoP('assets/cm-fe-rename-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-togglerename', { bdir: feBDir().lc, path: feFilePath(), name: feFileName() }); } },
            { label: 'Clear Folder ' + feFileLabels().fname, visible: acsIsVis('mscwappfileexplorer') && feFileLabels().ftype === 'Folder', icon: icoP('assets/cm-fe-cleardir-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-cleardir', { bdir: feBDir().lc, path: feFilePath() }); } },
            { label: 'Refresh/Sync ' + feBDir().capd + ' Files', visible: acsIsVis('mscwappfileexplorer'), icon: icoP('assets/cm-fe-refresh-folder-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-sync', [feBDir().lc]); } },
            { label: 'Refresh/Sync All Files', visible: acsIsVis('mscwappfileexplorer'), icon: icoP('assets/cm-fe-refresh-all-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-fe-sync', ['audio', 'subs', 'video']); } },
            // Launcher //////////////////////////////////////////////////////////
            { type: 'separator', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsLauncher') },
            { label: 'Explore Folder: ../' + pjFolderPath(), visible: acsIsVis('mscwapphome') && hcsIsVis('hcsLauncher') && hcaIsVis('hcaProjectList'), enabled: true, icon: icoP('assets/cm-fe-reveal-ico.png'), type: 'normal', click: () => { electron_1.shell.showItemInFolder((pjFileExplDir())); } },
            { label: 'Delete ' + pjFileName(), visible: acsIsVis('mscwapphome') && hcsIsVis('hcsLauncher') && hcaIsVis('hcaProjectList'), enabled: true, icon: icoP('assets/cm-fe-delete-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('launch-cm-projectlist-delete', [pjFileName()]); } },
            { label: 'Duplicate ' + pjFileName(), visible: acsIsVis('mscwapphome') && hcsIsVis('hcsLauncher') && hcaIsVis('hcaProjectList'), enabled: true, icon: icoP('assets/cm-launcher-projectlist-duplicate-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('launch-cm-projectlist-duplicate', [pjFileName()]); } },
            { label: 'Export ' + pjFileName(), visible: acsIsVis('mscwapphome') && hcsIsVis('hcsLauncher') && hcaIsVis('hcaProjectList'), enabled: true, icon: icoP('assets/compz-mmdd-file-export-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('launch-cm-projectlist-export', [pjProjectObj()]); } },
            { label: 'Rename ' + pjFileName(), visible: acsIsVis('mscwapphome') && hcsIsVis('hcsLauncher') && hcaIsVis('hcaProjectList'), enabled: true, icon: icoP('assets/cm-fe-rename-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('launch-cm-projectlist-rename', [pjProjectObj()]); } },
            // HomeContext ///////////////////////////////////////////////////////
            // Player ------------------------------
            { type: 'separator', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') },
            // >>> PlayList
            { label: 'Edit ' + plFileLabels().ftype + ' ' + plFileLabels().fname, visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), enabled: (plFileType() === 'file'), icon: icoP('assets/cm-fe-load-editor-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-edit', ['home', 'hcsPlayer', 'hcaPlayList', 'edit', plFile()]); } },
            { label: 'Rename ' + plFileLabels().ftype + ' ' + plFileLabels().fname, visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), enabled: (plFileType() === 'file'), icon: icoP('assets/cm-fe-rename-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-rename', ['home', 'hcsPlayer', 'hcaPlayList', 'rename', plFile()]); } },
            { label: 'Remove ' + plFileLabels().ftype + ' ' + plFileLabels().fname, visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), enabled: (plFileType() === 'file'), icon: icoP('assets/cm-home-player-playlist-remove-item-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-remove', ['home', 'hcsPlayer', 'hcaPlayList', 'remove', plFile()]); } },
            { label: 'View Info ' + plFileLabels().fname, visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), enabled: (plFileType() === 'file'), icon: icoP('assets/cm-home-player-playlist-viewinfo-item-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-viewinfo', ['home', 'hcsPlayer', 'hcaPlayList', 'viewinfo', plFile()]); } },
            { label: 'Mark ' + plFileLabels().fname, visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), enabled: plCanMark(), icon: icoP('assets/cm-home-player-playlist-mark-item-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-mark', ['home', 'hcsPlayer', 'hcaPlayList', 'mark', plFile()]); } },
            { label: 'Unmark ' + plFileLabels().fname, visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), enabled: plCanUnMark(), icon: icoP('assets/cm-home-player-playlist-unmark-item-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-mark', ['home', 'hcsPlayer', 'hcaPlayList', 'unmark', plFile()]); } },
            { label: 'Clear List', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayList'), icon: icoP('assets/cm-home-player-playlist-clearall-item-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-clearall', ['home', 'hcsPlayer', 'hcaPlayList', 'clearall']); } },
            // >>> Equaliser
            { label: 'Equaliser Action', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayEqualiser'), type: 'normal', click: () => { console.log('Home > Equaliser'); } },
            // >>> TrackHeader
            { label: 'View Info ' + plyrFileLabel(), visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayTrackHeader') && plyrFileIsLoaded(), enabled: true, icon: icoP('assets/cm-home-player-playlist-viewinfo-item-ico.png'), type: 'normal', click: () => { compzWin.webContents.send('cm-player-playlist-viewinfo', ['home', 'hcsPlayer', 'hcaPlayTrackHeader', 'viewinfo', plyrFile()]); } },
            // >>> Vis Area
            { label: 'Media Vis Action', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayVis'), type: 'normal', click: () => { console.log('Home > Media Vis'); } },
            // >>> TrackProgress
            { label: 'ProgressBar Action', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayProgressBar'), type: 'normal', click: () => { console.log('Home > Progress Bar'); } },
            // >>> PlayerStatusBox
            { label: 'hcaPlayStatus Action', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayStatus'), type: 'normal', click: () => { console.log('Home > Play Status'); } },
            // >>> PlayerActionBtns
            { label: 'PlayerCtrlBtns Action', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayerCtrlBtns'), type: 'normal', click: () => { console.log('Home > Play Ctrl Btns'); } },
            // >>> PlayerVolume
            { label: 'hcaPlayerVolCtrl Action', visible: acsIsVis('mscwapphome') && hcsIsVis('hcsPlayer') && hcaIsVis('hcaPlayerVolCtrl'), type: 'normal', click: () => { console.log('Home > Play Ctrl Btns'); } },
            // Editor ------------------------------
            { type: 'separator', visible: acsIsVis('mscwapphome') && hcsIsVis('editor') },
            { label: 'Editor Action', visible: acsIsVis('mscwapphome') && hcsIsVis('editor'), type: 'normal', click: () => { console.log('Home > Action #2'); } },
            // Scraper -----------------------------
            { type: 'separator', visible: acsIsVis('mscwapphome') && hcsIsVis('scraper') },
            { label: 'Scraper Action', visible: acsIsVis('mscwapphome') && hcsIsVis('scraper'), type: 'normal', click: () => { console.log('Home > Action #1'); } },
            // StatusBarContext //////////////////////////////////////////////////
            { type: 'separator', visible: acsIsVis('mscwappstatusbar') },
            { label: 'StatusBar Action #1', visible: acsIsVis('mscwappstatusbar'), type: 'normal', click: () => { console.log('StatusBar > Action #1'); } },
            { label: 'StatusBar Action #2', visible: acsIsVis('mscwappstatusbar'), type: 'normal', click: () => { console.log('StatusBar > Action #2'); } },
            // StandardEditing //////////////////////////////////////////////////
            { type: 'separator', visible: true },
            { label: 'Copy', visible: true, enabled: ps.selectionText.trim().length > 0 && ps.editFlags.canCopy, icon: icoP('assets/cm-edit-copy-ico.png'), role: 'copy', type: 'normal' },
            { label: 'Cut', visible: true, enabled: ps.selectionText.trim().length > 0 && ps.editFlags.canCut, icon: icoP('assets/cm-edit-cut-ico.png'), role: 'cut', type: 'normal' },
            { label: 'Paste', visible: true, enabled: ps.editFlags.canPaste, icon: icoP('assets/cm-edit-paste-ico.png'), role: 'paste', type: 'normal' },
            { label: 'Select All', visible: true, enabled: ps.editFlags.canSelectAll, icon: icoP('assets/cm-edit-selectall-ico.png'), role: 'selectAll', type: 'normal' },
            // WinControl ////////////////////////////////////////////////////////
            { type: 'separator', visible: true },
            { label: 'comp0Z1te', visible: true, icon: icoP('assets/cm-compz-ico.png'), type: 'submenu', submenu: [
                    { label: 'Maximize Window', visible: true, icon: icoP('assets/cm-compz-win-max-ico.png'), type: 'normal', click: () => { winCtrl('max'); } },
                    { label: 'Minimize Window', visible: true, icon: icoP('assets/cm-compz-win-min-ico.png'), type: 'normal', click: () => { winCtrl('min'); } },
                    { label: 'Reset Window', visible: true, icon: icoP('assets/cm-compz-win-reset-ico.png'), type: 'normal', click: () => { winCtrl('restore'); } },
                    { label: 'Hide in Tray', visible: true, icon: icoP('assets/cm-compz-win-hide-ico.png'), type: 'normal', click: () => { winCtrl('tray'); } },
                    { label: 'Reload App', visible: true, icon: icoP('assets/cm-compz-win-reload-ico.png'), role: 'forceReload', type: 'normal' },
                    { label: 'Exit App', visible: true, icon: icoP('assets/cm-compz-win-exit-ico.png'), type: 'normal', click: () => { winCtrl('quit'); } }
                ]
            }
        ]
    };
    cmOpts = baseCMOpts;
    return Promise.resolve(true);
};
/////////////////////////////////////////////////////////
function clearAppDirs() {
    return __awaiter(this, void 0, void 0, function* () {
        const appDataDir = path.relative(__dirname, electron_1.app.getPath('userData'));
        const absolProjDir = path.join(electron_1.app.getPath('documents'), 'compzProjects');
        const appProjsDir = path.relative(__dirname, absolProjDir);
        del.sync([path.posix.join(appDataDir, '/*/'), path.posix.join('!', appDataDir, 'Session Storage')], { force: true });
        del.sync(appProjsDir, { force: true });
        return Promise.resolve(true);
    });
}
/////////////////////////////////////////////////////////
function initNetIPRegion() {
    return __awaiter(this, void 0, void 0, function* () {
        let ipaD, gotData, ptys = ['ip', 'city', 'region', 'region_code', 'country', 'country_code', 'languages'], ipRegLang = {};
        if (!userIPRegLang) {
            return new Promise((resolve) => {
                const ipa = (0, child_process_1.spawn)('curl', ['https://ipapi.co/json/']);
                ipa.stdout.on('data', (data) => { let ipdRaw = Buffer.from(data), json = decoder.write(ipdRaw), ipdObj = JSON.parse(json); ipaD = ipdObj; gotData = true; });
                ipa.stderr.on('end', () => { if (gotData) {
                    for (let i = 0; i < ptys.length; i++) {
                        ipaD[ptys[i]] ? ipRegLang[ptys[i]] = ipaD[ptys[i]] : ipaD[ptys[i]] = null;
                    }
                    ;
                    userIPRegLang = ipRegLang;
                    resolve(true);
                }
                else {
                    resolve(false);
                } });
                ipa.on('close', code => { if (code !== 0) {
                    console.log('Error Code: ' + code);
                } });
                ipa.on('error', error => { console.log('IPA|ERROR: ' + error.name + ': ' + error.message); });
            });
        }
    });
}
/////////////////////////////////////////////////////////
function initCompz() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!compzWin) {
            initNetIPRegion();
            yield initPathChecks();
            yield initDisplay();
            yield createWindow();
        }
        ;
        return Promise.resolve(true);
    });
}
/////////////////////////////////////////////////////////
electron_1.app.disableHardwareAcceleration();
if (!gpuInfo) {
    gpuInfo = electron_1.app.getGPUInfo('basic');
}
;
electron_1.app.on('ready', () => __awaiter(void 0, void 0, void 0, function* () { yield initCompz(); evCons('a', 'ready'); }));
electron_1.app.on('browser-window-focus', () => { evCons('a', 'browser-window-focus'); });
electron_1.app.on('browser-window-blur', () => { evCons('a', 'browser-window-blur'); });
electron_1.app.on('web-contents-created', () => { evCons('a', 'web-contents-created'); });
electron_1.app.on('gpu-info-update', () => { evCons('a', 'gpu-info-update'); });
electron_1.app.on('open-file', (e) => { e.preventDefault(); evCons('a', 'open-file', e); });
electron_1.app.on('did-become-active', () => { evCons('a', 'did-become-active'); scs(true); });
electron_1.app.on('window-all-closed', () => __awaiter(void 0, void 0, void 0, function* () { evCons('a', 'window-all-closed'); if (myClearDirsMode) {
    yield clearAppDirs();
} ; electron_1.app.exit(); }));
electron_1.app.on('will-quit', () => __awaiter(void 0, void 0, void 0, function* () { evCons('a', 'will-quit'); scs(false); if (myClearDirsMode) {
    yield clearAppDirs();
} }));
electron_1.app.on('before-quit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    evCons('a', 'before-quit');
    e.preventDefault();
    compzWin.webContents.send('app-will-quit');
    const qSave = () => __awaiter(void 0, void 0, void 0, function* () { return Promise.resolve((yield doDialog('msgbox', ['saveQuestion', editorFile]))); });
    const qExitFn = () => __awaiter(void 0, void 0, void 0, function* () { if ((yield doDialog('msgbox', ['exitQuestion'])) !== 'cancel') {
        if (myClearDirsMode) {
            yield clearAppDirs();
        }
        ;
        electron_1.app.exit();
    }
    else {
        udAppSB('Exit comp0Z1te: Canceled');
        if (childWasOpen) {
            childWasOpen = false;
            childWinAction('create', null);
        }
    } });
    const waitSave = () => __awaiter(void 0, void 0, void 0, function* () { let saveDoneFn; return new Promise((resolve) => { saveDoneFn = () => { resolve(true); electron_1.ipcMain.removeListener('editorSaveDone', saveDoneFn); }; electron_1.ipcMain.on('editorSaveDone', saveDoneFn); compzWin.webContents.send('editorDoSaveClose'); }); });
    if (!editorFile || !editorShouldSave) {
        qExitFn();
    }
    else {
        switch ((yield qSave())) {
            case 'cancel':
                udAppSB('File Save ► Exit: Canceled');
                break;
            case 'no':
                if (myClearDirsMode) {
                    yield clearAppDirs();
                }
                ;
                electron_1.app.exit();
                break;
            default:
                yield waitSave();
                if (myClearDirsMode) {
                    yield clearAppDirs();
                }
                ;
                electron_1.app.exit();
                break;
        }
    }
}));
electron_1.app.on('quit', () => __awaiter(void 0, void 0, void 0, function* () { evCons('a', 'quit'); scs(false); if (myClearDirsMode) {
    yield clearAppDirs();
} }));
/////////////////////////////////////////////////////////
// APP INITS
/////////////////////////////////////////////////////////
function createWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            compzWin = new electron_1.BrowserWindow(cWinOpts);
            let pathIndex = './index.html';
            if ((yield exists(path.join(__dirname, '../dist/index.html')))) {
                pathIndex = '../dist/index.html';
            }
            ;
            compzWin.loadURL(url.format({ pathname: path.join(__dirname, pathIndex), protocol: 'file:', slashes: true }));
            (0, main_1.initialize)();
            (0, main_1.enable)(compzWin.webContents);
            Store.initRenderer();
            if (!compzTray) {
                yield initTray();
            }
            ;
            if (!cmOpts) {
                yield cmBuild();
                (0, electron_context_menu_1.default)(cmOpts);
            }
            else {
                (0, electron_context_menu_1.default)(cmOpts);
            }
            ;
            scs(true);
            if (myWinMode === 'dev' || myWinMode === 'random') {
                if (!compzDevTools) {
                    yield initUserPrefs();
                    compzDevTools = new electron_1.BrowserWindow;
                    compzWin.webContents.setDevToolsWebContents(compzDevTools.webContents);
                    compzWin.webContents.openDevTools({ mode: 'detach', activate: false });
                    compzWin.webContents.once('did-finish-load', () => {
                        if (myWinMode === 'dev') {
                            compzDevTools.setPosition(375, 115, false);
                            compzDevTools.setSize(1460, 900, false);
                        }
                        else if (myWinMode === 'random') {
                            compzDevTools.setPosition(175, 105, false);
                            compzDevTools.setSize(950, 650, false);
                        }
                        ;
                    });
                    compzWin.webContents.on('devtools-closed', () => __awaiter(this, void 0, void 0, function* () { evCons('d', 'devtools-closed'); if (myClearDirsMode) {
                        yield clearAppDirs();
                    } ; electron_1.app.exit(); }));
                    compzWin.webContents.on('devtools-focused', () => { evCons('d', 'devtools-focused'); scs(false); });
                    compzWin.webContents.on('before-input-event', (e, input) => { if (input.type === 'keyUp' && input.key === 'Alt') {
                        e.preventDefault();
                        if (e.defaultPrevented) {
                            mmDDFn('alt', 'ddaltsc', 'alt');
                        }
                    } });
                }
                ;
                compzWin.webContents.on('context-menu', () => { onCxtCCons(); mainCMIsOpen = true; compzWin.webContents.send('main-context-menu-open', [true]); evCons('w', 'context-menu'); });
            }
            ;
            compzWin.on('focus', () => { evCons('w', 'focus'); scs(true); });
            compzWin.on('blur', () => { evCons('w', 'blur'); scs(false); });
            compzWin.on('closed', () => { evCons('w', 'closed'); if (compzWin) {
                compzWin = null;
            } ; scs(false); });
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                if (myWinMode === 'prod') {
                    compzWin.setBounds(prodAppArea);
                }
                else if (myWinMode === 'dev') {
                    compzWin.setBounds(devAppArea);
                }
                else if (myWinMode == 'random') {
                    compzWin.setBounds(randomAppArea);
                }
                ;
                compzWin.restore();
                compzWin.show();
                compzWin.focus();
            }), 400);
            return Promise.resolve(true);
        }
        catch (e) {
            console.log('[app/main.ts|createWindow] ERROR: ' + JSON.stringify(e));
            return Promise.resolve(false);
        }
    });
}
;
//-------------------------------------------------------
function childWinAction(action, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const getCCWBounds = () => { let winOpts = { x: cWinOpts.x, y: cWinOpts.y, width: cWinOpts.width, height: cWinOpts.height }; const wBs = compzWin.getBounds(); if (wBs && !_.isEqual(wBs, winOpts)) {
            winOpts = wBs;
        } ; const cCBs = { x: Math.round(winOpts.x + ((winOpts.width - ((winOpts.width * 0.3) + 0)) / 2)), y: Math.round(winOpts.y + ((winOpts.height - ((winOpts.height * 0.3) + 0)) / 2)), width: Math.round((winOpts.width * 0.3) + 0), height: Math.round((winOpts.height * 0.3) + 0) }; return cCBs; };
        switch (action) {
            case 'create':
                if (compzChildWin === null) {
                    const cCBs = getCCWBounds();
                    compzChildWin = new electron_1.BrowserWindow({ x: cCBs.x, y: cCBs.y, width: cCBs.width, height: cCBs.height, parent: compzWin, icon: path.join(__dirname, '../dist/assets/icons/favicon.png'), transparent: true, frame: false, titleBarStyle: 'hidden', modal: true, show: false, movable: true, minimizable: true, maximizable: true, webPreferences: { nodeIntegration: true, contextIsolation: false, spellcheck: false } });
                    if (compzChildWin.menuBarVisible) {
                        compzChildWin.removeMenu();
                    }
                    ;
                    compzChildWin.loadFile((path.join(compzAppPaths.app, 'launcher.html')));
                    compzChildWin.once('ready-to-show', () => {
                        const nowBs = compzChildWin.getBounds(), getBs = getCCWBounds();
                        if (!_.isEqual(nowBs, getBs)) {
                            compzChildWin.setBounds(getBs);
                        }
                        ;
                        compzChildWin.webContents.send('childwin-data', ['data']);
                    });
                    compzChildWin.webContents.openDevTools({ mode: 'detach', activate: false });
                }
                ;
                break;
            case 'close':
                if (compzChildWin !== null) {
                    if (!compzChildWin.isClosable) {
                        compzChildWin.setClosable(true);
                    }
                    ;
                    compzChildWin.close();
                }
                ;
                break;
            case 'show':
                if (compzChildWin !== null) {
                    const scCWasVis = compzChildWin.isVisible();
                    if (!scCWasVis) {
                        compzChildWin.show();
                    }
                }
                ;
                break;
            case 'hide':
                if (compzChildWin !== null) {
                    const hcCWasVis = compzChildWin.isVisible();
                    if (hcCWasVis) {
                        compzChildWin.hide();
                    }
                }
                ;
                break;
            case 'bounds': if (compzChildWin !== null) {
                const nowBs = compzChildWin.getBounds(), getBs = getCCWBounds();
                if (!_.isEqual(nowBs, getBs)) {
                    compzChildWin.setBounds(getBs);
                }
                ;
                break;
            }
        }
        ;
        return Promise.resolve(true);
    });
}
//-------------------------------------------------------
const initPathChecks = () => __awaiter(void 0, void 0, void 0, function* () {
    const readF = (p) => __awaiter(void 0, void 0, void 0, function* () { try {
        const rR = yield (0, promises_1.readFile)(p, { encoding: 'utf-8' });
        if (rR && (yield isJSON(rR))) {
            return Promise.resolve({ r: true, d: JSON.parse(rR) });
        }
        else {
            return Promise.resolve({ r: false });
        }
    }
    catch (e) {
        console.log(e);
        return Promise.resolve({ r: false });
    } });
    const writeF = (p, d) => __awaiter(void 0, void 0, void 0, function* () { let fD = ''; typeof d !== 'string' ? fD = JSON.stringify(d) : fD = d; try {
        yield (0, promises_1.writeFile)(p, fD, { encoding: 'utf-8' });
        return Promise.resolve(true);
    }
    catch (e) {
        console.log(e);
        return Promise.resolve(false);
    } });
    const mkPDirs = (newPName) => __awaiter(void 0, void 0, void 0, function* () {
        const pPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + capd(newPName.toLowerCase()));
        const pDirPs = ['exports', 'playlists', 'media', 'media/audio', 'media/subs', 'media/video'];
        try {
            yield (0, promises_1.mkdir)(pPath, { recursive: true });
            for (let i = 0; i < pDirPs.length; i++) {
                yield (0, promises_1.mkdir)(path.join(pPath, pDirPs[i]));
            }
            ;
            return Promise.resolve(true);
        }
        catch (_b) {
            return Promise.resolve(false);
        }
    });
    const wPPrefsF = (newPName) => __awaiter(void 0, void 0, void 0, function* () { const lcNewPName = newPName.toLowerCase(), capdNewPName = capd(lcNewPName), newPPrefsFPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + capdNewPName + '/' + lcNewPName + 'Prefs.json'), newPPrefsFData = JSON.stringify(appTypes_1.defCompzProject); try {
        yield (0, promises_1.writeFile)(newPPrefsFPath, newPPrefsFData, { encoding: 'utf-8' });
        return Promise.resolve(true);
    }
    catch (e) {
        console.log(e);
        return Promise.resolve(false);
    } });
    const pathsFP = path.join(electron_1.app.getPath('userData'), 'compzPaths.json');
    console.log(pathsFP);
    if ((yield exists(pathsFP))) {
        const rFRes = yield readF(pathsFP);
        if (rFRes.r) {
            const pathsObj = rFRes.d;
            console.log(JSON.stringify(pathsObj));
            if ((yield allPsV(pathsObj))) {
                compzAppPaths = rFRes.d;
            }
            else {
                console.log('Tested Invalid');
                compzAppPaths = null;
            }
        }
        else {
            console.log('Read Paths File Failed');
            compzAppPaths = null;
        }
    }
    else {
        console.log('Paths File Missing!');
        compzAppPaths = null;
    }
    ;
    if (!compzAppPaths) {
        let defCAPs = appTypes_1.defCompzAppPaths;
        defCAPs.app = electron_1.app.getAppPath();
        for (const k of Object.keys(defCAPs.binary)) {
            let defP = '';
            if (k.startsWith('ff')) {
                defP = path.join(defCAPs.app, 'binary/ffmpeg/bin/' + k + '.exe');
            }
            else {
                defP = path.join(defCAPs.app, 'binary/youtube-dl/youtube-dl.exe');
            }
            ;
            if ((yield exists(defP))) {
                defCAPs.binary[k] = defP;
            }
            else {
                console.log('!!! MISSING BINARY - ' + k + ' - !!!');
            }
        }
        ;
        const uSPs = ['appData', 'userData', 'desktop', 'documents', 'downloads'];
        for (let i = 0; i < uSPs.length; i++) {
            defCAPs[uSPs[i]] = electron_1.app.getPath(uSPs[i]);
        }
        ;
        compzAppPaths = defCAPs;
        if ((yield allPsV(defCAPs))) {
            yield writeF(pathsFP, defCAPs);
        }
    }
    ;
    if (!defaultProject || !userProjects) {
        const cProjBDP = path.join(electron_1.app.getPath('documents'), 'compzProjects');
        if (!(yield exists(cProjBDP))) {
            const defPDirs = ['default', 'meowcats123', 'spanishflea'];
            for (let i = 0; i < defPDirs.length; i++) {
                if ((yield mkPDirs(defPDirs[i]))) {
                    yield wPPrefsF(defPDirs[i]);
                }
            }
        }
        ;
        let projFilesRes = { defaultProjectFile: null, userProjectFiles: [], ttlUPFs: 0 };
        for (let f of yield (0, promises_1.readdir)(cProjBDP, { withFileTypes: true })) {
            if (f.isDirectory()) {
                const aProjDirPath = path.join(cProjBDP, f.name), aProjLCName = f.name.toLowerCase();
                if ((yield (0, promises_1.readdir)(aProjDirPath)).includes(aProjLCName + 'Prefs.json')) {
                    const aProjPrefsPath = path.join(aProjDirPath, aProjLCName + 'Prefs.json'), aProjDirPrefsStat = yield (0, promises_1.stat)(aProjPrefsPath);
                    if (aProjDirPrefsStat && aProjDirPrefsStat.size > 0) {
                        let pfObj = { projectName: aProjLCName, projectDirPath: aProjDirPath, projectPrefsPath: aProjPrefsPath, projectLastMod: 0 };
                        pfObj.projectLastMod = Math.round(Math.max(...[aProjDirPrefsStat.atime, aProjDirPrefsStat.mtime, aProjDirPrefsStat.ctime]) / 1000);
                        if (pfObj.projectName === 'default') {
                            projFilesRes.defaultProjectFile = pfObj;
                        }
                        else {
                            projFilesRes.userProjectFiles.push(pfObj);
                            projFilesRes.ttlUPFs++;
                        }
                    }
                }
            }
        }
        ;
        if (projFilesRes.ttlUPFs > 0) {
            projFilesRes.userProjectFiles = _.orderBy(projFilesRes.userProjectFiles, ['projectLastMod'], ['desc']);
        }
        ;
        if (!projFilesRes.defaultProjectFile) {
            yield mkPDirs('default');
            yield wPPrefsF('default');
            projFilesRes.defaultProjectFile = { projectName: 'default', projectDirPath: path.join(electron_1.app.getPath('documents'), 'compzProjects/Default'), projectPrefsPath: path.join(electron_1.app.getPath('documents'), 'compzProjects/Default/defaultPrefs.json'), projectLastMod: Math.floor(Date.now() / 1000) };
        }
        ;
        defaultProject = projFilesRes.defaultProjectFile;
        userProjects = projFilesRes.userProjectFiles;
    }
    ;
    ///// TEMP SUBS /////
    /*  if(!(await exists('C:\\Users\\PC\\Documents\\compzProjects\\Meowcats123\\scrapeTargets')&&(exists('C:\\Users\\PC\\SubBU\\scrapeTargets')))){
       await mkdir('C:\\Users\\PC\\Documents\\compzProjects\\Meowcats123\\scrapeTargets',{recursive:true});
       cp('C:\\Users\\PC\\SubBU\\scrapeTargets','C:\\Users\\PC\\Documents\\compzProjects\\Meowcats123\\scrapeTargets',{recursive:true},(err)=>{if(err){console.log(err)}});
     }; */
    /////
    return Promise.resolve(true);
});
//-------------------------------------------------------
const syncUProjects = (returnData) => __awaiter(void 0, void 0, void 0, function* () {
    const cProjBDP = path.join(electron_1.app.getPath('documents'), 'compzProjects');
    let userProjectFiles = [], ttlUPFs = 0;
    for (let f of yield (0, promises_1.readdir)(cProjBDP, { withFileTypes: true })) {
        if (f.isDirectory()) {
            const aProjDirPath = path.join(cProjBDP, f.name), aProjLCName = f.name.toLowerCase();
            if ((yield (0, promises_1.readdir)(aProjDirPath)).includes(aProjLCName + 'Prefs.json')) {
                const aProjPrefsPath = path.join(aProjDirPath, aProjLCName + 'Prefs.json'), aProjDirPrefsStat = yield (0, promises_1.stat)(aProjPrefsPath);
                if (aProjDirPrefsStat && aProjDirPrefsStat.size > 0) {
                    let pfObj = { projectName: aProjLCName, projectDirPath: aProjDirPath, projectPrefsPath: aProjPrefsPath, projectLastMod: 0 };
                    pfObj.projectLastMod = Math.round(Math.max(...[aProjDirPrefsStat.atime, aProjDirPrefsStat.mtime, aProjDirPrefsStat.ctime]) / 1000);
                    if (pfObj.projectName !== 'default') {
                        userProjectFiles.push(pfObj);
                        ttlUPFs++;
                    }
                }
            }
        }
    }
    ;
    if (ttlUPFs > 0) {
        userProjectFiles = _.orderBy(userProjectFiles, ['projectLastMod'], ['desc']);
    }
    ;
    userProjects = userProjectFiles;
    if (returnData && returnData === true) {
        return Promise.resolve(userProjectFiles);
    }
    else {
        return Promise.resolve(true);
    }
});
//-------------------------------------------------------
electron_1.ipcMain.handle('manage-projects', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    const mPAction = args[0];
    let mPData = null;
    if (args[1]) {
        mPData = args[1];
    }
    ;
    const mPRes = yield manageProjects(mPAction, mPData);
    return mPRes;
}));
const manageProjects = (action, data) => __awaiter(void 0, void 0, void 0, function* () {
    appCons('(manageProjects(' + action + '))...');
    const aPDP = path.join(electron_1.app.getPath('documents'), 'compzProjects');
    const delPFiles = (pName) => __awaiter(void 0, void 0, void 0, function* () {
        const capdPName = capd(pName), dPDPath = path.join(aPDP, capdPName);
        if (!(exists(dPDPath))) {
            return Promise.resolve({ r: false, d: 'Project folder not found' });
        }
        else {
            try {
                yield del.default(dPDPath, { force: true });
                return Promise.resolve({ r: true, d: null });
            }
            catch (_c) {
                return Promise.resolve({ r: false, d: 'Unspecified Error' });
            }
        }
    });
    const mkPDirs = (newPName) => __awaiter(void 0, void 0, void 0, function* () {
        const pPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + capd(newPName.toLowerCase()));
        const pDirPs = ['exports', 'playlists', 'media', 'media/audio', 'media/subs', 'media/video'];
        try {
            yield (0, promises_1.mkdir)(pPath, { recursive: true });
            for (let i = 0; i < pDirPs.length; i++) {
                yield (0, promises_1.mkdir)(path.join(pPath, pDirPs[i]));
            }
            ;
            return Promise.resolve(true);
        }
        catch (e) {
            console.log(e);
            return Promise.resolve(false);
        }
    });
    const readPrefsF = (ppath) => __awaiter(void 0, void 0, void 0, function* () { try {
        const rR = yield (0, promises_1.readFile)(ppath, { encoding: 'utf-8' });
        if (rR && (yield isJSON(rR))) {
            return Promise.resolve({ r: true, d: JSON.parse(rR) });
        }
        else {
            return Promise.resolve({ r: false });
        }
    }
    catch (e) {
        console.log(e);
        return Promise.resolve({ r: false });
    } });
    const wPPrefsF = (newPName, newPPrefsPath) => __awaiter(void 0, void 0, void 0, function* () {
        const lcNewPName = newPName.toLowerCase(), capdNewPName = capd(lcNewPName), newPPrefsFPath = path.join(aPDP, capdNewPName + '/' + lcNewPName + 'Prefs.json');
        let newPPrefsFData = '';
        if (newPPrefsPath !== null) {
            const rPFRes = yield readPrefsF(newPPrefsPath);
            if (rPFRes.r) {
                newPPrefsFData = JSON.stringify(rPFRes.d);
            }
        }
        else {
            newPPrefsFData = JSON.stringify(appTypes_1.defCompzProject);
        }
        ;
        try {
            yield (0, promises_1.writeFile)(newPPrefsFPath, newPPrefsFData, { encoding: 'utf-8' });
            return Promise.resolve(true);
        }
        catch (e) {
            console.log(e);
            return Promise.resolve(false);
        }
    });
    const doCreateNP = (projectName, usePrefsPath) => __awaiter(void 0, void 0, void 0, function* () {
        const npName = projectName;
        const npPrefsPth = usePrefsPath;
        const capdNPN = capd(npName);
        const nPDPath = path.join(aPDP, capdNPN);
        const nPPPath = path.join(aPDP, npName + 'Prefs.json');
        if (!(yield exists(nPDPath))) {
            yield mkPDirs(npName);
        }
        ;
        if (!(yield exists(nPPPath))) {
            yield wPPrefsF(npName, npPrefsPth);
        }
        ;
        const newProj = { projectName: npName, projectDirPath: nPDPath, projectPrefsPath: nPPPath, projectLastMod: Math.round((new Date()).getTime() / 1000) };
        let newProjIsV = true;
        console.log(newProjIsV);
        if (Object.keys(newProj).length !== 4) {
            newProjIsV = false;
        }
        ;
        if (Object.values(newProj).length !== 4) {
            newProjIsV = false;
        }
        ;
        if (typeof newProj.projectName !== 'string' || newProj.projectName.length < 1) {
            newProjIsV = false;
        }
        ;
        if (typeof newProj.projectDirPath !== 'string' || !(exists(newProj.projectDirPath))) {
            newProjIsV = false;
        }
        ;
        if (typeof newProj.projectPrefsPath !== 'string' || !(exists(newProj.projectPrefsPath))) {
            newProjIsV = false;
        }
        ;
        if (typeof newProj.projectLastMod !== 'number') {
            newProjIsV = false;
        }
        ;
        if (newProjIsV) {
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    });
    //--------------------
    let ePRes = { r: false, d: null };
    switch (action) {
        case 'list': //data=?/null
            const getPList = yield syncUProjects(true);
            if (typeof getPList === 'object' && Array.isArray(getPList)) {
                ePRes.r = true;
                ePRes.d = getPList;
            }
            ;
            break;
        case 'create': //data={projectName:<string>,prefsPath<string>:string} | returns {r:boolean,d:AppProject}
            let npName = data.projectName;
            let npPrefsPth = null;
            if (data.prefsPath !== null) {
                npPrefsPth = data.prefsPath;
            }
            ;
            if (userProjects.filter(uPO => uPO.projectName === npName).length !== 0) {
                const doOWrite = yield doDialog('msgbox', ['overwriteQuestion', { name: npName }]);
                if (doOWrite === 'no') {
                    npName = 'comp0Z1teproject-' + String(Math.round((new Date()).getTime() / 1000)).toLowerCase();
                }
            }
            ;
            const doCreateRes = yield doCreateNP(npName, npPrefsPth);
            if (doCreateRes) {
                const syncUProjListRes = yield syncUProjects(true);
                const matchNPArr = syncUProjListRes.filter(uPO => uPO.projectName === npName);
                if (matchNPArr.length === 1) {
                    ePRes = { r: true, d: matchNPArr[0] };
                }
                else {
                    appCons('[manage-projects|create] ERROR: Created Project (' + npName + ') NOT in userProjects SYNC LIST');
                }
            }
            else {
                appCons('[manage-projects|create] ERROR: Failed to Create New Project (' + npName + ')');
            }
            ;
            break;
        case 'duplicate': //data={clonedProjectName:string,baseProjectPrefsPath:string} | returns {r:boolean,d:clonedProject<AppProject>|error<string>}
            const doDupRes = yield doCreateNP(data.clonedProjectName, data.baseProjectPrefsPath);
            if (doDupRes) {
                const syncUProjListRes = yield syncUProjects(true);
                const matchNPArr = syncUProjListRes.filter(uPO => uPO.projectName === data.clonedProjectName);
                if (matchNPArr.length === 1) {
                    ePRes = { r: true, d: matchNPArr[0] };
                }
                else {
                    appCons('[manage-projects|duplicate] ERROR: Duplicate Project (' + data.clonedProjectName + ') NOT in userProjects SYNC LIST');
                }
            }
            else {
                appCons('[manage-projects|duplicate] ERROR: Failed to Duplicate New Project (' + data.clonedProjectName + ')');
            }
            ;
            break;
        case 'delete': //data=projectName:string | returns {r:boolean,d:null|error<string>}
            const delPName = data;
            const doDelete = yield doDialog('msgbox', ['deleteProjectQuestion', { name: delPName }]);
            if (doDelete === 'cancel') {
                ePRes.r = false;
                ePRes.d = 'Cancelled';
            }
            else {
                ePRes = yield delPFiles(delPName);
                yield syncUProjects();
            }
            ;
            break;
        case 'import': //data-null | returns | {r:boolean,d:AppProject|null}
            const ipRes = yield importProject();
            ePRes = ipRes;
            break;
        case 'export': //data=projectObj:AppProject | returns {r:boolean,d:expProjectInfo:ExportedProjectInfo}
            const cEPRes = yield createExpProject(data);
            if (cEPRes.r) {
                doExportSuccess(cEPRes.d);
                ePRes = { r: true, d: cEPRes.d };
            }
            else {
                doExportError(data);
            }
            break;
        case 'rename': //data={project:AppProject,newName:string} | return {r:boolean,d:AppProject}
            const rnPRes = yield renameProject(data.project, data.newName);
            if (rnPRes.r) {
                ePRes = rnPRes;
            }
            ;
            break;
        default: appCons('(manageProjects) [ERROR]: Unknown Action (' + action + ')');
    }
    ;
    return Promise.resolve(ePRes);
});
//-------------------------------------------------------
function importProject() {
    return __awaiter(this, void 0, void 0, function* () {
        const cvtBytes = (bs) => { const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; if (bs == 0) {
            return 'N/A';
        } ; const i = (Math.floor(Math.log(bs) / Math.log(1024))); if (i == 0) {
            return bs + ' ' + sizes[i];
        } ; return (bs / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]; };
        const selectZipDialog = () => {
            const cProjBDP = path.join(electron_1.app.getPath('documents'), 'compzProjects');
            const selImpFileRes = electron_1.dialog.showOpenDialogSync(electron_1.BrowserWindow.getFocusedWindow(), { defaultPath: cProjBDP, title: 'Import Project', buttonLabel: 'Import', filters: [{ name: 'Comp0Z1te Export File', extensions: ['zip'] }], properties: ['openFile', 'showHiddenFiles'] });
            if (selImpFileRes !== undefined && Array.isArray(selImpFileRes) && selImpFileRes.length > 0) {
                return Promise.resolve({ r: true, d: selImpFileRes[0] });
            }
            else {
                return Promise.resolve({ r: false, d: null });
            }
            ;
        };
        const checkZipValid = (zipPath) => __awaiter(this, void 0, void 0, function* () {
            let errArr = [];
            let impProj = { projectName: '', projectDirPath: '', projectPrefsPath: '', projectLastMod: 0 };
            let impPCs = { files: 0, folders: 0, total: 0, sizeNo: 0, sizeStr: '' };
            try {
                const zipStatObj = yield (0, promises_1.stat)(zipPath);
                if (zipStatObj && zipStatObj.size > 0) {
                    impPCs.sizeNo = zipStatObj.size;
                    impPCs.sizeStr = cvtBytes(zipStatObj.size);
                }
                ;
                if (zipStatObj && zipStatObj.ctimeMs > 0) {
                    impProj.projectLastMod = Math.round(zipStatObj.ctimeMs / 1000);
                }
                ;
                const tempImpZipDir = path.join(electron_1.app.getPath('documents'), 'compzProjects');
                const impZip = new AdmZip(zipPath);
                let impPrefsFName, impPrefsEntryName = null, impPrefsTempPath = '';
                for (const zE of impZip.getEntries()) {
                    impPCs.total++;
                    zE.isDirectory ? impPCs.folders++ : impPCs.files++;
                    if (zE.entryName.includes('Prefs.json')) {
                        impPrefsFName = String(zE.name);
                        impPrefsEntryName = String(zE.entryName);
                    }
                }
                ;
                if (impPrefsEntryName !== null) {
                    yield impZip.extractEntryTo(impPrefsEntryName, tempImpZipDir, false, true);
                    impPrefsTempPath = path.join(tempImpZipDir, impPrefsFName);
                    if ((yield exists(impPrefsTempPath))) {
                        const prefsStatObj = yield (0, promises_1.stat)(impPrefsTempPath);
                        if (prefsStatObj.size > 0) {
                            impProj.projectName = impPrefsFName.replace('Prefs.json', '');
                            impProj.projectDirPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + capd(impProj.projectName));
                            impProj.projectPrefsPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + capd(impProj.projectName) + '/' + impProj.projectName + 'Prefs.json');
                            yield del.default(impPrefsTempPath, { force: true });
                            return Promise.resolve({ r: true, d: { project: impProj, counts: impPCs } });
                        }
                        else {
                            errArr.push('• Empty/corrupt project preferences file (0 Bytes)');
                            appCons(errArr.join(','));
                            return Promise.resolve({ r: false, d: errArr });
                        }
                    }
                    else {
                        errArr.push('• Failed to extract project preferences file (test)');
                        appCons(errArr.join(','));
                        return Promise.resolve({ r: false, d: errArr });
                    }
                }
                else {
                    errArr.push('• Invalid/missing project preferences file (*Prefs.json)');
                    appCons(errArr.join(','));
                    return Promise.resolve({ r: false, d: errArr });
                }
            }
            catch (e) {
                errArr.push('• Locked/corrupt exported project file (*.zip)');
                appCons(errArr.join(',') + ' - [ERROR]: ' + e);
                return Promise.resolve({ r: false, d: errArr });
            }
        });
        const checkOverwrite = (importProject) => __awaiter(this, void 0, void 0, function* () {
            let checkedImpProject = importProject;
            if ((yield exists(importProject.projectDirPath))) {
                const owriteResI = electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), { message: 'A project named ' + importProject.projectName + ' already exists.\nIf you proceed it will be replaced/overwritten.\nOVERWRITE or RENAME project when importing?', type: 'warning', buttons: ['Overwrite', 'Rename'], defaultId: 1, title: 'Existing Project', cancelId: 1, icon: icoP('assets/app-dialog-overwriteprompt-ico.png') });
                if (owriteResI === 0) {
                    return Promise.resolve({ didChange: false, project: checkedImpProject });
                }
                else {
                    checkedImpProject.projectName += get4DigitLabel();
                    checkedImpProject.projectDirPath += get4DigitLabel();
                    checkedImpProject.projectPrefsPath = checkedImpProject.projectName.replace('Prefs.json', '') + get4DigitLabel() + 'Prefs.json';
                    return Promise.resolve({ didChange: true, project: checkedImpProject });
                }
            }
            else {
                return Promise.resolve({ didChange: false, project: checkedImpProject });
            }
        });
        const extractZip = (zipPath, impProject, didChange) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.mkdir)(impProject.projectDirPath, { recursive: true });
                const impZip = new AdmZip(zipPath);
                const outputDir = impProject.projectDirPath;
                yield impZip.extractAllTo(outputDir);
                if (didChange) {
                    const oldPrefsPath = path.join(impProject.projectDirPath, impProject.projectName.substring(0, impProject.projectName.length - 4) + 'Prefs.json');
                    const newPrefsPath = impProject.projectPrefsPath;
                    yield (0, promises_1.rename)(oldPrefsPath, newPrefsPath);
                }
                ;
                return Promise.resolve(true);
            }
            catch (e) {
                appCons('(importProject|extractZip) [ERROR]: ' + e);
                return Promise.resolve(false);
            }
            ;
        });
        const selImpProjPath = yield selectZipDialog();
        if (selImpProjPath.r) {
            const checkZipVRes = yield checkZipValid(selImpProjPath.d);
            if (checkZipVRes.r) {
                let impP = checkZipVRes.d.project, impPDidChange = null;
                const impCs = checkZipVRes.d.counts;
                const checkOWRes = yield checkOverwrite(impP);
                if (checkOWRes.didChange) {
                    impP = checkOWRes.project;
                    impPDidChange = true;
                }
                else {
                    impPDidChange = false;
                }
                ;
                const extractZRes = yield extractZip(selImpProjPath.d, impP, impPDidChange);
                if (extractZRes) {
                    const doOpen = yield doImportSuccess(selImpProjPath.d, impP, impCs);
                    if (doOpen === 'open') {
                        return Promise.resolve({ r: true, d: impP });
                    }
                    else {
                        return Promise.resolve({ r: true, d: null });
                    }
                }
                else {
                    appCons('(importProject|extractZip) Extracting Zip Failed');
                    let allErrs = [];
                    if (!checkZipVRes.r && checkZipVRes.d.length > 0) {
                        allErrs = checkZipVRes.d;
                    }
                    ;
                    allErrs.push('Zip Extraction Failed');
                    doImportError(path.basename(selImpProjPath.d), allErrs);
                    return Promise.resolve({ r: false });
                }
            }
            else {
                appCons('(importProject|checkZipValid) Zip Invalid: ' + checkZipVRes.d.join(','));
                let allErrs = [];
                if (!checkZipVRes.r && checkZipVRes.d.length > 0) {
                    allErrs = checkZipVRes.d;
                }
                ;
                allErrs.push('Import Zip Invalid');
                doImportError(path.basename(selImpProjPath.d), allErrs);
                return Promise.resolve({ r: false });
            }
        }
        else {
            appCons('(importProject|selectZipDialog) File Select Cancelled/Failed');
            return Promise.resolve({ r: false });
        }
    });
}
//-------------------------------------------------------
function renameProject(project, nName) {
    return __awaiter(this, void 0, void 0, function* () {
        const oldPDirPath = project.projectDirPath;
        const newPDirPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + capd(nName));
        const oldPPrefsPath = path.join(newPDirPath, project.projectName + 'Prefs.json');
        const newPPrefsPath = path.join(newPDirPath, nName + 'Prefs.json');
        const copyDelProject = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.rename)(oldPDirPath, newPDirPath);
                yield (0, promises_1.rename)(oldPPrefsPath, newPPrefsPath);
                if ((yield exists(oldPDirPath))) {
                    yield del.default(oldPDirPath, { force: true });
                }
                ;
                appCons('(renameProject|copyDelProject) [SUCCESS]: Copied ' + oldPDirPath + ' > ' + newPDirPath + ',Renamed ' + oldPPrefsPath + ' > ' + newPPrefsPath + ',Deleted ' + oldPDirPath);
                return Promise.resolve(true);
            }
            catch (e) {
                appCons('(renameProject|copyDelProject) [ERROR]: ' + e);
                return Promise.resolve(false);
            }
        });
        const cdpRes = yield copyDelProject();
        if (cdpRes) {
            const getPListRes = yield syncUProjects(true);
            if (typeof getPListRes === 'object' && Array.isArray(getPListRes) && getPListRes.length > 0) {
                const matchRNArr = getPListRes.filter(pO => pO.projectName === nName);
                if (matchRNArr.length === 1) {
                    return Promise.resolve({ r: true, d: matchRNArr[0] });
                }
                else {
                    appCons('(renameProject|matchRenamedP) [ERROR]: No Projects in New List Matched Renamed Project');
                    return Promise.resolve({ r: true, data: null });
                }
            }
            else {
                appCons('(renameProject|syncUProjects) [ERROR]: No Projects in New List');
                return Promise.resolve({ r: true, data: null });
            }
        }
        else {
            appCons('(renameProject|copyDelProject) [ERROR]');
            return Promise.resolve({ r: true, data: null });
        }
    });
}
//-------------------------------------------------------
function getUTSLabel(label) { return (label + '-' + String(Math.round((new Date()).getTime() / 1000))).toLowerCase(); }
;
function get4DigitLabel() { return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1); }
//-------------------------------------------------------
function createExpProject(project) {
    return __awaiter(this, void 0, void 0, function* () {
        const cvtBytes = (bs) => { const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; if (bs == 0) {
            return 'N/A';
        } ; const i = (Math.floor(Math.log(bs) / Math.log(1024))); if (i == 0) {
            return bs + ' ' + sizes[i];
        } ; return (bs / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]; };
        const expZipFName = 'export' + get4DigitLabel() + project.projectName + '.zip';
        const tempExpZipPath = path.join(electron_1.app.getPath('documents'), 'compzProjects/' + expZipFName);
        const usrExpZipPath = path.join(project.projectDirPath, 'exports/' + expZipFName);
        let zInfo = { project: project, zipPath: usrExpZipPath, zipFiles: [], zipCounts: { files: 0, folders: 0, total: 0, sizeNo: 0, sizeStr: '' } };
        const createZip = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const cZip = new AdmZip();
                cZip.addLocalFolder(project.projectDirPath);
                cZip.writeZip(tempExpZipPath);
                appCons('(createExpProject|createZip) [SUCCESS]: Created ' + tempExpZipPath);
                return Promise.resolve(true);
            }
            catch (e) {
                appCons('(createExpProject|createZip) [ERROR]: ' + e);
                return Promise.resolve(false);
            }
        });
        const readZip = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const rZip = new AdmZip(tempExpZipPath);
                for (const zE of rZip.getEntries()) {
                    zInfo.zipCounts.total++;
                    zE.isDirectory ? zInfo.zipCounts.folders++ : zInfo.zipCounts.files++;
                    zInfo.zipFiles.push(zE.name);
                }
                ;
                appCons('(createExpProject|readZip) [SUCCESS]: Read ' + tempExpZipPath);
                return Promise.resolve(true);
            }
            catch (e) {
                appCons('(createExpProject|readZip) [ERROR]: ' + e);
                return Promise.resolve(false);
            }
        });
        const mvDelZip = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.rename)(tempExpZipPath, usrExpZipPath);
                yield del.default(tempExpZipPath, { force: true });
                const sObj = yield (0, promises_1.stat)(usrExpZipPath);
                if (sObj.size > 0) {
                    zInfo.zipCounts.sizeNo = sObj.size;
                    zInfo.zipCounts.sizeStr = cvtBytes(sObj.size);
                }
                ;
                appCons('(createExpProject|mvDelZip) [SUCCESS]: Moved ' + tempExpZipPath + ' > ' + usrExpZipPath + ',Deleted ' + tempExpZipPath);
                return Promise.resolve(true);
            }
            catch (e) {
                appCons('(createExpProject|mvDelZip) [ERROR]: ' + e);
                return Promise.resolve(false);
            }
        });
        const createZRes = yield createZip();
        if (createZRes) {
            const readZRes = yield readZip();
            if (readZRes) {
                const moveDelZRes = yield mvDelZip();
                if (moveDelZRes) {
                    return Promise.resolve({ r: true, d: zInfo });
                }
                else {
                    return Promise.resolve({ r: false, d: null });
                }
            }
            else {
                return Promise.resolve({ r: false, d: null });
            }
        }
        else {
            return Promise.resolve({ r: false, d: null });
        }
    });
}
//-------------------------------------------------------
const scs = (tf) => { if (tf) {
    if (!scsActive) {
        shortCutRegs('register');
    }
}
else {
    if (scsActive) {
        shortCutRegs('unregister');
    }
} };
const shortCutRegs = (action) => {
    if (action === 'register') {
        //---------------------------------------
        electron_1.globalShortcut.register('Alt+F', () => { mmDDFn('alt', 'ddaltsc', 'file'); });
        electron_1.globalShortcut.register('Alt+E', () => { mmDDFn('alt', 'ddaltsc', 'edit'); });
        electron_1.globalShortcut.register('Alt+T', () => { mmDDFn('alt', 'ddaltsc', 'tools'); });
        electron_1.globalShortcut.register('Alt+W', () => { mmDDFn('alt', 'ddaltsc', 'window'); });
        electron_1.globalShortcut.register('Alt+H', () => { mmDDFn('alt', 'ddaltsc', 'help'); });
        //---------------------------------------
        electron_1.globalShortcut.register('Ctrl+N', () => { mmDDFn('file', 'newblankproject', null); });
        electron_1.globalShortcut.register('Ctrl+Alt+N', () => { mmDDFn('file', 'importproject', null); });
        electron_1.globalShortcut.register('Ctrl+O', () => { mmDDFn('file', 'openproject', null); });
        electron_1.globalShortcut.register('Ctrl+Shift+O', () => { if (currentProject !== null) {
            mmDDFn('file', 'openplaylist', null);
        } });
        electron_1.globalShortcut.register('Ctrl+Shift+Alt+O', () => { if (currentProject !== null) {
            mmDDFn('file', 'openfile', null);
        } });
        electron_1.globalShortcut.register('Ctrl+S', () => { if (currentProject !== null) {
            mmDDFn('file', 'save', null);
        } });
        electron_1.globalShortcut.register('Ctrl+Shift+S', () => { if (currentProject !== null) {
            mmDDFn('file', 'saveas', null);
        } });
        electron_1.globalShortcut.register('Ctrl+Shift+E', () => { if (currentProject !== null) {
            mmDDFn('file', 'exportproject', null);
        } });
        electron_1.globalShortcut.register('Ctrl+,', () => { mmDDFn('file', 'preferences-generalsettings', null); });
        electron_1.globalShortcut.register('Ctrl+.', () => { mmDDFn('file', 'preferences-managemediafolders', null); });
        electron_1.globalShortcut.register('Ctrl+F4', () => { mmDDFn('file', 'closeproject', null); });
        electron_1.globalShortcut.register('Ctrl+Shift+F4', () => { if (currentProject !== null) {
            mmDDFn('file', 'closeplaylist', null);
        } });
        electron_1.globalShortcut.register('Ctrl+Shift+Alt+F4', () => { if (currentProject !== null) {
            mmDDFn('file', 'closefile', null);
        } });
        electron_1.globalShortcut.register('Alt+F4', () => { winCtrl('quit'); });
        //---------------------------------------
        electron_1.globalShortcut.register('Alt+F4', () => { winCtrl('quit'); });
        //---------------------------------------
        electron_1.globalShortcut.register('Ctrl+F', () => {
            if (currentProject !== null) {
                let newState = null;
                if (fileExplorerIsOpen === null) {
                    newState = true;
                }
                else {
                    fileExplorerIsOpen ? newState = false : newState = true;
                }
                ;
                compzWin.webContents.send('sc-fe-toggle', [newState]);
            }
            ;
        });
        electron_1.globalShortcut.register('Ctrl+Z', () => { compzWin.webContents.send('sc-undo'); });
        electron_1.globalShortcut.register('Ctrl+Y', () => { compzWin.webContents.send('sc-redo'); });
        electron_1.globalShortcut.register('Ctrl+C', () => { compzWin.webContents.send('sc-copy'); });
        electron_1.globalShortcut.register('Ctrl+X', () => { compzWin.webContents.send('sc-cut'); });
        electron_1.globalShortcut.register('Ctrl+V', () => { compzWin.webContents.send('sc-paste'); });
        electron_1.globalShortcut.register('Ctrl+A', () => { compzWin.webContents.send('sc-selectAll'); });
        electron_1.globalShortcut.register('Ctrl+Alt+O', () => { compzWin.webContents.send('sc-open-file', ['All Files']); });
        electron_1.globalShortcut.register('Ctrl+Alt+S', () => { compzWin.webContents.send('sc-save-file', ['All Files']); });
        scsActive = true;
    }
    else {
        electron_1.globalShortcut.unregisterAll();
        scsActive = false;
    }
    ;
};
//-------------------------------------------------------
const initDisplay = () => {
    if (cWinOpts.width === 0 || cWinOpts.height === 0) {
        const pDisplay = electron_1.screen.getPrimaryDisplay();
        const { width, height } = pDisplay.workAreaSize;
        if (myWinMode === 'prod') {
            (width - 80) > 1600 ? cWinOpts.width = 1600 : cWinOpts.width = (width - 80);
            cWinOpts.height = (height - 80);
            (width - 80) > 1600 ? cWinOpts.x = (width - 1600) / 2 : cWinOpts.x = 40;
            cWinOpts.y = 40;
            prodAppArea = { x: cWinOpts.x, y: cWinOpts.y, width: cWinOpts.width, height: cWinOpts.height };
        }
        else if (myWinMode === 'dev') {
            cWinOpts.width = width - devEditArea.width - 10;
            cWinOpts.height = height - 10;
            cWinOpts.x = devEditArea.width + 5;
            cWinOpts.y = 5;
            devAppArea = { x: cWinOpts.x, y: cWinOpts.y, width: cWinOpts.width, height: cWinOpts.height };
        }
        else if (myWinMode === 'random') {
            cWinOpts.width = width - 10;
            cWinOpts.height = height - 10;
            cWinOpts.x = 5;
            cWinOpts.y = 5;
            randomAppArea = { x: cWinOpts.x, y: cWinOpts.y, width: cWinOpts.width, height: cWinOpts.height };
        }
    }
    else {
        return Promise.resolve(true);
    }
};
//-------------------------------------------------------
const initUserPrefs = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (myWinMode === 'dev' || myWinMode === 'random') {
            let myDTBs = {};
            myWinMode === 'dev' ? myDTBs = { height: 900, width: 1460, x: 375, y: 115 } : myDTBs = { height: 650, width: 950, x: 175, y: 105 };
            const userDataPath = electron_1.app.getPath('userData'), devPrefsPath = path.join(userDataPath, 'Preferences');
            if ((yield exists(devPrefsPath))) {
                let devPrefsData = JSON.parse((yield (0, promises_1.readFile)(devPrefsPath, 'utf-8')));
                devPrefsData.electron.devtools.bounds = myDTBs;
                yield (0, promises_1.writeFile)(devPrefsPath, JSON.stringify(devPrefsData));
                return Promise.resolve(true);
            }
            else {
                return Promise.resolve(false);
            }
            ;
        }
        else {
            return Promise.resolve(false);
        }
    }
    catch (e) {
        console.log('[app/main.ts|initUserPrefs] ERROR: ' + JSON.stringify(e));
        return Promise.resolve(false);
    }
});
//-------------------------------------------------------
const initTray = () => {
    try {
        compzTray = new electron_1.Tray(path.join(__dirname, '../dist/assets/clogo.png'));
        const contextMenu = electron_1.Menu.buildFromTemplate([{ label: 'Show App', click: () => { winCtrl('show'); } }, { label: 'Quit', click: () => { winCtrl('quit'); } }]);
        compzTray.setToolTip('comp0Z1te Options');
        compzTray.setContextMenu(contextMenu);
        electron_1.ipcMain.on('tray', () => { winCtrl('hide'); });
        electron_1.ipcMain.on('min', () => { winCtrl('min'); });
        electron_1.ipcMain.on('max', () => { winCtrl('max'); });
        electron_1.ipcMain.on('restore', () => { winCtrl('restore'); });
        electron_1.ipcMain.on('close', () => { winCtrl('quit'); });
        return Promise.resolve(true);
    }
    catch (e) {
        return Promise.resolve(false);
    }
};
/////////////////////////////////////////////////////////
const doDialog = (type, args) => __awaiter(void 0, void 0, void 0, function* () {
    const getExts = (type) => { let resArr = []; for (let i = 0; i < appTypes_1.defAppStates.mediaFileExts[type].length; i++) {
        resArr.push((appTypes_1.defAppStates.mediaFileExts[type][i].replace('.', '')));
    } ; return resArr; };
    const dDFilters = [{ name: 'All Files', extensions: ['*'] }, { name: 'Audio Files', extensions: getExts('audio') }, { name: 'Subtitle Files', extensions: getExts('subs') }, { name: 'Video Files', extensions: getExts('video') }];
    const projFilters = [{ name: 'Comp0Z1te Project Files', extensions: ['json', '0z1'] }];
    let dDRes;
    switch (type) {
        case 'editorsaveas':
            const saFilePath = args[0];
            const saDOpts = { defaultPath: saFilePath, title: 'Save Edit As', buttonLabel: 'Save', properties: ['showHiddenFiles', 'createDirectory', 'dontAddToRecent'] };
            let saFRes = electron_1.dialog.showSaveDialogSync(electron_1.BrowserWindow.getFocusedWindow(), saDOpts);
            if (saFRes !== undefined) {
                dDRes = saFRes;
            }
            else {
                dDRes = null;
            }
            ;
            break;
        case 'save':
            const bdirPath = path.join(currentProject.projectDirPath, 'media/' + args[0].bdir);
            const sfPath = bdirPath + '/' + args[0].name;
            const saveDOpts = { defaultPath: sfPath, title: 'Save File As', buttonLabel: 'Save', filters: dDFilters, properties: ['showHiddenFiles', 'createDirectory', 'dontAddToRecent'] };
            let dSFRes = electron_1.dialog.showSaveDialogSync(electron_1.BrowserWindow.getFocusedWindow(), saveDOpts);
            if (dSFRes !== undefined) {
                dDRes = dSFRes;
            }
            else {
                dDRes = null;
            }
            ;
            break;
        case 'open':
            if (args[0] === 'project') {
                const cProjBDP = path.join(electron_1.app.getPath('documents'), 'compzProjects');
                const openDOpts = { defaultPath: cProjBDP, title: 'Open Project File', buttonLabel: 'Open Project', filters: projFilters, properties: ['openFile', 'showHiddenFiles'] };
                const dOFRes = electron_1.dialog.showOpenDialogSync(electron_1.BrowserWindow.getFocusedWindow(), openDOpts);
                if (dOFRes !== undefined) {
                    dDRes = dOFRes;
                }
                else {
                    dDRes = [];
                }
                ;
            }
            else if (args[0] === 'audio' || args[0] === 'subs' || args[0] === 'video') {
                let afPath = '', afFilters = [], capdBDir = capd(args[0]);
                if (capdBDir === 'Subs') {
                    capdBDir = 'Subtitle';
                }
                ;
                if (args[0] === 'audio') {
                    afPath = electron_1.app.getPath('music');
                    afFilters.push(dDFilters[1]);
                }
                else if (args[0] === 'subs') {
                    afPath = electron_1.app.getPath('documents');
                    afFilters.push(dDFilters[2]);
                }
                else if (args[0] === 'video') {
                    afPath = electron_1.app.getPath('videos');
                    afFilters.push(dDFilters[3]);
                }
                else {
                    afPath = electron_1.app.getPath('home');
                    afFilters = dDFilters[0];
                }
                ;
                const openDOpts = { defaultPath: afPath, title: 'Add ' + capdBDir + ' Files', buttonLabel: 'Add Files', filters: afFilters, properties: ['openFile', 'multiSelections', 'showHiddenFiles'] };
                const dOFRes = yield electron_1.dialog.showOpenDialog(electron_1.BrowserWindow.getFocusedWindow(), openDOpts);
                dDRes = dOFRes;
            }
            ;
            break;
        case 'msgbox':
            const getN = () => {
                const tN = (o) => { if (o && typeof o === 'object' && o.hasOwnProperty('name') && o.name) {
                    return true;
                }
                else {
                    return false;
                } };
                if (tN(args[1])) {
                    return args[1].name;
                }
                else if (tN(editorFile)) {
                    return editorFile.name;
                }
                else {
                    return 'this file';
                }
            };
            const mBTKey = args[0];
            const mBFileN = getN();
            const mBFixList = () => { let str = ''; if (args[0] === 'fixMissingFilesQuestion') {
                str = args[1].list;
            } ; return str; };
            const msgBoxTypes = {
                saveEditAVQuestion: { message: 'Save changes to ' + mBFileN + ' and update playlist?', type: 'question', buttons: ['Yes', 'No', 'Cancel'], defaultId: 0, title: 'Save Editor Changes', cancelId: 2, icon: icoP('assets/app-dialog-saveprompt-ico.png') },
                saveQuestion: { message: 'Save changes to ' + mBFileN + '?', type: 'question', buttons: ['Yes', 'No', 'Cancel'], defaultId: 0, title: 'Save Changes', cancelId: 2, icon: icoP('assets/app-dialog-saveprompt-ico.png') },
                exitQuestion: { message: 'Exit comp0z1te?', type: 'question', buttons: ['Yes', 'No'], defaultId: 0, title: 'Confirm Exit', cancelId: 1, icon: icoP('assets/app-dialog-exitprompt-ico.png') },
                overwriteQuestion: { message: mBFileN + ' already exists.\nDo you want to replace it?', type: 'warning', buttons: ['Yes', 'No'], defaultId: 1, title: 'Overwrite File', cancelId: 1, icon: icoP('assets/app-dialog-overwriteprompt-ico.png') },
                newBlankProjectQuestion: { message: 'Close ' + mBFileN + ' and start a\nNew Blank Project?', type: 'warning', buttons: ['New Project', 'Cancel'], defaultId: 0, title: 'Confirm New Project', cancelId: 1, icon: icoP('assets/app-dialog-newprojectprompt-ico.png') },
                importProjectQuestion: { message: mBFileN + ' is or includes files stored outside\nComp0Z1te\'s User Project Directory.\nDo you want to import the Project?', type: 'warning', buttons: ['Import', 'Cancel'], defaultId: 0, title: 'Confirm Import Project', cancelId: 1, icon: icoP('assets/app-dialog-importprompt-ico.png') },
                deleteProjectQuestion: { message: 'Delete Project ' + mBFileN + '?\nThis action is permanent and CANNOT be undone.', type: 'warning', buttons: ['Delete Project', 'Cancel'], defaultId: 1, title: 'Confirm Delete Project', cancelId: 1, icon: icoP('assets/app-dialog-deleteprojectprompt-ico.png') },
                deletePlaylistQuestion: { message: 'Delete Playlist ' + mBFileN + '?\nThis action is permanent and CANNOT be undone.', type: 'warning', buttons: ['Delete', 'Cancel'], defaultId: 1, title: 'Confirm Delete Playlist', cancelId: 1, icon: icoP('assets/app-dialog-deleteprojectprompt-ico.png') },
                deleteTargetData: { message: 'Removing ' + mBFileN + ' ...\nALSO DELETE item\'s media files from disk?\n*WARNING* This action CANNOT be undone.', type: 'question', buttons: ['Remove Only', 'Remove & Delete', 'Cancel'], defaultId: 0, title: 'Remove/Delete Options', cancelId: 2, icon: icoP('assets/app-dialog-deleteprojectprompt-ico.png') },
                fixMissingFilesQuestion: { message: 'Project ' + mBFileN + ' has missing/empty files (see below)\nShould we attempt to fix these issues?\n\n' + mBFixList(), type: 'warning', buttons: ['Attempt Fix', 'Cancel'], defaultId: 0, title: 'Missing/Empty Files', cancelId: 1, icon: icoP('assets/app-dialog-fixprojectprompt-ico.png') },
                dupePLFileQuestion: { title: 'Duplicate File', message: 'File ' + mBFileN.file + ' already exists in Playlist ' + mBFileN.playlist + '\nAdd another copy anyway?', type: 'warning', icon: icoP('assets/dialog-warning-ico-1024.png'), buttons: ['Cancel', 'Add Copy'], defaultId: 1, cancelId: 0 }
            };
            let popWin = null;
            if (compzWin && compzWin.focusable) {
                compzWin.focus();
                popWin = compzWin;
            }
            else {
                const availWins = electron_1.BrowserWindow.getAllWindows();
                if (availWins.length > 0) {
                    for (let i = 0; i < availWins.length; i++) {
                        const thisWin = availWins[i];
                        console.log(thisWin);
                        if (thisWin.isFocusable) {
                            if (!thisWin.isFocused) {
                                thisWin.focus();
                            }
                            ;
                            popWin = thisWin;
                        }
                    }
                }
                ;
            }
            ;
            const mbDResI = electron_1.dialog.showMessageBoxSync(popWin, msgBoxTypes[mBTKey]);
            dDRes = msgBoxTypes[mBTKey].buttons[mbDResI].toLowerCase().replace(/\s+/g, '');
            break;
        default:
            const cT = '(main|doDialog) !UNKNOWN! Dialog Type: ' + type;
            appCons(cT);
            console.log(cT);
    }
    ;
    return Promise.resolve(dDRes);
});
/////////////////////////////////////////////////////////
electron_1.ipcMain.handle('doErr', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    yield doError(args[0], args[1]);
    return true;
}));
const doError = (errTitle, errMsg) => __awaiter(void 0, void 0, void 0, function* () {
    const errBoxOpts = { message: errMsg, type: 'error', buttons: ['OK'], defaultId: 0, title: errTitle };
    electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), errBoxOpts);
    return Promise.resolve(true);
});
/////////////////////////////////////////////////////////
electron_1.ipcMain.handle('doWarn', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    yield doWarn(args[0], args[1]);
    return true;
}));
const doWarn = (warnTitle, warnMsg) => __awaiter(void 0, void 0, void 0, function* () {
    const warnBoxOpts = { message: warnMsg, type: 'warning', buttons: ['OK'], defaultId: 0, title: warnTitle };
    electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), warnBoxOpts);
    return Promise.resolve(true);
});
/////////////////////////////////////////////////////////
const doSuccess = (okTitle, okMsg) => __awaiter(void 0, void 0, void 0, function* () {
    const okBoxOpts = { message: okMsg, type: 'info', buttons: ['OK'], defaultId: 0, title: okTitle };
    electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), okBoxOpts);
    return Promise.resolve(true);
});
/////////////////////////////////////////////////////////
const doExportError = (project) => __awaiter(void 0, void 0, void 0, function* () {
    const errBoxOpts = { title: 'Export Project Error', message: 'Failed to export project (' + project.projectName + ')\nCheck file permissions,ensure no files are\nin use/locked and try again.', type: 'error', buttons: ['OK'], defaultId: 0 };
    electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), errBoxOpts);
    return Promise.resolve(true);
});
/////////////////////////////////////////////////////////
const doExportSuccess = (expZInfo) => {
    const expSuccessOpts = {
        title: 'Export Project Result',
        message: 'PROJECT ' + expZInfo.project.projectName + ' EXPORTED SUCCESSFULLY:\n\n• Export: ' + path.basename(expZInfo.zipPath) + '\n• Path: ' + expZInfo.project.projectDirPath + '/exports\n• Count: ' + String(expZInfo.zipCounts.folders) + '/' + String(expZInfo.zipCounts.files) + '/' + String(expZInfo.zipCounts.total) + ' (folders/files/total)\n• Size: ' + String(expZInfo.zipCounts.sizeNo) + ' Bytes (' + expZInfo.zipCounts.sizeStr + ')',
        type: 'info',
        buttons: ['View', 'OK'],
        defaultId: 1,
    };
    const msgBoxResI = electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), expSuccessOpts);
    if (msgBoxResI === 0) {
        electron_1.shell.showItemInFolder(expZInfo.zipPath);
    }
    ;
};
/////////////////////////////////////////////////////////
const doImportError = (projectName, errs) => __awaiter(void 0, void 0, void 0, function* () {
    let aMsg = 'Failed to export project (' + projectName + '):\n';
    for (let i = 0; i < errs.length; i++) {
        aMsg += errs[i] + '\n';
    }
    ;
    const errBoxOpts = { title: 'Import Project Error', message: aMsg, type: 'error', buttons: ['OK'], defaultId: 0 };
    electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), errBoxOpts);
});
/////////////////////////////////////////////////////////
const doImportSuccess = (zipPath, project, impCounts) => {
    const expSuccessOpts = {
        title: 'Import Project Result',
        message: 'PROJECT ' + project.projectName + ' IMPORTED SUCCESSFULLY:\n\n• Import: ' + path.basename(zipPath) + '\n• Path: ' + project.projectDirPath + '\n• Count: ' + String(impCounts.folders) + '/' + String(impCounts.files) + '/' + String(impCounts.total) + ' (folders/files/total)\n• Size: ' + String(impCounts.sizeNo) + ' Bytes (' + impCounts.sizeStr + ')',
        type: 'info',
        buttons: ['Open Now', 'OK'],
        defaultId: 1,
    };
    const msgBoxResI = electron_1.dialog.showMessageBoxSync(electron_1.BrowserWindow.getFocusedWindow(), expSuccessOpts);
    if (msgBoxResI === 0) {
        return Promise.resolve('open');
    }
    else {
        return Promise.resolve('ok');
    }
};
/////////////////////////////////////////////////////////
// IPC HANDLERS
/////////////////////////////////////////////////////////
function mTrack(tf) {
    if (tf) {
        if (mTrackInt !== null) {
            clearInterval(mTrackInt);
            mTrackInt = null;
        }
        ;
        mTrackInt = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const { z, p } = mmZone();
            if (z) {
                let ddN = '';
                const relX = p.x - wCBox.left, xpVArr = Object.values(mmDDXPos), xpKArr = Object.keys(mmDDXPos);
                for (let i = 0; i < xpVArr.length; i++) {
                    const ddXStart = xpVArr[i];
                    let ddXEnd = 0;
                    ((xpVArr.length - 1) === i) ? ddXEnd = mmDDXPos.wrap.end : ddXEnd = xpVArr[(i + 1)];
                    if (relX >= ddXStart && relX < ddXEnd) {
                        ddN = xpKArr[i];
                    }
                }
                ;
                if (ddN !== mmDDOpen) {
                    clearInterval(mTrackInt);
                    mTrackInt = null;
                    mmDDAction(null, mmDDOpen, 'close');
                    compzWin.webContents.send('mm-dd-open', [ddN]);
                    mmDDAction(null, ddN, 'open');
                }
            }
        }), 100);
    }
    else {
        clearInterval(mTrackInt);
    }
}
//-------------------------------------------------------
function mmDDAction(ddEvent, ddName, ddAction) {
    return __awaiter(this, void 0, void 0, function* () {
        let ddMenu = null;
        if (ddAction === 'open') {
            const ddOpts = mmDDOpts(ddName);
            ddMenu = electron_1.Menu.buildFromTemplate(ddOpts);
            mmDDMenus[ddName] = ddMenu;
            ddMenu.on('menu-will-show', () => { mmDDOpen = ddName; mTrack(true); });
            ddMenu.on('menu-will-close', (e) => {
                mTrack(false);
                e.preventDefault();
                if (e.defaultPrevented) {
                    const { z, p } = mmZone();
                    if (z) {
                        let ddN = '';
                        const relX = p.x - wCBox.left, xpVArr = Object.values(mmDDXPos), xpKArr = Object.keys(mmDDXPos);
                        for (let i = 0; i < xpVArr.length; i++) {
                            const ddXStart = xpVArr[i];
                            let ddXEnd = 0;
                            if ((xpVArr.length - 1) === i) {
                                ddXEnd = mmDDXPos.wrap.end;
                            }
                            else {
                                ddXEnd = xpVArr[(i + 1)];
                            }
                            ;
                            if (relX >= ddXStart && relX < ddXEnd) {
                                ddN = xpKArr[i];
                            }
                            ;
                        }
                        ;
                        if (ddN !== mmDDOpen) {
                            mmDDOpen = null;
                            compzWin.webContents.send('mm-dd-open', [null]);
                        }
                        ;
                    }
                    else {
                        mmDDOpen = null;
                        compzWin.webContents.send('mm-dd-open', [null]);
                    }
                }
                else {
                    mmDDOpen = null;
                    compzWin.webContents.send('mm-dd-open', [null]);
                }
            });
            let popOpts = { window: compzWin, x: mmDDXPos[ddName], y: 32 };
            if (ddEvent) {
                popOpts.window = electron_1.BrowserWindow.fromWebContents(ddEvent.sender);
            }
            ;
            ddMenu.popup(popOpts);
        }
        else if (ddAction === 'close') {
            ddMenu = mmDDMenus[ddName];
            ddMenu.closePopup();
            mmDDOpen = null;
            compzWin.webContents.send('mm-dd-open', [null]);
        }
    });
}
//-------------------------------------------------------
electron_1.ipcMain.on('mm-update-xpos', (e, args) => __awaiter(void 0, void 0, void 0, function* () { const wBs = compzWin.getBounds(); wCBox.left = wBs.x; wCBox.right = wBs.x + wBs.width; wCBox.top = wBs.y; wCBox.bottom = wBs.y + wBs.height; mmDDXPos = args[0]; }));
//-------------------------------------------------------
electron_1.ipcMain.on('mm-dd-action', (e, args) => __awaiter(void 0, void 0, void 0, function* () { const ddE = e, ddN = args[0], ddA = args[1]; yield mmDDAction(ddE, ddN, ddA); }));
//-------------------------------------------------------
electron_1.ipcMain.handle('do-childwin', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-childwin - ' + args[0]);
    const cwAction = args[0];
    let cwData = null;
    if (args[1]) {
        cwData = args[1];
    }
    ;
    yield childWinAction(cwAction, cwData);
    return Promise.resolve(true);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('prompt-save-editor-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: prompt-save-editor-file');
    const dSMDRes = yield doDialog('msgbox', args);
    return Promise.resolve(dSMDRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('do-show-msg', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-show-msg');
    const dSMDRes = yield doDialog('msgbox', args);
    return Promise.resolve(dSMDRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('editor-save-as', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: editor-save-as');
    const dSFDRes = yield doDialog('editorsaveas', args);
    return Promise.resolve(dSFDRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('do-save-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-save-file');
    const dSFDRes = yield doDialog('save', args);
    return Promise.resolve(dSFDRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('do-open-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-open-file');
    const dOFDRes = yield doDialog('open', args);
    return Promise.resolve(dOFDRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('do-confirm-delete-target', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (ipcMain) EVENT-RECEIVED: do-confirm-delete-target');
    const dCDTRes = yield doDialog('msgbox', args);
    return Promise.resolve(dCDTRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.on('childwin-action', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (childwin-action) - ' + String(args[0]).toUpperCase() + '...');
    switch (args[0]) {
        case 'close':
            childWinAction('close');
            break;
        case 'show':
            childWinAction('show', null);
            break;
    }
}));
//-------------------------------------------------------
electron_1.ipcMain.on('app-contents-cmd', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[main|IPCHandlers] (app-contents-cmd) - ' + String(args[0]).toUpperCase() + '...');
    switch (args[0]) {
        case 'undo':
            compzWin.webContents.undo();
            break;
        case 'redo':
            compzWin.webContents.redo();
            break;
        case 'cut':
            compzWin.webContents.cut();
            break;
        case 'copy':
            compzWin.webContents.copy();
            break;
        case 'paste':
            compzWin.webContents.paste();
            break;
        case 'selectAll':
            compzWin.webContents.selectAll();
            break;
    }
    ;
}));
//-------------------------------------------------------
electron_1.ipcMain.on('fe-shouldsave-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () { editorShouldSave = args[0]; }));
electron_1.ipcMain.on('home-editor-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () { editorFile = args[0]; if (args[0] === null) {
    editorShouldSave = false;
} }));
//-------------------------------------------------------
const ctxtConsOn = false;
const ctxtReg = (r) => {
    if (ctxtConsOn) {
        let acsN = '', hcsN = '', hcaN = '';
        if (r === 'acs') {
            acsN = '*NEW*';
        }
        else if (r === 'hcs') {
            hcsN = '*NEW*';
        }
        else {
            hcaN = '*NEW*';
        }
        ;
        const cRC = `
    | Context REGION CHANGE: --------------------------------
    | appContextSection:  ` + appContextSection + `     ` + acsN + `
    | homeContextSection: ` + homeContextSection + `    ` + hcsN + `
    | homeContextArea:    ` + homeContextArea + `       ` + hcaN + `
    | -------------------------------------------------------
    `;
        console.log(cRC);
    }
};
const ctxtFile = (f) => {
    if (ctxtConsOn) {
        let fecfN = '', plcfN = '', pjcfFN = '', pflN = '', fecfFN = 'null', plcfFN = 'null', pjcfN = 'null', pflFN = 'null';
        if (feContextFile) {
            fecfFN = feContextFile.name;
        }
        ;
        if (plContextFile) {
            plcfFN = plContextFile.name;
        }
        ;
        if (pjContextFile) {
            pjcfFN = pjContextFile.projectName;
        }
        ;
        if (playerFileLoaded) {
            pflFN = playerFileLoaded.name;
        }
        ;
        if (f === 'fecf') {
            fecfN = '*NEW*';
        }
        else if (f === 'plcf') {
            plcfN = '*NEW*';
        }
        else if (f === 'pfl') {
            pflN = '*NEW*';
        }
        else if (f === 'pjcf') { }
        ;
        const cFC = `
    | Context FILE CHANGE: -------------------------------
    | feContextFile:    ` + fecfFN + `         ` + fecfN + `
    | plContextFile:    ` + plcfFN + `         ` + plcfN + `
    | pjContextFile:    ` + pjcfFN + `         ` + pjcfN + `
    | playerFileLoaded: ` + pflFN + `          ` + pflN + `
    | ----------------------------------------------------
    `;
        console.log(cFC);
    }
};
const ctxtBlock = (chan, gVarName) => { if (ctxtConsOn) {
    console.log('Change to ' + gVarName + ' via #' + chan + ' [BLOCKED] (mainCMIsOpen===TRUE)');
} };
electron_1.ipcMain.on('open-winFE', (e, args) => __awaiter(void 0, void 0, void 0, function* () { electron_1.shell.showItemInFolder(args[0]); }));
//-------------------------------------------------------
electron_1.ipcMain.on('set-compz-route', (e, args) => __awaiter(void 0, void 0, void 0, function* () { compzRoute = args[0]; compzWin.webContents.send('new-compz-route', [compzRoute]); appCons('[NEW|ROUTE]: ' + compzRoute); }));
electron_1.ipcMain.handle('get-compz-route', () => __awaiter(void 0, void 0, void 0, function* () { return compzRoute; }));
//-------------------------------------------------------
function checkCurrentProject(args) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[main] currentProject [CHECK]: ' + args[0].projectName + ' - Checking Data...');
        const ckFiles = () => __awaiter(this, void 0, void 0, function* () {
            let misPs = [];
            const pPath = args[0].projectDirPath, pPPath = args[0].projectPrefsPath, pDirPs = ['exports', 'playlists', 'media', 'media/audio', 'media/subs', 'media/video'];
            if (!(exists(pPath))) {
                misPs.push(pPath);
            }
            ;
            if (!(exists(pPPath))) {
                misPs.push(pPPath);
            }
            ;
            for (let i = 0; i < pDirPs.length; i++) {
                if (!(exists(path.join(pPath, pDirPs[i])))) {
                    misPs.push(path.join(pPath, pDirPs[i]));
                }
            }
            ;
            if (misPs.length > 0) {
                return Promise.resolve({ r: false, d: misPs });
            }
            else {
                return Promise.resolve({ r: true, d: null });
            }
        });
        const { r, d } = yield ckFiles();
        if (!r) {
            let missListStr = '';
            if (d.includes('.json') || d.includes('.0z1')) {
                const pP = d.filter((p) => (p.includes('.json') || p.includes('.0z1')))[0], pPFN = path.basename(pP);
                if (!(exists(args[0].projectPrefsPath))) {
                    missListStr += '• Missing Project Prefences File (../' + pPFN + ')\n';
                }
                else {
                    missListStr += '• Empty Project Prefences File (' + pPFN + ')\n';
                }
            }
            ;
            for (let i = 0; i < d.length; i++) {
                if (!d[i].includes('.json') && !d[i].includes('.0z1')) {
                    const bD = path.basename(d[i]);
                    let mL = '• Missing ' + capd(bD) + ' Folder (../';
                    if (bD === 'audio' || bD === 'subs' || bD === 'video') {
                        missListStr += mL + 'media/' + bD + ')\n';
                    }
                    else {
                        missListStr += mL + '' + bD + ')\n';
                    }
                }
            }
            ;
            const doFixRes = yield doDialog('msgbox', ['fixMissingFilesQuestion', { name: args[0].projectName, list: missListStr }]);
            if (doFixRes !== 'cancel') {
                const mkDir = (dPath) => __awaiter(this, void 0, void 0, function* () { try {
                    yield (0, promises_1.mkdir)(dPath, { recursive: true });
                    return Promise.resolve(true);
                }
                catch (_a) {
                    return Promise.resolve(false);
                } });
                const wPrefs = (fPath) => __awaiter(this, void 0, void 0, function* () { const newPPrefsFData = JSON.stringify(appTypes_1.defCompzProject); try {
                    yield (0, promises_1.writeFile)(fPath, newPPrefsFData, { encoding: 'utf-8' });
                    return Promise.resolve(true);
                }
                catch (e) {
                    console.log(e);
                    return Promise.resolve(false);
                } });
                for (let i = 0; i < d.length; i++) {
                    if (!d[i].includes('.json') && !d[i].includes('.0z1')) {
                        yield mkDir(d[i]);
                    }
                    else {
                        wPrefs(d[i]);
                    }
                }
                ;
            }
        }
    });
}
//-------------------------------------------------------
electron_1.ipcMain.on('set-current-project', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    if (args[0] !== null) {
        currentProject = args[0];
        if (currentProject && !_.isEmpty(currentProject)) {
            console.log('[main] currentProject [SET]: ' + currentProject.projectName + ' - currentProject SET!');
            compzWin.webContents.send('current-project-loaded', [currentProject]);
        }
        else {
            console.log('[main] currentProject [ERROR]: args[0] !== Valid Project Object');
            console.log(args[0]);
        }
        ;
        checkCurrentProject(args);
    }
    else {
        console.log('[main] currentProject [SET]: to null - Resetting GVars...');
        currentProject = null;
        mainCMIsOpen = false;
        fileExplorerIsOpen = false;
        cmOpts = null;
        appContextSection = null;
        homeContextSection = null;
        homeContextArea = null;
        feContextFile = null;
        plContextFile = null;
        pjContextFile = null;
        playerFileLoaded = null;
        plMarkedFiles = null;
        editorFile = null;
        editorShouldSave = null;
        compzWin.webContents.send('current-project-loaded', [null]);
    }
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('clearcache', () => __awaiter(void 0, void 0, void 0, function* () { try {
    yield electron_1.session.defaultSession.clearCache();
    doSuccess('Clear Cache', 'Session cache cleared successfully');
    return true;
}
catch (e) {
    appCons('(IPCHandler|clearcache) ERROR: ' + e);
    return false;
} }));
electron_1.ipcMain.on('fe-is-open', (e, args) => __awaiter(void 0, void 0, void 0, function* () { const oldState = fileExplorerIsOpen; if (args[0] !== fileExplorerIsOpen) {
    fileExplorerIsOpen = args[0];
    if (oldState !== null) {
        compzWin.webContents.send('fe-is-open-changed', [fileExplorerIsOpen]);
    }
} }));
electron_1.ipcMain.handle('is-fe-open', () => __awaiter(void 0, void 0, void 0, function* () { return fileExplorerIsOpen; }));
//-------------------------------------------------------
electron_1.ipcMain.on('app-context-section', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (!mainCMIsOpen) {
    appContextSection = args[0];
    ctxtReg('acs');
    yield cmBuild();
}
else {
    ctxtBlock('app-context-section', 'appContextSection');
} }));
electron_1.ipcMain.on('home-context-section', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (!mainCMIsOpen) {
    homeContextSection = args[0];
    ctxtReg('hcs');
    yield cmBuild();
}
else {
    ctxtBlock('home-context-section', 'homeContextSection');
} }));
electron_1.ipcMain.on('home-context-area', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (!mainCMIsOpen) {
    homeContextArea = args[0];
    ctxtReg('hca');
    yield cmBuild();
}
else {
    ctxtBlock('home-context-area', 'homeContextArea');
} }));
electron_1.ipcMain.on('cm-isopen', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (mainCMIsOpen !== args[0]) {
    mainCMIsOpen = args[0];
    console.log('Changed mainCMIsOpen=' + String(args[0]) + ' via #cm-isopen');
} }));
//-------------------------------------------------------
electron_1.ipcMain.on('fe-context-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (!mainCMIsOpen) {
    feContextFile = args[0];
    ctxtFile('fecf');
    yield cmBuild();
}
else {
    ctxtBlock('fe-context-file', 'feContextFile');
} }));
electron_1.ipcMain.on('pl-context-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (!mainCMIsOpen) {
    plContextFile = args[0];
    ctxtFile('plcf');
    yield cmBuild();
}
else {
    ctxtBlock('pl-context-file', 'plContextFile');
} }));
electron_1.ipcMain.on('pj-context-file', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (!mainCMIsOpen) {
    pjContextFile = args[0];
    ctxtFile('pjcf');
    yield cmBuild();
}
else {
    ctxtBlock('pj-context-file', 'pjContextFile');
} }));
electron_1.ipcMain.on('player-file-loaded', (e, args) => __awaiter(void 0, void 0, void 0, function* () { playerFileLoaded = args[0]; ctxtFile('pfl'); yield cmBuild(); }));
electron_1.ipcMain.handle('get-player-file-loaded', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    if (playerFileLoaded) {
        appCons('[ipcMain|Handle|get-player-file-loaded] - FOUND playerFileLoaded - Returning fileObj');
        return playerFileLoaded;
    }
    else {
        appCons('[ipcMain|Handle|get-player-file-loaded] - No playerFileLoaded (null) - Returning NULL');
        return null;
    }
}));
electron_1.ipcMain.on('pl-marked-files', (e, args) => __awaiter(void 0, void 0, void 0, function* () { plMarkedFiles = args[0]; yield cmBuild(); }));
//-------------------------------------------------------
electron_1.ipcMain.on('appConsReady', (e) => __awaiter(void 0, void 0, void 0, function* () { if (!appConsReady) {
    appConsReady = true;
} }));
//-------------------------------------------------------
electron_1.ipcMain.handle('getCompzPaths', () => __awaiter(void 0, void 0, void 0, function* () { return compzAppPaths; }));
electron_1.ipcMain.handle('getFFPath', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    let ffPathRes = { r: false, d: null };
    if (compzAppPaths !== null && compzAppPaths.hasOwnProperty('binary')) {
        if (compzAppPaths.binary.hasOwnProperty(args[0])) {
            if (typeof compzAppPaths.binary[args[0]] === 'string' && compzAppPaths.binary[args[0]].trim().length > 0) {
                ffPathRes = { r: true, d: compzAppPaths.binary[args[0]].trim() };
            }
            else {
                appCons('(IPCHandle|getFFPath) ERROR: compzAppPaths.binary.' + args[0] + '==="" (blank)');
            }
        }
        else {
            appCons('(IPCHandle|getFFPath) ERROR: compzAppPaths missing property ' + args[0]);
        }
    }
    else {
        appCons('(IPCHandle|getFFPath) ERROR: compzAppPaths===null||compzAppPaths missing binary property');
    }
    return Promise.resolve(ffPathRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('getYTDLPath', () => __awaiter(void 0, void 0, void 0, function* () {
    let ytdlPathRes = { r: false, d: null };
    if (compzAppPaths !== null && compzAppPaths.hasOwnProperty('binary')) {
        if (compzAppPaths.binary.hasOwnProperty('ytdl')) {
            if (typeof compzAppPaths.binary['ytdl'] === 'string' && compzAppPaths.binary['ytdl'].trim().length > 0) {
                ytdlPathRes = { r: true, d: compzAppPaths.binary['ytdl'].trim() };
            }
            else {
                appCons('(IPCHandle|getYTDLPath) ERROR: compzAppPaths.binary.ytdl==="" (blank)');
            }
        }
        else {
            appCons('(IPCHandle|getYTDLPath) ERROR: compzAppPaths missing property ytdl');
        }
    }
    else {
        appCons('(IPCHandle|getYTDLPath) ERROR: compzAppPaths===null||compzAppPaths missing binary property');
    }
    return Promise.resolve(ytdlPathRes);
}));
//-------------------------------------------------------
electron_1.ipcMain.handle('getIPRegionLang', () => __awaiter(void 0, void 0, void 0, function* () { if (userIPRegLang) {
    return userIPRegLang;
}
else {
    yield initNetIPRegion();
    if (userIPRegLang) {
        return userIPRegLang;
    }
    else {
        return null;
    }
} }));
electron_1.ipcMain.handle('getAppPath', () => __awaiter(void 0, void 0, void 0, function* () { return compzAppPaths.app; }));
electron_1.ipcMain.handle('getProjectsPath', () => __awaiter(void 0, void 0, void 0, function* () { return path.join(electron_1.app.getPath('documents'), 'compzProjects'); }));
electron_1.ipcMain.handle('isProjectLoaded', () => __awaiter(void 0, void 0, void 0, function* () { if (currentProject !== null && typeof currentProject === 'object' && !_.isEmpty(currentProject)) {
    return true;
}
else {
    return false;
} }));
electron_1.ipcMain.handle('getDefaultProjectPath', () => __awaiter(void 0, void 0, void 0, function* () { return defaultProject.projectDirPath; }));
electron_1.ipcMain.handle('getUserProjects', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (args && args[0] && args[0] === 'sync') {
    yield syncUProjects();
    return userProjects;
}
else {
    return userProjects;
} }));
electron_1.ipcMain.handle('getCurrentProject', (e, args) => __awaiter(void 0, void 0, void 0, function* () { if (currentProject) {
    return { r: true, d: currentProject };
}
else {
    return { r: false, data: null };
} }));
electron_1.ipcMain.handle('getMediaPath', () => __awaiter(void 0, void 0, void 0, function* () {
    let mPRes = '';
    if (currentProject) {
        mPRes = path.join(currentProject.projectDirPath, 'media');
    }
    else {
        appCons('(IPCHandle|getMediaPath) ERROR: currentProject.projectDirPath - NOT FOUND');
    }
    ;
    return mPRes;
}));
electron_1.ipcMain.handle('getBDirPath', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[ipcHandle|getBDirPath] args[0]= ' + args[0]);
    let bdirPRes = '';
    if (currentProject && currentProject.hasOwnProperty('projectDirPath') && currentProject.projectDirPath) {
        console.log('[ipcHandle|getBDirPath] Found Project & currentDirPath: ' + currentProject.projectDirPath);
        bdirPRes = path.join(currentProject.projectDirPath, 'media/' + args[0]);
        console.log('[ipcHandle|getBDirPath] Set Result to: ' + bdirPRes);
    }
    else {
        appCons('(IPCHandle|getBDirPath) ERROR: currentProject.projectDirPath - NOT FOUND');
    }
    ;
    return bdirPRes;
}));
//-------------------------------------------------------
electron_1.ipcMain.on('openWindowsDir', (e, args) => __awaiter(void 0, void 0, void 0, function* () { electron_1.shell.showItemInFolder(args[0]); }));
//-------------------------------------------------------
electron_1.ipcMain.handle('readProjPrefsFile', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    if ((yield exists(currentProject.projectPrefsPath))) {
        const rAPFStr = yield (0, promises_1.readFile)(currentProject.projectPrefsPath, 'utf-8');
        const rAPFObj = JSON.parse(rAPFStr);
        if (args && args.length > 0 && args[0]) {
            if (args[0] === 'app') {
                const resD = rAPFObj.appStates;
                return Promise.resolve({ r: true, d: resD });
            }
            else if (args[0] === 'home') {
                const resD = rAPFObj.homeStates;
                return Promise.resolve({ r: true, d: resD });
            }
            else {
                return Promise.resolve({ r: false, d: null });
            }
        }
        else {
            return Promise.resolve({ r: true, d: rAPFObj });
        }
    }
    else {
        return Promise.resolve({ r: false, d: null });
    }
}));
electron_1.ipcMain.handle('writeProjPrefsFile', (e, args) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fileRWInProg) {
        fileRWInProg = true;
        const pFileObjKey = args[1];
        const pFileData = args[0];
        const readExistPF = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const rAPFRes = yield (0, promises_1.readFile)(currentProject.projectPrefsPath, 'utf-8');
                if (typeof rAPFRes === 'object') {
                    return Promise.resolve({ r: true, d: rAPFRes });
                }
                else if (typeof rAPFRes === 'string' && (yield isJSON(rAPFRes))) {
                    const tO = JSON.parse(rAPFRes);
                    if (typeof tO === 'object') {
                        return Promise.resolve({ r: true, d: tO });
                    }
                    else {
                        return Promise.resolve({ r: false, d: null });
                    }
                }
            }
            catch (e) {
                console.log(e);
                return Promise.resolve({ r: false, d: null });
            }
        });
        if (pFileObjKey === 'appStates' || pFileObjKey === 'homeStates') {
            const rEPFRes = yield readExistPF();
            if (rEPFRes.r) {
                let existPFData = rEPFRes.d;
                let compPFData;
                pFileObjKey === null ? compPFData = rEPFRes.d : compPFData = rEPFRes.d[pFileObjKey];
                if (!_.isEqual(compPFData, pFileData)) {
                    const diffRes = isDiff(pFileData, compPFData);
                    if (diffRes.r) {
                        existPFData.prefsLastMod = Math.round((new Date()).getTime() / 1000);
                        existPFData[pFileObjKey] = pFileData;
                        const newPFData = JSON.stringify(existPFData);
                        try {
                            const wNewPFRes = (0, promises_1.writeFile)(currentProject.projectPrefsPath, newPFData, 'utf-8');
                            yield wNewPFRes;
                            fileRWInProg = false;
                            return true;
                        }
                        catch (e) {
                            appCons('[main|ipcMain.handle] (writeProjPrefsFile) [ERROR]: ' + JSON.stringify(e));
                            fileRWInProg = false;
                            return false;
                        }
                    }
                    else {
                        fileRWInProg = false;
                        return true;
                    }
                }
                else {
                    fileRWInProg = false;
                    return true;
                }
            }
            else {
                appCons('(writeProjPrefsFile) [ERROR]: Failed to Read Existing compzPrefs.json - Aborted');
                fileRWInProg = false;
                return false;
            }
        }
        else {
            appCons('(writeProjPrefsFile) Will-Quit-Quick-Save...');
            const newPFData = JSON.stringify(pFileData);
            try {
                const wNewPFRes = (0, promises_1.writeFile)(currentProject.projectPrefsPath, newPFData, 'utf-8');
                yield wNewPFRes;
                fileRWInProg = false;
                return true;
            }
            catch (e) {
                appCons('[main|ipcMain.handle] (writeProjPrefsFile) [ERROR]: ' + JSON.stringify(e));
                fileRWInProg = false;
                return false;
            }
        }
    }
    else {
        fileRWInProg = false;
        return false;
    }
}));
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
//# sourceMappingURL=main.js.map