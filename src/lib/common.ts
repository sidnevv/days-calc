const ADDITIONAL_DAYS_BY_POSITION: { [key: string]: number } = {
  'Начальник отдела': 10,
  'Заместитель начальника отдела': 9,
  Консультант: 8,
  'Главный специалист': 8,
  'Старший специалист': 7,
  'Ведущий специалист': 6,
  'Специалист 1 категории': 5,
  Специалист: 0,
};

export const getAdditionalDaysByPosition = (position: string): number => {
  return ADDITIONAL_DAYS_BY_POSITION[position] || 0;
};
