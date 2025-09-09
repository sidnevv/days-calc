import { EmployeeWithVacation } from '@/types';
import React, { useState } from 'react';
import { useHolidaysCheck } from '@/hooks';

interface EmployeeTableProps {
  employees: EmployeeWithVacation[];
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const { isPublicHoliday, isLoading } = useHolidaysCheck();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [popover, setPopover] = useState<{
    employeeId: number;
    date: Date;
    position: { x: number; y: number };
  } | null>(null);

  // диапазон месяцев
  const [startMonth, setStartMonth] = useState(1); // Январь
  const [endMonth, setEndMonth] = useState(12); // Декабрь

  const currentDate = new Date();
  const years = Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() + i);
  const yearMonths = getMonthsWithDays(selectedYear);

  // только месяцы в диапазоне
  const visibleMonths = yearMonths.filter((m) => m.month >= startMonth && m.month <= endMonth);

  const [selectionStart, setSelectionStart] = useState<{ employeeId: number; date: Date } | null>(
    null,
  );
  const [selectionEnd, setSelectionEnd] = useState<{ employeeId: number; date: Date } | null>(null);
  const [selectedDatesByEmployee, setSelectedDatesByEmployee] = useState<Record<number, Date[]>>(
    {},
  );

  console.log(selectionStart, selectionEnd, selectedDatesByEmployee);
  const calculateAvailableDays = (employee: EmployeeWithVacation, date: Date) => {
    let available = employee.vacation.availableDays;
    let additional = employee.vacation.availableAdditionalDays;

    if (date.getFullYear() > new Date().getFullYear()) {
      available += employee.vacationDaysPerYear;
      additional += employee.positionChanges?.at(-1)?.additionalDaysPerYear ?? 0;
    }

    return { available, additional };
  };

  const handleMouseDown = (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => {
    const { available, additional } = calculateAvailableDays(employee, date);
    const currentSelected = selectedDatesByEmployee[employee.id] || [];

    if (currentSelected.length < available + additional) {
      setSelectionStart({ employeeId: employee.id, date });
      setSelectionEnd({ employeeId: employee.id, date });
      setSelectedDatesByEmployee((prev) => ({
        ...prev,
        [employee.id]: [date],
      }));
      setPopover({
        employeeId: employee.id,
        date,
        position: { x: e.clientX, y: e.clientY },
      });
    }
  };

  const handleMouseEnter = (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => {
    if (!selectionStart || selectionStart.employeeId !== employee.id) return;

    const { available, additional } = calculateAvailableDays(employee, date);

    const start = selectionStart.date;
    const end = date;
    const range: Date[] = [];

    const dayCount = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (dayCount > available + additional) return;

    const increment = start < end ? 1 : -1;
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i * increment);
      range.push(d);
    }

    setSelectionEnd({ employeeId: employee.id, date });
    setSelectedDatesByEmployee((prev) => ({
      ...prev,
      [employee.id]: range,
    }));

    setPopover({
      employeeId: employee.id,
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleMouseUp = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setPopover(null); // закрываем поповер
  };

  const handleCellClick = (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => {
    let available = employee.vacation.availableDays;
    let additional = employee.vacation.availableAdditionalDays;

    if (date.getFullYear() > new Date().getFullYear()) {
      available += employee.vacationDaysPerYear;
      additional += employee.positionChanges?.at(-1)?.additionalDaysPerYear ?? 0;
    }

    setPopover({
      employeeId: employee.id,
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  if (employees.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-400">Нет сотрудников</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-900 rounded-xl shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center rounded-t-xl">
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

          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-300 font-light">Месяцы:</label>
            <select
              value={startMonth}
              onChange={(e) => {
                const newStart = Number(e.target.value);
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

        <div className="flex flex-col items-end text-xs space-y-1">
          <span className="text-gray-300 font-light">
            Расчет на: {currentDate.toLocaleDateString('ru-RU')}
          </span>
          <span className="text-blue-400 font-medium">График отпусков на {selectedYear} год</span>
        </div>
      </div>

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
                  const date = new Date(selectedYear, monthData.month - 1, dayNumber);
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
                }),
              )}
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-800 transition-colors duration-150">
                <td className="sticky left-0 z-10 px-3 py-2 whitespace-nowrap text-xs uppercase font-normal text-gray-100 bg-gray-900 border-r border-gray-700">
                  {employee.name}
                </td>
                <td className="px-2 py-2 text-center text-xs font-normal border-r border-gray-700">
                  <span className="text-green-400 font-semibold">
                    {employee.vacation.availableDays.toFixed(1)}
                  </span>
                  <span className="text-blue-400">
                    {' '}
                    ({employee.vacation.availableAdditionalDays.toFixed(1)})
                  </span>
                </td>

                {visibleMonths.map((monthData) =>
                  Array.from({ length: monthData.daysInMonth }, (_, dayIndex) => {
                    const dayNumber = dayIndex + 1;
                    const date = new Date(selectedYear, monthData.month - 1, dayNumber);

                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const holiday = isPublicHoliday(date);

                    const hireDate = new Date(employee.hireDate);
                    const probationEnd = new Date(hireDate);
                    probationEnd.setMonth(probationEnd.getMonth() + 6);

                    const isBeforeHire = date < hireDate;
                    const isProbation = date >= hireDate && date < probationEnd;

                    return (
                      <td
                        key={`${monthData.month}-day-${dayNumber}`}
                        className={`text-center text-[11px] border border-gray-700 
                                                        w-8 h-6 min-w-[32px]
                                                        ${
                                                          (
                                                            selectedDatesByEmployee[employee.id] ||
                                                            []
                                                          ).some(
                                                            (d) => d.getTime() === date.getTime(),
                                                          )
                                                            ? 'bg-green-200/50 text-white'
                                                            : isBeforeHire || isProbation
                                                              ? 'bg-gray-600/40 text-gray-500 cursor-not-allowed'
                                                              : holiday
                                                                ? 'bg-yellow-900/60 text-yellow-300'
                                                                : isWeekend
                                                                  ? 'bg-red-900/60 text-red-400'
                                                                  : 'bg-gray-900 text-gray-400 hover:bg-blue-900'
                                                        }
                                                        transition-colors duration-100`}
                        title={`${dayNumber} ${monthData.monthName} ${selectedYear} ${
                          isBeforeHire
                            ? '(До приёма на работу)'
                            : isProbation
                              ? '(Испытательный срок)'
                              : holiday
                                ? '(Праздник)'
                                : ''
                        }`}
                        onMouseDown={(e) => handleMouseDown(employee, date, e)}
                        onMouseEnter={(e) => handleMouseEnter(employee, date, e)}
                        onMouseUp={handleMouseUp}
                        onClick={(e) => {
                          if (!isBeforeHire && !isProbation) {
                            handleCellClick(employee, date, e);
                          }
                        }}
                      />
                    );
                  }),
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {popover && (
          <div
            className="absolute z-50 bg-gray-800 text-gray-200 text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-600"
            style={{
              top: popover.position.y + 10,
              left: popover.position.x + 10,
            }}
            onClick={() => setPopover(null)}
          >
            {(() => {
              const employee = employees.find((e) => e.id === popover.employeeId);
              if (!employee) return null;

              const { available, additional } = calculateAvailableDays(employee, popover.date);
              const selectedCount = (selectedDatesByEmployee[employee.id] || []).length;

              return (
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">{popover.date.toLocaleDateString('ru-RU')}</div>
                  <div>
                    <span className="text-green-400">{available.toFixed(1)}</span> осн. +
                    <span className="text-blue-400"> {additional.toFixed(1)}</span> доп.
                  </div>
                  <div>
                    <span className="text-yellow-300">{selectedCount}</span> выбранных{' '}
                    {selectedCount === 1 ? 'день' : 'дня/дней'}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
        <div className="text-xs text-gray-300 flex flex-wrap items-center gap-4">
          <div>
            <strong>Пояснение:</strong> Таблица отображает календарь отпусков на {selectedYear} год
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
            <div className="w-4 h-4 bg-gray-600/40 border border-gray-700 rounded-sm"></div>
            <span>Заблокировано для выбора (отработал &lt; 6 мес.)</span>
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
