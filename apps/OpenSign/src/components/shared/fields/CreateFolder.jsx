import React, { useState } from "react";
import Parse from "parse";
import Alert from "../../../primitives/Alert";
import Loader from "../../../primitives/Loader";
import { useTranslation } from "react-i18next";
import { withSessionValidation } from "../../../utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CreateFolder = ({ parentFolderId, onSuccess, folderCls, onBack }) => {
  const folderPtr = {
    __type: "Pointer",
    className: folderCls,
    objectId: parentFolderId
  };
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [alert, setAlert] = useState({ type: "info", message: "" });
  const showToast = (type, msg) => {
    setAlert({ type: type, message: msg });
    setTimeout(() => setAlert({ type: type, message: "" }), 1000);
  };
  const handleCreateFolder = withSessionValidation(async (event) => {
    event.preventDefault();
    handleLoader(true);
    if (name) {
      const currentUser = Parse.User.current();
      const exsitQuery = new Parse.Query(folderCls);
      exsitQuery.equalTo("Name", name);
      exsitQuery.equalTo("Type", "Folder");
      exsitQuery.notEqualTo("IsArchive", true);
      if (parentFolderId) {
        exsitQuery.equalTo("Folder", folderPtr);
      }
      const templExist = await exsitQuery.first();
      if (templExist) {
        showToast("danger", t("folder-already-exist"));
      } else {
        const template = new Parse.Object(folderCls);
        template.set("Name", name);
        template.set("Type", "Folder");
        if (parentFolderId) {
          template.set("Folder", folderPtr);
        }
        template.set("CreatedBy", Parse.User.createWithoutData(currentUser.id));
        const ExtCls = JSON.parse(localStorage.getItem("Extand_Class"));
        template.set("ExtUserPtr", {
          __type: "Pointer",
          className: "contracts_Users",
          objectId: ExtCls[0].objectId
        });
        const res = await template.save();
        if (res) {
          handleLoader(false);
          showToast("success", t("folder-created-successfully"));
          onSuccess && onSuccess(res?.toJSON());
        }
      }
    } else {
      handleLoader(false);
      showToast("info", t("fill-folder-name"));
    }
  });
  const handleLoader = (status) => setIsLoader(status);

  return (
    <Box>
      {alert.message && <Alert type={alert.type}>{alert.message}</Alert>}
      <Box id="createFolder" sx={{ position: "relative" }}>
        {isLoader && (
          <Box
            sx={{
              position: "absolute",
              height: "100%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Loader />
          </Box>
        )}
        <Typography
          component="h1"
          sx={{ fontSize: "1rem", fontWeight: 600, mt: "0.4rem" }}
        >
          {t("create-folder")}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography
            component="label"
            sx={{ display: "block", fontSize: "0.75rem", mb: 0.5 }}
          >
            {t("name")}
            <Box component="span" sx={{ color: "error.main", fontSize: "13px" }}>
              *
            </Box>
          </Typography>
          <TextField
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
            onInput={(e) => e.target.setCustomValidity("")}
            required
            slotProps={{ htmlInput: { style: { fontSize: "0.75rem" } } }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateFolder}
            disabled={isLoader}
            startIcon={<AddIcon />}
          >
            {t("create")}
          </Button>
          {onBack && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              title={t("back")}
              onClick={() => onBack()}
              startIcon={<ArrowBackIcon />}
            >
              {t("back")}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateFolder;
