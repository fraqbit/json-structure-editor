import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import { findReferences } from "../utils";
import { StructuredData } from "../types";

interface JsonEditorProps {
  structuredData: StructuredData;
  node: any;
  path: string;
  onUpdate: (updatedNode: any) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  structuredData,
  node,
  path,
  onUpdate,
}) => {
  const [content, setContent] = useState<string>("");
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Используем ref для отслеживания текущего пути
  const currentPathRef = useRef<string>(path);
  const currentNodeRef = useRef<any>(node);

  useEffect(() => {
    // Обновляем только если узел или путь действительно изменились
    if (path !== currentPathRef.current || node !== currentNodeRef.current) {
      try {
        setContent(JSON.stringify(node, null, 2));
        setIsValidJson(true);
        setHasChanges(false);

        // Обновляем refs
        currentPathRef.current = path;
        currentNodeRef.current = node;
      } catch (error) {
        setContent("{}");
        setIsValidJson(false);
      }
    }
  }, [node, path]);

  const [references, setReferences] = useState({
    marketplaces: [],
    groups: [],
  });

  useEffect(() => {
    if (node?.code) {
      const refs = findReferences(structuredData, node.code);
      setReferences(refs);
    } else {
      setReferences({ marketplaces: [], groups: [] });
    }
  }, [node, structuredData]);

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasChanges(true);

    try {
      JSON.parse(newContent);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
    }
  };

  const handleUpdate = () => {
    try {
      const parsed = JSON.parse(content);

      // Проверяем, изменился ли code
      if (node?.code && parsed.code && node.code !== parsed.code) {
        if (
          // eslint-disable-next-line no-restricted-globals
          confirm(
            `Вы изменяете code элемента. Все ссылки на "${node.code}" будут обновлены на "${parsed.code}". Продолжить?`
          )
        ) {
          onUpdate(parsed);
        }
      } else {
        onUpdate(parsed);
      }
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          JSON Editor
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {node ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Path:</strong> {path}
            </Typography>

            {references.marketplaces.length > 0 && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Используется в маркетплейсах:</strong>{" "}
                {references.marketplaces.join(", ")}
              </Typography>
            )}

            {references.groups.length > 0 && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Используется в группах:</strong>{" "}
                {references.groups.join(", ")}
              </Typography>
            )}

            <TextField
              multiline
              fullWidth
              minRows={15}
              maxRows={20}
              value={content}
              onChange={handleContentChange}
              variant="outlined"
              sx={{
                fontFamily: "monospace",
                mb: 2,
                "& textarea": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
              error={!isValidJson}
              helperText={!isValidJson ? "Invalid JSON format" : ""}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={!isValidJson || !hasChanges}
              fullWidth
            >
              Apply Changes
            </Button>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Select a node to edit
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default JsonEditor;
