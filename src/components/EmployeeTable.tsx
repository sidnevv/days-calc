import { EmployeeWithVacation } from '../types';
import { useState } from 'react';
import {isPublicHoliday} from "@/lib/database";

interface EmployeeTableProps {
    employees: EmployeeWithVacation[];
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );

    // диапазон месяцев
    const [startMonth, setStartMonth] = useState(1); // Январь
    const [endMonth, setEndMonth] = useState(12); // Декабрь

    const currentDate = new Date();
    const years = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() + i);
    const yearMonths = getMonthsWithDays(selectedYear);

    // только месяцы в диапазоне
    const visibleMonths = yearMonths.filter(
        (m) => m.month >= startMonth && m.month <= endMonth
    );

    if (employees.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-400">Нет сотрудников</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-gray-900 rounded-xl shadow-lg border border-gray-700">
            {/* Заголовок */}
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center rounded-t-xl">
                {/* Слева — селектор года + диапазон месяцев */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-300 font-light">Год:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border border-gray-600 rounded-md px-3 py-1 text-xs text-gray-100 bg-gray-700
               focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* диапазон месяцев */}
                    <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-300 font-light">Месяцы:</label>
                        <select
                            value={startMonth}
                            onChange={(e) => {
                                const newStart = Number(e.target.value);
                                // гарантируем минимум 2 месяца
                                if (endMonth - newStart < 1) {
                                    setEndMonth(newStart + 1);
                                }
                                setStartMonth(newStart);
                            }}
                            className="border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-100 bg-gray-700"
                        >
                            {yearMonths.map((m) => (
                                <option key={m.month} value={m.month}>
                                    {m.monthName}
                                </option>
                            ))}
                        </select>
                        <span className="text-gray-400">–</span>
                        <select
                            value={endMonth}
                            onChange={(e) => {
                                const newEnd = Number(e.target.value);
                                // гарантируем минимум 2 месяца
                                if (newEnd - startMonth < 1) {
                                    setStartMonth(newEnd - 1);
                                }
                                setEndMonth(newEnd);
                            }}
                            className="border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-100 bg-gray-700"
                        >
                            {yearMonths.map((m) => (
                                <option key={m.month} value={m.month}>
                                    {m.monthName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Справа — инфо */}
                <div className="flex flex-col items-end text-xs space-y-1">
          <span className="text-gray-300 font-light">
            Расчет на: {currentDate.toLocaleDateString('ru-RU')}
          </span>
                    <span className="text-blue-400 font-medium">
            График отпусков на {selectedYear} год
          </span>
                </div>
            </div>

            {/* Таблица */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-gray-200">
                    <thead>
                    <tr className="bg-gray-800">
                        <th
                            className="sticky left-0 z-20 px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase border-r border-gray-700 bg-gray-800"
                            rowSpan={2}
                        >
                            Сотрудник
                        </th>
                        <th
                            className="px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase border-r border-gray-700"
                            rowSpan={2}
                        >
                            Доступно
                        </th>
                        {visibleMonths.map((monthData) => (
                            <th
                                key={monthData.month}
                                colSpan={monthData.daysInMonth}
                                className="px-2 py-3 text-center text-xs font-semibold text-gray-300 uppercase border-l border-gray-700 bg-gray-800"
                            >
                                {monthData.monthName}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        {visibleMonths.map((monthData) =>
                            Array.from({ length: monthData.daysInMonth }, (_, dayIndex) => {
                                const dayNumber = dayIndex + 1;
                                const date = new Date(
                                    selectedYear,
                                    monthData.month - 1,
                                    dayNumber
                                );
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const holiday = isPublicHoliday(date);

                                return (
                                    <th
                                        key={`${monthData.month}-day-${dayNumber}`}
                                        className={`text-center text-[11px] font-medium border border-gray-700
                        w-8 h-6 min-w-[32px]
                        ${
                                            holiday
                                                ? 'bg-yellow-900/60 text-yellow-300'
                                                : isWeekend
                                                    ? 'bg-red-900/60 text-red-400'
                                                    : 'bg-gray-900 text-gray-400'
                                        }`}
                                    >
                                        {dayNumber}
                                    </th>
                                );
                            })
                        )}
                    </tr>
                    </thead>

                    <tbody>
                    {employees.map((employee) => (
                        <tr
                            key={employee.id}
                            className="hover:bg-gray-800 transition-colors duration-150"
                        >
                            {/* Имя сотрудника */}
                            <td className="sticky left-0 z-10 px-3 py-2 whitespace-nowrap text-xs uppercase font-medium text-gray-100 bg-gray-900 border-r border-gray-700">
                                {employee.name}
                            </td>
                            {/* Доступные дни в формате XXX (YYY) */}
                            <td className="px-2 py-2 text-center text-xs font-medium border-r border-gray-700">
            <span className="text-green-400 font-semibold">
                {employee.vacation.availableDays.toFixed(1)}
            </span>
                                <span className="text-blue-400">
                {' '}({employee.vacation.availableAdditionalDays.toFixed(1)})
            </span>
                            </td>

                            {visibleMonths.map((monthData) =>
                                Array.from({ length: monthData.daysInMonth }, (_, dayIndex) => {
                                    const dayNumber = dayIndex + 1;
                                    const date = new Date(
                                        selectedYear,
                                        monthData.month - 1,
                                        dayNumber
                                    );
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    const holiday = isPublicHoliday(date);

                                    return (
                                        <td
                                            key={`${monthData.month}-day-${dayNumber}`}
                                            className={`text-center text-[11px] border border-gray-700 
        w-8 h-6 min-w-[32px] cursor-pointer
        ${
                                                holiday
                                                    ? 'bg-yellow-900/60 text-yellow-300'
                                                    : isWeekend
                                                        ? 'bg-red-900/60 text-red-400'
                                                        : 'bg-gray-900 text-gray-400'
                                            }
        hover:bg-blue-900 transition-colors duration-100`}
                                            title={`${dayNumber} ${monthData.monthName} ${selectedYear} ${
                                                holiday ? '(Праздник)' : ''
                                            }`}
                                        ></td>
                                    );
                                })
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
                <div className="text-xs text-gray-300 flex flex-wrap items-center gap-4">
                    <div>
                        <strong>Пояснение:</strong> Таблица отображает календарь отпусков на{' '}
                        {selectedYear} год
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-900/60 border border-red-700 rounded-sm"></div>
                        <span>Выходные дни</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-900/60 border border-yellow-700 rounded-sm"></div>
                        <span>Праздничные дни</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-900 border border-gray-700 rounded-sm"></div>
                        <span>Рабочие дни</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-green-400 font-semibold">XXX</span>
                        <span>- основные дни отпуска</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-blue-400">(YYY)</span>
                        <span>- дополнительные дни</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// helper
const getMonthsWithDays = (year: number) => {
    const months = [
        { name: 'Январь', days: 31 },
        { name: 'Февраль', days: year % 4 === 0 ? 29 : 28 },
        { name: 'Март', days: 31 },
        { name: 'Апрель', days: 30 },
        { name: 'Май', days: 31 },
        { name: 'Июнь', days: 30 },
        { name: 'Июль', days: 31 },
        { name: 'Август', days: 31 },
        { name: 'Сентябрь', days: 30 },
        { name: 'Октябрь', days: 31 },
        { name: 'Ноябрь', days: 30 },
        { name: 'Декабрь', days: 31 },
    ];

    return months.map((month, index) => ({
        month: index + 1,
        monthName: month.name,
        daysInMonth: month.days,
    }));
};
