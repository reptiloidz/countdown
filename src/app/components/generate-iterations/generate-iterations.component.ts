import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-generate-iterations',
	templateUrl: './generate-iterations.component.html',
})
export class GenerateIterationsComponent implements OnInit {
	@Input() iterationsForm!: FormGroup;

	ngOnInit(): void {}

	genRepeats() {}
}
