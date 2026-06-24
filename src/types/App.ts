export interface AppReturn {
  success: true;
  message?: string;
}

export interface AppData<T> extends AppReturn {
  data: T;
}

export interface AppError extends Omit<AppReturn, 'success'> {
  success: false;
  message?: string;
  errorDetails?: { [key: string]: any };
}

export interface AppResponse<T> extends AppReturn {
  res: T;
}
