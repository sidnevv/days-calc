import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

interface ErrorHandlerProps {
  error: FetchBaseQueryError | SerializedError | undefined;
}

export function ErrorHandler({ error }: ErrorHandlerProps) {
  if (!error) return null;

  let errorMessage = 'Произошла ошибка';

  if ('status' in error) {
    switch (error.status) {
      case 404:
        errorMessage = 'Данные не найдены';
        break;
      case 500:
        errorMessage = 'Ошибка сервера';
        break;
      case 400:
        errorMessage = 'Неверный запрос';
        break;
      default:
        errorMessage = `Ошибка: ${error.status}`;
    }
  } else if ('message' in error) {
    errorMessage = error.message || 'Неизвестная ошибка';
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex items-center">
        <div className="text-red-400 mr-2">⚠️</div>
        <div>
          <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}
