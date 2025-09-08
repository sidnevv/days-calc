export interface User {
  samaccountname: string;
  email: string;
  title: string;
  department: string;
  displayName: string;
  groups: string[];
  isLocked?: boolean;
}

export interface PositionChange {
  fromDate: string;
  toDate: string | null;
  position: string;
  vacationDaysPerYear: number;
  additionalDaysPerYear: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  hireDate: string;
  vacationDaysPerYear: number;
  usedVacationDays: number;
  usedAdditionalDays: number;
  positionChanges: PositionChange[];
}

export interface VacationCalculation {
  earnedDays: number;
  availableDays: number;
  additionalDays: number;
  availableAdditionalDays: number;
  totalAvailableDays: number;
}

export interface EmployeeWithVacation extends Employee {
  vacation: VacationCalculation;
}
