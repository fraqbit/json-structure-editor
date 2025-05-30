import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Button,
  Paper,
  Divider,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { FilterOption, Filters } from "./types";

interface FilterPanelProps {
  availableFilters: FilterOption[];
  filters: Filters;
  onFilterChange: (key: string, values: any[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  availableFilters,
  filters,
  onFilterChange,
  searchTerm,
  onSearchChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterOption | null>(null);

  const handleFilterSelect = (filter: FilterOption | null) => {
    setActiveFilter(filter);
  };

  const handleValueToggle = (value: string) => {
    if (!activeFilter) return;

    const filterKey = `${activeFilter.type}_${activeFilter.field}`;
    const currentValues = filters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange(filterKey, newValues);
  };

  const resetFilter = () => {
    if (activeFilter) {
      onFilterChange(`${activeFilter.type}_${activeFilter.field}`, []);
    }
    setActiveFilter(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      {/* Поисковая строка */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, width: "100%" }}>
        <SearchIcon sx={{ mr: 1, color: "action.active" }} />
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Поиск по code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ fontFamily: 'IBM Plex Mono', fontWeight: 500 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Активные фильтры */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterListIcon sx={{ mr: 1, color: "action.active" }} />
        <Typography variant="subtitle2" style={{ fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>Фильтры:</Typography>
        <Box sx={{ ml: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {Object.entries(filters).map(([key, values]) => {
            if (values.length === 0) return null;
            const [, field] = key.split("_");
            return (
              <Chip
                key={key}
                label={`${field}: ${values.join(", ")}`}
                onDelete={() => onFilterChange(key, [])}
                style={{ fontFamily: 'IBM Plex Mono', fontWeight: 500 }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Настройка фильтра */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <Autocomplete
          options={availableFilters}
          getOptionLabel={(option) => `${option.type}.${option.field}`}
          sx={{ width: 300 }}
          size="small"
          value={activeFilter}
          onChange={(_, newValue) => handleFilterSelect(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Выберите фильтр" />
          )}
        />

        {activeFilter && (
          <>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Значения для {activeFilter.field}:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxHeight: 120,
                  overflowY: "auto",
                  p: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                {activeFilter.values.map((value) => {
                  const filterKey = `${activeFilter.type}_${activeFilter.field}`;
                  const isSelected =
                    filters[filterKey]?.includes(value) || false;

                  return (
                    <FormControlLabel
                      key={value}
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleValueToggle(value)}
                          size="small"
                        />
                      }
                      label={String(value)}
                      sx={{ m: 0 }}
                    />
                  );
                })}
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-end" }}>
              <Button variant="outlined" onClick={resetFilter}>
                Сбросить
              </Button>
              <Button variant="contained" onClick={() => setActiveFilter(null)}>
                Готово
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default FilterPanel;
