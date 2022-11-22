import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LauncherComponent } from './launcher.component';
/////////////////////////////////////////////////////////
const routes:Routes=[{path:'launcher',component:LauncherComponent}];
/////////////////////////////////////////////////////////
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
/////////////////////////////////////////////////////////
export class LauncherRoutingModule {}
/////////////////////////////////////////////////////////
