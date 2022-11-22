import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputPopoverPage } from './inputPopover.page';

const routes: Routes = [
  {
    path: '',
    component: InputPopoverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InputPopoverPageRoutingModule {}
