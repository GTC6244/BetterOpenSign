import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { handleUnlinkSigner } from "../../../constant/Utils";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

const SelectSigners = (props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    signerPos,
    setSignerPos,
    signersData,
    setSignersData,
    uniqueId,
    isRemove,
    handleAddUser,
    isSubscribe
  } = props;
  const [userList, setUserList] = useState([]);
  const [selected, setSelected] = useState();
  const [userData, setUserData] = useState({});
  const [isError, setIsError] = useState(false);

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
      borderRadius: 8,
      zIndex: 9999
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
    //condition to check already assign signer exist if yes then show signer's email on dropdown input box
    if (userList.length > 0 && props.isExistSigner) {
      const alreadyAssign = userList.find(
        (item) => item.objectId === props.isExistSigner.signerObjId
      );
      if (alreadyAssign) {
        setSelected({
          label: `${alreadyAssign.Name}<${alreadyAssign.Email}>`,
          value: alreadyAssign.objectId
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList]);
  // `handleOptions` is used to set just save from quick form to selected option in dropdown
  const handleOptions = (item) => {
    //checking if user select no signer option from dropdown
    if (item) {
      //checking selected signer is already assign to the document or not
      const alreadyAssign = signersData.some(
        (item2) => item2.objectId === item.value
      );
      if (alreadyAssign) {
        alert(t("already-exist-signer"));
        setSelected("");
      } else {
        setSelected(item);
        const userData = userList.find((x) => x.objectId === item.value);
        if (userData) {
          setUserData(userData);
        }
      }
    } else {
      setSelected(item);
    }
  };
  const handleAdd = () => {
    if (userData && userData.objectId) {
      const addedId = handleAddUser(userData);
      if (props.closePopup) {
        props.closePopup();
      }
    } else if (selected?.value) {
      if (props.closePopup) {
        props.closePopup();
      }
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 1000);
    }
  };
  //function to use remove signer from assigned widgets in create template flow
  const handleRemove = () => {
    handleUnlinkSigner(
      signerPos,
      setSignerPos,
      signersData,
      setSignersData,
      uniqueId
    );
    if (props.closePopup) {
      props.closePopup();
    }
  };
  const loadOptions = async (inputValue) => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/getsigners`;
      const token =
            { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      };
      const search = inputValue;
      const axiosRes = await axios.post(url, { search }, { headers });
      const contactRes = axiosRes?.data?.result || [];
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        //compareArrays is a function where compare between two array (total signersList and document signers list)
        //and filter signers from total signer's list which already present in document's signers list
        // const compareArrays = (res, signerObj) => {
        //   return res.filter(
        //     (item1) =>
        //       !signerObj.find((item2) => item2.objectId === item1.objectId)
        //   );
        // };
        //get update signer's List if signersdata is present
        // const updateSignersList =
        //   props?.signersData && compareArrays(res, props?.signersData);
        const result = res;
        setUserList(result);
        return await result.map((item) => ({
          label: `${item.Name}<${item.Email}>`,
          value: item.objectId
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  return (
    <Box sx={{ height: "100%", px: "20px", py: "10px", color: "text.primary" }}>
      <Box sx={{ width: "100%", mx: "auto", p: "8px" }}>
        <Box sx={{ mb: 0 }}>
          <Typography
            component="label"
            sx={{ fontSize: "14px", fontWeight: 700 }}
          >
            {t("choose-from-contacts")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={selected}
                loadingMessage={() => t("loading")}
                noOptionsMessage={() => t("contact-not-found")}
                loadOptions={loadOptions}
                onChange={handleOptions}
                onFocus={() => loadOptions()}
                styles={selectStyles}
                menuPortalTarget={document.getElementById("selectSignerModal")}
              />
            </Box>
            {!props.isContact && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => props.setIsContact(true)}
                sx={{ minWidth: 0, px: 1.5 }}
              >
                <AddIcon fontSize="small" />
              </Button>
            )}
          </Box>
        </Box>
        <Typography
          sx={{
            color: isError ? "error.main" : "transparent",
            fontSize: "11px",
            ml: "6px",
            my: "2px"
          }}
        >
          {t("select-signer")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={() => handleAdd()}>
            {t("submit")}
          </Button>
          {props.isExistSigner && isRemove && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleRemove()}
            >
              {t("no-signer")}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SelectSigners;
