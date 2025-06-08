import React from "react";
import { Container, Typography, Button, Box, Snackbar, Alert, CircularProgress, Grid, Paper } from "@mui/material";
import JsonTreeView from "./json-tree-view/JsonTreeView";
import JsonEditor from "./json-editor/JsonEditor";
import FilterPanel from "./filter-panel/FilterPanel";
import CreationDialog from "./creation-dialog/CreationDialog";
import AttachmentDialog from "./attachment-dialog/AttachmentDialog";
import ExportConfirmationDialog from "./export-confirmation-dialog/ExportConfirmationDialog";
import { useAppLogic } from "../hooks/useAppLogic";

const App = () => {
  const logic = useAppLogic();

  if (logic.loading) {
    return (
      <Container maxWidth="lg" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={80} />
        <Typography variant="h6" style={{ marginLeft: 20 }}>
          Загрузка данных...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <ExportConfirmationDialog
          open={logic.showExportDialog}
          errors={logic.validationErrors}
          changes={logic.exportChanges}
          onCancel={() => logic.setShowExportDialog(false)}
          onConfirm={logic.confirmExport}
        />
        <CreationDialog
          open={logic.creationDialog.open}
          onClose={() => logic.setCreationDialog({ open: false, type: null })}
          onSubmit={logic.handleCreateEntity}
          actualWidgets={logic.actualWidgets}
          actualGroups={logic.actualGroups}
          type={logic.creationDialog.type}
        />
        {logic.structuredData && (
          <AttachmentDialog
            open={logic.attachmentDialog.open}
            onClose={() => logic.setAttachmentDialog({ ...logic.attachmentDialog, open: false })}
            onSubmit={logic.handleAttachItems}
            data={logic.structuredData}
            type={logic.attachmentDialog.type === "marketplace" ? "groups" : "widgets"}
            title={logic.attachmentDialog.type === "marketplace" ? "Привязать группы к маркетплейсу" : "Привязать виджеты к группе"}
          />
        )}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom style={{ fontFamily: "IBM Plex Mono", fontWeight: 500 }}>
            JSON STRUCTURE EDITOR
          </Typography>
          <input type="file" accept=".json" onChange={logic.handleFileUpload} style={{ display: "none" }} id="upload-json" />
          <label htmlFor="upload-json">
            <Button variant="contained" component="span" style={{ fontFamily: "IBM Plex Mono", fontWeight: 500 }}>
              Загрузить JSON
            </Button>
          </label>
          {logic.structuredData && (
            <Button variant="contained" color="primary" onClick={logic.handleDownload} style={{ marginLeft: 10, fontFamily: "IBM Plex Mono", fontWeight: 500 }}>
              Выгрузить JSON
            </Button>
          )}
          {logic.structuredData && (
            <>
              <Button variant="outlined" onClick={() => logic.setCreationDialog({ open: true, type: "marketplace" })} style={{ fontFamily: "IBM Plex Mono", fontWeight: 500, marginLeft: 10 }}>
                + Маркетплейс
              </Button>
              <Button variant="outlined" onClick={() => logic.setCreationDialog({ open: true, type: "group" })} style={{ fontFamily: "IBM Plex Mono", fontWeight: 500, marginLeft: 10 }}>
                + Группа
              </Button>
              <Button variant="outlined" onClick={() => logic.setCreationDialog({ open: true, type: "widget" })} style={{ fontFamily: "IBM Plex Mono", fontWeight: 500, marginLeft: 10 }}>
                + Виджет
              </Button>
            </>
          )}
        </Box>
        {!logic.structuredData && !logic.loading && (
          <Paper elevation={3} style={{ padding: 20, textAlign: "center" }}>
            <Typography variant="h6" style={{ fontFamily: "IBM Plex Mono", fontWeight: 500 }}>
              Загрузите JSON файл для начала работы
            </Typography>
          </Paper>
        )}
        {logic.structuredData && (
          <FilterPanel
            availableFilters={logic.availableFilters}
            filters={logic.filters}
            onFilterChange={logic.handleFilterChange}
            searchTerm={logic.searchTerm}
            onSearchChange={logic.handleSearchChange}
          />
        )}
        {logic.structuredData && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Paper elevation={3} style={{ height: "80vh", overflow: "auto" }}>
                <JsonTreeView
                  data={logic.filteredData}
                  onSelectNode={logic.handleSelectNode}
                  onAttachGroups={logic.openAttachmentDialog.bind(null, "marketplace")}
                  onAttachWidgets={logic.openAttachmentDialog.bind(null, "group")}
                  getMarketplaceGroups={logic.getMarketplaceGroups}
                  getGroupWidgets={logic.getGroupWidgets}
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper elevation={3} style={{ height: "80vh" }}>
                <JsonEditor
                  structuredData={logic.structuredData}
                  node={logic.selectedNode}
                  path={logic.nodePath}
                  onUpdate={logic.handleUpdateNode}
                />
              </Paper>
            </Grid>
          </Grid>
        )}
        <Snackbar
          open={logic.snackbar.open}
          autoHideDuration={6000}
          onClose={logic.handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={logic.handleCloseSnackbar} severity={logic.snackbar.severity} sx={{ width: "100%" }}>
            {logic.snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
      {logic.structuredData && (
        <Box sx={{ minHeight: "80px", backgroundColor: "#1976d2", width: "100%", color: "white", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "7px 7px 0 0" }}>
          <Typography variant="h6" style={{ fontFamily: "IBM Plex Mono", fontWeight: 500 }}>
            ONLY FOR USE IN INVSHOW SBERBANK TEAM!
          </Typography>
        </Box>
      )}
    </>
  );
};

export default App;
