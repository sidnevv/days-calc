import { useEffect, useRef, useState } from 'react';

import { Save, Trash } from 'lucide-react';

import { useHolidaysCheck } from '@/hooks';
import { useSaveVacationRangesMutation } from '@/lib/api/vacationsApi';
import {
  EmployeeSelection,
  EmployeeWithVacation,
  SaveVacationRangesRequest,
  VacationRange,
} from '@/types';

interface EmployeeTableProps {
  employees: EmployeeWithVacation[];
  currentUserId: number;
}

export default function EmployeeTable({ employees, currentUserId }: EmployeeTableProps) {
  const { isPublicHoliday, isLoading } = useHolidaysCheck();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [popover, setPopover] = useState<{
    employeeId: number;
    date: Date;
    position: { x: number; y: number };
  } | null>(null);

  // RTK Mutation для сохранения диапазонов отпусков
  const [saveVacationRanges, { isLoading: isSaving, isError, isSuccess }] =
    useSaveVacationRangesMutation();

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

  // Новая структура для хранения выбранных диапазонов и дат
  const [selectionsByEmployee, setSelectionsByEmployee] = useState<
    Record<number, EmployeeSelection>
  >({});

  // Для отслеживания текущего редактируемого диапазона
  const [editingRangeId, setEditingRangeId] = useState<number | null>(null);

  // Генератор ID для диапазонов
  const nextRangeId = useRef(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rangesToDelete, setRangesToDelete] = useState<VacationRange[]>([]);

  useEffect(() => {
    const initialSelections: Record<number, EmployeeSelection> = {};

    employees.forEach((employee) => {
      // Ищем диапазоны для текущего выбранного года
      const yearRanges = employee.vacationRanges.find((range) => range.year === selectedYear);

      if (yearRanges && yearRanges.ranges.length > 0) {
        const ranges: VacationRange[] = [];
        const selectedDates: Date[] = [];

        yearRanges.ranges.forEach((range) => {
          const startDate = new Date(range.startDate);
          const endDate = new Date(range.endDate);
          const datesInRange = getDatesInRange(startDate, endDate);

          const vacationRange: VacationRange = {
            id: nextRangeId.current++,
            startDate,
            endDate,
            daysCount: datesInRange.length,
          };

          ranges.push(vacationRange);
          selectedDates.push(...datesInRange);
        });

        initialSelections[employee.id] = {
          ranges,
          selectedDates,
        };
      }
    });

    setSelectionsByEmployee(initialSelections);
  }, [employees, selectedYear]);

  useEffect(() => {
    // Сбрасываем выбор при изменении года
    setSelectionsByEmployee({});
    setEditingRangeId(null);
    nextRangeId.current = 1;
  }, [selectedYear]);

  // Эффект для показа уведомлений о статусе сохранения
  useEffect(() => {
    if (isSuccess) {
      // Можно добавить toast-уведомление
      console.log('Диапазоны отпусков успешно сохранены');
    }

    if (isError) {
      // Можно добавить toast-уведомление об ошибке
      console.error('Ошибка при сохранении диапазонов отпусков');
    }
  }, [isSuccess, isError]);

  const calculateAvailableDays = (employee: EmployeeWithVacation, date: Date) => {
    let available = employee.vacation.availableDays;
    let additional = employee.vacation.availableAdditionalDays;

    if (date.getFullYear() > new Date().getFullYear()) {
      available += employee.vacationDaysPerYear;
      additional += employee.positionChanges?.at(-1)?.additionalDaysPerYear ?? 0;
    }

    return { available, additional };
  };

  const getTotalSelectedDays = (employeeId: number) => {
    const selection = selectionsByEmployee[employeeId];
    if (!selection) return 0;

    return selection.selectedDates.length;
  };

  const isDateSelectable = (employee: EmployeeWithVacation, date: Date) => {
    const hireDate = new Date(employee.hireDate);
    const probationEnd = new Date(hireDate);
    probationEnd.setMonth(probationEnd.getMonth() + 6);

    const isBeforeHire = date < hireDate;
    const isProbation = date >= hireDate && date < probationEnd;

    return !isBeforeHire && !isProbation;
  };

  const handleMouseDown = (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => {
    if (employee.id !== currentUserId) return;

    if (!isDateSelectable(employee, date)) return;

    const { available, additional } = calculateAvailableDays(employee, date);
    const totalAvailable = available + additional;
    const currentSelectedDays = getTotalSelectedDays(employee.id);

    // Проверяем, есть ли доступные дни для выбора
    if (currentSelectedDays >= totalAvailable) return;

    // Проверяем, кликнули ли на уже выбранную дату (для редактирования диапазона)
    const selection = selectionsByEmployee[employee.id];
    if (selection) {
      for (const range of selection.ranges) {
        const rangeDates = getDatesInRange(range.startDate, range.endDate);
        if (rangeDates.some((d) => d.getTime() === date.getTime())) {
          // Начинаем редактирование существующего диапазона
          setEditingRangeId(range.id);
          setSelectionStart({ employeeId: employee.id, date: range.startDate });
          setSelectionEnd({ employeeId: employee.id, date: range.endDate });
          return;
        }
      }
    }

    // Начинаем новый выбор
    setEditingRangeId(null);
    setSelectionStart({ employeeId: employee.id, date });
    setSelectionEnd({ employeeId: employee.id, date });

    setPopover({
      employeeId: employee.id,
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleMouseEnter = (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => {
    if (employee.id !== currentUserId) return;
    if (!selectionStart || selectionStart.employeeId !== employee.id) return;
    if (!isDateSelectable(employee, date)) return;

    const { available, additional } = calculateAvailableDays(employee, date);
    const totalAvailable = available + additional;
    const currentSelectedDays = getTotalSelectedDays(employee.id);

    const start = selectionStart.date;
    const end = date;

    // Получаем даты в предполагаемом диапазоне
    const rangeDates = getDatesInRange(start, end);

    // Проверяем, не превышает ли новый диапазон доступные дни
    // (учитываем уже выбранные дни из других диапазонов)
    const existingDates = selectionsByEmployee[employee.id]?.selectedDates || [];
    const newDates = rangeDates.filter(
      (d) => !existingDates.some((ed) => ed.getTime() === d.getTime()),
    );

    if (currentSelectedDays + newDates.length > totalAvailable) return;

    setSelectionEnd({ employeeId: employee.id, date });
    setPopover({
      employeeId: employee.id,
      date,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleMouseUp = () => {
    if (!selectionStart || !selectionEnd) return;

    const employeeId = selectionStart.employeeId;
    const start = selectionStart.date;
    const end = selectionEnd.date;

    // Получаем все даты в выбранном диапазоне
    const rangeDates = getDatesInRange(start, end);

    // Обновляем состояние выбранных дат
    setSelectionsByEmployee((prev) => {
      const currentSelection = prev[employeeId] || { ranges: [], selectedDates: [] };

      let updatedRanges = [...currentSelection.ranges];
      let updatedDates = [...currentSelection.selectedDates];

      if (editingRangeId !== null) {
        // Редактируем существующий диапазон
        const rangeIndex = updatedRanges.findIndex((r) => r.id === editingRangeId);
        if (rangeIndex !== -1) {
          // Удаляем даты старого диапазона
          const oldRange = updatedRanges[rangeIndex];
          const oldRangeDates = getDatesInRange(oldRange.startDate, oldRange.endDate);
          updatedDates = updatedDates.filter(
            (d) => !oldRangeDates.some((od) => od.getTime() === d.getTime()),
          );

          // Добавляем новые даты
          updatedDates = [...updatedDates, ...rangeDates];

          // Обновляем диапазон
          updatedRanges[rangeIndex] = {
            ...oldRange,
            startDate: start,
            endDate: end,
            daysCount: rangeDates.length,
          };
        }
      } else {
        // Добавляем новый диапазон
        const newRange: VacationRange = {
          id: nextRangeId.current++,
          startDate: start,
          endDate: end,
          daysCount: rangeDates.length,
        };

        updatedRanges = [...updatedRanges, newRange];
        updatedDates = [...updatedDates, ...rangeDates];
      }

      return {
        ...prev,
        [employeeId]: {
          ranges: updatedRanges,
          selectedDates: updatedDates,
        },
      };
    });

    setSelectionStart(null);
    setSelectionEnd(null);
    setEditingRangeId(null);
  };

  // Функция для отправки диапазонов на сервер
  const saveRangesToServer = async (employeeId: number) => {
    const selection = selectionsByEmployee[employeeId];
    if (!selection || selection.ranges.length === 0) {
      console.log('Нет диапазонов для сохранения');
      return;
    }

    try {
      const request: SaveVacationRangesRequest = {
        id: employeeId,
        year: selectedYear,
        status: 'draft',
        ranges: selection.ranges.map((range) => ({
          startDate: range.startDate.toISOString().split('T')[0],
          endDate: range.endDate.toISOString().split('T')[0],
        })),
      };

      await saveVacationRanges(request).unwrap();
      console.log(`Диапазоны для сотрудника ${employeeId} успешно сохранены`);

      setSelectionsByEmployee((prev) => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          // Можно обновить статус или другие поля при необходимости
        },
      }));
    } catch (error) {
      console.error('Ошибка при сохранении диапазонов:', error);
    }
  };

  // TODO: Сделать утверждение всех отпусков. Функция для отправки всех диапазонов
  // const saveAllRanges = async () => {
  //   for (const employeeId of Object.keys(selectionsByEmployee)) {
  //     await saveRangesToServer(Number(employeeId));
  //   }
  // };

  // Функция для получения всех дат в диапазоне
  const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates = [];
    let currentDate = new Date(startDate);
    let lastDate = new Date(endDate);

    // Убедимся, что даты в правильном порядке
    if (currentDate > lastDate) {
      [currentDate, lastDate] = [lastDate, currentDate];
    }

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Функция для открытия модального окна
  const openDeleteModal = () => {
    const currentUserRanges = selectionsByEmployee[currentUserId]?.ranges || [];
    setRangesToDelete(currentUserRanges);
    setDeleteModalOpen(true);
  };

  const deleteSelectedRanges = (rangeIds: number[]) => {
    setSelectionsByEmployee((prev) => {
      const currentSelection = prev[currentUserId];
      if (!currentSelection) return prev;

      // Находим диапазоны для удаления
      const rangesToRemove = currentSelection.ranges.filter((r) => rangeIds.includes(r.id));

      // Удаляем даты этих диапазонов
      let updatedDates = [...currentSelection.selectedDates];
      rangesToRemove.forEach((range) => {
        const rangeDates = getDatesInRange(range.startDate, range.endDate);
        updatedDates = updatedDates.filter(
          (d) => !rangeDates.some((rd) => rd.getTime() === d.getTime()),
        );
      });

      // Удаляем диапазоны
      const updatedRanges = currentSelection.ranges.filter((r) => !rangeIds.includes(r.id));

      return {
        ...prev,
        [currentUserId]: {
          ranges: updatedRanges,
          selectedDates: updatedDates,
        },
      };
    });

    setDeleteModalOpen(false);
  };

  const DeleteRangesModal = () => {
    if (!deleteModalOpen) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm
             transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0">
        <div
          className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-4
               transform transition-all duration-300 scale-95 data-[state=open]:scale-100">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center">
            Удаление диапазонов
          </h3>

          {rangesToDelete.length === 0 ? (
            <p className="text-gray-400 text-sm mb-6">Нет выбранных диапазонов для удаления</p>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-4">Выберите диапазоны для удаления:</p>
              <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-1">
                {rangesToDelete.map((range) => (
                  <label
                    key={range.id}
                    htmlFor={`range-${range.id}`}
                    className="flex items-center justify-between px-3 py-2
                         bg-gray-700/50 hover:bg-gray-700 rounded-lg cursor-pointer
                         transition-colors">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`range-${range.id}`}
                        defaultChecked
                        className="accent-red-500 w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-200">
                        {range.startDate.toLocaleDateString('ru-RU')} –{' '}
                        {range.endDate.toLocaleDateString('ru-RU')}
                        <span className="text-gray-500 ml-2">({range.daysCount} дней)</span>
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg
                   hover:bg-gray-600 transition-colors">
              Отмена
            </button>
            {rangesToDelete.length > 0 && (
              <button
                onClick={() => {
                  const checkboxes = document.querySelectorAll<HTMLInputElement>(
                    'input[type="checkbox"]:checked',
                  );
                  const selectedRangeIds = Array.from(checkboxes).map((cb) =>
                    parseInt(cb.id.replace('range-', '')),
                  );
                  deleteSelectedRanges(selectedRangeIds);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
                     hover:bg-red-500 shadow-md transition-colors">
                Удалить выбранные
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
               focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              className="border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-100 bg-gray-700">
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
              className="border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-100 bg-gray-700">
              {yearMonths.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.monthName}
                </option>
              ))}
            </select>
          </div>
          <button
            className="cursor-pointer border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-100 bg-gray-700 hover:bg-green-600"
            title="Сохранить"
            onClick={() => saveRangesToServer(currentUserId)}>
            <Save color="#ffffff" size={18} />
          </button>
          <button
            className="cursor-pointer border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-100 bg-gray-700 hover:bg-rose-600"
            title="Очистить выбранные диапозоны"
            onClick={openDeleteModal}>
            <Trash color="#ffffff" size={18} />
          </button>
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
                rowSpan={2}>
                Сотрудник
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase border-r border-gray-700"
                rowSpan={2}>
                Доступно
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase border-r border-gray-700"
                rowSpan={2}>
                Выбрано
              </th>
              {visibleMonths.map((monthData) => (
                <th
                  key={monthData.month}
                  colSpan={monthData.daysInMonth}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-300 uppercase border-l border-gray-700 bg-gray-800">
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
                        }`}>
                      {dayNumber}
                    </th>
                  );
                }),
              )}
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => {
              const isCurrentUser = employee.id === currentUserId;
              const selection = selectionsByEmployee[employee.id];
              const selectedDates = selection?.selectedDates || [];
              const { available, additional } = calculateAvailableDays(
                employee,
                new Date(selectedYear, 0, 1),
              );
              const totalAvailable = available + additional;

              return (
                <tr key={employee.id} className="hover:bg-gray-800 transition-colors duration-150">
                  <td className="sticky left-0 z-10 px-3 py-2 whitespace-nowrap text-xs uppercase font-normal text-gray-100 bg-gray-900 border-r border-gray-700">
                    {employee.name}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-normal border-r border-gray-700">
                    <span className="text-green-400 font-semibold">{available.toFixed(1)}</span>
                    <span className="text-blue-400"> ({additional.toFixed(1)})</span>
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-normal border-r border-gray-700">
                    <div className="flex flex-col items-center">
                      <span
                        className={`font-semibold ${selectedDates.length > totalAvailable ? 'text-red-400' : 'text-yellow-300'}`}>
                        {selectedDates.length}
                      </span>
                    </div>
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

                      const isSelected = selectedDates.some((d) => d.getTime() === date.getTime());

                      // Проверяем, является ли дата частью текущего редактируемого диапазона
                      const isInCurrentSelection =
                        selectionStart &&
                        selectionEnd &&
                        selectionStart.employeeId === employee.id &&
                        date >=
                          new Date(
                            Math.min(selectionStart.date.getTime(), selectionEnd.date.getTime()),
                          ) &&
                        date <=
                          new Date(
                            Math.max(selectionStart.date.getTime(), selectionEnd.date.getTime()),
                          );

                      const isInSavedRange = employee.vacationRanges.some((vacationRange) => {
                        if (vacationRange.year !== selectedYear) return false;

                        return vacationRange.ranges.some((range) => {
                          const rangeStart = new Date(range.startDate);
                          const rangeEnd = new Date(range.endDate);
                          return date >= rangeStart && date <= rangeEnd;
                        });
                      });

                      const cellClassName = `
  text-center text-[11px] border border-gray-700 
  w-8 h-6 min-w-[32px]
  ${
    !isCurrentUser
      ? 'cursor-not-allowed bg-gray-800/50 text-gray-500'
      : isSelected
        ? 'bg-green-500/70 text-white'
        : isInCurrentSelection
          ? 'bg-green-300/50 text-white'
          : isInSavedRange // Добавляем проверку на сохраненные диапазоны
            ? 'bg-blue-500/60 text-white' // Другой цвет для сохраненных диапазонов
            : isBeforeHire || isProbation
              ? 'bg-gray-600/40 text-gray-500 cursor-not-allowed'
              : holiday
                ? 'bg-yellow-900/60 text-yellow-300'
                : isWeekend
                  ? 'bg-red-900/60 text-red-400'
                  : 'bg-gray-900 text-gray-400 hover:bg-blue-900'
  }
  transition-colors duration-100
`;

                      return (
                        <td
                          key={`${monthData.month}-day-${dayNumber}`}
                          className={cellClassName}
                          title={
                            !isCurrentUser
                              ? 'Можно редактировать только свои диапазоны'
                              : `${dayNumber} ${monthData.monthName} ${selectedYear} ${
                                  isBeforeHire
                                    ? '(До приёма на работу)'
                                    : isProbation
                                      ? '(Испытательный срок)'
                                      : holiday
                                        ? '(Праздник)'
                                        : ''
                                }`
                          }
                          onMouseDown={(e) => handleMouseDown(employee, date, e)}
                          onMouseEnter={(e) => handleMouseEnter(employee, date, e)}
                          onMouseUp={handleMouseUp}
                        />
                      );
                    }),
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {popover && (
          <div
            className="absolute z-50 bg-gray-800 text-gray-200 text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-600"
            style={{
              top: popover.position.y + 10,
              left: popover.position.x + 10,
            }}
            onClick={() => setPopover(null)}>
            {(() => {
              const employee = employees.find((e) => e.id === popover.employeeId);
              if (!employee) return null;

              const { available, additional } = calculateAvailableDays(employee, popover.date);
              const selection = selectionsByEmployee[employee.id];
              const totalAvailable = available + additional;
              const selectedCount = getTotalSelectedDays(employee.id);
              const remaining = totalAvailable - selectedCount;

              return (
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">{popover.date.toLocaleDateString('ru-RU')}</div>
                  <div>
                    <span className="text-green-400">{available.toFixed(1)}</span> осн. +
                    <span className="text-blue-400"> {additional.toFixed(1)}</span> доп.
                  </div>
                  <div>
                    <span className="text-yellow-300">{selectedCount}</span> выбрано из{' '}
                    {totalAvailable.toFixed(0)}
                  </div>
                  <div>
                    <span className="text-gray-400">Осталось: {remaining.toFixed(0)}</span>
                  </div>
                  {selection && selection.ranges.length > 0 && (
                    <div className="mt-1 text-[10px] text-gray-400 text-left">
                      {selection.ranges.map((range) => (
                        <div key={range.id} className="flex items-center justify-between">
                          <span>
                            {range.startDate.toLocaleDateString('ru-RU')} -{' '}
                            {range.endDate.toLocaleDateString('ru-RU')}
                          </span>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">({range.daysCount})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
            <div className="w-4 h-4 bg-green-500/70 border border-green-700 rounded-sm"></div>
            <span>Выбранные дни отпуска</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500/60 border border-blue-700 rounded-sm"></div>
            <span>Сохраненные диапазоны отпусков</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-300/50 border border-green-500 rounded-sm"></div>
            <span>Текущий выбираемый диапазон</span>
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

      <DeleteRangesModal />
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
