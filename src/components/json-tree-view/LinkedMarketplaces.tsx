import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Marketplace } from "../types";

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

export default LinkedMarketplaces; 