import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { Conflict, Resolution } from './types';

interface ConflictDialogProps {
  open: boolean;
  conflicts: Conflict[];
  onClose: () => void;
  onResolve: (resolution: Resolution) => void;
}

const ConflictDialog: React.FC<ConflictDialogProps> = ({ 
  open, 
  conflicts, 
  onClose, 
  onResolve 
}) => {
  const [resolution, setResolution] = useState<Omit<Resolution, 'affectedItems'>>({
    action: 'apply-all',
    newCode: ''
  });
  const [affectedItems, setAffectedItems] = useState<string[]>([]);

  const handleActionSelect = (action: 'apply-all' | 'clone') => {
    setResolution(prev => ({
      ...prev,
      action,
      newCode: action === 'clone' ? prev.newCode : ''
    }));
    setAffectedItems([]);
  };

  const handleToggleAffectedItem = (itemId: string) => {
    setAffectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleResolve = () => {
    if (resolution.action === 'clone' && !resolution.newCode) {
      return;
    }
    
    onResolve({
      ...resolution,
      affectedItems: resolution.action === 'apply-all' 
        ? conflicts.flatMap(c => c.usedIn.map(i => i.code))
        : affectedItems
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Resolve Conflicts</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Found {conflicts.length} conflict(s) in your data. Please choose how to resolve them:
        </Typography>
        
        {conflicts.map((conflict, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {conflict.type === 'group' ? 'Group' : 'Widget'} conflict: <strong>{conflict.code}</strong>
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <Typography variant="body2" color="text.secondary">
                  Existing value:
                </Typography>
                <Box sx={{ 
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  maxHeight: 150,
                  overflow: 'auto'
                }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                    {JSON.stringify(conflict.existing, null, 2)}
                  </pre>
                </Box>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="text.secondary">
                  New value:
                </Typography>
                <Box sx={{ 
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  maxHeight: 150,
                  overflow: 'auto'
                }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                    {JSON.stringify(conflict.new, null, 2)}
                  </pre>
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              Used in:
            </Typography>
            <Grid container spacing={1}>
              {conflict.usedIn.map((item, i) => (
                <Grid size={{ xs: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          resolution.action === 'apply-all' || 
                          affectedItems.includes(item.code)
                        }
                        onChange={() => handleToggleAffectedItem(item.code)}
                        disabled={resolution.action === 'apply-all'}
                      />
                    }
                    label={item.name || item.title || item.code || `${conflict.type} ${i + 1}`}
                  />
                </Grid>
              ))}
            </Grid>
            
            {index < conflicts.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Resolution method:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{xs: 6}}>
              <Button
                variant={resolution.action === 'apply-all' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleActionSelect('apply-all')}
              >
                Apply to all
              </Button>
            </Grid>
            <Grid size={{xs: 6}}>
              <Button
                variant={resolution.action === 'clone' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleActionSelect('clone')}
              >
                Create clone
              </Button>
            </Grid>
          </Grid>
          
          {resolution.action === 'clone' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="New code"
                value={resolution.newCode || ''}
                onChange={(e) => setResolution(prev => ({
                  ...prev,
                  newCode: e.target.value
                }))}
                fullWidth
                error={!resolution.newCode}
                helperText={!resolution.newCode ? 'Please enter a new code' : ''}
              />
            </Box>
          )}
        </Box>
        
        {resolution.action === 'clone' && affectedItems.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please select at least one item to apply the clone to
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleResolve}
          disabled={
            (resolution.action === 'clone' && 
             (!resolution.newCode || affectedItems.length === 0)) ||
            !resolution.action
          }
          variant="contained"
        >
          Apply Resolution
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictDialog;