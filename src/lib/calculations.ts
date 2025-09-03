import { Employee, PositionChange, VacationCalculation } from '@/types';

export const calculateVacationDays = (employee: Employee): VacationCalculation => {
    const currentDate = new Date();
    const hireDate = new Date(employee.hireDate);

    // Если сотрудник еще не начал работать
    if (currentDate < hireDate) {
        return {
            earnedDays: 0,
            availableDays: 0
        };
    }

    let totalEarnedDays = 0;
    const currentMonth = new Date(hireDate);

    while (currentMonth <= currentDate) {
        const relevantPosition = findRelevantPosition(employee, currentMonth);

        if (relevantPosition) {
            const daysPerMonth = relevantPosition.vacationDaysPerYear / 12;
            totalEarnedDays += daysPerMonth;
        }

        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const availableDays = Math.max(0, totalEarnedDays - (employee.usedVacationDays || 0));

    return {
        earnedDays: parseFloat(totalEarnedDays.toFixed(2)),
        availableDays: parseFloat(availableDays.toFixed(2))
    };
};

const findRelevantPosition = (employee: Employee, date: Date): PositionChange | null => {
    const targetDate = new Date(date);

    for (const position of employee.positionChanges) {
        const positionStart = new Date(position.fromDate);
        const positionEnd = position.toDate ? new Date(position.toDate) : new Date(8640000000000000);

        if (targetDate >= positionStart && targetDate <= positionEnd) {
            return position;
        }
    }

    return null;
};

// Альтернативный упрощенный расчет (если нужен более точный)
export const calculateVacationDaysSimple = (employee: Employee): VacationCalculation => {
    const currentDate = new Date();
    const hireDate = new Date(employee.hireDate);

    if (currentDate < hireDate) {
        return {
            earnedDays: 0,
            availableDays: 0
        };
    }

    // Вычисляем количество полных отработанных месяцев
    const monthsWorked = calculateMonthsWorked(hireDate, currentDate);

    // Находим текущую позицию
    const currentPosition = findCurrentPosition(employee);
    const daysPerMonth = currentPosition ? currentPosition.vacationDaysPerYear / 12 : 28 / 12;

    const earnedDays = monthsWorked * daysPerMonth;
    const availableDays = Math.max(0, earnedDays - (employee.usedVacationDays || 0));

    return {
        earnedDays: parseFloat(earnedDays.toFixed(2)),
        availableDays: parseFloat(availableDays.toFixed(2))
    };
};

const calculateMonthsWorked = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += end.getMonth();

    // Учитываем день месяца
    if (end.getDate() < start.getDate()) {
        months--;
    }

    return Math.max(0, months);
};

const findCurrentPosition = (employee: Employee): PositionChange | null => {
    const currentDate = new Date();

    return employee.positionChanges.find(position => {
        const positionStart = new Date(position.fromDate);
        const positionEnd = position.toDate ? new Date(position.toDate) : new Date(8640000000000000);

        return currentDate >= positionStart && currentDate <= positionEnd;
    }) || null;
};