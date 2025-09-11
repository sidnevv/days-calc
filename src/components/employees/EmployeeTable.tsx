import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Save, Trash } from 'lucide-react';

import { useHolidaysCheck } from '@/hooks';
import { useToaster } from '@/hooks/useToaster';
import { useGetEmployeesQuery } from '@/lib/api/employeeApi';
import {
  useDeleteVacationRangesMutation,
  useSaveVacationRangesMutation,
} from '@/lib/api/vacationsApi';
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

// Вспомогательная функция для получения месяцев с днями
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

// Мемоизированный компонент для ячейки календаря
interface CalendarCellProps {
  employee: EmployeeWithVacation;
  date: Date;
  monthData: { month: number; monthName: string; daysInMonth: number };
  dayNumber: number;
  isSelected: boolean;
  isInCurrentSelection: boolean;
  isInSavedRange: boolean;
  isInServerRange: boolean;
  isCurrentUser: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  onMouseUp: () => void;
}

const CalendarCell = memo(
  ({
    employee,
    date,
    monthData,
    dayNumber,
    isSelected,
    isInCurrentSelection,
    isInSavedRange,
    isInServerRange,
    isCurrentUser,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
  }: CalendarCellProps) => {
    const { isPublicHoliday } = useHolidaysCheck();

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const holiday = isPublicHoliday(date);

    const hireDate = useMemo(() => new Date(employee.hireDate), [employee.hireDate]);
    const probationEnd = useMemo(() => {
      const end = new Date(hireDate);
      end.setMonth(end.getMonth() + 6);
      return end;
    }, [hireDate]);

    const isBeforeHire = date < hireDate;
    const isProbation = date >= hireDate && date < probationEnd;

    const cellClassName = useMemo(
      () => `
    text-center text-[11px] border border-gray-700 
    w-8 h-6 min-w-[32px]
    ${
      !isCurrentUser
        ? 'cursor-not-allowed bg-gray-800/50 text-gray-500'
        : isInServerRange
          ? 'cursor-not-allowed bg-purple-600/40 text-gray-300'
          : isSelected
            ? 'bg-green-500/70 text-white'
            : isInCurrentSelection
              ? 'bg-green-300/50 text-white'
              : isInSavedRange
                ? 'bg-blue-500/60 text-white'
                : isBeforeHire || isProbation
                  ? 'bg-gray-600/40 text-gray-500 cursor-not-allowed'
                  : holiday
                    ? 'bg-yellow-900/60 text-yellow-300'
                    : isWeekend
                      ? 'bg-red-900/60 text-red-400'
                      : 'bg-gray-900 text-gray-400 hover:bg-blue-900'
    }
    transition-colors duration-100
  `,
      [
        isCurrentUser,
        isInServerRange,
        isSelected,
        isInCurrentSelection,
        isInSavedRange,
        isBeforeHire,
        isProbation,
        holiday,
        isWeekend,
      ],
    );

    const title = useMemo(
      () =>
        !isCurrentUser
          ? 'Можно редактировать только свои диапазоны'
          : isInServerRange
            ? 'Уже сохраненный диапазон (нельзя изменить)'
            : `${dayNumber} ${monthData.monthName} ${date.getFullYear()} ${
                isBeforeHire
                  ? '(До приёма на работу)'
                  : isProbation
                    ? '(Испытательный срок)'
                    : holiday
                      ? '(Праздник)'
                      : ''
              }`,
      [
        isCurrentUser,
        isInServerRange,
        dayNumber,
        monthData.monthName,
        date,
        isBeforeHire,
        isProbation,
        holiday,
      ],
    );

    return (
      <td
        className={cellClassName}
        title={title}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
      />
    );
  },
);

CalendarCell.displayName = 'CalendarCell';

// Мемоизированный компонент для строки сотрудника
interface EmployeeRowProps {
  employee: EmployeeWithVacation;
  isCurrentUser: boolean;
  selectedYear: number;
  visibleMonths: ReturnType<typeof getMonthsWithDays>;
  selectionsByEmployee: Record<number, EmployeeSelection>;
  selectionStart: { employeeId: number; date: Date } | null;
  selectionEnd: { employeeId: number; date: Date } | null;
  handleMouseDown: (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => void;
  handleMouseEnter: (
    employee: EmployeeWithVacation,
    date: Date,
    e: React.MouseEvent<HTMLTableCellElement>,
  ) => void;
  handleMouseUp: () => void;
  calculateAvailableDays: (
    employee: EmployeeWithVacation,
    date: Date,
  ) => { available: number; additional: number };
}

const EmployeeRow = memo(
  ({
    employee,
    isCurrentUser,
    selectedYear,
    visibleMonths,
    selectionsByEmployee,
    selectionStart,
    selectionEnd,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    calculateAvailableDays,
  }: EmployeeRowProps) => {
    const selection = selectionsByEmployee[employee.id];
    const selectedDates = selection?.selectedDates || [];

    const { available, additional } = useMemo(
      () => calculateAvailableDays(employee, new Date(selectedYear, 0, 1)),
      [employee, selectedYear, calculateAvailableDays],
    );

    const totalAvailable = available + additional;

    // Получаем серверные диапазоны (изначально сохраненные)
    const serverRanges = useMemo(() => {
      const yearRanges = employee.vacationRanges.find((range) => range.year === selectedYear);
      return yearRanges?.ranges || [];
    }, [employee.vacationRanges, selectedYear]);

    return (
      <tr className="hover:bg-gray-800 transition-colors duration-150">
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

            const isSelected = selectedDates.some((d) => d.getTime() === date.getTime());

            const isInCurrentSelection =
              selectionStart &&
              selectionEnd &&
              selectionStart.employeeId === employee.id &&
              date >=
                new Date(Math.min(selectionStart.date.getTime(), selectionEnd.date.getTime())) &&
              date <=
                new Date(Math.max(selectionStart.date.getTime(), selectionEnd.date.getTime()));

            const isInSavedRange = selection?.ranges.some((range) => {
              const rangeStart = new Date(range.startDate);
              const rangeEnd = new Date(range.endDate);
              return date >= rangeStart && date <= rangeEnd;
            });

            const isInServerRange = serverRanges.some((range) => {
              const rangeStart = new Date(range.startDate);
              const rangeEnd = new Date(range.endDate);
              return date >= rangeStart && date <= rangeEnd;
            });

            return (
              <CalendarCell
                key={`${monthData.month}-day-${dayNumber}`}
                employee={employee}
                date={date}
                monthData={monthData}
                dayNumber={dayNumber}
                isSelected={isSelected}
                isInCurrentSelection={!!isInCurrentSelection}
                isInSavedRange={isInSavedRange}
                isInServerRange={isInServerRange}
                isCurrentUser={isCurrentUser}
                onMouseDown={(e) => handleMouseDown(employee, date, e)}
                onMouseEnter={(e) => handleMouseEnter(employee, date, e)}
                onMouseUp={handleMouseUp}
              />
            );
          }),
        )}
      </tr>
    );
  },
);

EmployeeRow.displayName = 'EmployeeRow';

// Интерфейс для серверного диапазона
interface ServerRange {
  startDate: string;
  endDate: string;
}

// Интерфейс для серверного vacationRange
interface ServerVacationRange {
  id: number;
  employeeId: number;
  year: number;
  status: string;
  ranges: ServerRange[];
  duration: number;
}

// Мемоизированный компонент модального окна удаления
interface DeleteRangesModalProps {
  deleteModalOpen: boolean;
  rangesToDelete: VacationRange[];
  serverRanges: ServerRange[];
  onClose: () => void;
  onDelete: (rangeIds: number[], isServerRange: boolean, ranges?: ServerRange[]) => void;
}

const DeleteRangesModal = memo(
  ({
    deleteModalOpen,
    rangesToDelete,
    serverRanges,
    onClose,
    onDelete,
  }: DeleteRangesModalProps) => {
    if (!deleteModalOpen) return null;

    const handleDelete = () => {
      const serverCheckboxes = document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"][id^="server-range-"]:checked',
      );
      const localCheckboxes = document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"][id^="local-range-"]:checked',
      );

      // Для серверных диапазонов используем индексы, так как у них нет ID на клиенте
      const selectedServerRanges = Array.from(serverCheckboxes).map((cb) => {
        const index = parseInt(cb.id.replace('server-range-', ''));
        return index;
      });

      const selectedLocalRangeIds = Array.from(localCheckboxes).map((cb) =>
        parseInt(cb.id.replace('local-range-', '')),
      );

      // Получаем выбранные серверные диапазоны по индексам
      const selectedServerRangeObjects = selectedServerRanges.map((index) => serverRanges[index]);

      // Вызываем обработчики для каждого типа
      if (selectedServerRanges.length > 0) {
        onDelete(selectedServerRanges, true, selectedServerRangeObjects);
      }
      if (selectedLocalRangeIds.length > 0) {
        onDelete(selectedLocalRangeIds, false);
      }
    };

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

          {serverRanges.length === 0 && rangesToDelete.length === 0 ? (
            <p className="text-gray-400 text-sm mb-6">Нет диапазонов для удаления</p>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-4">Выберите диапазоны для удаления:</p>
              <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-1">
                {/* Серверные диапазоны */}
                {serverRanges.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      Сохраненные диапазоны:
                    </p>
                    {serverRanges.map((range, index) => {
                      const startDate = new Date(range.startDate);
                      const endDate = new Date(range.endDate);
                      const daysCount =
                        Math.ceil(
                          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
                        ) + 1;

                      return (
                        <label
                          key={`server-${index}`}
                          htmlFor={`server-range-${index}`}
                          className="flex items-center justify-between px-3 py-2
                             bg-purple-700/30 hover:bg-purple-700/50 rounded-lg cursor-pointer
                             transition-colors border-l-2 border-purple-500">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`server-range-${index}`}
                              className="accent-red-500 w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-200">
                              {startDate.toLocaleDateString('ru-RU')} –{' '}
                              {endDate.toLocaleDateString('ru-RU')}
                              <span className="text-gray-500 ml-2">({daysCount} дней)</span>
                              <span className="text-purple-400 text-xs ml-2">(сохранено)</span>
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Локальные диапазоны */}
                {rangesToDelete.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Новые диапазоны:</p>
                    {rangesToDelete.map((range) => (
                      <label
                        key={range.id}
                        htmlFor={`local-range-${range.id}`}
                        className="flex items-center justify-between px-3 py-2
                           bg-gray-700/50 hover:bg-gray-700 rounded-lg cursor-pointer
                           transition-colors">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`local-range-${range.id}`}
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
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg
                 hover:bg-gray-600 transition-colors">
              Отмена
            </button>
            {(serverRanges.length > 0 || rangesToDelete.length > 0) && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
                   hover:bg-red-500 shadow-md transition-colors">
                Удалить выбранные
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

DeleteRangesModal.displayName = 'DeleteRangesModal';

export default function EmployeeTable({ employees, currentUserId }: EmployeeTableProps) {
  const toast = useToaster();
  const { isPublicHoliday, isLoading } = useHolidaysCheck();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [popover, setPopover] = useState<{
    employeeId: number;
    date: Date;
    position: { x: number; y: number };
  } | null>(null);

  const { refetch: refetchEmployees } = useGetEmployeesQuery();

  const [saveVacationRanges, { isLoading: isSaving, isError, isSuccess }] =
    useSaveVacationRangesMutation();

  const [deleteVacationRanges] = useDeleteVacationRangesMutation();

  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);

  const currentDate = useMemo(() => new Date(), []);

  const years = useMemo(
    () => Array.from({ length: 3 }, (_, i) => currentDate.getFullYear() + i),
    [currentDate],
  );

  const yearMonths = useMemo(() => getMonthsWithDays(selectedYear), [selectedYear]);

  const visibleMonths = useMemo(
    () => yearMonths.filter((m) => m.month >= startMonth && m.month <= endMonth),
    [yearMonths, startMonth, endMonth],
  );

  const [selectionStart, setSelectionStart] = useState<{ employeeId: number; date: Date } | null>(
    null,
  );
  const [selectionEnd, setSelectionEnd] = useState<{ employeeId: number; date: Date } | null>(null);

  const [selectionsByEmployee, setSelectionsByEmployee] = useState<
    Record<number, EmployeeSelection>
  >({});

  const [editingRangeId, setEditingRangeId] = useState<number | null>(null);
  const nextRangeId = useRef(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rangesToDelete, setRangesToDelete] = useState<VacationRange[]>([]);

  // Получаем серверные диапазоны для текущего пользователя
  const serverRanges = useMemo(() => {
    const currentEmployee = employees.find((e) => e.id === currentUserId);
    if (!currentEmployee) return [];

    const yearRanges = currentEmployee.vacationRanges.find((range) => range.year === selectedYear);
    return yearRanges?.ranges || [];
  }, [employees, currentUserId, selectedYear]);

  // Мемоизированные функции
  const getDatesInRange = useCallback((startDate: Date, endDate: Date): Date[] => {
    const dates = [];
    let currentDate = new Date(startDate);
    let lastDate = new Date(endDate);

    if (currentDate > lastDate) {
      [currentDate, lastDate] = [lastDate, currentDate];
    }

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, []);

  const calculateAvailableDays = useCallback((employee: EmployeeWithVacation, date: Date) => {
    let available = employee.vacation.availableDays;
    let additional = employee.vacation.availableAdditionalDays;

    if (date.getFullYear() > new Date().getFullYear()) {
      available += employee.vacationDaysPerYear;
      additional += employee.positionChanges?.at(-1)?.additionalDaysPerYear ?? 0;
    }

    return { available, additional };
  }, []);

  const getTotalSelectedDays = useCallback(
    (employeeId: number) => {
      const selection = selectionsByEmployee[employeeId];
      if (!selection) return 0;
      return selection.selectedDates.length;
    },
    [selectionsByEmployee],
  );

  const isDateSelectable = useCallback(
    (employee: EmployeeWithVacation, date: Date) => {
      const hireDate = new Date(employee.hireDate);
      const probationEnd = new Date(hireDate);
      probationEnd.setMonth(probationEnd.getMonth() + 6);

      const isBeforeHire = date < hireDate;
      const isProbation = date >= hireDate && date < probationEnd;

      // Проверяем, не находится ли дата в серверном диапазоне
      const isInServerRange = serverRanges.some((range) => {
        const rangeStart = new Date(range.startDate);
        const rangeEnd = new Date(range.endDate);
        return date >= rangeStart && date <= rangeEnd;
      });

      return !isBeforeHire && !isProbation && !isInServerRange;
    },
    [serverRanges],
  );

  // Мемоизированные обработчики событий
  const handleMouseDown = useCallback(
    (employee: EmployeeWithVacation, date: Date, e: React.MouseEvent<HTMLTableCellElement>) => {
      if (employee.id !== currentUserId) return;
      if (!isDateSelectable(employee, date)) return;

      const { available, additional } = calculateAvailableDays(employee, date);
      const totalAvailable = available + additional;
      const currentSelectedDays = getTotalSelectedDays(employee.id);

      if (currentSelectedDays >= totalAvailable) return;

      const selection = selectionsByEmployee[employee.id];
      if (selection) {
        for (const range of selection.ranges) {
          const rangeDates = getDatesInRange(range.startDate, range.endDate);
          if (rangeDates.some((d) => d.getTime() === date.getTime())) {
            setEditingRangeId(range.id);
            setSelectionStart({ employeeId: employee.id, date: range.startDate });
            setSelectionEnd({ employeeId: employee.id, date: range.endDate });
            return;
          }
        }
      }

      setEditingRangeId(null);
      setSelectionStart({ employeeId: employee.id, date });
      setSelectionEnd({ employeeId: employee.id, date });

      setPopover({
        employeeId: employee.id,
        date,
        position: { x: e.clientX, y: e.clientY },
      });
    },
    [
      currentUserId,
      isDateSelectable,
      calculateAvailableDays,
      getTotalSelectedDays,
      selectionsByEmployee,
      getDatesInRange,
    ],
  );

  const handleMouseEnter = useCallback(
    (employee: EmployeeWithVacation, date: Date, e: React.MouseEvent<HTMLTableCellElement>) => {
      if (employee.id !== currentUserId) return;
      if (!selectionStart || selectionStart.employeeId !== employee.id) return;
      if (!isDateSelectable(employee, date)) return;

      const { available, additional } = calculateAvailableDays(employee, date);
      const totalAvailable = available + additional;
      const currentSelectedDays = getTotalSelectedDays(employee.id);

      const start = selectionStart.date;
      const end = date;

      const rangeDates = getDatesInRange(start, end);
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
    },
    [
      currentUserId,
      selectionStart,
      isDateSelectable,
      calculateAvailableDays,
      getTotalSelectedDays,
      getDatesInRange,
      selectionsByEmployee,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (!selectionStart || !selectionEnd) return;

    const employeeId = selectionStart.employeeId;
    const start = selectionStart.date;
    const end = selectionEnd.date;

    const rangeDates = getDatesInRange(start, end);

    setSelectionsByEmployee((prev) => {
      const currentSelection = prev[employeeId] || { ranges: [], selectedDates: [] };

      let updatedRanges = [...currentSelection.ranges];
      let updatedDates = [...currentSelection.selectedDates];

      if (editingRangeId !== null) {
        const rangeIndex = updatedRanges.findIndex((r) => r.id === editingRangeId);
        if (rangeIndex !== -1) {
          const oldRange = updatedRanges[rangeIndex];
          const oldRangeDates = getDatesInRange(oldRange.startDate, oldRange.endDate);
          updatedDates = updatedDates.filter(
            (d) => !oldRangeDates.some((od) => od.getTime() === d.getTime()),
          );

          updatedDates = [...updatedDates, ...rangeDates];

          updatedRanges[rangeIndex] = {
            ...oldRange,
            startDate: start,
            endDate: end,
            daysCount: rangeDates.length,
          };
        }
      } else {
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
  }, [selectionStart, selectionEnd, editingRangeId, getDatesInRange]);

  const saveRangesToServer = useCallback(
    async (employeeId: number) => {
      const selection = selectionsByEmployee[employeeId];
      if (!selection || selection.ranges.length === 0) {
        toast.error('Нет диапазонов для сохранения');
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
        refetchEmployees();
        toast.success(`Выбранные диапазоны успешно сохранены`);

        // После сохранения очищаем локальные диапазоны
        setSelectionsByEmployee((prev) => ({
          ...prev,
          [employeeId]: {
            ranges: [],
            selectedDates: [],
          },
        }));
      } catch (error) {
        toast.error(`Ошибка при сохранении диапазонов`);
      }
    },
    [selectionsByEmployee, selectedYear, saveVacationRanges, refetchEmployees, toast],
  );

  const openDeleteModal = useCallback(() => {
    const currentUserRanges = selectionsByEmployee[currentUserId]?.ranges || [];
    setRangesToDelete(currentUserRanges);
    setDeleteModalOpen(true);
  }, [selectionsByEmployee, currentUserId]);

  const handleDeleteRanges = useCallback(
    async (rangeIds: number[], isServerRange: boolean, serverRangesToDelete?: ServerRange[]) => {
      if (isServerRange && serverRangesToDelete) {
        // Удаление серверных диапазонов
        try {
          // Преобразуем диапазоны в формат для API
          const rangesForApi = serverRangesToDelete.map((range) => ({
            startDate: range.startDate,
            endDate: range.endDate,
          }));

          await deleteVacationRanges({
            employeeId: currentUserId,
            year: selectedYear,
            ranges: rangesForApi,
          }).unwrap();

          toast.success('Серверные диапазоны успешно удалены');

          // Обновляем UI - перезагружаем данные или обновляем состояние
          // В реальном приложении здесь нужно обновить данные сотрудника
        } catch (error) {
          toast.error('Ошибка при удалении серверных диапазонов');
        }
      } else {
        // Удаление локальных диапазонов
        setSelectionsByEmployee((prev) => {
          const currentSelection = prev[currentUserId];
          if (!currentSelection) return prev;

          const rangesToRemove = currentSelection.ranges.filter((r) => rangeIds.includes(r.id));

          let updatedDates = [...currentSelection.selectedDates];
          rangesToRemove.forEach((range) => {
            const rangeDates = getDatesInRange(range.startDate, range.endDate);
            updatedDates = updatedDates.filter(
              (d) => !rangeDates.some((rd) => rd.getTime() === d.getTime()),
            );
          });

          const updatedRanges = currentSelection.ranges.filter((r) => !rangeIds.includes(r.id));

          return {
            ...prev,
            [currentUserId]: {
              ranges: updatedRanges,
              selectedDates: updatedDates,
            },
          };
        });
      }

      setDeleteModalOpen(false);
    },
    [currentUserId, selectedYear, getDatesInRange, deleteVacationRanges],
  );

  useEffect(() => {
    const initialSelections: Record<number, EmployeeSelection> = {};

    employees.forEach((employee) => {
      // Инициализируем только пустые selections для каждого сотрудника
      // Серверные диапазоны теперь обрабатываются отдельно
      initialSelections[employee.id] = {
        ranges: [],
        selectedDates: [],
      };
    });

    setSelectionsByEmployee(initialSelections);
  }, [employees, selectedYear]);

  useEffect(() => {
    setSelectionsByEmployee({});
    setEditingRangeId(null);
    nextRangeId.current = 1;
  }, [selectedYear]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Диапазоны отпусков успешно сохранены');
    }

    if (isError) {
      toast.error('Ошибка при сохранении диапазонов отпусков');
    }
  }, [isSuccess, isError]);

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
              className="border border-gray-600 rounded-md px-3 py-1 text-xs text-gray-100 bg-gray-700
               focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              className="border border-gray-600 rounded-md px-3 py-1 text-xs text-gray-100 bg-gray-700
               focus:outline-none focus:ring-2 focus:ring-blue-500">
              {yearMonths.map((m) => (
                <option key={m.month} value={m.month}>
                  {m.monthName}
                </option>
              ))}
            </select>
          </div>
          <div className="inline-flex rounded-md shadow-xs" role="group">
            <button
              className="cursor-pointer rounded-l-md border border-gray-600 transition-colors  px-3 py-1 text-xs text-gray-100 bg-gray-700 hover:bg-green-600"
              title="Сохранить"
              onClick={() => saveRangesToServer(currentUserId)}>
              <Save color="#ffffff" size={18} />
            </button>
            <button
              className="cursor-pointer rounded-r-md border border-gray-600 transition-colors  px-3 py-1 text-xs text-gray-100 bg-gray-700 hover:bg-rose-600"
              title="Очистить выбранные диапозоны"
              onClick={openDeleteModal}>
              <Trash color="#ffffff" size={18} />
            </button>
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
            {employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                isCurrentUser={employee.id === currentUserId}
                selectedYear={selectedYear}
                visibleMonths={visibleMonths}
                selectionsByEmployee={selectionsByEmployee}
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
                handleMouseDown={handleMouseDown}
                handleMouseEnter={handleMouseEnter}
                handleMouseUp={handleMouseUp}
                calculateAvailableDays={calculateAvailableDays}
              />
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

          {/*<div className="flex items-center space-x-2">*/}
          {/*    <div className="w-4 h-4 bg-blue-500/60 border border-blue-700 rounded-sm"></div>*/}
          {/*    <span>Сохраненные диапазоны отпусков</span>*/}
          {/*</div>*/}

          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-600/40 border border-purple-700 rounded-sm"></div>
            <span>Сохраненные диапазоны отпусков (нельзя изменить)</span>
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

      <DeleteRangesModal
        deleteModalOpen={deleteModalOpen}
        rangesToDelete={rangesToDelete}
        serverRanges={serverRanges}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDeleteRanges}
      />
    </div>
  );
}
