import {
  ExpandedGroup,
  ExpandedWidget,
  Filters,
  Group,
  Marketplace,
  StructuredData,
  ValidationError,
  ValidationResult,
  Widget,
} from "./types";
import Ajv from "ajv";
import schema from "./ImportSchema.json";
import { useMemo } from "react";
import { processStructure } from "./sortUtils";
const ajv = new Ajv({ allErrors: true });

export const applyFilters = (
  data: StructuredData,
  filters: Filters,
  searchTerm: string
): StructuredData => {
  const lowerSearchTerm = searchTerm.toLowerCase();

  // Фильтрация виджетов
  const filteredWidgets = data.widgets.filter((widget) => {
    const matchesSearch =
      !searchTerm || widget.code.toLowerCase().includes(lowerSearchTerm);
    const matchesFilters = Object.entries(filters).every(([key, values]) => {
      if (values.length === 0) return true;
      const [type, field] = key.split("_");
      return type !== "widget" || values.includes(widget[field]);
    });
    return matchesSearch && matchesFilters;
  });

  // Фильтрация групп
  const filteredGroups = data.groups.filter((group) => {
    const matchesSearch =
      !searchTerm || group.code.toLowerCase().includes(lowerSearchTerm);
    const matchesFilters = Object.entries(filters).every(([key, values]) => {
      if (values.length === 0) return true;
      const [type, field] = key.split("_");
      return type !== "group" || values.includes(group[field]);
    });

    // Проверяем виджеты в группе
    const hasMatchingWidgets = group.groupWidgets?.some((gw) =>
      filteredWidgets.some((w) => w.code === gw.widget)
    );

    return (matchesSearch || hasMatchingWidgets) && matchesFilters;
  });

  // Фильтрация маркетплейсов
  const filteredMarketplaces = data.marketplaces.filter((mp) => {
    const matchesSearch =
      !searchTerm || mp.code.toLowerCase().includes(lowerSearchTerm);
    const matchesFilters = Object.entries(filters).every(([key, values]) => {
      if (values.length === 0) return true;
      const [type, field] = key.split("_");
      return type !== "marketplace" || values.includes(mp[field]);
    });

    // Проверяем группы в маркетплейсе
    const hasMatchingGroups = mp.marketplaceGroups?.some((mg) =>
      filteredGroups.some((g) => g.code === mg.group)
    );

    return (matchesSearch || hasMatchingGroups) && matchesFilters;
  });

  return {
    ...data,
    marketplaces: filteredMarketplaces,
    groups: filteredGroups,
    widgets: filteredWidgets,
  };
};

export const calculateCorrectPath = (
  originalPath: string,
  data: StructuredData
): string => {
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
    widgets: [] as string[],
  };

  if (!data) return references;

  // Поиск в маркетплейсах
  data.marketplaces.forEach((mp) => {
    if (mp.marketplaceGroups?.some((mg) => mg.group === code)) {
      references.marketplaces.push(mp.code || "Unknown Marketplace");
    }
  });

  // Поиск в группах
  data.groups.forEach((group) => {
    if (group.groupWidgets?.some((gw) => gw.widget === code)) {
      references.groups.push(group.code || "Unknown Group");
    }
  });

  // Поиск в виджетах по actions/properties
  data.widgets.forEach((widget) => {
    if (Array.isArray(widget.actions)) {
      for (const action of widget.actions) {
        if (Array.isArray(action.properties)) {
          if (action.properties.some(
            (prop) => prop.code === 'marketplaceId' && prop.value === code
          )) {
            references.widgets.push(widget.code);
            break;
          }
        }
      }
    }
  });

  return references;
};

export const getGroupByCode = (
  data: StructuredData,
  code: string
): Group | undefined => {
  return data.groups.find((g) => g.code === code);
};

export const getMarketplaceByCode = (
  data: StructuredData,
  code: string
): Marketplace | undefined => {
  return data.marketplaces.find((m) => m.code === code)
}

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

export const getInitialMarketplaceLinks = (marketplace: Marketplace, allMarketplaces: Marketplace[]): Marketplace[] => {
  // If it's not an initial marketplace or has no settingMarketplaces, return empty array
  if (!marketplace.isInitial || !marketplace.settingMarketplaces || marketplace.settingMarketplaces.length === 0) {
    return [];
  }

  // Get the codes of linked marketplaces from settingMarketplaces
  const linkedMarketplaceCodes = marketplace.settingMarketplaces.map(
    setting => setting.marketplace
  );

  // Find the actual marketplace objects that match these codes
  return allMarketplaces.filter(mp => 
    linkedMarketplaceCodes.includes(mp.code)
  );
};

export const validateStructure = (data: StructuredData): ValidationResult => {
  const errors: ValidationError[] = [];

  // 1. Валидация по схеме (заглушка - реализуйте по вашему ImportSchema.json)
  const schemaErrors = validateAgainstSchema(data);
  errors.push(...schemaErrors);

  // 2. Проверка связей между сущностями
  const relationErrors = validateRelations(data);
  errors.push(...relationErrors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateAgainstSchema = (data: StructuredData): ValidationError[] => {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid && validate.errors) {
    return validate.errors.map((err) => ({
      type: "schema",
      message: `${err.instancePath} ${err.message}`,
      path: err.instancePath,
    }));
  }

  return [];
};

const validateRelations = (data: StructuredData): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { marketplaces, groups, widgets } = data;

  // Помечаем все сущности как "не найденные" изначально
  const groupMap = new Map<string, boolean>();
  const widgetMap = new Map<string, boolean>();
  const marketplaceMap = new Map<string, boolean>();

  groups.forEach((g) => groupMap.set(g.code, false));
  widgets.forEach((w) => widgetMap.set(w.code, false));
  marketplaces.forEach((m) => marketplaceMap.set(m.code, m.isInitial)); // Начальные витрины считаем "найденными"

  // 1. Проверка связей витрин с группами
  marketplaces.forEach((marketplace) => {
    marketplace.marketplaceGroups?.forEach((mg) => {
      if (!groupMap.has(mg.group)) {
        errors.push({
          type: "relation",
          message: `Группа "${mg.group}" не найдена`,
          path: `marketplaces[code=${marketplace.code}].marketplaceGroups`,
        });
      } else {
        groupMap.set(mg.group, true);
      }
    });
  });

  // 2. Группы без связей с витринами
  groupMap.forEach((found, code) => {
    if (!found) {
      errors.push({
        type: "relation",
        message: `Группа "${code}" не привязана ни к одной витрине`,
        path: `groups[code=${code}]`,
      });
    }
  });

  // 3. Проверка связей групп с виджетами
  groups.forEach((group) => {
    group.groupWidgets?.forEach((gw) => {
      if (!widgetMap.has(gw.widget)) {
        errors.push({
          type: "relation",
          message: `Виджет "${gw.widget}" не найден`,
          path: `groups[code=${group.code}].groupWidgets`,
        });
      } else {
        widgetMap.set(gw.widget, true);
      }
    });
  });

  // 4. Виджеты без связей с группами
  widgetMap.forEach((found, code) => {
    if (!found) {
      errors.push({
        type: "relation",
        message: `Виджет "${code}" не привязан ни к одной группе`,
        path: `widgets[code=${code}]`,
      });
    }
  });

  // 5. Проверка ссылок на витрины в экшенах
  [...marketplaces, ...groups, ...widgets].forEach((entity) => {
    if ('actions' in entity && entity.actions) {
      entity.actions.forEach((action) => {
        if (action.properties) {
          action.properties.forEach((prop) => {
            if (prop.code === "marketplaceId" && !marketplaceMap.has(prop.value)) {
              errors.push({
                type: "relation",
                message: `Витрины "${prop.value}" не существует, но action ссылается на нее `,
                path: `${entity.type}s[code=${entity.code}].actions`,
              });
            }
          });
        }
      });
    }
  });

  return errors;
};

export const useSortedData = (data: StructuredData | null) => {
  return useMemo(() => {
    if (!data) return null;
    return processStructure(data);
  }, [data]);
};

export const normalizeForComparison = (
  data: StructuredData
): StructuredData => {
  return {
    marketplaces: data.marketplaces.map(({ found, ...rest }) => rest),
    groups: data.groups.map(({ found, ...rest }) => rest),
    widgets: data.widgets.map(({ found, ...rest }) => rest),
  };
};
