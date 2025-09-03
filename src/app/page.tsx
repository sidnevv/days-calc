'use client';

import { useState, useEffect } from 'react';
import EmployeeTable from '../components/EmployeeTable';
import { EmployeeWithVacation } from '../types';
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
    const [employees, setEmployees] = useState<EmployeeWithVacation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/employees');

            if (!response.ok) {
                throw new Error('Не удалось загрузить сотрудников');
            }

            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-xl text-gray-300 animate-pulse">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-3">
            {error && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}
            <div className="flex justify-end mb-4">
                <ThemeToggle />
            </div>

                <EmployeeTable employees={employees} />
        </div>
    );
}
