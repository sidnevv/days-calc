import { useGetHolidaysQuery } from '@/lib/api/holidaysApi';

export const isPublicHoliday = (date: Date, holidays: string[]): boolean => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return holidays.includes(dateStr);
};

// Хук для использования в компонентах
export const useHolidaysCheck = () => {
  const { data: holidays = [], isLoading, error } = useGetHolidaysQuery();

  const checkHoliday = (date: Date): boolean => {
    return isPublicHoliday(date, holidays);
  };

  return {
    isPublicHoliday: checkHoliday,
    holidays,
    isLoading,
    error,
  };
};
