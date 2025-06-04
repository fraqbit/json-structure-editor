import {
  ExpandedGroup,
  ExpandedWidget,
  Group,
  Marketplace,
  StructuredData, ValidationError, ValidationResult,
  Widget,
} from "./types";
import Ajv from 'ajv';
import schema from './ImportSchema.json';
import {useMemo} from "react";
import {processStructure} from "./sortUtils";
const ajv = new Ajv({ allErrors: true });

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
    errors
  };
};

const validateAgainstSchema = (data: StructuredData): ValidationError[] => {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid && validate.errors) {
    return validate.errors.map(err => ({
      type: 'schema',
      message: `${err.instancePath} ${err.message}`,
      path: err.instancePath
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

  groups.forEach(g => groupMap.set(g.code, false));
  widgets.forEach(w => widgetMap.set(w.code, false));
  marketplaces.forEach(m => marketplaceMap.set(m.code, m.isInitial)); // Начальные витрины считаем "найденными"

  // 1. Проверка связей витрин с группами
  marketplaces.forEach(marketplace => {
    marketplace.marketplaceGroups?.forEach(mg => {
      if (!groupMap.has(mg.group)) {
        errors.push({
          type: 'relation',
          message: `Группа "${mg.group}" не найдена`,
          path: `marketplaces[code=${marketplace.code}].marketplaceGroups`
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
        type: 'relation',
        message: `Группа "${code}" не привязана ни к одной витрине`,
        path: `groups[code=${code}]`
      });
    }
  });

  // 3. Проверка связей групп с виджетами
  groups.forEach(group => {
    group.groupWidgets?.forEach(gw => {
      if (!widgetMap.has(gw.widget)) {
        errors.push({
          type: 'relation',
          message: `Виджет "${gw.widget}" не найден`,
          path: `groups[code=${group.code}].groupWidgets`
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
        type: 'relation',
        message: `Виджет "${code}" не привязан ни к одной группе`,
        path: `widgets[code=${code}]`
      });
    }
  });

  // 5. Проверка ссылок на витрины в экшенах
  [...marketplaces, ...groups, ...widgets].forEach(entity => {
    entity.actions?.forEach(action => {
      action.properties?.forEach(prop => {
        if (prop.code === 'marketplaceId' && !marketplaceMap.has(prop.value)) {
          errors.push({
            type: 'relation',
            message: `Витрины "${prop.value}" не существует, но action ссылается на нее `,
            path: `${entity.type}s[code=${entity.code}].actions`
          });
        }
      });
    });
  });

  return errors;
};

export const useSortedData = (data: StructuredData | null) => {
  return useMemo(() => {
    if (!data) return null;
    return processStructure(data);
  }, [data]);
};

export const normalizeForComparison = (data: StructuredData): StructuredData => {
  return {
    marketplaces: data.marketplaces.map(({ found, ...rest }) => rest),
    groups: data.groups.map(({ found, ...rest }) => rest),
    widgets: data.widgets.map(({ found, ...rest }) => rest)
  };
};
