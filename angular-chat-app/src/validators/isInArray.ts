import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function isInArray(table: Array<string>): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (table.includes(control.value)) {
            return { isInArray: { value: control.value } }; // Validation error when value is found in the array
        }
        return null; // No validation error when value is not found in the array
    };
}
