import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import {
  StructuredData,
  Marketplace,
  Group,
  ExpandedGroup,
  ExpandedWidget,
} from "./types";
import AddLinkIcon from "@mui/icons-material/AddLink";

interface JsonTreeViewProps {
  data: StructuredData;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
}

interface RowComponentProps {
  isExpanded: boolean;
  handleToggleMarketplace: (index: number) => void;
  index: number;
  mp: Marketplace;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  onSelectNode,
  onAttachGroups,
  onAttachWidgets,
  getMarketplaceGroups,
  getGroupWidgets
}) => {
  const [expandedMarketplaces, setExpandedMarketplaces] = useState<
    Record<number, boolean>
  >({});

  const handleToggleMarketplace = useCallback((index: number) => {
    setExpandedMarketplaces((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Список витрин ({data.marketplaces.length})
      </Typography>

      {data.marketplaces.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {data.marketplaces.map((mp, index) => (
            <RowComponent
              key={mp.code || index}
              index={index}
              isExpanded={expandedMarketplaces[index]}
              handleToggleMarketplace={handleToggleMarketplace}
              mp={mp}
              onSelectNode={onSelectNode}
              onAttachGroups={onAttachGroups}
              onAttachWidgets={onAttachWidgets}
              getMarketplaceGroups={getMarketplaceGroups}
              getGroupWidgets={getGroupWidgets}
            />
          ))}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{ p: 3, textAlign: "center", bgcolor: "background.default" }}
        >
          <Typography color="text.secondary">
            Нет витрин, соответствующих выбранным фильтрам
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

interface RowComponentProps {
  isExpanded: boolean;
  handleToggleMarketplace: (index: number) => void;
  index: number;
  mp: Marketplace;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
}

const RowComponent: React.FC<RowComponentProps> = React.memo(
  ({
    isExpanded,
    handleToggleMarketplace,
    index,
    mp,
    onSelectNode,
    onAttachGroups,
    onAttachWidgets,
    getMarketplaceGroups,
    getGroupWidgets
  }) => {
    // Получаем расширенные группы для маркетплейса
    const marketplaceGroups = getMarketplaceGroups(mp);

    return (
      <Paper elevation={2} sx={{ mb: 1 }}>
        <Accordion
          expanded={isExpanded}
          onChange={() => handleToggleMarketplace(index)}
          sx={{
            "&:before": { display: "none" },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "4px !important",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography fontWeight="medium" sx={{ flexGrow: 1 }}>
                {mp.code || `Marketplace ${index + 1}`}
              </Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(mp, `marketplaces[${index}]`);
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onAttachGroups(mp);
                }}
                size="small"
              >
                <AddLinkIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Группы на витрине
            </Typography>
            <MarketplaceGroups
              marketplaceGroups={marketplaceGroups}
              mpIndex={index}
              onSelectNode={onSelectNode}
              onAttachWidgets={onAttachWidgets}
              getGroupWidgets={getGroupWidgets}
            />
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  }
);

interface MarketplaceGroupsProps {
  marketplaceGroups: ExpandedGroup[];
  mpIndex: number;
  onSelectNode: (node: any, path: string) => void;
  onAttachWidgets: (group: Group) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
}

const MarketplaceGroups: React.FC<MarketplaceGroupsProps> = React.memo(
  ({ marketplaceGroups, mpIndex, onSelectNode, onAttachWidgets, getGroupWidgets }) => {
    const [expandedGroups, setExpandedGroups] = useState<
      Record<number, boolean>
    >({});

    const handleToggleGroup = (index: number) => {
      setExpandedGroups((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    if (marketplaceGroups.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет групп в этом маркетплейсе
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {marketplaceGroups.map((group, groupIndex) => (
          <Paper
            key={group.code || groupIndex}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Accordion
              expanded={expandedGroups[groupIndex]}
              onChange={() => handleToggleGroup(groupIndex)}
              sx={{
                bgcolor: "background.paper",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {group.code || `Group ${groupIndex + 1}`}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(
                        group,
                        `groups[${groupIndex}]`
                      );
                    }}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onAttachWidgets(group as unknown as Group);
                    }}
                    size="small"
                  >
                    <AddLinkIcon fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Виджеты в группе
                </Typography>
                <GroupWidgets
                  group={group as unknown as Group}
                  onSelectNode={onSelectNode}
                  getGroupWidgets={getGroupWidgets}
                />
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))}
      </Box>
    );
  }
);

interface GroupWidgetsProps {
  group: Group;
  onSelectNode: (node: any, path: string) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
}

const GroupWidgets: React.FC<GroupWidgetsProps> = React.memo(
  ({ group, onSelectNode, getGroupWidgets }) => {
    const widgets = getGroupWidgets(group);

    if (!widgets || widgets.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет виджетов в этой группе
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {widgets.map((widget, widgetIndex) => (
          <Paper
            key={widget.code || widgetIndex}
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
            onClick={() =>
              onSelectNode(
                widget,
                `widgets[${widgetIndex}]`
              )
            }
          >
            <Typography variant="subtitle2">
              {widget.code || `Widget ${widgetIndex + 1}`}
            </Typography>
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

export default JsonTreeView;