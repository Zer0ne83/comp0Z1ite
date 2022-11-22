"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.StorageService = void 0;
//import * as Store from 'electron-store';
const electron_store_1 = __importDefault(require("electron-store"));
const ngx_logger_1 = require("ngx-logger");
const core_1 = require("@angular/core");
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
let StorageService = 
////////////////////////////////////////////////////////////////
class StorageService {
    ////////////////////////////////////////////////////////////////
    constructor(logger) {
        this.logger = logger;
        this.storeIsReady = false;
        this.store = null;
        if (!this.store || !this.storeIsReady) {
            this.store = new electron_store_1.default();
        }
        ;
    }
    ////////////////////////////////////////////////////////////////
    isJSON(data) {
        if (typeof data !== 'string')
            return false;
        try {
            const result = JSON.parse(data);
            const type = Object.prototype.toString.call(result);
            return type === '[object Object]' || type === '[object Array]';
        }
        catch (err) {
            return false;
        }
    }
    ////////////////////////////////////////////////////////////////
    set(setKey, setVal) {
        try {
            this.store.set(setKey, setVal);
            this.logger.info('[storeServ|set] Item (' + setKey + ') Set - \u2714\uFE0F OK');
            return Promise.resolve(true);
        }
        catch (e) {
            this.logger.info('[storeServ|set] Item (' + setKey + ') Set - \u2757 ERROR');
            return Promise.resolve(false);
        }
    }
    ////////////////////////////////////////////////////////////////
    get(getKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getRes = yield this.store.get(getKey);
                if (getRes) {
                    this.logger.info('[storeServ|get] Item (' + getKey + ') Get - \u2714\uFE0F FOUND');
                    return Promise.resolve({ r: true, d: getRes });
                }
                else {
                    this.logger.info('[storeServ|get] Item (' + getKey + ') Get - \u2757NOT FOUND');
                    return Promise.resolve({ r: false });
                }
            }
            catch (e) {
                this.logger.info('[storeServ|get] Item (' + getKey + ') Set - \u2757 ERROR');
                return Promise.resolve({ r: false });
            }
        });
    }
    ////////////////////////////////////////////////////////////////
    delete(delKey) {
        try {
            this.store.delete(delKey);
            this.logger.info('[storeServ|delete] Item (' + delKey + ') Deleted - \u2714\uFE0F OK');
            return Promise.resolve(true);
        }
        catch (e) {
            this.logger.info('[storeServ|delete] Item (' + delKey + ') Delete - \u2757 ERROR');
            return Promise.resolve(false);
        }
    }
    ////////////////////////////////////////////////////////////////
    has(hasKey) {
        try {
            if (this.store.has(hasKey)) {
                this.logger.info('[storeServ|has] Key ' + hasKey + ' - \u2714\uFE0F FOUND');
                return Promise.resolve(true);
            }
            else {
                this.logger.info('[storeServ|has] Key ' + hasKey + ' - \u2757NOT FOUND');
                return Promise.resolve(false);
            }
            ;
        }
        catch (e) {
            this.logger.info('[storeServ|has] (' + hasKey + ') Has - \u2757 ERROR');
            return Promise.resolve(false);
        }
    }
    ////////////////////////////////////////////////////////////////
    clear() {
        try {
            this.store.clear();
            this.logger.info('[storeServ|set] Cleared Store - \u2714\uFE0F OK');
            return Promise.resolve(true);
        }
        catch (e) {
            this.logger.info('[storeServ|clear] Clear Store - \u2757 ERROR');
            return Promise.resolve(false);
        }
    }
    ////////////////////////////////////////////////////////////////
    storeInfo() {
        try {
            const storeRes = { size: this.store.size, path: this.store.path, data: this.store.store };
            this.logger.info('[storeServ|storeInfo] Store Info - \u2714\uFE0F OK');
            return Promise.resolve(storeRes);
        }
        catch (e) {
            this.logger.info('[storeServ|storeInfo] Store Info - \u2757 ERROR');
            return Promise.resolve(null);
        }
    }
};
StorageService = __decorate([
    (0, core_1.Injectable)({ providedIn: 'root' })
    ////////////////////////////////////////////////////////////////
    ,
    __metadata("design:paramtypes", [ngx_logger_1.NGXLogger])
], StorageService);
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map