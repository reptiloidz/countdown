import { NgModule } from '@angular/core';
import { MainItemComponent } from './main-item.component';
import { CheckAccessEditPipe } from '../../pipes/check-access-edit.pipe';

@NgModule({
	imports: [MainItemComponent, CheckAccessEditPipe],
	exports: [MainItemComponent, CheckAccessEditPipe],
})
export class MainItemModule {}
