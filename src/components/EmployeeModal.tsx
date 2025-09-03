import React, { useState, useEffect } from 'react';
import { Employee } from '@/types';

interface EmployeeModalProps {
    employee?: Employee;
    isOpen: boolean;
    onSave: (data: Omit<Employee, 'id'>) => void;
    onClose: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, isOpen, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
        name: '',
        position: '',
        hireDate: new Date().toISOString().split('T')[0],
        vacationDaysPerYear: 28,
        usedVacationDays: 0,
        positionChanges: []
    });

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        } else {
            setFormData({
                name: '',
                position: '',
                hireDate: new Date().toISOString().split('T')[0],
                vacationDaysPerYear: 28,
                usedVacationDays: 0,
                positionChanges: []
            });
        }
    }, [employee, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {employee ? 'Редактирование' : 'Добавление'} сотрудника
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                        <input
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата приема</label>
                        <input
                            type="date"
                            value={formData.hireDate}
                            onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дней отпуска в год</label>
                        <input
                            type="number"
                            value={formData.vacationDaysPerYear}
                            onChange={(e) => setFormData({...formData, vacationDaysPerYear: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Использовано дней</label>
                        <input
                            type="number"
                            value={formData.usedVacationDays}
                            onChange={(e) => setFormData({...formData, usedVacationDays: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;