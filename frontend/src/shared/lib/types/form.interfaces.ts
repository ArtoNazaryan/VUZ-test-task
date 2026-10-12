export interface IFormErrorTarget<TField extends string> {
  field: TField | null;
  message: string;
}
