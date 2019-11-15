export class BaseResponse<TResponce, TRequest> {
  public status: number;
  public code?: string;
  public message?: string;
  public body?: TResponce;
  public response?: TResponce;
  public request?: TRequest;
  public queryString?: any;
  public error?: any;
  public errors?: any;
}

export interface PagedResponse {
  count: number;
  page: number;
  totalPages: number;
  totalItems: number;
}
