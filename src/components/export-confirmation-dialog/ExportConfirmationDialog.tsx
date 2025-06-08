// components/ExportConfirmationDialog.tsx
import React from "react";
import { Button, Typography, Box, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Chip } from "@mui/material";
import { Warning as WarningIcon, Info as InfoIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { ValidationError } from "../types";
import BaseDialog from "../common/BaseDialog";

interface ChangeItem {
  type: "marketplace" | "group" | "widget" | "relation";
  code: string;
  action: "added" | "modified" | "deleted";
  details?: string;
}

interface ExportConfirmationDialogProps {
  open: boolean;
  errors: ValidationError[];
  changes: ChangeItem[];
  onCancel: () => void;
  onConfirm: () => void;
}

const ExportConfirmationDialog: React.FC<ExportConfirmationDialogProps> = ({
  open,
  errors,
  changes,
  onCancel,
  onConfirm,
}) => {
  const [tabValue, setTabValue] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const getChangeIcon = (action: string) => {
    switch (action) {
      case "added": return <AddIcon color="success" />;
      case "modified": return <EditIcon color="info" />;
      case "deleted": return <DeleteIcon color="error" />;
      default: return <InfoIcon />;
    }
  };
  return (
    <BaseDialog
      open={open}
      title={<>
        Подтверждение выгрузки
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Chip label={`${errors.length} ошибок`} color={errors.length ? "error" : "success"} size="small" />
          <Chip label={`${changes.length} изменений`} color="info" size="small" />
        </Box>
      </>}
      onClose={onCancel}
      actions={[
        <Button key="cancel" onClick={onCancel}>Отмена</Button>,
        <Button key="confirm" onClick={onConfirm} variant="contained" color={errors.length ? "warning" : "primary"} startIcon={errors.length ? <WarningIcon /> : undefined}>
          {errors.length ? "Выгрузить с ошибками" : "Подтвердить выгрузку"}
        </Button>,
      ]}
      maxWidth="md"
      fullWidth
    >
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Ошибки валидации" />
        <Tab label="Список изменений" />
        <Tab label="Сводка" />
      </Tabs>
      <Box sx={{ pt: 2 }}>
        {tabValue === 0 && (errors.length > 0 ? (
          <List dense>
            {errors.map((error, index) => (
              <ListItem key={index}>
                <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                <ListItemText primary={error.message} secondary={error.path} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="success.main" sx={{ p: 2 }}>Ошибок валидации не обнаружено</Typography>
        ))}
        {tabValue === 1 && (changes.length > 0 ? (
          <List dense>
            {changes.map((change, index) => (
              <ListItem key={index}>
                <ListItemIcon>{getChangeIcon(change.action)}</ListItemIcon>
                <ListItemText primary={`${change.type}: ${change.code}`} secondary={change.action} />
                {change.details && <Typography variant="body2" color="text.secondary">{change.details}</Typography>}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>Изменений не обнаружено</Typography>
        ))}
        {tabValue === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Статистика:</Typography>
            <Typography>• Ошибок валидации: {errors.length}</Typography>
            <Typography>• Добавлено: {changes.filter((c) => c.action === "added").length}</Typography>
            <Typography>• Изменено: {changes.filter((c) => c.action === "modified").length}</Typography>
            <Typography>• Удалено: {changes.filter((c) => c.action === "deleted").length}</Typography>
            {errors.length > 0 && <Typography color="error" sx={{ mt: 2 }}>Внимание: файл содержит ошибки валидации!</Typography>}
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default ExportConfirmationDialog;
