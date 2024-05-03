import { Pipe, PipeTransform } from '@angular/core';
import { PointColorTypes } from '../types';

@Pipe({
	name: 'colorsCheck',
})
export class ColorsCheckPipe implements PipeTransform {
	transform(
		colorType: PointColorTypes[],
		pointColorsItem: PointColorTypes
	): boolean {
		return colorType.includes(pointColorsItem);
	}
}
