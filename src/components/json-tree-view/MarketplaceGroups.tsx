import React, { useState } from "react";
import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { Marketplace, Group, ExpandedGroup, ExpandedWidget } from "../types";
import GroupWidgets from "./GroupWidgets";

interface MarketplaceGroupsProps {
  marketplaceGroups: ExpandedGroup[];
  mpIndex: number;
  parentMarketplaceCode: string;
  onSelectNode: (node: any, path: string) => void;
  onAttachWidgets: (group: Group) => void;
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  onUnlink?: (type: 'marketplace' | 'group' | 'widget', parentCode: string, code: string) => void;
}

const MarketplaceGroups: React.FC<MarketplaceGroupsProps> = React.memo(
  ({
    marketplaceGroups,
    mpIndex,
    parentMarketplaceCode,
    onSelectNode,
    onAttachWidgets,
    getGroupWidgets,
    getMarketplaceGroups,
    onUnlink,
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
                      <Typography variant="subtitle2" sx={{ flexGrow: 1, userSelect: 'text' }}>
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
                        sx={{ mb: 1, userSelect: 'text' }}
                      >
                        Группы на витрине
                      </Typography>
                      <MarketplaceGroups
                        marketplaceGroups={nestedGroups}
                        mpIndex={index}
                        parentMarketplaceCode={marketplace.code}
                        onSelectNode={onSelectNode}
                        onAttachWidgets={onAttachWidgets}
                        getGroupWidgets={getGroupWidgets}
                        getMarketplaceGroups={getMarketplaceGroups}
                        onUnlink={onUnlink}
                      />
                    </AccordionDetails>
                  )}
                </Accordion>
              </Paper>
            );
          } else {
            // This is a group, render its widgets
            const expandedGroup = group as ExpandedGroup;
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
                      <Typography variant="subtitle2" sx={{ flexGrow: 1, WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text',
                          userSelect: 'text !important' }}>
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
                      {onUnlink && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnlink('group', parentMarketplaceCode, expandedGroup.code);
                          }}
                          size="small"
                        >
                          <span style={{ fontWeight: 'bold', color: 'red' }}>×</span>
                        </IconButton>
                      )}
                    </Box>
                  </AccordionSummary>
                  {expandedGroups[index] && (
                    <AccordionDetails sx={{ pt: 0, bgcolor: "background.default" }}>
                      <GroupWidgets
                        group={expandedGroup}
                        onSelectNode={onSelectNode}
                        getGroupWidgets={getGroupWidgets}
                        onUnlink={onUnlink}
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

export default MarketplaceGroups;
