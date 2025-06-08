export interface Group {
  code: string;
  name: string | null;
  groupWidgets: Array<{
    widget: string;
    displayOrder: number;
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
  displayOrder: number;
  [key: string]: any;
}

export interface Marketplace {
  code: string;
  name: string | null;
  title: string | null;
  description: string | null;
  marketplaceGroups?: (MarketplaceGroup | null)[];
  isInitial?: boolean;
  settingMarketplaces?: Array<{
    marketplace: string;
    displayOrder: number;
  }>;
  [key: string]: any;
}

// Расширяем MarketplaceGroup, добавляем displayOrder
export interface ExpandedGroup extends Group {
  displayOrder: number;
  isInitial?: boolean;
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

export interface RowComponentProps {
  isExpanded: boolean;
  handleToggleMarketplace: (index: string) => void;
  index: string;
  mp: Marketplace;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  isInitial?: boolean
}

export interface JsonTreeViewProps {
  data: StructuredData;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
}

export interface MarketplaceGroupsProps {
  marketplaceGroups: (ExpandedGroup | Marketplace)[];
  mpIndex: string | number;
  onSelectNode: (node: any, path: string) => void;
  onAttachWidgets: (group: Group) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
}

export interface LinkedMarketplacesProps {
  marketplaces: Marketplace[];
  onSelectNode: (node: any, path: string) => void;
}

export interface GroupWidgetsProps {
  group: Group;
  onSelectNode: (node: any, path: string) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  onUnlink?: (type: 'widget', parentCode: string, code: string) => void;
}