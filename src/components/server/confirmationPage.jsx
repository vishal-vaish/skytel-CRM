import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React from "react";
import styles from "./server.module.css";

const ConfirmationPage = ({isOpen, setIsOpen, onConfirm}) => {
  return (

      <Dialog open={isOpen} maxWidth="xl">
        <div className={styles.confirmationContainer}>
        <DialogTitle>Confirmation Page</DialogTitle>
        <DialogContent>
          Are you sure want to delete it?
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirm} variant="outlined">
            Delete
          </Button>
          <Button onClick={setIsOpen} color="inherit">
            Cancel
          </Button>
        </DialogActions>
        </div>
      </Dialog>
  )
}

export default ConfirmationPage;