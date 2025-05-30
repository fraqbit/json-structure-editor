import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import { saveAs } from "file-saver";
import JsonTreeView from "./JsonTreeView";
import JsonEditor from "./JsonEditor";
import ConflictDialog from "./ConflictDialog";
import FilterPanel from "./FilterPanel";
import {
  AttachmentDialogState,
  EntityCreationData,
  FilterOption,
  Filters,
  Group,
  Marketplace,
  Resolution,
  StructuredData,
  Widget,
} from "./types";
import CreationDialog from "./CreationDialog";
import AttachmentDialog from "./AttachmentDialog";

const applyFilters = (
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

const App = () => {
  const [jsonData, setJsonData] = useState<StructuredData | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredData | null>(
    null
  );
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodePath, setNodePath] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conflicts] = useState<any[]>([]);
  const [openConflictDialog, setOpenConflictDialog] = useState<boolean>(false);
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
  const [attachmentDialog, setAttachmentDialog] =
    useState<AttachmentDialogState>({
      open: false,
      type: "group",
      target: null,
      availableItems: [],
    });

  // Функция для открытия диалога привязки
  const openAttachmentDialog = (type: "marketplace" | "group", target: any) => {
    if (!structuredData) return;

    setAttachmentDialog({
      open: true,
      type,
      target,
      availableItems:
        type === "marketplace" ? structuredData.groups : structuredData.widgets,
    });
  };

  // Функция для привязки элементов
  const handleAttachItems = (selectedCodes: string[]) => {
    if (!structuredData || !attachmentDialog.target) return;

    const newData = { ...structuredData };
    const target = attachmentDialog.target;

    try {
      if (attachmentDialog.type === "marketplace") {
        // Привязываем группы к маркетплейсу
        const mpIndex = newData.marketplaces.findIndex(
          (mp) => mp.code === target.code
        );
        if (mpIndex === -1) return;

        const existingGroups =
          newData.marketplaces[mpIndex].marketplaceGroups || [];

        // Добавляем только новые группы
        const newGroups = selectedCodes
          .filter((code) => !existingGroups.some((g) => g.group === code))
          .map((code) => ({
            group: code,
            displayOrder: existingGroups.length + 1,
          }));

        newData.marketplaces[mpIndex].marketplaceGroups = [
          ...existingGroups,
          ...newGroups,
        ];
      } else if (attachmentDialog.type === "group") {
        // Привязываем виджеты к группе
        const groupIndex = newData.groups.findIndex(
          (g) => g.code === target.code
        );
        if (groupIndex === -1) return;

        const existingWidgets = newData.groups[groupIndex].groupWidgets || [];

        // Добавляем только новые виджеты
        const newWidgets = selectedCodes
          .filter((code) => !existingWidgets.some((w) => w.widget === code))
          .map((code) => ({
            widget: code,
            displayOrder: existingWidgets.length + 1,
          }));

        newData.groups[groupIndex].groupWidgets = [
          ...existingWidgets,
          ...newWidgets,
        ];
      }

      setStructuredData(newData);
      showSnackbar("Элементы успешно привязаны", "success");
    } catch (error) {
      showSnackbar("Ошибка при привязке элементов", "error");
    }

    setAttachmentDialog({ ...attachmentDialog, open: false });
  };

  // Функция для создания новой сущности
  const handleCreateEntity = useCallback(
    (entityData: EntityCreationData) => {
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
    },
    [structuredData]
  );

  const extractFilters = useCallback((data: StructuredData) => {
    if (!data) return;

    const filterOptions: FilterOption[] = [];
    const valueMap: Record<string, Set<any>> = {};

    // Анализ marketplaces
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
        setLoading(false); // Обязательно отключаем режим загрузки
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
          setJsonData(parsedData);
          setLoading(false); // ← Убедитесь, что эта строчка выполняется
        } catch (err) {
          showSnackbar("Ошибка при чтении файла", "error");
          setLoading(false); // Даже в случае ошибки очистите loading-статус
        }
      } else {
        showSnackbar("Неверный формат файла", "error");
        setLoading(false); // То же самое и здесь
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

  const handleUpdateNode = useCallback(
    (updatedNode: any) => {
      if (!structuredData) return;

      try {
        const pathParts = nodePath.split(".");
        let currentPointer: any = { data: structuredData }; // Обертка для корневого уровня

        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (part.includes("[")) {
            const [arrayName, index] = part.split(/[\]]/).filter(Boolean);
            currentPointer = currentPointer[arrayName][parseInt(index)];
          } else {
            currentPointer = currentPointer[part];
          }
        }

        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart.includes("[")) {
          const [arrayName, index] = lastPart.split(/[\]]/).filter(Boolean);
          currentPointer[arrayName][parseInt(index)] = updatedNode;
        } else {
          currentPointer[lastPart] = updatedNode;
        }

        setStructuredData({ ...structuredData });
        showSnackbar("Узел успешно обновлён", "success");
      } catch (error) {
        showSnackbar("Ошибка при обновлении узла", "error");
      }
    },
    [nodePath, structuredData]
  );

  const handleDownload = () => {
    try {
      if (!structuredData) return;

      // Данные уже в оригинальном формате
      const blob = new Blob([JSON.stringify(structuredData, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "edited_data.json");
      showSnackbar("Файл успешно выгружен", "success");
    } catch (error) {
      showSnackbar("Ошибка при выгрузке файла", "error");
    }
  };

  const transformToOriginal = (
    structuredData: StructuredData | null
  ): StructuredData | null => {
    if (!structuredData) return null;

    const { marketplaces, groups, widgets } = structuredData;

    // Создаём мапы уникальных групп и виджетов
    const uniqueGroups = new Map<string, Group>();
    const uniqueWidgets = new Map<string, Widget>();

    // Добавляем группы и виджеты в мапы
    groups.forEach((group) => uniqueGroups.set(group.code, group));
    widgets.forEach((widget) => uniqueWidgets.set(widget.code, widget));

    // Преобразовываем маркетплейсы
    const transformedMarketplaces: Marketplace[] = marketplaces.map((mp) => {
      const transformedMarketplaceGroups = mp.marketplaceGroups?.map((mg) => ({
        group: mg.group, // Сохраняем ссылку на группу
        displayOrder: mg.displayOrder, // Сохраняем порядок отображения
      }));

      return {
        ...mp,
        marketplaceGroups: transformedMarketplaceGroups,
      };
    });

    // Возвращаем оригинальные группы и виджеты
    const transformedGroups: Group[] = Array.from(uniqueGroups.values());
    const transformedWidgets: Widget[] = Array.from(uniqueWidgets.values());

    return {
      marketplaces: transformedMarketplaces,
      groups: transformedGroups,
      widgets: transformedWidgets,
    };
  };

  const handleResolveConflicts = useCallback(
    (resolution: Resolution) => {
      if (resolution.action === "apply-all") {
        // Применять все изменения глобально
        setStructuredData(transformToOriginal(structuredData));
      } else if (resolution.action === "clone") {
        // Клонирование объекта с заданием нового кода
        const clonedData = JSON.parse(JSON.stringify(structuredData));
        const targetConflict = conflicts.find(
          (c) => c.code === resolution.newCode
        );

        if (targetConflict) {
          switch (targetConflict.type) {
            case "group":
              clonedData.groups.push({
                ...targetConflict.new,
                code: resolution.newCode,
              });
              break;
            case "widget":
              clonedData.widgets.push({
                ...targetConflict.new,
                code: resolution.newCode,
              });
              break;
          }
        }

        setStructuredData(clonedData);
      }

      setOpenConflictDialog(false);
    },
    [structuredData, conflicts]
  );

  const showSnackbar = (
    message: string,
    severity: "info" | "error" | "success" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

    // Применяем фильтрацию
    return applyFilters(structuredData, filters, searchTerm);
  }, [structuredData, filters, searchTerm]);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={80} />
        <Typography variant="h6" style={{ marginLeft: 20 }}>
          Загрузка данных...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ paddingTop: 20, paddingBottom: 20 }}>
      <CreationDialog
        open={creationDialog.open}
        onClose={() => setCreationDialog({ open: false, type: null })}
        onSubmit={handleCreateEntity}
        data={structuredData || { marketplaces: [], groups: [], widgets: [] }}
        type={creationDialog.type}
      />
      {structuredData && (
        <AttachmentDialog
          open={attachmentDialog.open}
          onClose={() =>
            setAttachmentDialog({ ...attachmentDialog, open: false })
          }
          onSubmit={handleAttachItems}
          data={structuredData}
          type={attachmentDialog.type === "marketplace" ? "groups" : "widgets"}
          title={
            attachmentDialog.type === "marketplace"
              ? "Привязать группы к маркетплейсу"
              : "Привязать виджеты к группе"
          }
        />
      )}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JSON Structure Editor
        </Typography>

        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="upload-json"
        />
        <label htmlFor="upload-json">
          <Button variant="contained" component="span">
            Загрузить JSON
          </Button>
        </label>

        {structuredData && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            style={{ marginLeft: 10 }}
          >
            Выгрузить JSON
          </Button>
        )}
      </Box>

      {!structuredData && !loading && (
        <Paper elevation={3} style={{ padding: 20, textAlign: "center" }}>
          <Typography variant="h6">
            Загрузите JSON файл для начала работы
          </Typography>
        </Paper>
      )}

      {structuredData && (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() =>
              setCreationDialog({ open: true, type: "marketplace" })
            }
          >
            + Маркетплейс
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCreationDialog({ open: true, type: "group" })}
          >
            + Группа
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCreationDialog({ open: true, type: "widget" })}
          >
            + Виджет
          </Button>
        </Box>
      )}

      {structuredData && (
        <FilterPanel
          availableFilters={availableFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      )}

      {structuredData && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Paper elevation={3} style={{ height: "80vh", overflow: "auto" }}>
              <JsonTreeView
                data={filteredData}
                onSelectNode={handleSelectNode}
                filters={filters}
                searchTerm={searchTerm}
                onAttachGroups={openAttachmentDialog.bind(null, "marketplace")}
                onAttachWidgets={openAttachmentDialog.bind(null, "group")}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Paper elevation={3} style={{ height: "80vh" }}>
              <JsonEditor
                node={selectedNode}
                path={nodePath}
                onUpdate={handleUpdateNode}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
      <ConflictDialog
        open={openConflictDialog}
        conflicts={conflicts}
        onClose={() => setOpenConflictDialog(false)}
        onResolve={handleResolveConflicts}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
