import { ExpandedGroup, ExpandedWidget, Group, Marketplace, StructuredData, Widget } from "./types";

// В App.tsx или отдельном файле helpers.ts
export const getGroupByCode = (data: StructuredData, code: string): Group | undefined => {
    return data.groups.find(g => g.code === code);
  };
  
export const getWidgetByCode = (data: StructuredData, code: string): Widget | undefined => {
    return data.widgets.find(w => w.code === code);
  };
  
export const getMarketplaceGroups = (data: StructuredData, mp: Marketplace): ExpandedGroup[] => {
    if (!mp.marketplaceGroups) return [];
    
    return mp.marketplaceGroups.map(mg => {
      const group = getGroupByCode(data, mg.group);
      if (!group) return null;
      
      const groupWidgets = group.groupWidgets?.map(gw => {
        const widget = getWidgetByCode(data, gw.widget);
        return widget ? { ...widget, displayOrder: gw.displayOrder } : null;
      }).filter(Boolean) as ExpandedWidget[];
      
      return {
        ...group,
        ...mg, // Включаем displayOrder из marketplaceGroups
        groupWidgets
      };
    }).filter(Boolean) as ExpandedGroup[];
  };