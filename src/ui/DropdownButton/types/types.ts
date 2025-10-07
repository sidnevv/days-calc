import { ReactNode } from 'react';

export interface DropdownItem {
  id: string;
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownButtonProps {
  label: ReactNode;
  items: DropdownItem[];
  className?: string;
}
