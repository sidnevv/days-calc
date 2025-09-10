export interface User {
  id: number;
  samaccountname: string;
  email: string;
  title: string;
  department: string;
  displayName: string;
  groups: string[];
  isLocked?: boolean;
}
