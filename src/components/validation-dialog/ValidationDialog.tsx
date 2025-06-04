// components/ValidationErrorsDialog.tsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    Chip
} from '@mui/material';
import {StructuredData, ValidationError} from '../types';
import saveAs from 'file-saver';

interface ValidationErrorsDialogProps {
    open: boolean;
    errors: ValidationError[];
    data: StructuredData
    onClose: () => void;
}

export const ValidationErrorsDialog: React.FC<ValidationErrorsDialogProps> = ({
                                                                                  open,
                                                                                  errors,
                                                                                  onClose,
    data
                                                                              }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Ошибки валидации
                <Chip
                    label={`${errors.length} ошибок`}
                    color="error"
                    size="small"
                    sx={{ ml: 2 }}
                />
            </DialogTitle>
            <DialogContent dividers>
                <List dense>
                    {errors.map((error, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={error.message}
                                secondary={error.path}
                                primaryTypographyProps={{ color: 'error.main' }}
                            />
                            <Chip
                                label={error.type === 'schema' ? 'Схема' : 'Связи'}
                                size="small"
                                variant="outlined"
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
                <Button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(data, null, 2)], {
                            type: 'application/json'
                        });
                        saveAs(blob, "edited_data.json");
                    }}
                >
                    Скачать структуру
                </Button>
                <Button
                    onClick={() => {
                        // Можно добавить экспорт ошибок
                        const blob = new Blob([JSON.stringify(errors, null, 2)], {
                            type: 'application/json'
                        });
                        saveAs(blob, 'validation_errors.json');
                    }}
                >
                    Экспорт ошибок
                </Button>
            </DialogActions>
        </Dialog>
    );
};
