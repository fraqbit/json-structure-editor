import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import { StructuredData, EntityCreationData } from './types';

interface CreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EntityCreationData) => void;
  data: StructuredData;
  type: 'marketplace' | 'group' | 'widget' | null;
}

const CreationDialog: React.FC<CreationDialogProps> = ({ 
  open, 
  onClose, 
  onSubmit,
  data,
  type
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  useEffect(() => {
    // Сброс формы при открытии
    if (open) {
      setFormData({});
      setSelectedGroups([]);
      setSelectedWidgets([]);
    }
  }, [open, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const entityData: EntityCreationData = {
      type: type!,
      code: formData.code || '',
      ...formData
    };

    if (type === 'marketplace') {
      entityData.marketplaceGroups = selectedGroups.map(group => ({
        group,
        displayOrder: 0 // Порядок по умолчанию
      }));
    }

    if (type === 'group') {
      entityData.groupWidgets = selectedWidgets.map(widget => ({
        widget,
        displayOrder: 0 // Порядок по умолчанию
      }));
    }

    onSubmit(entityData);
    onClose();
  };

  const renderFormFields = () => {
    switch (type) {
      case 'marketplace':
        return (
          <>
            <TextField
              fullWidth
              label="Код маркетплейса"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Название"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Добавить группы
            </Typography>
            <Autocomplete
              multiple
              options={data.groups.map(g => g.code)}
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
      
      case 'group':
        return (
          <>
            <TextField
              fullWidth
              label="Код группы"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Название"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Тип отображения"
              name="viewTypeCode"
              value={formData.viewTypeCode || ''}
              onChange={handleChange}
              margin="normal"
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Добавить виджеты
            </Typography>
            <Autocomplete
              multiple
              options={data.widgets.map(w => w.code)}
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
      
      case 'widget':
        return (
          <>
            <TextField
              fullWidth
              label="Код виджета"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Название"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Описание"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Категория"
              name="categoryCode"
              value={formData.categoryCode || ''}
              onChange={handleChange}
              margin="normal"
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
        {type === 'marketplace' && 'Создать новый маркетплейс'}
        {type === 'group' && 'Создать новую группу'}
        {type === 'widget' && 'Создать новый виджет'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {renderFormFields()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.code}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreationDialog;