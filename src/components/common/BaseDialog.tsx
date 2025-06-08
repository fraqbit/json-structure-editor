import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogProps } from "@mui/material";

interface BaseDialogProps extends Omit<DialogProps, 'title'> {
  open: boolean;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const BaseDialog: React.FC<BaseDialogProps> = ({ open, title, actions, children, ...props }) => (
  <Dialog open={open} {...props}>
    {title && <DialogTitle>{title}</DialogTitle>}
    <DialogContent dividers>{children}</DialogContent>
    {actions && <DialogActions>{actions}</DialogActions>}
  </Dialog>
);

export default BaseDialog; 