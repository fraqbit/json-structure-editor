import React from "react";
import { Paper, Typography, Box, IconButton } from "@mui/material";
import { Group, ExpandedWidget } from "../types";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface GroupWidgetsProps {
  group: Group;
  onSelectNode: (node: any, path: string) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  onUnlink?: (type: 'widget', parentCode: string, code: string) => void;
  onCopy?: (obj: any, type: 'marketplace' | 'group' | 'widget') => void;
}

const GroupWidgets: React.FC<GroupWidgetsProps> = React.memo(
  ({ group, onSelectNode, getGroupWidgets, onUnlink, onCopy }) => {
    const widgets = getGroupWidgets(group);

    if (widgets.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет привязанных виджетов
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {widgets.map((widget, index) => (
          <Paper
            key={widget.code || index}
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              cursor: "pointer",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
            onClick={() => onSelectNode(widget, `widgets[${index}]`)}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                {widget.code || `Widget ${index + 1}`}
              </Typography>
              {onUnlink && (
                <IconButton
                  onClick={e => {
                    e.stopPropagation();
                    onUnlink('widget', group.code, widget.code);
                  }}
                  size="small"
                >
                  <span style={{ fontWeight: 'bold', color: 'red' }}>×</span>
                </IconButton>
              )}
              {onCopy && (
                <IconButton
                  onClick={e => {
                    e.stopPropagation();
                    onCopy(widget, 'widget');
                  }}
                  size="small"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            {widget.description && (
              <Typography variant="body2" color="text.secondary">
                {widget.description}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    );
  }
);

export default GroupWidgets; 