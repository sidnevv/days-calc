import { Employee } from '@/types';

const PUBLIC_HOLIDAYS: string[] = [
    '2025-01-01',
    '2025-01-02',
    '2025-01-03',
    '2025-01-04',
    '2025-01-05',
    '2025-01-06',
    '2025-01-07',
    '2025-01-08',
    '2025-01-08',
    '2025-02-23',
    '2025-03-08',
    '2025-05-01',
    '2025-05-09',
    '2025-06-12',
    '2025-11-04',
];


const ADDITIONAL_DAYS_BY_POSITION: { [key: string]: number } = {
    'Начальник отдела': 10,
    'Заместитель начальника отдела': 9,
    'Консультант': 8,
    'Главный специалист': 8,
    'Старший специалист': 7,
    'Ведущий специалист': 6,
    'Специалист 1 категории': 5,
    'Специалист': 0
};

let employees: Employee[] = [
    {
        id: 1,
        name: "Сиднев Виктор Анатольевич",
        position: "Заместитель начальника отдела",
        hireDate: "2015-05-15",
        vacationDaysPerYear: 28,
        usedVacationDays: 177,
        usedAdditionalDays: 15,
        positionChanges: [
            {
                fromDate: "2015-05-15",
                toDate: "2017-01-31",
                position: "Ведущий специалист",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 6
            },
            {
                fromDate: "2017-02-01",
                toDate: "2017-11-12",
                position: "Старший специалист",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 7
            },
            {
                fromDate: "2017-11-13",
                toDate: "2022-11-12",
                position: "Главный специалист",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 8
            },
            {
                fromDate: "2022-11-13",
                toDate: "2022-03-02",
                position: "Консультант",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 8
            },
            {
                fromDate: "2022-03-03",
                toDate: null,
                position: "Заместитель начальника отдела",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 9
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
        usedAdditionalDays: 0,
        positionChanges: [
            {
                fromDate: "2025-07-10",
                toDate: null,
                position: "Ведущий специалист",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 6
            }
        ]
    },
    {
        id: 3,
        name: "Ярлыков Александр Александрович",
        position: "Ведущий специалист",
        hireDate: "2024-11-01",
        vacationDaysPerYear: 28,
        usedVacationDays: 0,
        usedAdditionalDays: 0,
        positionChanges: [
            {
                fromDate: "2024-11-01",
                toDate: null,
                position: "Ведущий специалист",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 6
            }
        ]
    },
    {
        id: 4,
        name: "Копылов Игорь Андреевич",
        position: "Ведущий специалист",
        hireDate: "2025-04-21",
        vacationDaysPerYear: 28,
        usedVacationDays: 0,
        usedAdditionalDays: 0,
        positionChanges: [
            {
                fromDate: "2025-04-21",
                toDate: null,
                position: "Ведущий специалист",
                vacationDaysPerYear: 28,
                additionalDaysPerYear: 6
            }
        ]
    }
];

export const getAdditionalDaysByPosition = (position: string): number => {
    return ADDITIONAL_DAYS_BY_POSITION[position] || 0;
};

export const isPublicHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return PUBLIC_HOLIDAYS.includes(dateStr);
};

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