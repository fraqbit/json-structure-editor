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
import RowComponent from "./RowComponent";
import GroupWidgets from "./GroupWidgets";
import MarketplaceGroups from "./MarketplaceGroups";
import LinkedMarketplaces from "./LinkedMarketplaces";

interface JsonTreeViewProps {
  data: StructuredData;
  onSelectNode: (node: any, path: string) => void;
  onAttachGroups: (marketplace: Marketplace) => void;
  onAttachWidgets: (group: Group) => void;
  getMarketplaceGroups: (mp: Marketplace) => ExpandedGroup[];
  getGroupWidgets: (group: Group) => ExpandedWidget[];
  getInitialMarketplaceLinks?: (mp: Marketplace) => Marketplace[];
  onAttachMarketplaces?: (marketplace: Marketplace) => void;
  onUnlink?: (type: 'marketplace' | 'group' | 'widget', parentCode: string, code: string) => void;
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  onSelectNode,
  onAttachGroups,
  onAttachWidgets,
  getMarketplaceGroups,
  getGroupWidgets,
  getInitialMarketplaceLinks,
  onAttachMarketplaces,
  onUnlink,
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
              onAttachMarketplaces={onAttachMarketplaces}
              onUnlink={onUnlink}
              data={data}
              parentCode=""
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

export default JsonTreeView;
