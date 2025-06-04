// types/sortUtils.ts
import { StructuredData, Marketplace, Group } from "./types";

// Шаблон порядка полей для каждого типа
const FIELD_ORDER_TEMPLATE = {
    marketplace: [
        'code',
        'title',
        'name',
        'description',
        'channel',
        'headerViewTypeCode',
        'headerBackImage',
        'headerBackStyleCode',
        'sortingParameter',
        'filteringParameter',
        'isInitial',
        'marketplaceGroups',
        'actions',
        'properties',
        'settingMarketplaces'
    ],
    group: [
        'code',
        'title',
        'name',
        'description',
        'channel',
        'bhb120',
        'viewTypeCode',
        'categoryCode',
        'widgetViewTypeCode',
        'widgetBackStyleCode',
        'groupWidgets',
        'actions',
        'properties'
    ],
    widget: [
        'code',
        'title',
        'name',
        'description',
        'underDescription',
        'channel',
        'bhb120',
        'categoryCode',
        'icon',
        'productBackStyleCode',
        'actions',
        'properties'
    ]
};

// Сортировка полей объекта по шаблону
export const sortObjectFields = <T extends object>(obj: T, type: keyof typeof FIELD_ORDER_TEMPLATE): T => {
    const template = FIELD_ORDER_TEMPLATE[type];
    if (!template) return obj;

    const sortedObj = {} as T;
    const existingKeys = new Set(Object.keys(obj));

    // Добавляем поля в порядке шаблона
    template.forEach(key => {
        if (existingKeys.has(key)) {
            sortedObj[key] = obj[key];
            existingKeys.delete(key);
        }
    });

    // Добавляем оставшиеся поля (если есть)
    Array.from(existingKeys).forEach(key => {
        sortedObj[key] = obj[key];
    });

    return sortedObj;
};

// Сортировка marketplaceGroups по displayOrder
export const sortMarketplaceGroups = (marketplace: Marketplace): Marketplace => {
    if (!marketplace.marketplaceGroups) return marketplace;

    return {
        ...marketplace,
        marketplaceGroups: [...marketplace.marketplaceGroups].sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        )
    };
};

// Сортировка groupWidgets по displayOrder
export const sortGroupWidgets = (group: Group): Group => {
    if (!group.groupWidgets) return group;

    return {
        ...group,
        groupWidgets: [...group.groupWidgets].sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        )
    };
};

// Полная обработка структуры
export const processStructure = (data: StructuredData): StructuredData => {
    return {
        marketplaces: data.marketplaces.map(m =>
            sortObjectFields(
                sortMarketplaceGroups(m),
                'marketplace'
            )
        ),
        groups: data.groups.map(g =>
            sortObjectFields(
                sortGroupWidgets(g),
                'group'
            )
        ),
        widgets: data.widgets.map(w =>
            sortObjectFields(w, 'widget')
        )
    };
};
