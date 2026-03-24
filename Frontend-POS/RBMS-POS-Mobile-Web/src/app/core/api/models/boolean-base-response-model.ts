/* tslint:disable */
/* eslint-disable */
export interface BooleanBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: boolean;
  status?: string | null;
}
