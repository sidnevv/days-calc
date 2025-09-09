export interface User {
  samaccountname: string;
  email: string;
  title: string;
  department: string;
  displayName: string;
  groups: string[];
  isLocked?: boolean;
}
