import React, { useEffect, useState } from "react";
import Parse from "parse";
import CreateFolder from "./CreateFolder";
import ModalUi from "../../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import SaveIcon from "@mui/icons-material/Save";
import AddBoxIcon from "@mui/icons-material/AddBox";

const FolderModal = (props) => {
  const { t } = useTranslation();
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const [clickFolder, setClickFolder] = useState("");
  const [folderList, setFolderList] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  //   below useEffect is called when user open popup
  useEffect(() => {
    if (props.isOpenModal) {
      fetchFolder();
    }
    // eslint-disable-next-line
  }, [props.isOpenModal]);

  // `fetchFolder` is used to fetch of folder list created by user on basis of folderPtr or without folderPtr
  const fetchFolder = async (folderPtr) => {
    setIsLoader(true);
    try {
      const FolderQuery = new Parse.Query(props.folderCls);
      if (folderPtr) {
        FolderQuery.equalTo("Folder", folderPtr);
        FolderQuery.descending("Type");
        FolderQuery.notEqualTo("IsArchive", true);
        FolderQuery.equalTo("CreatedBy", Parse.User.current());
      } else {
        FolderQuery.doesNotExist("Folder");
        FolderQuery.descending("Type");
        FolderQuery.notEqualTo("IsArchive", true);
        FolderQuery.equalTo("CreatedBy", Parse.User.current());
      }

      const res = await FolderQuery.find();
      if (res) {
        const result = JSON.parse(JSON.stringify(res));
        if (result) {
          setFolderList(result);
          setIsLoader(false);
        }
        setIsLoader(false);
      }
    } catch (error) {
      setIsLoader(false);
    }
  };

  // `handleSelect` is used to save pointer of folder selected by user and it's path in state
  const handleSelect = (item) => {
    setFolderList([]);
    setClickFolder({ ObjectId: item.objectId, Name: item.Name });
    if (tabList.length > 0) {
      const tab = tabList.some((x) => x.objectId === item.objectId);
      if (!tab) {
        setTabList((tabs) => [...tabs, item]);
        const folderPtr = {
          __type: "Pointer",
          className: props.folderCls,
          objectId: item.objectId
        };
        fetchFolder(folderPtr);
      }
    } else {
      setTabList((tabs) => [...tabs, item]);
      const folderPtr = {
        __type: "Pointer",
        className: props.folderCls,
        objectId: item.objectId
      };

      fetchFolder(folderPtr);
    }
  };

  // `handleSubmit` is used to pass folderPtr to parent component
  const handleSubmit = () => {
    let url = drivename + " Drive";
    tabList.forEach((t) => {
      url = url + " / " + t.Name;
    });
    if (props.onSuccess) {
      props.onSuccess(clickFolder);
    }
    // SetIsOpen(false);
    props.setIsOpenMoveModal(false);
  };

  // `handleCancel` is used to clear list of folder, close popup and folderUrl
  const handleCancel = () => {
    // SetIsOpen(false);
    props.setIsOpenMoveModal(false);
    setClickFolder({});
    setFolderList([]);
    setTabList([]);
  };

  // `handleCancel` is call when user click on folder name from path/tab in popup
  const removeTabListItem = async (e, i) => {
    e.preventDefault();

    setIsLoader(true);
    setIsAdd(false);
    if (i !== undefined) {
      setFolderList([]);
      const list = tabList.filter((folder, j) => j <= i && folder);
      const index = list.length - 1;
      const folderPtr = {
        __type: "Pointer",
        className: props.folderCls,
        objectId: list[index].objectId
      };
      setTabList(list);
      fetchFolder(folderPtr);
    } else {
      setClickFolder({});
      setFolderList([]);
      setTabList([]);
      fetchFolder();
    }
  };
  // `handleCreate` is used to open folder creation form in popup
  const handleCreate = () => setIsAdd(true);
  const handleBack = () => setIsAdd(false);
  // `handleAddFolder` is call when user folder created successfully and it fetch folder list on the basis of folderPtr or without folderPtr
  const handleAddFolder = (newFolder) => {
    props.setPdfData((prev) => [...prev, newFolder]);
    if (clickFolder && clickFolder.ObjectId) {
      fetchFolder({
        __type: "Pointer",
        className: props.folderCls,
        objectId: newFolder.objectId // clickFolder.ObjectId
      });
    } else {
      fetchFolder();
    }
    setClickFolder({ ObjectId: newFolder.objectId, Name: newFolder.Name });
    setTabList((prev) => [...prev, newFolder]);
    handleBack();
  };
  return (
    <Box sx={{ fontSize: "0.75rem", mt: 1 }}>
      <ModalUi
        title={t("select-folder")}
        isOpen={props.isOpenModal}
        handleClose={handleCancel}
      >
        <Box
          sx={{
            width: "100%",
            minWidth: { xs: 300, md: 500 },
            maxWidth: 500,
            px: 1.5
          }}
        >
          <Box
            sx={{
              pt: 0.5,
              color: "secondary.main",
              fontSize: "14px",
              fontWeight: 500
            }}
          >
            <Box
              component="span"
              sx={{ cursor: "pointer" }}
              title={`${drivename} Drive`}
              onClick={(e) => removeTabListItem(e)}
            >
              {t("OpenSign-drive", { appName: drivename })} /{" "}
            </Box>
            {tabList &&
              tabList.map((tab, i) => (
                <React.Fragment key={`${tab.objectId}-${i}`}>
                  <Box
                    component="span"
                    sx={{ cursor: "pointer" }}
                    title={tab.Name}
                    onClick={(e) => removeTabListItem(e, i)}
                  >
                    {tab.Name}
                  </Box>
                  {" / "}
                </React.Fragment>
              ))}
            <Divider sx={{ mt: "0.750rem" }} />
          </Box>
          <Box sx={{ mb: !isAdd ? 1.5 : 0, mt: 1 }}>
            {!isAdd && (
              <Box sx={{ maxHeight: 210, overflow: "auto" }}>
                {folderList.length > 0
                  ? folderList.map((folder) => (
                      <Box
                        key={folder.objectId}
                        sx={{
                          cursor:
                            folder.Type === "Folder" ? "pointer" : "default",
                          borderBottom: "1px solid",
                          borderColor: "outline.variant",
                          py: 1,
                          mb: 0.25
                        }}
                        onClick={() =>
                          folder.Type === "Folder" && handleSelect(folder)
                        }
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                          }}
                        >
                          {folder.Type === "Folder" ? (
                            <Box
                              component="svg"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              sx={{ width: "1.4rem", height: "1.4rem", fill: "currentColor" }}
                            >
                              <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" />
                            </Box>
                          ) : (
                            <Box
                              component="svg"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                              sx={{
                                width: "1.4rem",
                                height: "1.4rem",
                                fill: "currentColor",
                                color: "primary.main"
                              }}
                            >
                              <path d="M374.629 150.627L233.371 9.373C227.371 3.371 219.23 0 210.746 0H64C28.652 0 0 28.652 0 64V448C0 483.345 28.652 512 64 512H320C355.348 512 384 483.345 384 448V173.254C384 164.767 380.629 156.629 374.629 150.627ZM224 22.629L361.375 160H248C234.781 160 224 149.234 224 136V22.629ZM368 448C368 474.467 346.469 496 320 496H64C37.531 496 16 474.467 16 448V64C16 37.533 37.531 16 64 16H208V136C208 158.062 225.938 176 248 176H368V448ZM96 264C96 268.406 99.594 272 104 272H280C284.406 272 288 268.406 288 264S284.406 256 280 256H104C99.594 256 96 259.594 96 264ZM280 320H104C99.594 320 96 323.594 96 328S99.594 336 104 336H280C284.406 336 288 332.406 288 328S284.406 320 280 320ZM280 384H104C99.594 384 96 387.594 96 392S99.594 400 104 400H280C284.406 400 288 396.406 288 392S284.406 384 280 384Z" />
                            </Box>
                          )}
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {folder.Name}
                          </Box>
                        </Box>
                      </Box>
                    ))
                  : !isLoader && (
                      <Box
                        sx={{
                          color: "text.primary",
                          textAlign: "center",
                          my: 1
                        }}
                      >
                        {t("no-data")}
                      </Box>
                    )}
              </Box>
            )}
            {isAdd && (
              <CreateFolder
                parentFolderId={clickFolder && clickFolder.ObjectId}
                folderCls={props.folderCls}
                onSuccess={handleAddFolder}
                onBack={handleBack}
              />
            )}
            {isLoader && (
              <Box
                sx={{ display: "flex", justifyContent: "center", my: 2 }}
              >
                <i className="fa-light fa-spinner fa-spin-pulse text-[30px]"></i>
              </Box>
            )}
          </Box>
        </Box>
        <Divider />
        {!isAdd && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: "0.75rem",
              px: "1.25rem"
            }}
          >
            <Button
              variant="contained"
              size="small"
              title={t("save-here")}
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
            >
              {t("save-here")}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              title={t("add-folder")}
              onClick={handleCreate}
              startIcon={<AddBoxIcon />}
            >
              {t("add-folder")}
            </Button>
          </Box>
        )}
      </ModalUi>
    </Box>
  );
};

export default FolderModal;
