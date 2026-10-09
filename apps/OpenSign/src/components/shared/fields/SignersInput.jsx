import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import AddContact from "../../../primitives/AddContact";
import Tooltip from "../../../primitives/Tooltip";
import { useTranslation } from "react-i18next";
import { findContact } from "../../../constant/Utils";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

const AddSignerModal = ({ isOpen, children }) => {
  return (
    <Dialog
      open={!!isOpen}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            position: "relative",
            p: 0,
            minWidth: { xs: "90%", md: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            fontSize: "0.875rem"
          }
        }
      }}
    >
      {children}
    </Dialog>
  );
};

/**
 * react-sortable-hoc is depcreated not usable from react 18.x.x
 *  need to replace it with @dnd-kit
 * code changes required
 */

const SignersInput = (props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [state, setState] = useState(undefined);
  const [selected, setSelected] = useState([]);
  const [isModal, setIsModel] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // MD3-themed styles for the react-select dropdown (replaces DaisyUI op-* classes).
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 32,
      fontSize: 11,
      backgroundColor: theme.palette.background.paper,
      borderColor: state.isFocused
        ? theme.palette.primary.main
        : theme.palette.divider,
      boxShadow: "none",
      "&:hover": { borderColor: theme.palette.text.primary }
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
    menu: (base) => ({
      ...base,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: 8
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? theme.palette.surface.container
        : theme.palette.background.paper,
      color: theme.palette.text.primary,
      cursor: "pointer"
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 8
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme.palette.primary.contrastText,
      fontSize: 11
    }),
    singleValue: (base) => ({ ...base, color: theme.palette.text.primary }),
    input: (base) => ({ ...base, color: theme.palette.text.primary }),
    placeholder: (base) => ({ ...base, color: theme.palette.text.secondary })
  };

  useEffect(() => {
    // to provide initial data for selected list items in Bcc for edit template
    if (props?.initialData && props?.initialData?.length > 0) {
      const trimEmail = props?.initialData.map((item) => ({
        value: item?.objectId,
        label: item?.Name,
        email: item?.Email
      }));
      setSelected(trimEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions?.length > 0) {
      const trimEmail = selectedOptions.map((item) => ({
        ...item,
        label: item?.label?.split("<")?.shift()
      }));
      setSelected(trimEmail);
    } else {
      setSelected(selectedOptions);
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newValue = arrayMove(selected, oldIndex, newIndex);
    setSelected(newValue);
  };

  useEffect(() => {
    if (props.isReset && props.isReset === true) {
      setSelected([]);
    }
  }, [props.isReset]);

  useEffect(() => {
    if (selected && selected.length) {
      let newData = [];
      selected.forEach((x) => {
        if (props?.isCaptureAllData) {
          newData.push(x);
        } else {
          newData.push(x.value);
        }
      });
      if (props.onChange) {
        props.onChange(newData);
      }
    }

    // eslint-disable-next-line
  }, [selected]);

  const handleModalCloseClick = () => {
    setIsModel(false);
    setModalIsOpen(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  // `handleNewDetails` is used to set just save from quick form to selected option in dropdown
  const handleNewDetails = (data) => {
    const user = {
      value: data["objectId"],
      label: data["Name"],
      email: data?.Email
    };
    setState([...state, user]);
    if (selected.length > 0) {
      setSelected([...selected, user]);
    } else {
      setSelected([user]);
    }
  };
  const loadOptions = async (inputValue) => {
    try {
      const contactRes = await findContact(
        inputValue,
      );
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        //compareArrays is a function where compare between two array (total signersList and document signers list)
        //and filter signers from total signer's list which already present in document's signers list
        const compareArrays = (res, signerObj) => {
          return res.filter(
            (item1) =>
              !signerObj.find((item2) => item2.objectId === item1.objectId)
          );
        };

        //get update signer's List if signersdata is present
        const updateSignersList =
          props?.signersData && compareArrays(res, props?.signersData);

        const result = updateSignersList ? updateSignersList : res;
        setState(result);
        return await result.map((item) => ({
          label: item.Name + "<" + item.Email + ">",
          value: item.objectId,
          email: item.Email,
          isChecked: true
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  return (
    <Box sx={{ fontSize: "0.75rem", mt: 1 }}>
      <Typography
        component="label"
        sx={{ display: "block", position: "relative" }}
      >
        {props.label ? props.label : t("signers")}
        {props.required && (
          <Box component="span" sx={{ color: "error.main", fontSize: "13px" }}>
            *
          </Box>
        )}
        <Box
          component="span"
          sx={{
            zIndex: props?.zindex ? props.zindex : 30,
            position: "absolute",
            ml: 0.5,
            fontSize: "0.75rem"
          }}
        >
          <Tooltip
            id={`${props.label ? props.label : "signers"}-tooltip`}
            message={props.helpText ? props.helpText : t("signers-help")}
          />
        </Box>
      </Typography>
      <Box sx={{ display: "flex", columnGap: "5px" }}>
        <Box
          sx={{ width: "100%", zIndex: props?.zindex ? props.zindex : 40 }}
        >
          <AsyncSelect
            onSortEnd={onSortEnd}
            distance={4}
            isMulti
            cacheOptions
            defaultOptions
            options={state || []}
            value={selected}
            onChange={onChange}
            closeMenuOnSelect={false}
            required={props.required}
            loadingMessage={() => t("loading")}
            noOptionsMessage={() => t("contact-not-found")}
            loadOptions={loadOptions}
            styles={selectStyles}
          />
        </Box>
        <Box
          onClick={() => {
            setIsModel(true);
            openModal();
          }}
          sx={{
            cursor: "pointer",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            maxHeight: "38px",
            minWidth: "48px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "text.primary",
            "&:hover": { borderColor: "text.primary" }
          }}
        >
          <AddIcon fontSize="small" />
        </Box>
        <AddSignerModal isOpen={modalIsOpen}>
          <Typography
            component="h3"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              fontSize: "1.125rem",
              pt: "15px",
              px: "20px"
            }}
          >
            {t("add-contact")}
          </Typography>
          <IconButton
            onClick={handleModalCloseClick}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.primary"
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          {isModal && (
            <AddContact
              isDisableTitle
              isAddYourSelfCheckbox={props?.isAddYourSelfCheckbox}
              details={handleNewDetails}
              closePopup={handleModalCloseClick}
            />
          )}
        </AddSignerModal>
      </Box>
    </Box>
  );
};

export default SignersInput;
