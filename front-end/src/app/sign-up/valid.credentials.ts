import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function nameValidator():ValidatorFn{

    return (control: AbstractControl<string>):ValidationErrors | null =>{

        const regex = /^[a-zA-Z]{2,}$/; //Names must be at least two string alphabets, no digits
        const isValidName = regex.test(control.value);

        return isValidName ? null : {invalidName:true};
    };
}

export function passwordValidator(): ValidatorFn{

    return (control: AbstractControl<string>): ValidationErrors | null =>{
        

        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;//Password must be at least characters, one special characters, one upper case, one lower case and one digit

        const isValidPassword = regex.test(control.value);

        return isValidPassword ? null : {invalidPassword: true};
    };
}


export function emailValidator(): ValidatorFn{

    return (control: AbstractControl<string>): ValidationErrors | null =>{

        const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/; //Must match the acceptable email formats

        const isValidEmail = regex.test(control.value);

        return isValidEmail ? null : {invalidEmail: true};
    };
}


export function phoneNumberValidator(): ValidatorFn{
        return (control: AbstractControl<string>): ValidationErrors | null =>{

            const regex = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/; //Phone number regex
    
            const isValidNumber = regex.test(control.value);
    
            return isValidNumber ? null : {invalidPhoneNumber: true};
        };
    }

