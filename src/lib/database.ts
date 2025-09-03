import { Employee, POSITION_ADDITIONAL_DAYS } from '@/types';

let employees: Employee[] = [
    {
        id: 1,
        name: "Сиднев Виктор Анатольевич",
        position: "Заместитель начальника отдела",
        hireDate: "2015-05-15",
        vacationDaysPerYear: 28,
        usedVacationDays: 177,
        positionChanges: [
            {
                fromDate: "2015-05-15",
                toDate: "2017-01-31",
                position: "Ведущий специалист",
                vacationDaysPerYear: 28
            },
            {
                fromDate: "2017-02-01",
                toDate: "2017-11-12",
                position: "Старший специалист",
                vacationDaysPerYear: 28
            },
            {
                fromDate: "2017-11-13",
                toDate: "2022-11-12",
                position: "Главный специалист",
                vacationDaysPerYear: 28
            },
            {
                fromDate: "2022-11-13",
                toDate: "2022-03-02",
                position: "Консультант",
                vacationDaysPerYear: 28
            },
            {
                fromDate: "2022-03-03",
                toDate: null,
                position: "Заместитель начальника отдела",
                vacationDaysPerYear: 28
            }
        ]
    },
    {
        id: 2,
        name: "Гомзяков Никита Витальевич",
        position: "Ведущий специалист",
        hireDate: "2025-07-10",
        vacationDaysPerYear: 28,
        usedVacationDays: 0,
        positionChanges: [
            {
                fromDate: "2025-07-10",
                toDate: null,
                position: "Ведущий специалист",
                vacationDaysPerYear: 28
            }
        ]
    }
];

export const db = {
    getEmployees: (): Employee[] => employees,
    getEmployee: (id: number): Employee | undefined => employees.find(e => e.id === id),
    updateEmployee: (id: number, data: Partial<Employee>): Employee | undefined => {
        employees = employees.map(e => e.id === id ? { ...e, ...data } : e);
        return employees.find(e => e.id === id);
    },
    addEmployee: (employee: Omit<Employee, 'id'>): Employee => {
        const newEmployee: Employee = {
            id: Date.now(),
            ...employee
        };
        employees.push(newEmployee);
        return newEmployee;
    },
    deleteEmployee: (id: number): boolean => {
        const initialLength = employees.length;
        employees = employees.filter(e => e.id !== id);
        return employees.length < initialLength;
    }
};