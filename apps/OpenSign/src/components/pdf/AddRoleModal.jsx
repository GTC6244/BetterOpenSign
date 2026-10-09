import React, { useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

const AddRoleModal = (props) => {
  const { t } = useTranslation();
  return (
    <ModalUi
      title={t("add-role")}
      isOpen={props.isModalRole}
      handleClose={props.handleCloseRoleModal}
    >
      <Box sx={{ height: "100%", py: 1.25, px: 2.5 }}>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column" }}
          onSubmit={props.handleAddRole}
        >
          <TextField
            size="small"
            fullWidth
            value={props.roleName}
            onChange={(e) => props.setRoleName(e.target.value)}
            placeholder={
              props.signersdata.length > 0
                ? "Role " + (props.signersdata.length + 1)
                : "Role 1"
            }
            sx={{ mt: 1 }}
          />
          <Typography
            sx={{ color: "text.secondary", fontSize: "11px", mt: 0.5, mb: 1.25, ml: 1.25 }}
          >
            {t("role-ex")}..
          </Typography>
          <Box>
            <Divider sx={{ mb: 1.25 }} />
            <Button type="submit" variant="contained">
              {t("add")}
            </Button>
            <Button
              onClick={props.handleCloseRoleModal}
              type="button"
              variant="text"
              sx={{ ml: 1 }}
            >
              {t("close")}
            </Button>
          </Box>
        </Box>
      </Box>
    </ModalUi>
  );
};

export default AddRoleModal;
