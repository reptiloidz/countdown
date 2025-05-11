import { KeyValue } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sortKeyValue',
})
export class SortKeyValuePipe implements PipeTransform {
	isKeyValue(object: any): object is KeyValue<string, string | number> {
		return !isNaN(object) && 'value' in object;
	}
	transform(list: KeyValue<string, string | number>[] | undefined): KeyValue<string, string | number>[] | undefined {
		return list?.sort((a, b) => {
			return +a.value - +b.value;
		});
	}
}
