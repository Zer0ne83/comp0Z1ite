"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defCompzProject = exports.defHomeStates = exports.defAppStates = exports.defCompzAppPaths = void 0;
// AppPaths DEFAULT OBJECT
exports.defCompzAppPaths = { app: null, binary: { ffmpeg: null, ffplay: null, ffprobe: null, ytdl: null }, appData: null, userData: null, desktop: null, documents: null, downloads: null };
//////////////////////////////////////////////////
// AppStates DEFAULT OBJECT
exports.defAppStates = {
    mediaFileExts: {
        audio: ['.mp3', '.aac', '.flac', '.wav', '.aiff', '.dsd', '.pmc', '.mid'],
        subs: ['.srt', '.ssa', '.ttml', '.sbv', '.dfxp', '.vtt', '.txt'],
        video: ['.mpg', '.mpeg', '.mp4', '.mp2', '.webm', '.ogg', '.m4p', '.m4v', '.avi', 'wmv', '.mov']
    },
    isMaxed: false,
    statusBar: { barActionTxt: null, barHATime: '', barHistoryTxt: null, barA2HInProg: false, barA2HAnim: false, barWait: null },
    feIsOpen: false,
    feArrangeWin: 'equal',
    feEqualWinMax: '',
    feItemOrder: { audio: { by: 'type', dir: 'asc' }, subs: { by: 'type', dir: 'asc' }, video: { by: 'type', dir: 'asc' } },
    feTreeOpts: { attributes: ['type', 'extension', 'birthtime', 'atime', 'mtime', 'ctime'], normalizePath: true, depth: 3 },
    feTreeAudio: null,
    feTreeSubs: null,
    feTreeVideo: null,
    feDataStats: { audio: { count: { file: 0, dir: 0 }, size: { no: '', suffix: '' } }, subs: { count: { file: 0, dir: 0 }, size: { no: '', suffix: '' } }, video: { count: { file: 0, dir: 0 }, size: { no: '', suffix: '' } }, all: { count: { file: 0, dir: 0 }, size: { no: '', suffix: '' } } },
    feDirVis: { audio: {}, subs: {}, video: {} },
    feSearch: {
        feShowSearch: false,
        fePreSearchOrder: { audio: { by: 'type', dir: 'asc' }, subs: { by: 'type', dir: 'asc' }, video: { by: 'type', dir: 'asc' } },
        feSearchInProg: false,
        feSearchVal: '',
        feSearchMatches: null,
        feSearchMatchData: null,
        feGhostDirs: {},
        tdData: {
            feSearchTDOpts: { singleSelection: false, idField: 'bdir', textField: 'label', enableCheckAll: false, allowSearchFilter: false, itemsShowLimit: 0, limitSelection: 3, closeDropDownOnSelection: false, showSelectedItemsAtTop: false, defaultOpen: false, allowRemoteDataSearch: false },
            feSearchTDsTrue: [{ bdir: 'audio', label: 'Audio', isDisabled: false }, { bdir: 'subs', label: 'Subs', isDisabled: false }, { bdir: 'video', label: 'Video', isDisabled: false }],
            feSearchTDAll: [{ bdir: 'audio', label: 'Audio', isDisabled: false }, { bdir: 'subs', label: 'Subs', isDisabled: false }, { bdir: 'video', label: 'Video', isDisabled: false }],
            feSearchTDIndic: { audio: true, subs: true, video: true },
            feSearchHideBlock: { audio: false, subs: false, video: false }
        },
        filterData: { feSearchFilters: [], feHasActiveFilters: false, feAFCount: 0, feFilterOut: {} }
    },
    feRename: { feIsRenaming: false, feDidRename: null, feRenameFSInProg: false, feRenameItem: null, feRenameVals: {}, feRenameName: '' }
};
//////////////////////////////////////////////////
// HomeStates DEFAULT OBJECT
exports.defHomeStates = {
    playerSectionVis: true,
    editorSectionVis: true,
    scraperSectionVis: true,
    sectionHs: { player: 'calc((100vh - 74px) / 3)', editor: 'calc((100vh - 74px) / 3)', scraper: 'calc((100vh - 74px) / 3)' },
    homeFeIsOpen: false,
    playerTabToggle: 'list',
    projectPlaylists: [{ id: 'pl0', name: 'Default', items: [], isLoaded: true }],
    plHData: { tsize: { no: 0, txt: '-', suffix: '-' }, tdur: { no: 0, txt: '-' } },
    plSort: { by: null, dir: 'asc' },
    plMarkedItems: {},
    playerFile: null,
    vizModel: 'circle',
    etbAV: { o: { data: null }, n: { data: null }, canEdit: false, hasFocus: false, didChange: false },
    eCmds: { allArr: ['copy', 'cut', 'paste', 'undo', 'redo', 'selectAll'], copy: false, cut: false, paste: false, undo: false, redo: false, selectAll: false },
    tSelO: { txt: '', section: '' },
    editorFile: null,
    editorToolbox: null,
    subBoxLs: { focusin: null, focus: null, focusout: null, blur: null },
    etbSubs: { o: { data: null, counts: { lines: 0, words: 0, chars: 0 } }, n: { data: null, counts: { lines: 0, words: 0, chars: 0 } }, canEdit: false, hasFocus: false, didChange: false, isTyping: false },
    etbSubsReset: { o: { data: null, counts: { lines: 0, words: 0, chars: 0 } }, n: { data: null, counts: { lines: 0, words: 0, chars: 0 } }, canEdit: false, hasFocus: false, didChange: false, isTyping: false },
    etbSelection: '',
    etbFindIsOpen: false,
    etbFindIsCs: false,
    etbFindVal: '',
    etbReplaceVal: '',
    etbLastOState: null,
    etbFindResultsCount: null,
    searchData: []
};
//////////////////////////////////////////////////
// CompzStates DEFAULT OBJECT
exports.defCompzProject = { appStates: exports.defAppStates, homeStates: exports.defHomeStates };
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//# sourceMappingURL=appTypes.js.map