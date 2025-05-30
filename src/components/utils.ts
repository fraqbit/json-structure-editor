import {
  ExpandedGroup,
  ExpandedWidget,
  Group,
  Marketplace,
  StructuredData,
  Widget,
} from "./types";

export const calculateCorrectPath = (originalPath: string, data: StructuredData): string => {
    const parts = originalPath.split(".");
  
    let correctedPath = "";
  
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
  
      if (part.startsWith("marketplaceGroups")) {
        // Извлекаем код группы из строки пути
        const groupCodeMatch = part.match(/$$([\w\d]+)$$/);
        if (!groupCodeMatch) {
          throw new Error("Unable to extract group code from path");
        }
        const groupCode = groupCodeMatch[1]; // Это должен быть код группы, а не индекс
  
        const groupIndex = findGroupIndex(data.groups, groupCode);
        if (groupIndex !== null) {
          correctedPath += `.groups[${groupIndex}]`;
        } else {
          throw new Error(`Group with code ${groupCode} not found`);
        }
      } else if (part.startsWith("groupWidgets")) {
        // Аналогично для виджетов
        const widgetCodeMatch = part.match(/$$([\w\d]+)$$/);
        if (!widgetCodeMatch) {
          throw new Error("Unable to extract widget code from path");
        }
        const widgetCode = widgetCodeMatch[1];
  
        const widgetIndex = findWidgetIndex(data.widgets, widgetCode);
        if (widgetIndex !== null) {
          correctedPath += `.widgets[${widgetIndex}]`;
        } else {
          throw new Error(`Widget with code ${widgetCode} not found`);
        }
      } else {
        correctedPath += `.${part}`;
      }
    }
  
    return `data${correctedPath}`;
  };

  export const findReferences = (data: StructuredData, code: string) => {
    const references = {
      marketplaces: [] as string[],
      groups: [] as string[],
    };
    
    if (!data) return references;
    
    // Поиск в маркетплейсах
    data.marketplaces.forEach(mp => {
      if (mp.marketplaceGroups?.some(mg => mg.group === code)) {
        references.marketplaces.push(mp.code || 'Unknown Marketplace');
      }
    });
    
    // Поиск в группах
    data.groups.forEach(group => {
      if (group.groupWidgets?.some(gw => gw.widget === code)) {
        references.groups.push(group.code || 'Unknown Group');
      }
    });
    
    return references;
  };

// В App.tsx или отдельном файле helpers.ts
export const getGroupByCode = (
  data: StructuredData,
  code: string
): Group | undefined => {
  return data.groups.find((g) => g.code === code);
};

export const getWidgetByCode = (
  data: StructuredData,
  code: string
): Widget | undefined => {
  return data.widgets.find((w) => w.code === code);
};

export const findGroupIndex = (
  groups: Group[],
  groupCode: string
): number | null => {
  const foundIndex = groups.findIndex((grp) => grp.code === groupCode);
  return foundIndex >= 0 ? foundIndex : null;
};

export const findWidgetIndex = (
    widgets: Widget[],
    widgetCode: string
  ): number | null => {
    const foundIndex = widgets.findIndex((wgt) => wgt.code === widgetCode);
    return foundIndex >= 0 ? foundIndex : null;
  };

export const getMarketplaceGroups = (
  data: StructuredData,
  mp: Marketplace
): ExpandedGroup[] => {
  if (!mp.marketplaceGroups) return [];

  return mp.marketplaceGroups
    .map((mg) => {
      const group = getGroupByCode(data, mg.group);
      if (!group) return null;

      const groupWidgets = group.groupWidgets
        ?.map((gw) => {
          const widget = getWidgetByCode(data, gw.widget);
          return widget ? { ...widget, displayOrder: gw.displayOrder } : null;
        })
        .filter(Boolean) as ExpandedWidget[];

      return {
        ...group,
        ...mg, // Включаем displayOrder из marketplaceGroups
        groupWidgets,
      };
    })
    .filter(Boolean) as ExpandedGroup[];
};
