import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeRoutingModule } from './home/home-routing.module';
import { LauncherRoutingModule } from './launcher/launcher-routing.module';
/////////////////////////////////////////////////////////
const routes:Routes=[
  {path:'',redirectTo:'launcher',pathMatch:'full'},
];
/////////////////////////////////////////////////////////
@NgModule({
  imports: [
    RouterModule.forRoot(routes,{relativeLinkResolution:'legacy'}),
    HomeRoutingModule,
    LauncherRoutingModule
  ],
  exports: [RouterModule]
})
/////////////////////////////////////////////////////////
export class AppRoutingModule { }
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
