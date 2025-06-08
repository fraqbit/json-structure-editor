// utils/compareStructures.ts
import { StructuredData } from '../components/types';

export interface ChangeItem {
    type: 'marketplace' | 'group' | 'widget' | 'relation';
    code: string;
    action: 'added' | 'modified' | 'deleted';
    details?: string;
    path?: string;
}

// utils/compareStructures.ts
export const compareStructures = (
    current: StructuredData,
    original: StructuredData
): ChangeItem[] => {
    const changes: ChangeItem[] = [];

    // Нормализация данных для сравнения (игнорируем служебные поля)
    const normalizeWidget = (widget: any) => {
        const { found, displayOrder, ...rest } = widget;
        return rest;
    };

    // Сравниваем только уникальные виджеты по их коду
    const compareUniqueWidgets = () => {
        const currentWidgets = new Map(current.widgets.map(w => [w.code, normalizeWidget(w)]));
        const originalWidgets = new Map(original.widgets.map(w => [w.code, normalizeWidget(w)]));

        // Проверяем добавленные/измененные виджеты
        current.widgets.forEach(widget => {
            const originalWidget = originalWidgets.get(widget.code);
            if (!originalWidget) {
                changes.push({ type: 'widget', code: widget.code, action: 'added' });
            } else if (
                JSON.stringify(normalizeWidget(widget)) !== JSON.stringify(originalWidget)
            ) {
                changes.push({ type: 'widget', code: widget.code, action: 'modified' });
            }
        });

        // Проверяем удаленные виджеты
        original.widgets.forEach(widget => {
            if (!currentWidgets.has(widget.code)) {
                changes.push({ type: 'widget', code: widget.code, action: 'deleted' });
            }
        });
    };

    // Сравниваем группы и их связи с виджетами
    const compareGroups = () => {
        const currentGroups = new Map(current.groups.map(g => [g.code, g]));
        const originalGroups = new Map(original.groups.map(g => [g.code, g]));

        // Проверяем изменения в группах (без учета виджетов)
        current.groups.forEach(group => {
            const originalGroup = originalGroups.get(group.code);
            if (!originalGroup) {
                changes.push({ type: 'group', code: group.code, action: 'added' });
            } else {
                // Сравниваем только основные поля группы (исключая groupWidgets)
                const { groupWidgets: _, ...currentGroupData } = group;
                const { groupWidgets: __, ...originalGroupData } = originalGroup;

                if (JSON.stringify(currentGroupData) !== JSON.stringify(originalGroupData)) {
                    changes.push({ type: 'group', code: group.code, action: 'modified' });
                }
            }
        });

        // Проверяем удаленные группы
        original.groups.forEach(group => {
            if (!currentGroups.has(group.code)) {
                changes.push({ type: 'group', code: group.code, action: 'deleted' });
            }
        });

        // Сравниваем связи групп с виджетами
        current.groups.forEach(group => {
            const originalGroup = originalGroups.get(group.code);
            if (!originalGroup) return;

            const currentWidgets = new Set(group.groupWidgets?.map(gw => gw.widget) || []);
            const originalWidgets = new Set(originalGroup.groupWidgets?.map(gw => gw.widget) || []);

            // Проверяем добавленные связи
            currentWidgets.forEach(widgetCode => {
                if (!originalWidgets.has(widgetCode)) {
                    changes.push({
                        type: 'relation',
                        code: `${group.code} → ${widgetCode}`,
                        action: 'added',
                        details: 'Добавлена связь группы с виджетом'
                    });
                }
            });

            // Проверяем удаленные связи
            originalWidgets.forEach(widgetCode => {
                if (!currentWidgets.has(widgetCode)) {
                    changes.push({
                        type: 'relation',
                        code: `${group.code} → ${widgetCode}`,
                        action: 'deleted',
                        details: 'Удалена связь группы с виджетом'
                    });
                }
            });
        });
    };

    // Аналогично для marketplaceGroups...

    compareUniqueWidgets();
    compareGroups();
    // compareMarketplaces...

    return changes;
};
