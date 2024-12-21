import { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';

export const handleApiError = (error: unknown, defaultMessage: string): void => {
  const message = getErrorMessage(error);
  enqueueSnackbar(message, {
    variant: 'error',
    autoHideDuration: 5000,
    preventDuplicate: true,
  });
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response?.status === 500) {
      return 'An internal server error occurred. Please try again later.';
    }

    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && (
    error.code === 'ECONNABORTED' ||
    error.message === 'Network Error' ||
    !error.response
  );
};

export const isAuthError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 401;
};