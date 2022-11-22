import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { EventsService } from '../events.service';
import { StorageService } from '../storage.service';
import { YTubeService } from '../ytube.service';
import { LoggerModule,NGXLogger } from 'ngx-logger';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula';
import { TooltipModule } from 'angular-simple-tooltip';
/////////////////////////////////////////////////////////
@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations:[HomeComponent],
  imports:[CommonModule,SharedModule,HomeRoutingModule,IonicModule.forRoot({scrollPadding:false,scrollAssist:true}),FormsModule,LoggerModule.forRoot(environment.logging),DragulaModule,TooltipModule],
  providers:[NGXLogger,EventsService,StorageService,YTubeService]
})
/////////////////////////////////////////////////////////
export class HomeModule {}
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
