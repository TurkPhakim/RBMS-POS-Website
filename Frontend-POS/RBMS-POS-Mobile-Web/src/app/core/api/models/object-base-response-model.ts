/* tslint:disable */
/* eslint-disable */
export interface ObjectBaseResponseModel {
  code?: string | null;
  errors?: ({
[key: string]: Array<string>;
}) | null;
  message?: string | null;
  result?: any | null;
  status?: string | null;
}
