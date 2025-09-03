// Вспомогательные функции для работы с датами

export const getYearsList = (currentYear: number, count: number = 3): number[] => {
    return Array.from({ length: count }, (_, i) => currentYear + i);
};

export const getMonthsWithDays = (year: number) => {
    const months = [
        { name: 'Январь', shortName: 'янв', days: 31 },
        { name: 'Февраль', shortName: 'фев', days: isLeapYear(year) ? 29 : 28 },
        { name: 'Март', shortName: 'мар', days: 31 },
        { name: 'Апрель', shortName: 'апр', days: 30 },
        { name: 'Май', shortName: 'май', days: 31 },
        { name: 'Июнь', shortName: 'июн', days: 30 },
        { name: 'Июль', shortName: 'июл', days: 31 },
        { name: 'Август', shortName: 'авг', days: 31 },
        { name: 'Сентябрь', shortName: 'сен', days: 30 },
        { name: 'Октябрь', shortName: 'окт', days: 31 },
        { name: 'Ноябрь', shortName: 'ноя', days: 30 },
        { name: 'Декабрь', shortName: 'дек', days: 31 }
    ];

    return months.map((month, index) => ({
        month: index + 1,
        monthName: month.name,
        monthShortName: month.shortName,
        daysInMonth: month.days
    }));
};

export const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 - воскресенье, 6 - суббота
};

export const getDayType = (date: Date): 'weekend' | 'weekday' | 'holiday' => {
    if (isWeekend(date)) {
        return 'weekend';
    }

    // Можно добавить проверку на праздничные дни
    // const holidays = getHolidays(date.getFullYear());
    // if (holidays.some(holiday => isSameDay(date, holiday))) {
    //   return 'holiday';
    // }

    return 'weekday';
};

// Функция для получения праздничных дней (можно расширить)
export const getHolidays = (year: number): Date[] => {
    return [
        new Date(year, 0, 1),   // Новый год
        new Date(year, 0, 2),   // Новый год
        new Date(year, 0, 3),   // Новый год
        new Date(year, 0, 4),   // Новый год
        new Date(year, 0, 5),   // Новый год
        new Date(year, 0, 6),   // Новый год
        new Date(year, 0, 7),   // Рождество
        new Date(year, 1, 23),  // День защитника Отечества
        new Date(year, 2, 8),   // Международный женский день
        new Date(year, 4, 1),   // Праздник весны и труда
        new Date(year, 4, 9),   // День Победы
        new Date(year, 5, 12),  // День России
        new Date(year, 10, 4),  // День народного единства
    ];
};