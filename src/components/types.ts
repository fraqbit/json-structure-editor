export interface Group {
  code: string;
  name: string | null;
  groupWidgets: Array<{
    widget: string;
    displayOrder?: number;
    viewTypeCode?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface Widget {
  code: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface StructuredData {
  marketplaces: Marketplace[];
  groups: Group[];
  widgets: Widget[];
}

export interface FilterOption {
  type: 'marketplace' | 'group' | 'widget';
  field: string;
  values: any[];
}

export type Filters = Record<string, any[]>;

export interface Conflict {
  type: 'group' | 'widget';
  code: string;
  existing: any;
  new: any;
  usedIn: any[];
}

export interface Resolution {
  action: 'apply-all' | 'clone';
  newCode?: string;
  affectedItems: string[];
}

export interface MarketplaceGroup {
  group: string;
  displayOrder?: number;
  [key: string]: any;
}

export interface Marketplace {
  code: string;
  name: string | null;
  title: string | null;
  description: string | null;
  marketplaceGroups?: (MarketplaceGroup | null)[];
  [key: string]: any;
}

// Расширяем MarketplaceGroup, добавляем displayOrder
export interface ExpandedGroup extends MarketplaceGroup {
  displayOrder?: number;
  [key: string]: any;
}

export interface GroupWidget {
  widget: string;
  [key: string]: any;
}

export interface ExpandedWidget extends Widget {
  [key: string]: any;
}

export interface EntityCreationData {
  type: 'marketplace' | 'group' | 'widget';
  code: string;
  [key: string]: any;
}

export interface CreationDialogState {
  open: boolean;
  type: 'marketplace' | 'group' | 'widget' | null;
  formData: Record<string, any>;
  selectedGroups: string[]; // Для маркетплейса
  selectedWidgets: string[]; // Для группы
}

export interface AttachmentDialogState {
  open: boolean;
  type: 'marketplace' | 'group';
  target: any; // Marketplace или Group, к которому привязываем
  availableItems: any[]; // Группы или виджеты для привязки
}

export type ValidationError = {
  type: 'schema' | 'relation';
  message: string;
  path?: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};
