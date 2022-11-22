import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LauncherRoutingModule } from './launcher-routing.module';
import { LauncherComponent } from './launcher.component';
import { SharedModule } from '../shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { EventsService } from '../events.service';
import { StorageService } from '../storage.service';
import { YTubeService } from '../ytube.service';
import { LoggerModule,NGXLogger } from 'ngx-logger';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
/////////////////////////////////////////////////////////
@NgModule({
  declarations: [LauncherComponent],
  imports: [CommonModule, SharedModule, LauncherRoutingModule,IonicModule.forRoot({scrollPadding:false,scrollAssist:true}),FormsModule,LoggerModule.forRoot(environment.logging)],
  providers: [NGXLogger,EventsService,StorageService,YTubeService]
})
/////////////////////////////////////////////////////////
export class LauncherModule {}
/////////////////////////////////////////////////////////
