export interface PositionChange {
  fromDate: string;
  toDate: string | null;
  position: string;
  vacationDaysPerYear: number;
  additionalDaysPerYear: number;
}

export interface VacationRange extends SaveVacationRangesRequest {
  duration: number;
}
export interface VacationEmployee {
  id: number;
  name: string;
  position: string;
  hireDate: string;
  vacationDaysPerYear: number;
  usedVacationDays: number;
  usedAdditionalDays: number;
  positionChanges: PositionChange[];
  vacationRanges: VacationRange[];
}

export interface VacationCalculation {
  earnedDays: number;
  availableDays: number;
  additionalDays: number;
  availableAdditionalDays: number;
  totalAvailableDays: number;
}

export interface EmployeeWithVacation extends VacationEmployee {
  vacation: VacationCalculation;
}
export interface VacationRange {
  id: number;
  startDate: Date;
  endDate: Date;
  daysCount: number;
}

export interface EmployeeSelection {
  ranges: VacationRange[];
  selectedDates: Date[];
}
export interface SaveVacationRangesRequest {
  id: number;
  year: number;
  ranges: {
    startDate: string;
    endDate: string;
  }[];
  status: 'draft' | 'approved';
}
