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
} from "../types";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";

interface JsonTreeViewProps {
  data: StructuredData;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  getInitialMarketplaceLinks?: (mp: Marketplace) => Marketplace[]; // New prop for initial marketplace links
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  onSelectNode,
  onAttachGroups,
  onAttachWidgets,
  getMarketplaceGroups,
  getGroupWidgets,
  getInitialMarketplaceLinks,
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
              getInitialMarketplaceLinks={getInitialMarketplaceLinks}
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
  getInitialMarketplaceLinks?: (mp: Marketplace) => Marketplace[];
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
    getGroupWidgets,
    getInitialMarketplaceLinks,
  }) => {
    const isInitialMarketplace = mp.isInitial;
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
                { mp.code || `Marketplace ${index + 1}`}
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
              {!mp.isInitial && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttachGroups(mp);
                  }}
                  size="small"
                >
                  <AddLinkIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </AccordionSummary>
          {isExpanded && (
            <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
              {isInitialMarketplace ? (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Привязанные витрины
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {marketplaceGroups.map((linkedMp, linkedIndex) => (
                      <Paper
                        key={linkedMp.code || linkedIndex}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                {linkedMp.code || `Marketplace ${linkedIndex + 1}`}
                              </Typography>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNode(
                                    linkedMp,
                                    `marketplaces[${index}].settingMarketplaces[${linkedIndex}]`
                                  );
                                }}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              Группы на витрине
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              {getMarketplaceGroups((linkedMp as unknown) as Marketplace).map((group, groupIndex) => (
                                <Paper
                                  key={group.code || groupIndex}
                                  elevation={0}
                                  sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                        }}
                                      >
                                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                          {group.code || `Group ${groupIndex + 1}`}
                                        </Typography>
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectNode(
                                              group,
                                              `marketplaces[${index}].settingMarketplaces[${linkedIndex}].marketplaceGroups[${groupIndex}]`
                                            );
                                          }}
                                          size="small"
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onAttachWidgets(group);
                                          }}
                                          size="small"
                                        >
                                          <AddLinkIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                      >
                                        Виджеты
                                      </Typography>
                                      <GroupWidgets
                                        group={group}
                                        onSelectNode={onSelectNode}
                                        getGroupWidgets={getGroupWidgets}
                                      />
                                    </AccordionDetails>
                                  </Accordion>
                                </Paper>
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Paper>
                    ))}
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Группы на витрине
                  </Typography>
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
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                {group.code || `Group ${groupIndex + 1}`}
                              </Typography>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNode(
                                    group,
                                    `marketplaces[${index}].marketplaceGroups[${groupIndex}]`
                                  );
                                }}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAttachWidgets(group);
                                }}
                                size="small"
                              >
                                <AddLinkIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              Виджеты
                            </Typography>
                            <GroupWidgets
                              group={group}
                              onSelectNode={onSelectNode}
                              getGroupWidgets={getGroupWidgets}
                            />
                          </AccordionDetails>
                        </Accordion>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}
            </AccordionDetails>
          )}
        </Accordion>
      </Paper>
    );
  }
);

interface LinkedMarketplacesProps {
  marketplaces: Marketplace[];
  onSelectNode: (node: any, path: string) => void;
}

const LinkedMarketplaces: React.FC<LinkedMarketplacesProps> = React.memo(
  ({ marketplaces, onSelectNode }) => {
    if (marketplaces.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Нет привязанных витрин
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {marketplaces.map((marketplace, index) => (
          <Paper
            key={marketplace.code || index}
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
            onClick={() => onSelectNode(marketplace, `marketplaces[${index}]`)}
          >
            <Typography variant="subtitle2">
              {marketplace.title || marketplace.code || `Marketplace ${index + 1}`}
            </Typography>
            {marketplace.description && (
              <Typography variant="body2" color="text.secondary">
                {marketplace.description}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    );
  }
);

interface MarketplaceGroupsProps {
  marketplaceGroups: ExpandedGroup[];
  mpIndex: number;
  onSelectNode: (node: any, path: string) => void;
  onAttachWidgets: (group: Group) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
}

const MarketplaceGroups: React.FC<MarketplaceGroupsProps> = React.memo(
  ({
    marketplaceGroups,
    mpIndex,
    onSelectNode,
    onAttachWidgets,
    getGroupWidgets,
    getMarketplaceGroups,
  }) => {
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
      {}
    );

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
            Нет привязанных элементов
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {marketplaceGroups.map((group, index) => {
          const isMarketplace = 'title' in group && 'description' in group;
          if (isMarketplace) {
            // This is a marketplace, render its groups
            const marketplace = group as unknown as Marketplace;
            const nestedGroups = getMarketplaceGroups(marketplace);
            return (
              <Paper
                key={marketplace.code || index}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Accordion
                  expanded={expandedGroups[index]}
                  onChange={() => handleToggleGroup(index)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", width: "100%" }}
                    >
                      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                        {marketplace.code || `Marketplace ${index + 1}`}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(
                            marketplace,
                            `marketplaces[${mpIndex}].settingMarketplaces[${index}]`
                          );
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  {expandedGroups[index] && (
                    <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Группы на витрине
                      </Typography>
                      <MarketplaceGroups
                        marketplaceGroups={nestedGroups}
                        mpIndex={index}
                        onSelectNode={onSelectNode}
                        onAttachWidgets={onAttachWidgets}
                        getGroupWidgets={getGroupWidgets}
                        getMarketplaceGroups={getMarketplaceGroups}
                      />
                    </AccordionDetails>
                  )}
                </Accordion>
              </Paper>
            );
          } else {
            // This is a group, render its widgets
            const expandedGroup = group as ExpandedGroup;
            const widgets = getGroupWidgets(expandedGroup);
            return (
              <Paper
                key={expandedGroup.code || index}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Accordion
                  expanded={expandedGroups[index]}
                  onChange={() => handleToggleGroup(index)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", width: "100%" }}
                    >
                      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                        {expandedGroup.code || `Group ${index + 1}`}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(
                            expandedGroup,
                            `marketplaces[${mpIndex}].marketplaceGroups[${index}]`
                          );
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onAttachWidgets(expandedGroup);
                        }}
                        size="small"
                      >
                        <AddLinkIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  {expandedGroups[index] && (
                    <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
                      <GroupWidgets
                        group={expandedGroup}
                        onSelectNode={onSelectNode}
                        getGroupWidgets={getGroupWidgets}
                      />
                    </AccordionDetails>
                  )}
                </Accordion>
              </Paper>
            );
          }
        })}
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
            <Typography variant="subtitle2">
              {widget.code || `Widget ${index + 1}`}
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
