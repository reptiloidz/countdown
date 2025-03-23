import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainItemComponent } from './main-item.component';
import { TimersModule } from '../timers/timers.module';
import { SharedModule } from '../shared/shared.module';
import { CheckAccessEditPipe } from '../pipes/check-access-edit.pipe';
import { SvgModule } from '../svg/svg.module';
import { RemainModule } from '../remain/remain.module';
import { RouterModule } from '@angular/router';

@NgModule({
	imports: [CommonModule, SharedModule, SvgModule, RouterModule, TimersModule, RemainModule],
	declarations: [MainItemComponent, CheckAccessEditPipe],
	exports: [MainItemComponent, CheckAccessEditPipe],
})
export class MainItemModule {}
