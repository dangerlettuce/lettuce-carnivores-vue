export interface FunctionResponse {
  success: boolean;
  error?: boolean;
  message?: string | null;
  errorDetails?: any | null;
  data?: Object | null;
}

export interface FunctionResponseError extends FunctionResponse {
  success: false;
}
