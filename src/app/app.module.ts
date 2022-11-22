import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { LoggerModule, NGXLogger } from 'ngx-logger';
import { HomeModule } from './home/home.module';
import { LauncherModule } from './launcher/launcher.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { EventsService } from './events.service';
import { StorageService } from './storage.service';
import { FFMPEGService } from './ffmpeg.service';
import { HowlerService } from './viz.service';
import { YTubeService } from './ytube.service';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula';
import { TooltipModule } from 'angular-simple-tooltip';
/////////////////////////////////////////////////////////
@NgModule({
  declarations: [AppComponent],
  schemas:[NO_ERRORS_SCHEMA],
  imports: [
    LoggerModule.forRoot(environment.logging),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    LauncherModule,
    AppRoutingModule,
    IonicModule.forRoot({scrollPadding:false,scrollAssist:true}),
    CommonModule,
    DragulaModule.forRoot(),
    TooltipModule
  ],
  providers: [NGXLogger,EventsService,StorageService,FFMPEGService,YTubeService,HowlerService],
  bootstrap: [AppComponent]
})
/////////////////////////////////////////////////////////
export class AppModule {}
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
