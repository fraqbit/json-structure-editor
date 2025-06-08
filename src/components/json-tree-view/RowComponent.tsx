import React from "react";
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
import AddLinkIcon from "@mui/icons-material/AddLink";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { StructuredData, Marketplace, Group, ExpandedGroup, ExpandedWidget } from "../types";
import GroupWidgets from "./GroupWidgets";

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
  onAttachMarketplaces?: (marketplace: Marketplace) => void;
  onUnlink?: (type: 'marketplace' | 'group' | 'widget', parentCode: string, code: string) => void;
  data: StructuredData;
  parentCode?: string;
  onCopy?: (obj: any, type: 'marketplace' | 'group' | 'widget') => void;
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
    onAttachMarketplaces,
    onUnlink,
    data,
    parentCode = '',
    onCopy,
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
              {mp.isInitial && onAttachMarketplaces && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttachMarketplaces(mp);
                  }}
                  size="small"
                >
                  <AddLinkIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUnlink) onUnlink('marketplace', parentCode, mp.code);
                }}
                size="small"
              >
                <span style={{ fontWeight: 'bold', color: 'red' }}>×</span>
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCopy) onCopy(mp, 'marketplace');
                }}
                size="small"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
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
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const originalMp = data.marketplaces.find((m) => m.code === linkedMp.code);
                                  if (originalMp) onAttachGroups(originalMp);
                                }}
                                size="small"
                              >
                                <AddLinkIcon fontSize="small" />
                              </IconButton>
                              {onUnlink && (
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUnlink('marketplace', mp.code, linkedMp.code);
                                  }}
                                  size="small"
                                >
                                  <span style={{ fontWeight: 'bold', color: 'red' }}>×</span>
                                </IconButton>
                              )}
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
                                        {onUnlink && (
                                          <IconButton
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onUnlink('group', linkedMp.code, group.code);
                                            }}
                                            size="small"
                                          >
                                            <span style={{ fontWeight: 'bold', color: 'red' }}>×</span>
                                          </IconButton>
                                        )}
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (onCopy) onCopy(group, 'group');
                                          }}
                                          size="small"
                                        >
                                          <ContentCopyIcon fontSize="small" />
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
                                        onUnlink={onUnlink}
                                        onCopy={onCopy}
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
                              {onUnlink && (
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUnlink('group', mp.code, group.code);
                                  }}
                                  size="small"
                                >
                                  <span style={{ fontWeight: 'bold', color: 'red' }}>×</span>
                                </IconButton>
                              )}
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onCopy) onCopy(group, 'group');
                                }}
                                size="small"
                              >
                                <ContentCopyIcon fontSize="small" />
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
                              onUnlink={onUnlink}
                              onCopy={onCopy}
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

export default RowComponent; 