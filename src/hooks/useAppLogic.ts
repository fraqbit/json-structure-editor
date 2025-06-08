import { useState, useEffect, useMemo, useCallback } from "react";
import { applyFilters, normalizeForComparison, validateStructure } from "../components/utils";
import { processStructure } from "../components/sortUtils";
import { ChangeItem, compareStructures } from "../components/compareStructures";
import { FilterOption, Filters, StructuredData, ValidationError, AttachmentDialogState as OrigAttachmentDialogState, EntityCreationData, Group, Marketplace, ExpandedGroup, ExpandedWidget } from "../components/types";
import saveAs from "file-saver";

type AttachmentDialogType = 'marketplace' | 'group' | 'initial-marketplace';
interface AttachmentDialogState extends Omit<OrigAttachmentDialogState, 'type'> {
  type: AttachmentDialogType;
}

export const useAppLogic = () => {
  const [jsonData, setJsonData] = useState<StructuredData | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodePath, setNodePath] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<StructuredData | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportChanges, setExportChanges] = useState<ChangeItem[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "error" | "success" | "warning",
  });
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([]);
  const [creationDialog, setCreationDialog] = useState<{
    open: boolean;
    type: "marketplace" | "group" | "widget" | null;
  }>({ open: false, type: null });
  const [attachmentDialog, setAttachmentDialog] = useState<AttachmentDialogState>({
    open: false,
    type: "group",
    target: null,
    availableItems: [],
  });

  const openAttachmentDialog = (type: AttachmentDialogType, target: any) => {
    if (!structuredData) return;
    setAttachmentDialog({
      open: true,
      type,
      target,
      availableItems:
        type === "marketplace"
          ? structuredData.groups
          : type === "initial-marketplace"
            ? structuredData.marketplaces.filter(mp => !mp.isInitial)
            : structuredData.widgets,
    });
  };

  const openInitialMarketplaceDialog = (target: any) => openAttachmentDialog("initial-marketplace", target);

  const handleAttachItems = (selectedCodes: string[]) => {
    if (!structuredData || !attachmentDialog.target) return;
    const newData = { ...structuredData };
    const target = attachmentDialog.target;
    try {
      if (attachmentDialog.type === "marketplace") {
        const mpIndex = newData.marketplaces.findIndex((mp) => mp.code === target.code);
        if (mpIndex === -1) return;
        const existingGroups = newData.marketplaces[mpIndex].marketplaceGroups || [];
        const newGroups = selectedCodes
          .filter((code) => !existingGroups.some((g) => g.group === code))
          .map((code) => ({ group: code, displayOrder: 0 }));
        newData.marketplaces[mpIndex].marketplaceGroups = [
          ...newGroups,
          ...existingGroups,
        ];
      } else if (attachmentDialog.type === "group") {
        const groupIndex = newData.groups.findIndex((g) => g.code === target.code);
        if (groupIndex === -1) return;
        const existingWidgets = newData.groups[groupIndex].groupWidgets || [];
        const newWidgets = selectedCodes
          .filter((code) => !existingWidgets.some((w) => w.widget === code))
          .map((code) => ({ widget: code, displayOrder: 0 }));
        newData.groups[groupIndex].groupWidgets = [
          ...newWidgets,
          ...existingWidgets,
        ];
      } else if (attachmentDialog.type === "initial-marketplace") {
        const mpIndex = newData.marketplaces.findIndex((mp) => mp.code === target.code);
        if (mpIndex === -1) return;
        const existingLinks = newData.marketplaces[mpIndex].settingMarketplaces || [];
        const newLinks = selectedCodes
          .filter((code) => !existingLinks.some((m) => m.marketplace === code))
          .map((code) => ({ marketplace: code, displayOrder: 0 }));
        newData.marketplaces[mpIndex].settingMarketplaces = [
          ...newLinks,
          ...existingLinks,
        ];
      }
      setStructuredData(newData);
      showSnackbar("Элементы успешно привязаны", "success");
    } catch (error) {
      showSnackbar("Ошибка при привязке элементов", "error");
    }
    setAttachmentDialog({ ...attachmentDialog, open: false });
  };

  const handleCreateEntity = useCallback((entityData: EntityCreationData) => {
    if (!structuredData) return;
    const newData = { ...structuredData };
    try {
      switch (entityData.type) {
        case "marketplace":
          newData.marketplaces = [
            ...newData.marketplaces,
            {
              code: entityData.code,
              title: entityData.title || null,
              description: entityData.description || null,
              name: entityData.name || null,
              channel: entityData.channel || "",
              headerViewTypeCode: entityData.headerViewTypeCode || null,
              headerBackImage: entityData.headerBackImage || null,
              headerBackStyleCode: entityData.headerBackStyleCode || null,
              sortingParameter: entityData.sortingParameter || null,
              filteringParameter: entityData.filteringParameter || null,
              isInitial: entityData.isInitial || false,
              marketplaceGroups: entityData.marketplaceGroups || [],
              settingMarketplaces: entityData.isInitial ? (entityData.settingMarketplaces || []) : undefined,
            },
          ];
          break;
        case "group":
          newData.groups = [
            ...newData.groups,
            {
              code: entityData.code,
              title: entityData.title || null,
              viewTypeCode: entityData.viewTypeCode || null,
              name: entityData.name || null,
              channel: entityData.channel || "",
              bhb120: entityData.bhb120 || false,
              categoryCode: entityData.categoryCode || null,
              widgetViewTypeCode: entityData.widgetViewTypeCode || null,
              widgetBackStyleCode: entityData.widgetBackStyleCode || null,
              groupWidgets: entityData.groupWidgets || [],
            },
          ];
          break;
        case "widget":
          newData.widgets = [
            ...newData.widgets,
            {
              code: entityData.code,
              title: entityData.title || "",
              name: entityData.name || null,
              description: entityData.description || null,
              categoryCode: entityData.categoryCode || null,
              channel: entityData.channel || "",
              bhb120: entityData.bhb120 || false,
              icon: entityData.icon || null,
              underDescription: entityData.underDescription || null,
              productBackStyleCode: entityData.productBackStyleCode || null,
              actions: entityData.actions || [],
              properties: entityData.properties || [],
            },
          ];
          break;
      }
      setStructuredData(newData);
      showSnackbar(`${entityData.type} успешно создан`, "success");
    } catch (error) {
      showSnackbar(`Ошибка при создании ${entityData.type}`, "error");
    }
  }, [structuredData]);

  const actualGroups = useMemo(() => structuredData?.groups.map((group) => group.code), [structuredData]);
  const actualWidgets = useMemo(() => structuredData?.widgets.map((widget) => widget.code), [structuredData]);

  const extractFilters = useCallback((data: StructuredData) => {
    if (!data) return;
    const filterOptions: FilterOption[] = [];
    const valueMap: Record<string, Set<any>> = {};
    data.marketplaces.forEach((mp) => {
      Object.entries(mp).forEach(([key, value]) => {
        const filterKey = `marketplace_${key}`;
        if (!valueMap[filterKey]) {
          valueMap[filterKey] = new Set();
          filterOptions.push({
            type: "marketplace",
            field: key,
            values: [],
          });
        }
        if (value !== null && value !== undefined) {
          valueMap[filterKey].add(value);
        }
      });
    });
    filterOptions.forEach((option) => {
      const filterKey = `${option.type}_${option.field}`;
      option.values = Array.from(valueMap[filterKey]) || [];
    });
    setAvailableFilters(filterOptions);
  }, []);

  useEffect(() => {
    if (jsonData) {
      setLoading(true);
      try {
        setStructuredData(jsonData);
        extractFilters(jsonData);
      } catch (error) {
        showSnackbar("Ошибка преобразования данных", "error");
      } finally {
        setLoading(false);
      }
    }
  }, [jsonData, extractFilters]);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        try {
          const parsedData = JSON.parse(result);
          setOriginalData(parsedData);
          setJsonData(processStructure(parsedData));
          setLoading(false);
        } catch (err) {
          showSnackbar("Ошибка при чтении файла", "error");
          setLoading(false);
        }
      } else {
        showSnackbar("Неверный формат файла", "error");
        setLoading(false);
      }
    };
    reader.onerror = () => {
      showSnackbar("Ошибка чтения файла", "error");
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleSelectNode = useCallback((node: any, path: string) => {
    setSelectedNode(node);
    setNodePath(path);
  }, []);

  const handleUpdateNode = useCallback((updatedNode: any) => {
    if (!structuredData) return;
    try {
      const pathParts = nodePath.split(".");
      let currentPointer: any = structuredData;
      let parent = null;
      let lastKey = null;
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (part.includes("[")) {
          const match = part.match(/(\w+)\[(\d+)\]/);
          if (!match) continue;
          const arrayName = match[1];
          const index = parseInt(match[2]);
          parent = currentPointer;
          lastKey = arrayName;
          currentPointer = currentPointer[arrayName][index];
        } else {
          parent = currentPointer;
          lastKey = part;
          currentPointer = currentPointer[part];
        }
      }
      const oldCode = currentPointer?.code;
      const newCode = updatedNode?.code;
      if (parent && lastKey !== null) {
        if (Array.isArray(parent[lastKey])) {
          const index = parseInt(pathParts[pathParts.length - 1].match(/\[(\d+)\]/)?.[1] || "0");
          parent[lastKey][index] = updatedNode;
        } else {
          parent[lastKey] = updatedNode;
        }
      }
      if (oldCode && newCode && oldCode !== newCode) {
        const newData = { ...structuredData };
        newData.marketplaces = newData.marketplaces.map((mp) => {
          if (!mp.marketplaceGroups) return mp;
          return {
            ...mp,
            marketplaceGroups: mp.marketplaceGroups.map((mg) => {
              if (mg.group === oldCode) {
                return { ...mg, group: newCode };
              }
              return mg;
            }),
          };
        });
        newData.groups = newData.groups.map((group) => {
          if (!group.groupWidgets) return group;
          return {
            ...group,
            groupWidgets: group.groupWidgets.map((gw) => {
              if (gw.widget === oldCode) {
                return { ...gw, widget: newCode };
              }
              return gw;
            }),
          };
        });
        setStructuredData(newData);
      } else {
        setStructuredData({ ...structuredData });
      }
      showSnackbar("Узел успешно обновлён", "success");
    } catch (error) {
      showSnackbar("Ошибка при обновлении узла", "error");
    }
  }, [nodePath, structuredData]);

  const getMarketplaceGroups = useCallback((mp: Marketplace): ExpandedGroup[] => {
    if (!structuredData) return [];
    if (mp.isInitial && mp.settingMarketplaces) {
      return mp.settingMarketplaces
        .map((mg) => {
          const marketplace = structuredData.marketplaces.find((m) => m.code === mg.marketplace);
          if (!marketplace) return null;
          return {
            ...marketplace,
            displayOrder: mg.displayOrder || 0,
          };
        })
        .filter(Boolean) as unknown as ExpandedGroup[];
    }
    if (!mp.marketplaceGroups) return [];
    return mp.marketplaceGroups
      .map((mg) => {
        const group = structuredData.groups.find((g) => g.code === mg.group);
        if (!group) return null;
        return {
          ...group,
          displayOrder: mg.displayOrder,
          groupWidgets: group.groupWidgets || [],
        };
      })
      .filter(Boolean) as unknown as ExpandedGroup[];
  }, [structuredData]);

  const getGroupWidgets = useCallback((group: Group): ExpandedWidget[] => {
    if (!structuredData || !group.groupWidgets) return [];
    return group.groupWidgets
      .map((gw) => {
        const widget = structuredData.widgets.find((w) => w.code === gw.widget);
        if (!widget) return null;
        return {
          ...widget,
          displayOrder: gw.displayOrder,
        };
      })
      .filter(Boolean) as ExpandedWidget[];
  }, [structuredData]);

  const handleDownload = async () => {
    if (!structuredData || !originalData) return;
    const validationResult = validateStructure(structuredData);
    setValidationErrors(validationResult.errors);
    const normalizedCurrent = normalizeForComparison(structuredData);
    const normalizedOriginal = normalizeForComparison(originalData);
    const changes = compareStructures(normalizedCurrent, normalizedOriginal);
    setExportChanges(changes);
    setShowExportDialog(true);
  };

  const showSnackbar = (
    message: string,
    severity: "info" | "error" | "success" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const confirmExport = () => {
    try {
      const blob = new Blob([JSON.stringify(structuredData, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "edited_data.json");
      showSnackbar("Файл успешно выгружен", "success");
    } catch (error) {
      showSnackbar("Ошибка при выгрузке файла", "error");
    } finally {
      setShowExportDialog(false);
    }
  };

  const handleFilterChange = useCallback((filterKey: string, values: any[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: values,
    }));
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filteredData = useMemo(() => {
    if (!structuredData) return null;
    return applyFilters(structuredData, filters, searchTerm);
  }, [structuredData, filters, searchTerm]);

  const handleUnlink = (type: 'marketplace' | 'group' | 'widget', parentCode: string, code: string) => {
    if (!structuredData) return;
    const newData = { ...structuredData };
    if (type === 'marketplace') {
      // Удалить marketplace из settingMarketplaces у initial marketplace
      const mpIndex = newData.marketplaces.findIndex(mp => mp.code === parentCode);
      if (mpIndex === -1) return;
      newData.marketplaces[mpIndex].settingMarketplaces = (newData.marketplaces[mpIndex].settingMarketplaces || []).filter(m => m.marketplace !== code);
    } else if (type === 'group') {
      // Удалить группу из marketplaceGroups у marketplace
      const mpIndex = newData.marketplaces.findIndex(mp => mp.code === parentCode);
      if (mpIndex === -1) return;
      newData.marketplaces[mpIndex].marketplaceGroups = (newData.marketplaces[mpIndex].marketplaceGroups || []).filter(g => g.group !== code);
    } else if (type === 'widget') {
      // Удалить виджет из groupWidgets у группы
      const groupIndex = newData.groups.findIndex(g => g.code === parentCode);
      if (groupIndex === -1) return;
      newData.groups[groupIndex].groupWidgets = (newData.groups[groupIndex].groupWidgets || []).filter(w => w.widget !== code);
    }
    setStructuredData(newData);
    showSnackbar('Связь удалена', 'success');
  };

  return {
    jsonData,
    setJsonData,
    structuredData,
    setStructuredData,
    validationErrors,
    setValidationErrors,
    selectedNode,
    setSelectedNode,
    nodePath,
    setNodePath,
    loading,
    setLoading,
    originalData,
    setOriginalData,
    showExportDialog,
    setShowExportDialog,
    exportChanges,
    setExportChanges,
    snackbar,
    setSnackbar,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    availableFilters,
    setAvailableFilters,
    creationDialog,
    setCreationDialog,
    attachmentDialog,
    setAttachmentDialog,
    openAttachmentDialog,
    openInitialMarketplaceDialog,
    handleAttachItems,
    handleCreateEntity,
    actualGroups,
    actualWidgets,
    handleFileUpload,
    handleSelectNode,
    handleUpdateNode,
    getMarketplaceGroups,
    getGroupWidgets,
    handleDownload,
    handleCloseSnackbar,
    confirmExport,
    handleFilterChange,
    handleSearchChange,
    filteredData,
    handleUnlink,
  };
}; 