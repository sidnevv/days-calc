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
