import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class PopupService {
	private renderer: Renderer2;

	private _eventPopupOpenSubject = new Subject<{
		title: string;
		component: any;
		inputs?: Record<string, any>;
	}>();
	eventPopupOpen$ = this._eventPopupOpenSubject.asObservable();

	constructor(rendererFactory: RendererFactory2) {
		this.renderer = rendererFactory.createRenderer(null, null);
	}

	show(title: string, component: any, inputs?: Record<string, any>) {
		this.renderer.addClass(document.documentElement, 'ov-hidden');
		this._eventPopupOpenSubject.next({ title, component, inputs });
	}

	hide() {
		this.renderer.removeClass(document.documentElement, 'ov-hidden');
	}
}
