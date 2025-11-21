import { Routes } from '@angular/router';
import { NatiaComponent } from './natiaUI/natia/natia.component';
import { SystemStreamInfoComponent } from './system-stream-info/system-stream-info.component';

export const routes: Routes = [
  {
    path: '',
    component: NatiaComponent
  },
  {
    path: 'system-streams',
    component: SystemStreamInfoComponent
  }
];
