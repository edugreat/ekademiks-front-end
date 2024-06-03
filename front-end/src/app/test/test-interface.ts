/*
An interface for the question object which corresponds to the question object of the backend implementation
*/
export interface Question{

    number:number,
    text:string,
    options:Option[]
}

export interface Option {

    text:string,
    letter:'A'|'B'|'C'|'D'|'E'


}