import React, { useState, useEffect, useRef } from "react";
import pad from "../../assets/images/pad.svg";
import axios from "axios";
import { useTranslation } from "react-i18next";
import EditContactForm from "./EditContactForm";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import Tooltip from "../../primitives/Tooltip";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { useElSize } from "../../hook/useElSize";
import ImportContact from "./ImportContact";
import AddContact from "../../primitives/AddContact";
import { withSessionValidation } from "../../utils";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

const Contactbook = (props) => {
  const titleRef = useRef(null);
  const titleElement = useElSize(titleRef);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isContactform, setIsContactform] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isModal, setIsModal] = useState({});
  const [contact, setContact] = useState({
    Name: "",
    Email: "",
    Phone: "",
    JobTitle: "",
    Company: ""
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(props.List.length / props.docPerPage);
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }

    return pages;
  };
  const showAlert = (type, message, time = 1500) => {
    setAlertMsg({ type: type, message: message });
    setTimeout(() => setAlertMsg({ type: "", message: "" }), time);
  };
  const pageNumbers = getPaginationRange();
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  const handleActionBtn = withSessionValidation(async (act, item) => {
    if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "edit") {
      setContact(item);
      setIsModal({ [`edit_${item.objectId}`]: true });
    }
  });
  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const sortedList = React.useMemo(() => {
    const contacts = [...props.List];
    contacts.sort((a, b) => {
      const nameA = a?.Name?.toLowerCase() || "";
      const nameB = b?.Name?.toLowerCase() || "";
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return contacts;
  }, [props.List, sortOrder]);

  const currentList = sortedList?.slice(indexOfFirstDoc, indexOfLastDoc);

  // Change page
  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleContactFormModal = () => {
    setIsContactform(!isContactform);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleUserData = (data) => {
    props.setList((prevData) => [data, ...prevData]);
    showAlert("success", t("contact-saved"));
  };

  const handleDelete = withSessionValidation(async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    try {
      const serverUrl = serverUrl_fn();
      const cls = "contracts_Contactbook";
      const url = serverUrl + `/classes/${cls}/`;
      const body = { IsDeleted: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        showAlert("success", t("record-delete-alert"));
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
      }
    } catch (err) {
      console.log("err", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });
  const handleClose = () => {
    setIsDeleteModal({});
  };

  // `handleImportBtn` is trigger when user click on upload icon from contactbook
  const handleImportBtn = () => {
    setIsModal({ export: true });
  };

  // `handleEditContact` is used to update contactas per old contact Id
  const handleEditContact = async (updateContact) => {
    const updateList = props.List.map((x) =>
      x.objectId === contact.objectId ? { ...x, ...updateContact } : x
    );
    props.setList(updateList);
  };
  const handleCloseModal = () => {
    setActLoader({});
    setIsModal({});
  };
  return (
    <Box sx={{ position: "relative" }}>
      {Object.keys(actLoader)?.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            borderRadius: 2,
            zIndex: 30
          }}
        >
          <Loader />
        </Box>
      )}
      <Paper
        elevation={3}
        sx={{
          p: 1,
          width: "100%",
          bgcolor: "surface.main",
          color: "text.primary"
        }}
      >
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        <Box
          ref={titleRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            my: 1,
            mx: 1.5,
            fontSize: { xs: "20px", md: "23px" }
          }}
        >
          <Box sx={{ fontWeight: 300 }}>
            {t(`report-name.Contactbook`)}{" "}
            {props.report_help && (
              <Box component="span" sx={{ fontSize: { xs: "0.75rem", md: "13px" }, fontWeight: 400 }}>
                <Tooltip
                  id="report_help"
                  message="t(`report-help.Contactbook`)"
                />
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
              mb: 1
            }}
          >
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <Box sx={{ display: "flex" }}>
                <TextField
                  type="search"
                  size="small"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={t("search-contacts")}
                  onPaste={props.handleSearchPaste}
                  sx={{ width: 256 }}
                  inputProps={{ style: { fontSize: "0.75rem" } }}
                />
              </Box>
            )}
            {/* import contact icon */}
            <IconButton
              onClick={() => handleImportBtn()}
              sx={{ color: "text.primary" }}
            >
              <i className="fa-light fa-upload text-[23px] md:text-[25px]"></i>
            </IconButton>
            {/* add contact icon*/}
            <IconButton
              onClick={() => handleContactFormModal()}
              sx={{ color: "secondary.main" }}
            >
              <i className="fa-light fa-square-plus text-[30px] md:text-[32px]"></i>
            </IconButton>
            {/* search icon/magnifer icon */}
            {titleElement?.width < 500 && (
              <IconButton
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i className="fa-light fa-magnifying-glass"></i>
              </IconButton>
            )}
          </Box>
        </Box>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <Box sx={{ width: "100%", px: 1.5, pt: 0.5, pb: 1.5 }}>
            <TextField
              type="search"
              size="small"
              fullWidth
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              inputProps={{ style: { fontSize: "0.75rem" } }}
            />
          </Box>
        )}
        <Box
          sx={{
            overflow: "auto",
            width: "100%",
            borderBottom: 1,
            borderColor: "divider",
            minHeight:
              props.List?.length > 0
                ? "317px"
                : currentList?.length === props.docPerPage
                  ? "auto"
                  : undefined,
            height:
              props.List?.length > 0
                ? undefined
                : currentList?.length === props.docPerPage
                  ? "fit-content"
                  : "100vh"
          }}
        >
          <Table sx={{ width: "100%", mb: 2, borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                {props.heading?.map((item, index) => (
                  <React.Fragment key={index}>
                    <TableCell sx={{ textAlign: "left", p: 1, fontSize: "14px" }}>
                      {t(`report-heading.${item}`)}
                      {item === "Name" && (
                        <IconButton
                          type="button"
                          size="small"
                          onClick={toggleSortOrder}
                          sx={{ ml: 0.5 }}
                        >
                          <i
                            className={
                              sortOrder === "asc"
                                ? "fa-light fa-arrow-down-a-z"
                                : "fa-light fa-arrow-up-a-z"
                            }
                          ></i>
                        </IconButton>
                      )}
                    </TableCell>
                  </React.Fragment>
                ))}
                {props.actions?.length > 0 && (
                  <TableCell
                    sx={{ p: 1, color: "transparent", pointerEvents: "none" }}
                  >
                    {t("action")}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.List?.length > 0 &&
                !props.searchLoader &&
                currentList.map((item, index) => (
                  <TableRow key={index}>
                    {props.heading.includes("Sr.No") && (
                      <TableCell sx={{ p: 1, textAlign: "left", fontWeight: 600, fontSize: "12px" }}>
                        {startIndex + index + 1}
                      </TableCell>
                    )}
                    {props.heading.includes("Name") && (
                      <TableCell sx={{ p: 1, textAlign: "left", fontWeight: 600, fontSize: "12px" }}>
                        {item?.Name}
                      </TableCell>
                    )}
                    {props.heading.includes("Email") && (
                      <TableCell sx={{ p: 1, textAlign: "left", fontSize: "12px" }}>{item?.Email ?? "-"}</TableCell>
                    )}
                    {props.heading.includes("Phone") && (
                      <TableCell sx={{ p: 1, textAlign: "left", fontSize: "12px" }}>{item?.Phone ?? "-"}</TableCell>
                    )}
                    {props.heading.includes("Company") && (
                      <TableCell sx={{ p: 1, textAlign: "left", fontSize: "12px" }}>{item?.Company ?? "-"}</TableCell>
                    )}
                    {props.heading.includes("JobTitle") && (
                      <TableCell sx={{ p: 1, textAlign: "left", fontSize: "12px" }}>{item?.JobTitle ?? "-"}</TableCell>
                    )}
                    <TableCell sx={{ px: 1.5, py: 1 }}>
                      <Box
                        sx={{
                          color: "text.primary",
                          minWidth: "max-content",
                          display: "flex",
                          flexDirection: "row",
                          columnGap: 1,
                          rowGap: 0.5,
                          justifyContent: "flex-start",
                          alignItems: "center"
                        }}
                      >
                        {props.actions?.length > 0 &&
                          props.actions.map((act, index) => (
                            <Button
                              key={index}
                              variant="outlined"
                              size="small"
                              onClick={() => handleActionBtn(act, item)}
                              title={t(`btnLabel.${act.hoverLabel}`)}
                              className={act?.btnColor ? act.btnColor : undefined}
                              sx={{ minWidth: 0, px: 1 }}
                            >
                              <i className={act.btnIcon}></i>
                            </Button>
                          ))}
                        {isDeleteModal[item.objectId] && (
                          <ModalUi
                            isOpen
                            title={t("delete-contact")}
                            handleClose={handleClose}
                          >
                            <Box sx={{ m: "20px" }}>
                              <Box sx={{ fontSize: "1.125rem", fontWeight: 400, color: "text.primary" }}>
                                {t("contact-delete-alert")}
                              </Box>
                              <Divider sx={{ mt: 1.5 }} />
                              <Box sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1 }}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleDelete(item)}
                                  sx={{ width: 100 }}
                                >
                                  {t("yes")}
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={handleClose}
                                  sx={{ width: 100 }}
                                >
                                  {t("no")}
                                </Button>
                              </Box>
                            </Box>
                          </ModalUi>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {(props.searchLoader || props.List?.length <= 0) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                bgcolor: "surface.main",
                color: "text.primary",
                borderRadius: 3,
                py: 2
              }}
            >
              {props.searchLoader ? (
                <>
                  <Loader />
                  <Box sx={{ fontSize: "0.875rem" }}>{t("loading-mssg")}</Box>
                </>
              ) : (
                <>
                  <Box sx={{ width: 60, height: 60, overflow: "hidden" }}>
                    <img
                      className="w-full h-full object-contain"
                      src={pad}
                      alt={t("no-data-available")}
                    />
                  </Box>
                  <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {t("no-data-available")}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", p: 1, gap: 0.5 }}>
          {props.List.length > props.docPerPage && (
            <Button variant="outlined" size="small" onClick={() => paginateBack()}>
              {t("prev")}
            </Button>
          )}
          {pageNumbers.map((x, i) => (
            <Button
              key={i}
              size="small"
              variant={x === currentPage ? "contained" : "outlined"}
              onClick={() => setCurrentPage(x)}
              disabled={x === "..."}
            >
              {x}
            </Button>
          ))}
          {props.List.length > props.docPerPage && (
            <Button variant="outlined" size="small" onClick={() => paginateFront()}>
              {t("next")}
            </Button>
          )}
        </Box>
        <ModalUi
          title={t("add-contact")}
          isOpen={isContactform}
          handleClose={handleContactFormModal}
        >
          <AddContact
            isDisableTitle
            isAddYourSelfCheckbox
            details={handleUserData}
            closePopup={handleContactFormModal}
          />
        </ModalUi>
        {isModal?.["edit_" + contact.objectId] && (
          <ModalUi
            isOpen
            title={t("edit-contact")}
            handleClose={handleCloseModal}
          >
            <EditContactForm
              contact={contact}
              handleClose={handleCloseModal}
              handleEditContact={handleEditContact}
            />
          </ModalUi>
        )}
        <ModalUi
          isOpen={isModal?.export}
          title={t("bulk-import")}
          handleClose={handleCloseModal}
        >
          <Box sx={{ position: "relative" }}>
            {Object.keys(actLoader)?.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "rgba(0,0,0,0.3)",
                  zIndex: 30
                }}
              >
                <Loader />
              </Box>
            )}
            <ImportContact
              setLoader={setActLoader}
              onImport={handleCloseModal}
              showAlert={showAlert}
            />
          </Box>
        </ModalUi>
      </Paper>
    </Box>
  );
};

export default Contactbook;
