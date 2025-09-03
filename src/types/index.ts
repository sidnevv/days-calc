export interface PositionChange {
    fromDate: string;
    toDate: string | null;
    position: string;
    vacationDaysPerYear: number;
}

export interface Employee {
    id: number;
    name: string;
    position: string;
    hireDate: string;
    vacationDaysPerYear: number;
    usedVacationDays: number;
    positionChanges: PositionChange[];
}

export interface VacationCalculation {
    earnedDays: number;
    availableDays: number;
}

export interface EmployeeWithVacation extends Employee {
    vacation: VacationCalculation;
}