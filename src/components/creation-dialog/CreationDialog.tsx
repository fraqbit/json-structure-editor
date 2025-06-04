import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Autocomplete,
    Chip,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
} from "@mui/material";
import {EntityCreationData, Group, Widget} from "../types";

interface CreationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: EntityCreationData) => void;
    type: "marketplace" | "group" | "widget" | null;
    actualGroups: string[]
    actualWidgets: string[]
}


const CreationDialog: React.FC<CreationDialogProps> = ({
                                                          open,
                                                          onClose,
                                                          onSubmit,
                                                          type,
    actualGroups, actualWidgets
                                                      }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
    const [jsonInput, setJsonInput] = useState<string>("");
    const [isJsonMode, setIsJsonMode] = useState<boolean>(true);
    const [jsonError, setJsonError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFormData({});
            setSelectedGroups([]);
            setSelectedWidgets([]);
            setJsonInput("");
            setJsonError(null);
        }
    }, [open, type]);

    useEffect(() => {
        if (isJsonMode && jsonInput) {
            try {
                const parsed = JSON.parse(jsonInput);
                setFormData(parsed);
                setJsonError(null);

                if (type === "marketplace" && parsed.marketplaceGroups) {
                    setSelectedGroups(parsed.marketplaceGroups.map((g: any) => g.group));
                }

                if (type === "group" && parsed.groupWidgets) {
                    setSelectedWidgets(parsed.groupWidgets.map((w: any) => w.widget));
                }
            } catch (err) {
                setJsonError("Невалидный JSON");
            }
        }
    }, [jsonInput, isJsonMode, type]);

    const handleModeChange = () => {
        setIsJsonMode(!isJsonMode);
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJsonInput(e.target.value);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const entityData: EntityCreationData = {
            type: type!,
            code: formData.code || "",
            ...formData,
        };

        if (type === "marketplace") {
            entityData.marketplaceGroups = selectedGroups.map((group) => ({
                group,
                displayOrder: 0,
            }));
        }

        if (type === "group") {
            entityData.groupWidgets = selectedWidgets.map((widget) => ({
                widget,
                displayOrder: 0,
            }));
        }

        onSubmit(entityData);
        onClose();
    };

    const renderFormFields = () => {
        if (isJsonMode) {
            return (
                <TextField
                    fullWidth
                    label="JSON данные"
                    name="json"
                    value={jsonInput}
                    onChange={handleJsonChange}
                    margin="normal"
                    multiline
                    rows={12}
                    error={!!jsonError}
                    helperText={jsonError}
                    placeholder={`Введите данные в формате JSON, например:\n${JSON.stringify({
                        code: "example",
                        title: "Пример",
                        description: "Описание",
                        // другие поля в зависимости от типа
                    }, null, 2)}`}
                />
            );
        }

        switch (type) {
            case "marketplace":
        return (
          <>
            <TextField
              fullWidth
              label="code"
              name="code"
              value={formData.code || ""}
              onChange={handleChange}
              margin="normal"
              required
              size="small"
            />
            <TextField
              fullWidth
              label="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="name"
              name="name"
              value={formData.name || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="channel"
              name="channel"
              value={formData.channel || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="headerViewTypeCode"
              name="headerViewTypeCode"
              value={formData.headerViewTypeCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="headerBackImage"
              name="headerBackImage"
              value={formData.headerBackImage || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="headerBackStyleCode"
              name="headerBackStyleCode"
              value={formData.headerBackStyleCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="sortingParameter"
              name="sortingParameter"
              value={formData.sortingParameter || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="filteringParameter"
              name="filteringParameter"
              value={formData.filteringParameter || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="isInitial"
              name="isInitial"
              value={formData.isInitial || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Добавить группы
            </Typography>
            <Autocomplete
              multiple
              options={actualGroups}
              value={selectedGroups}
              onChange={(_, value) => setSelectedGroups(value)}
              renderInput={(params) => (
                <TextField {...params} label="Выберите группы" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </>
        );

      case "group":
        return (
          <>
            <TextField
              fullWidth
              label="code"
              name="code"
              value={formData.code || ""}
              onChange={handleChange}
              margin="normal"
              required
              size="small"
            />
            <TextField
              fullWidth
              label="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="name"
              name="name"
              value={formData.name || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="channel"
              name="channel"
              value={formData.channel || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="bhb120"
              name="bhb120"
              value={formData.bhb120 || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="viewTypeCode"
              name="viewTypeCode"
              value={formData.viewTypeCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="categoryCode"
              name="categoryCode"
              value={formData.categoryCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="widgetViewTypeCode"
              name="widgetViewTypeCode"
              value={formData.widgetViewTypeCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="widgetBackStyleCode"
              name="widgetBackStyleCode"
              value={formData.widgetBackStyleCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Добавить виджеты
            </Typography>
            <Autocomplete
              multiple
              options={actualWidgets}
              value={selectedWidgets}
              onChange={(_, value) => setSelectedWidgets(value)}
              renderInput={(params) => (
                <TextField {...params} label="Выберите виджеты" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />
          </>
        );

      case "widget":
        return (
          <>
            <TextField
              fullWidth
              label="code"
              name="code"
              value={formData.code || ""}
              onChange={handleChange}
              margin="normal"
              required
              size="small"
            />
            <TextField
              fullWidth
              label="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="name"
              name="name"
              value={formData.name || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="channel"
              name="channel"
              value={formData.channel || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />

            <TextField
              fullWidth
              label="bhb120"
              name="bhb120"
              value={formData.bhb120 || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="categoryCode"
              name="categoryCode"
              value={formData.categoryCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="icon"
              name="icon"
              value={formData.icon || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="underDescription"
              name="underDescription"
              value={formData.underDescription || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="productBackStyleCode"
              name="productBackStyleCode"
              value={formData.productBackStyleCode || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
            />
            <TextField
              fullWidth
              label="actions"
              name="actions"
              value={formData.actions || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
              rows={3}
            />
            <TextField
              fullWidth
              label="properties"
              name="properties"
              value={formData.properties || null}
              onChange={handleChange}
              margin="normal"
              multiline
              size="small"
              rows={3}
            />
          </>
        );

      default:
        return null;
    }
  };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {type === "marketplace" && "Создать новый маркетплейс"}
                {type === "group" && "Создать новую группу"}
                {type === "widget" && "Создать новый виджет"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isJsonMode}
                                onChange={handleModeChange}
                                color="primary"
                            />
                        }
                        label={isJsonMode ? "Режим JSON" : "Ручной ввод"}
                    />
                </Box>
                <Box sx={{ mt: 1 }}>{renderFormFields()}</Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.code || !!jsonError}
                >
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreationDialog;
