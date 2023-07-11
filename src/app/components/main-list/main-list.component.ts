import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event.interface';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit {
	result: Event[] = [];

	constructor(private http: HttpService) {}

	ngOnInit(): void {
		this.http.getEvents().subscribe({
			next: (result: Event[]) => {
				this.result = result;
				console.log(result);
			},
		});
	}
}
