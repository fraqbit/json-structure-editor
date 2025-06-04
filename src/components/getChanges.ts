import {useCallback} from "react";
import {ChangeItem} from "./compareStructures";
import {StructuredData} from "./types";

export const getChanges = useCallback((current: StructuredData, original: StructuredData) => {
    const changes: ChangeItem[] = [];

    // Сравниваем маркетплейсы
    current.marketplaces.forEach((mp, i) => {
        const originalMp = original.marketplaces[i];
        if (!originalMp || mp.code !== originalMp.code) {
            changes.push({
                type: 'marketplace',
                code: mp.code,
                action: originalMp ? 'modified' : 'added'
            });
        }
        // Детальное сравнение полей...
    });

    // Аналогично для групп и виджетов
    return changes;
}, []);
