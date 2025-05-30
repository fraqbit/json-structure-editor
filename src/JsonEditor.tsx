import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Divider,
} from "@mui/material";

interface JsonEditorProps {
  node: any;
  path: string;
  onUpdate: (updatedNode: any) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ node, path, onUpdate }) => {
  const [content, setContent] = useState<string>("");
  const [isValidJson, setIsValidJson] = useState<boolean>(true);

  useEffect(() => {
    if (node) {
      try {
        setContent(JSON.stringify(node, null, 2));
        setIsValidJson(true);
      } catch (error) {
        setContent("{}");
        setIsValidJson(false);
      }
    } else {
      setContent("");
      setIsValidJson(true);
    }
  }, [node]);

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newContent = e.target.value;
    setContent(newContent);

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
      onUpdate(parsed);
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
              disabled={!isValidJson}
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
