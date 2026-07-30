import { ChangeDetectionStrategy, Component, HostBinding, input, OnInit } from '@angular/core';
import { SwitcherItem } from 'src/app/interfaces';
import { SwitcherComponent } from '../switcher/switcher.component';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [SwitcherComponent],
	templateUrl: './settings.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
	themes: SwitcherItem[] = [
		{
			text: 'Светлая тема',
			value: 'dark',
			icon: 'moon',
		},
		{
			text: 'По умолчанию',
			value: 'default',
			default: true,
		},
		{
			text: 'Тёмная тема',
			value: 'light',
			icon: 'sun',
		},
	];
	sounds: SwitcherItem[] = [
		{
			text: 'Без звука',
			value: 'disabled',
			icon: 'speaker-disabled',
		},
		{
			text: 'Короткий сигнал',
			value: 'short',
			icon: 'speaker-short',
		},
		{
			text: 'Длинный сигнал',
			value: 'long',
			icon: 'speaker-long',
		},
	];
	themeValueDefault = 'default';
	soundValueDefault = 'short';

	isPopup = input(false);

	@HostBinding('class') get componentClass(): string {
		return this.isPopup() ? 'settings' : '';
	}

	ngOnInit(): void {
		document.documentElement.setAttribute('data-theme', this.themeValue);
		document.documentElement.setAttribute('data-sound', this.soundValue);
	}

	get themeValue() {
		return localStorage.getItem('theme') ?? this.themeValueDefault;
	}

	get soundValue() {
		return localStorage.getItem('sound') ?? this.soundValueDefault;
	}

	changeTheme(theme: string) {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	changeSound(sound: string) {
		document.documentElement.setAttribute('data-sound', sound);
		localStorage.setItem('sound', sound);
	}
}
