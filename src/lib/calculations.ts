import { Employee, PositionChange, VacationCalculation } from '@/types';
import { getAdditionalDaysByPosition } from './database';


export const calculateVacationDays = (employee: Employee): VacationCalculation => {
    const currentDate = new Date();
    const hireDate = new Date(employee.hireDate);

    if (currentDate < hireDate) {
        return {
            earnedDays: 0,
            availableDays: 0,
            additionalDays: 0,
            availableAdditionalDays: 0,
            totalAvailableDays: 0
        };
    }

    let totalEarnedDays = 0;
    let totalAdditionalDays = 0;

    for (let year = hireDate.getFullYear(); year <= currentDate.getFullYear(); year++) {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        const relevantPositions = employee.positionChanges.filter(pos => {
            const posStart = new Date(pos.fromDate);
            const posEnd = pos.toDate ? new Date(pos.toDate) : new Date(8640000000000000);
            return posStart <= yearEnd && posEnd >= yearStart;
        });

        for (const position of relevantPositions) {
            const posStart = new Date(position.fromDate);
            const posEnd = position.toDate ? new Date(position.toDate) : new Date(8640000000000000);

            const periodStart = new Date(Math.max(posStart.getTime(), yearStart.getTime()));
            const periodEnd = new Date(Math.min(posEnd.getTime(), yearEnd.getTime(), currentDate.getTime()));

            if (periodStart <= periodEnd) {
                // Расчет основных дней отпуска
                const monthsWorked = calculateMonthsBetween(periodStart, periodEnd);
                const daysPerMonth = position.vacationDaysPerYear / 12;
                totalEarnedDays += monthsWorked * daysPerMonth;

                // Расчет дополнительных дней
                const daysWorked = calculateDaysBetween(periodStart, periodEnd);
                const additionalDaysPerYear = position.additionalDaysPerYear !== undefined
                    ? position.additionalDaysPerYear
                    : getAdditionalDaysByPosition(position.position);
                const additionalDaysPerDay = additionalDaysPerYear / 365;
                totalAdditionalDays += daysWorked * additionalDaysPerDay;
            }
        }
    }

    // Учет использованных дней
    const availableDays = Math.max(0, totalEarnedDays - employee.usedVacationDays);
    const availableAdditionalDays = Math.max(0, totalAdditionalDays - (employee.usedAdditionalDays || 0));
    const totalAvailableDays = availableDays + availableAdditionalDays;

    return {
        earnedDays: parseFloat(totalEarnedDays.toFixed(2)),
        availableDays: parseFloat(availableDays.toFixed(2)),
        additionalDays: parseFloat(totalAdditionalDays.toFixed(2)),
        availableAdditionalDays: parseFloat(availableAdditionalDays.toFixed(2)),
        totalAvailableDays: parseFloat(totalAvailableDays.toFixed(2))
    };
};

// Остальные вспомогательные функции без изменений
const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24) + 1;

    return Math.max(0, daysDiff);
};

const calculateMonthsBetween = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += end.getMonth();

    // Учитываем части месяца
    const startDay = start.getDate();
    const endDay = end.getDate();
    const daysInStartMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const daysInEndMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

    const fractionStart = (daysInStartMonth - startDay + 1) / daysInStartMonth;
    const fractionEnd = endDay / daysInEndMonth;

    if (months === 0) {
        return fractionStart;
    }

    return months - 1 + fractionStart + fractionEnd;
};

// Упрощенная версия расчета
export const calculateVacationDaysSimple = (employee: Employee): VacationCalculation => {
    const currentDate = new Date();
    const hireDate = new Date(employee.hireDate);

    if (currentDate < hireDate) {
        return {
            earnedDays: 0,
            availableDays: 0,
            additionalDays: 0,
            availableAdditionalDays: 0,
            totalAvailableDays: 0
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
        ? (currentPosition.additionalDaysPerYear || getAdditionalDaysByPosition(currentPosition.position))
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
        totalAvailableDays: parseFloat(totalAvailableDays.toFixed(2))
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

    return employee.positionChanges.find(position => {
        const positionStart = new Date(position.fromDate);
        const positionEnd = position.toDate ? new Date(position.toDate) : new Date(8640000000000000);

        return currentDate >= positionStart && currentDate <= positionEnd;
    }) || null;
};