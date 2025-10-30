import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const ConfirmDialog = ({ open, title = 'Confirm', message, onCancel, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button color="error" onClick={onConfirm}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
