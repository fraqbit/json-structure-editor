import React, { useState, useEffect } from "react";
import { TextField, Box, Typography, Autocomplete, Chip, Tabs, Tab, FormControlLabel, Switch, Button, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { EntityCreationData } from "../types";
import BaseDialog from "../common/BaseDialog";

interface CreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EntityCreationData) => void;
  type: "marketplace" | "group" | "widget" | null;
  actualGroups: string[];
  actualWidgets: string[];
  actualMarketplaces?: { code: string; isInitial?: boolean }[];
}

const CreationDialog: React.FC<CreationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  actualGroups,
  actualWidgets,
  actualMarketplaces = [],
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [jsonInput, setJsonInput] = useState<string>("");
  const [isJsonMode, setIsJsonMode] = useState<boolean>(true);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Для выбора marketplace с isInitial === false
  const availableMarketplaces = actualMarketplaces.filter(mp => mp.isInitial === false).map(mp => mp.code);

  useEffect(() => {
    if (open) {
      setFormData({});
      setSelectedGroups([]);
      setSelectedWidgets([]);
      setSelectedMarketplaces([]);
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
        if (type === "marketplace" && parsed.settingMarketplaces) {
          setSelectedMarketplaces(parsed.settingMarketplaces.map((m: any) => m.marketplace));
        }
        if (type === "group" && parsed.groupWidgets) {
          setSelectedWidgets(parsed.groupWidgets.map((w: any) => w.widget));
        }
      } catch (err) {
        setJsonError("Невалидный JSON");
      }
    }
  }, [jsonInput, isJsonMode, type]);

  const handleModeChange = () => setIsJsonMode(!isJsonMode);
  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => setJsonInput(e.target.value);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = () => {
    const entityData: EntityCreationData = {
      type: type!,
      code: formData.code || "",
      ...formData,
    };
    if (type === "marketplace") {
      if (formData.isInitial === true || formData.isInitial === "true") {
        entityData.settingMarketplaces = selectedMarketplaces.map((marketplace) => ({ marketplace, displayOrder: 0 }));
      } else {
        entityData.marketplaceGroups = selectedGroups.map((group) => ({ group, displayOrder: 0 }));
      }
    }
    if (type === "group") {
      entityData.groupWidgets = selectedWidgets.map((widget) => ({ widget, displayOrder: 0 }));
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
          placeholder={`Введите данные в формате JSON, например:\n${JSON.stringify({ code: "example", title: "Пример", description: "Описание" }, null, 2)}`}
        />
      );
    }
    switch (type) {
      case "marketplace":
        const isInitial = formData.isInitial === true || formData.isInitial === "true";
        return (
          <>
            <TextField fullWidth label="code" name="code" value={formData.code || ""} onChange={handleChange} margin="normal" required size="small" />
            <TextField fullWidth label="title" name="title" value={formData.title || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="description" name="description" value={formData.description || ""} onChange={handleChange} margin="normal" multiline size="small" />
            <TextField fullWidth label="name" name="name" value={formData.name || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="channel" name="channel" value={formData.channel || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="headerViewTypeCode" name="headerViewTypeCode" value={formData.headerViewTypeCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="headerBackImage" name="headerBackImage" value={formData.headerBackImage || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="headerBackStyleCode" name="headerBackStyleCode" value={formData.headerBackStyleCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="sortingParameter" name="sortingParameter" value={formData.sortingParameter || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="filteringParameter" name="filteringParameter" value={formData.filteringParameter || ""} onChange={handleChange} margin="normal" size="small" />
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="isInitial-label">isInitial</InputLabel>
              <Select
                labelId="isInitial-label"
                name="isInitial"
                value={typeof formData.isInitial === "boolean" ? String(formData.isInitial) : "false"}
                label="isInitial"
                onChange={e => handleSelectChange("isInitial", e.target.value === "true")}
              >
                <MenuItem value={"true"}>true</MenuItem>
                <MenuItem value={"false"}>false</MenuItem>
              </Select>
            </FormControl>
            {isInitial ? (
              <Autocomplete
                multiple
                options={availableMarketplaces}
                value={selectedMarketplaces}
                onChange={(_, v) => setSelectedMarketplaces(v)}
                renderInput={(params) => <TextField {...params} label="Витрины (marketplace) для привязки" margin="normal" />}
              />
            ) : (
              <Autocomplete
                multiple
                options={actualGroups}
                value={selectedGroups}
                onChange={(_, v) => setSelectedGroups(v)}
                renderInput={(params) => <TextField {...params} label="Группы" margin="normal" />}
              />
            )}
          </>
        );
      case "group":
        return (
          <>
            <TextField fullWidth label="code" name="code" value={formData.code || ""} onChange={handleChange} margin="normal" required size="small" />
            <TextField fullWidth label="title" name="title" value={formData.title || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="name" name="name" value={formData.name || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="viewTypeCode" name="viewTypeCode" value={formData.viewTypeCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="channel" name="channel" value={formData.channel || ""} onChange={handleChange} margin="normal" size="small" />
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="bhb120-label">bhb120</InputLabel>
              <Select
                labelId="bhb120-label"
                name="bhb120"
                value={typeof formData.bhb120 === "boolean" ? String(formData.bhb120) : "false"}
                label="bhb120"
                onChange={e => setFormData(prev => ({ ...prev, bhb120: e.target.value === "true" }))}
              >
                <MenuItem value={"true"}>true</MenuItem>
                <MenuItem value={"false"}>false</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="categoryCode" name="categoryCode" value={formData.categoryCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="widgetViewTypeCode" name="widgetViewTypeCode" value={formData.widgetViewTypeCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="widgetBackStyleCode" name="widgetBackStyleCode" value={formData.widgetBackStyleCode || ""} onChange={handleChange} margin="normal" size="small" />
            <Autocomplete multiple options={actualWidgets} value={selectedWidgets} onChange={(_, v) => setSelectedWidgets(v)} renderInput={(params) => <TextField {...params} label="Виджеты" margin="normal" />} />
          </>
        );
      case "widget":
        return (
          <>
            <TextField fullWidth label="code" name="code" value={formData.code || ""} onChange={handleChange} margin="normal" required size="small" />
            <TextField fullWidth label="title" name="title" value={formData.title || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="name" name="name" value={formData.name || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="description" name="description" value={formData.description || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="categoryCode" name="categoryCode" value={formData.categoryCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="channel" name="channel" value={formData.channel || ""} onChange={handleChange} margin="normal" size="small" />
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="bhb120-label-widget">bhb120</InputLabel>
              <Select
                labelId="bhb120-label-widget"
                name="bhb120"
                value={typeof formData.bhb120 === "boolean" ? String(formData.bhb120) : "false"}
                label="bhb120"
                onChange={e => setFormData(prev => ({ ...prev, bhb120: e.target.value === "true" }))}
              >
                <MenuItem value={"true"}>true</MenuItem>
                <MenuItem value={"false"}>false</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="icon" name="icon" value={formData.icon || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="underDescription" name="underDescription" value={formData.underDescription || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="productBackStyleCode" name="productBackStyleCode" value={formData.productBackStyleCode || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="actions" name="actions" value={formData.actions || ""} onChange={handleChange} margin="normal" size="small" />
            <TextField fullWidth label="properties" name="properties" value={formData.properties || ""} onChange={handleChange} margin="normal" size="small" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <BaseDialog
      open={open}
      title={type ? `Создать ${type}` : "Создать"}
      onClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose}>Отмена</Button>,
        <Button key="submit" onClick={handleSubmit} variant="contained">Создать</Button>,
        <Button key="mode" onClick={handleModeChange} color="secondary">{isJsonMode ? "Форма" : "JSON"}</Button>,
      ]}
      maxWidth="sm"
      fullWidth
    >
      {renderFormFields()}
    </BaseDialog>
  );
};

export default CreationDialog;
