'use client';

import React, { useEffect, useState } from 'react';

import { Clock, User } from 'lucide-react';

import { PageLayout } from '@/components/layout/PageLayout';
import { useGetCurrentUserQuery } from '@/lib/api/authApi';
import { useGetEmployeesQuery } from '@/lib/api/employeeApi';
import { Employee, PositionChange } from '@/types';
import { Modal, useModal } from '@/ui/Modal';
import { Column, Table } from '@/ui/Table';

const getRussianWord = (number: number, words: [string, string, string]) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};
const calculateDuration = (from: string, to: string | null) => {
  if (!to) return 'по настоящее время';

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const years = toDate.getFullYear() - fromDate.getFullYear();
  const months = toDate.getMonth() - fromDate.getMonth();

  let result = '';
  if (years > 0) result += `${years} ${getRussianWord(years, ['год', 'года', 'лет'])} `;
  if (months > 0) result += `${months} ${getRussianWord(months, ['месяц', 'месяца', 'месяцев'])}`;

  console.log(result);
  return result.trim();
};

const formatDateRange = (from: string, to: string | null) => {
  const format = (date: string) => new Date(date).toLocaleDateString('ru-RU');
  return `${format(from)} - ${to ? format(to) : 'н.в.'}`;
};

const PositionHistoryCards = ({ history }: { history: PositionChange[] }) => {
  return (
    <div className="space-y-3 ">
      <h3 className="text-sm font-semibold text-gray-400">История должностей</h3>
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-400">
        <div className="space-y-3 pr-2">
          {history.map((change, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-xl border border-gray-400">
              <div className="flex justify-between items-center mb-2">
                <span className="font-normal text-slate-200">{change.position}</span>
                <span className="text-sm text-slate-400">
                  {formatDateRange(change.fromDate, change.toDate)}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {change.toDate
                  ? calculateDuration(change.fromDate, change.toDate)
                  : 'Работает в настоящее время'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Employees() {
  const { isOpen, open, close } = useModal();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  // const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();

  const { data: employees, isLoading, error, refetch } = useGetEmployeesQuery();
  const { data: user } = useGetCurrentUserQuery();

  // Инициализация формы при выборе сотрудника
  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        displayName: selectedEmployee.displayName || '',
        position: selectedEmployee.position || '',
        department: selectedEmployee.department || '',
        number: selectedEmployee.number || 0,
        hireDate: selectedEmployee.hireDate || '',
        status: selectedEmployee.status || 'active',
      });
    }
  }, [selectedEmployee]);

  const columns: Column<Employee>[] = [
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      render: (employee: Employee) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {employee.status === 'active' ? 'Активен' : 'Уволен'}
        </span>
      ),
    },
    {
      key: 'displayName',
      header: 'Фамилия, Имя, Отчество',
      sortable: true,
    },
    {
      key: 'position',
      header: 'Должность',
      sortable: true,
    },
    {
      key: 'department',
      header: 'Отдел',
      sortable: true,
    },
    {
      key: 'number',
      header: 'Таб. номер',
      sortable: true,
    },
    {
      key: 'hireDate',
      header: 'Дата приема',
      sortable: true,
      render: (employee: Employee) => new Date(employee.hireDate).toLocaleDateString('ru-RU'),
    },
  ];

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee); // Сохраняем выбранного сотрудника
    open(); // Открываем модальное окно
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setFormData({});
    close();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee?.id) return;

    try {
      console.log('Обновляем сотрудника:', { ...formData });
      // await updateEmployee({
      //   id: selectedEmployee.id,
      //   ...formData,
      // }).unwrap();
      //
      // refetch(); // Обновляем список сотрудников
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-300 animate-pulse">Error...</div>
      </div>
    );
  }

  return (
    <PageLayout user={user!} isLoading={isLoading} error={error}>
      <div>
        <div className="flex items-center gap-2  mb-4">
          <User size={20} />

          <h2 className="text-xl">Сотрудники</h2>
        </div>

        <Table data={employees} columns={columns} keyField="id" onRowClick={handleRowClick} />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title={
          selectedEmployee
            ? `Информация о сотруднике: ${selectedEmployee.displayName}`
            : 'Информация о сотруднике'
        }
        size="full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ФИО */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-400 mb-2">
                Фамилия, Имя, Отчество *
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border bg-gray-700 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Должность */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-400 mb-2">
                Должность *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border bg-gray-700 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Отдел */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-400 mb-2">
                Отдел *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border bg-gray-700 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Табельный номер */}
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-400 mb-2">
                Табельный номер *
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border bg-gray-700 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Дата приема */}
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-400 mb-2">
                Дата приема *
              </label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={
                  formData.hireDate ? new Date(formData.hireDate).toISOString().split('T')[0] : ''
                }
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border bg-gray-700 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Статус */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-2">
                Статус *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-500 rounded-md bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="active">Активен</option>
                <option value="inactive">Уволен</option>
              </select>
            </div>
          </div>

          {selectedEmployee?.positionChanges && selectedEmployee.positionChanges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-500">
              <PositionHistoryCards history={selectedEmployee.positionChanges} />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-500">
            <button
              type="button"
              onClick={handleCloseModal}
              // disabled={isUpdating}
              className="px-4 py-2 text-gray-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors disabled:opacity-50">
              Отмена
            </button>
            <button
              type="submit"
              // disabled={isUpdating}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50">
              {/*{isUpdating ? 'Сохранение...' : 'Сохранить'}*/}
            </button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
