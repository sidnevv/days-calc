import { Employee, PositionChange, VacationCalculation } from '@/types';
import { getAdditionalDaysByPosition } from './common';

export const calculateVacationDaysSimple = (employee: Employee): VacationCalculation => {
  const currentDate = new Date();
  const hireDate = new Date(employee.hireDate);

  if (currentDate < hireDate) {
    return {
      earnedDays: 0,
      availableDays: 0,
      additionalDays: 0,
      availableAdditionalDays: 0,
      totalAvailableDays: 0,
    };
  }

  // Расчет основных дней отпуска
  const monthsWorked = calculateMonthsWorked(hireDate, currentDate);
  const currentPosition = findCurrentPosition(employee);
  const daysPerMonth = currentPosition ? currentPosition.vacationDaysPerYear / 12 : 28 / 12;
  const earnedDays = monthsWorked * daysPerMonth;

  // Расчет дополнительных дней
  const daysWorked = calculateDaysWorked(hireDate, currentDate);
  const additionalDaysPerYear = currentPosition
    ? currentPosition.additionalDaysPerYear || getAdditionalDaysByPosition(currentPosition.position)
    : 0;
  const additionalDaysPerDay = additionalDaysPerYear / 365;
  const additionalDays = daysWorked * additionalDaysPerDay;

  // Учет использованных дней
  const availableDays = Math.max(0, earnedDays - employee.usedVacationDays);
  const availableAdditionalDays = Math.max(0, additionalDays - (employee.usedAdditionalDays || 0));
  const totalAvailableDays = availableDays + availableAdditionalDays;

  return {
    earnedDays: parseFloat(earnedDays.toFixed(2)),
    availableDays: parseFloat(availableDays.toFixed(2)),
    additionalDays: parseFloat(additionalDays.toFixed(2)),
    availableAdditionalDays: parseFloat(availableAdditionalDays.toFixed(2)),
    totalAvailableDays: parseFloat(totalAvailableDays.toFixed(2)),
  };
};

const calculateMonthsWorked = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months -= start.getMonth();
  months += end.getMonth();

  if (end.getDate() < start.getDate()) {
    months--;
  }

  return Math.max(0, months);
};

const calculateDaysWorked = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24) + 1;

  return Math.max(0, daysDiff);
};

const findCurrentPosition = (employee: Employee): PositionChange | null => {
  const currentDate = new Date();

  return (
    employee.positionChanges.find((position) => {
      const positionStart = new Date(position.fromDate);
      const positionEnd = position.toDate ? new Date(position.toDate) : new Date(8640000000000000);

      return currentDate >= positionStart && currentDate <= positionEnd;
    }) || null
  );
};
