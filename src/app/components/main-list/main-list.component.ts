import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit {
	result: Point[] = [];

	constructor(private http: HttpService) {}

	ngOnInit(): void {
		this.http.getPoints().subscribe({
			next: (result: Point[]) => {
				this.result = result;
				console.log(result);
			},
		});
	}
}
