import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  TextField,
} from "@mui/material";
import { Group, StructuredData, Widget } from "./types";

interface AttachmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedItems: string[]) => void;
  data: StructuredData;
  type: "groups" | "widgets";
  title: string;
}

const AttachmentDialog: React.FC<AttachmentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  data,
  type,
  title,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  let filteredItems: (Group | Widget)[] = [];

  if (type === "groups") {
    filteredItems = data.groups.filter((item: Group) => {
      return (
        item.code.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        (item.title || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase()) ||
        (item.name || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      );
    });
  } else {
    filteredItems = data.widgets.filter((item: Widget) => {
      return (
        item.code.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        (item.title || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase()) ||
        (item.name || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      );
    });
  }

  const handleToggle = (code: string) => {
    setSelectedItems((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedItems);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Поиск"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        />
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredItems.map((item) => (
            <ListItem
              key={item.code}
              component={"li"}
              onClick={() => handleToggle(item.code)}
            >
              <Checkbox
                edge="start"
                checked={selectedItems.includes(item.code)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText
                primary={item.code}
                secondary={item.title || item.name}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={selectedItems.length === 0}
        >
          Привязать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentDialog;
