import { useState, useRef, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import RecipientList from "./RecipientList";
import WidgetList from "./WidgetList";
import {
  isMobile,
  radioButtonWidget,
  textInputWidget,
  cellsWidget,
  textWidget,
  widgets,
  drawWidget
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import { useWidgetDrag } from "../../hook/useWidgetDrag";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

function WidgetComponent(props) {
  const { t } = useTranslation();
  const signRef = useRef(null);
  const userInformation = localStorage.getItem("UserInformation");
  const [isSignersModal, setIsSignersModal] = useState(false);
  // Define all draggable widget configurations
  const draggableItems = [
    { id: 1, text: "signature" },
    { id: 2, text: "stamp" },
    { id: 3, text: "initials" },
    { id: 4, text: textInputWidget },
    { id: 6, text: "name" },
    { id: 7, text: "job title" },
    { id: 8, text: "company" },
    { id: 9, text: "email" },
    { id: 10, text: "date" },
    { id: 11, text: textWidget },
    { id: 12, text: cellsWidget },
    { id: 13, text: "checkbox" },
    { id: 14, text: "dropdown" },
    { id: 15, text: radioButtonWidget },
    { id: 16, text: "image" },
    { id: 17, text: drawWidget },
  ];

  // Create all drag refs in one go
  const widgetRefs = draggableItems.map((item) =>
    useWidgetDrag({ type: "BOX", ...item })
  );

  // Map your widgets with the generated dragRefs
  const [widgetList, setWidgetList] = useState([]);
  const handleModal = () => {
    setIsSignersModal(!isSignersModal);
  };
  useEffect(() => {
    const updated = widgets.map((obj, index) => ({
      ...obj,
      ref: widgetRefs[index]?.dragRef || null
    }));
    setWidgetList(updated);
    // eslint-disable-next-line
  }, []);

  // allow only (signature, stamp, initials, text, name, job title, company, email, cells) widget when isAllowModification true and user have session token
  const modifiedWidgets = widgetList.filter(
    (data) =>
      ![
        "dropdown",
        radioButtonWidget,
        textInputWidget,
        "date",
        "image",
        "checkbox",
        drawWidget
      ].includes(data.type)
  );
  // allow only (signature, stamp, initials, text, cells) widget when isAllowModification true and user does not have session token
  const unlogedInUserWidgets = widgetList.filter(
    (data) =>
      ![
        "dropdown",
        radioButtonWidget,
        textInputWidget,
        "date",
        "image",
        "checkbox",
        "name",
        "email",
        "job title",
        "company",
        drawWidget
      ].includes(data.type)
  );
  const selfSignWidgets = widgetList.filter(
    (data) =>
      ![
        "dropdown",
        radioButtonWidget,
        textInputWidget,
        drawWidget,
      ].includes(data.type)
  );
  //if user select prefill role then allow only date,image,text,checkbox,radio,dropdownAdd commentMore actions
  //dropdown widget should only be show in template flow
  const prefillAllowWidgets = widgetList.filter((data) =>
    (props.isPrefillDropdown ? ["dropdown"] : [])
      .concat([
        radioButtonWidget,
        textWidget,
        "date",
        "image",
        "checkbox",
        drawWidget
      ])
      .includes(data.type)
  );
  //function to show widget on the base of conditionAdd commentMore actions
  const handleWidgetType = () => {
    if (props.isSignYourself) {
      return selfSignWidgets;
    } else if (props?.roleName === "prefill") {
      return prefillAllowWidgets;
    } else if (props.isAlllowModify) {
      if (userInformation) {
        return modifiedWidgets;
      } else {
        return unlogedInUserWidgets;
      }
    } else if (props?.roleName !== "prefill") {
      return widgetList.filter(
        (data) => ![textWidget, drawWidget].includes(data.type)
      );
    }
  };
  const handleSelectRecipient = () => {
    if (props?.roleName === "prefill") {
      return "Prefill by owner";
    } else if (
      props.signersdata[props.isSelectListId]?.Email ||
      props.signersdata[props.isSelectListId]?.Role
    ) {
      const userData =
        props.signersdata[props.isSelectListId]?.Name ||
        props.signersdata[props.isSelectListId]?.Role;
      const name =
        userData?.length > 20 ? `${userData.slice(0, 20)}...` : userData;
      return name;
    }
  };
  const handleBlockColor = () => {
    const widgetBoxColor = props?.signerPos?.find(
      (x) => x?.Id === props?.uniqueId
    )?.blockColor;
    return widgetBoxColor;
  };
  return (
    <>
      {isMobile ? (
        !props.isMailSend && (
          <Box
            id="navbar"
            sx={{
              position: "fixed",
              zIndex: 99,
              bottom: 0,
              right: 0,
              width: "100%"
            }}
          >
            {props.isSigners && (
              <Box
                sx={{
                  width: "100%",
                  mb: 0.625,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.5
                }}
              >
                <Box sx={{ width: "100%", ml: 0.625 }} onClick={() => handleModal()}>
                  <TextField
                    select
                    data-tut="recipientArea"
                    size="small"
                    fullWidth
                    value={handleSelectRecipient() || ""}
                    sx={{
                      pointerEvents: "none",
                      "& .MuiInputBase-root": {
                        backgroundColor:
                          props.roleName === "prefill"
                            ? "#edf6fc"
                            : handleBlockColor() || "#edf6fc"
                      }
                    }}
                  >
                    <MenuItem value={handleSelectRecipient() || ""}>
                      {handleSelectRecipient()}
                    </MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ width: "18%" }}>
                  {props.handleAddSigner ? (
                    <Button
                      data-tut="reactourAddbtn"
                      onClick={() => props.handleAddSigner()}
                      variant="contained"
                      color="secondary"
                    >
                      <i className="fa-light fa-plus "></i>
                    </Button>
                  ) : (
                    props.setIsAddSigner && (
                      <Button
                        data-tut="addRecipient"
                        onClick={() => props.setIsAddSigner(true)}
                        variant="contained"
                        color="secondary"
                      >
                        <i className="fa-light fa-plus"></i>
                      </Button>
                    )
                  )}
                </Box>
              </Box>
            )}

            <Box
              data-tut="addWidgets"
              sx={{
                bgcolor: "surface.main",
                border: "2px solid",
                borderColor: "divider",
                borderTopColor: "primary.main"
              }}
            >
              <div className="flex whitespace-nowrap overflow-x-scroll pt-[10px] pb-[5px] pr-[5px]">
                <WidgetList
                  updateWidgets={handleWidgetType}
                  handleDivClick={props.handleDivClick}
                  handleMouseLeave={props.handleMouseLeave}
                  signRef={signRef}
                  marginLeft={5}
                  addPositionOfSignature={props.addPositionOfSignature}
                />
              </div>
            </Box>
          </Box>
        )
      ) : (
        <Box
          data-tut={props.dataTut}
          className={props.isMailSend ? "bg-opacity-50 pointer-events-none" : ""}
          sx={{
            display: { xs: "none", md: "block" },
            height: "100%",
            bgcolor: "surface.main"
          }}
        >
          <Box
            sx={{
              mx: 1,
              pr: 1,
              pt: 1,
              pb: 0.5,
              fontSize: "15px",
              color: "text.primary",
              fontWeight: 600,
              borderBottom: "1px solid",
              borderColor: "divider"
            }}
          >
            <span>
              {t("widgets")}
              {props?.isSignYourself && (
                <sup onClick={() => props.setIsTour && props.setIsTour(true)}>
                  <Box
                    component="i"
                    className="cursor-pointer fa-light fa-question"
                    sx={{
                      ml: 0.5,
                      borderRadius: "9999px",
                      border: "1px solid",
                      borderColor: "text.primary",
                      fontSize: "11px",
                      py: "1px",
                      px: "3px"
                    }}
                  ></Box>
                </sup>
              )}
            </span>
          </Box>
          <div
            className="p-[12px] grid lg:grid-cols-2 gap-x-2 lg:gap-y-1.5 pt-3"
            data-tut="addWidgets"
            role="list"
            aria-label="Add widgets"
          >
            <WidgetList
              updateWidgets={handleWidgetType}
              handleDivClick={props.handleDivClick}
              handleMouseLeave={props.handleMouseLeave}
              signRef={signRef}
              addPositionOfSignature={props.addPositionOfSignature}
            />
          </div>
        </Box>
      )}
      {isSignersModal && (
        <ModalUi
          title={props.title ? props.title : t("recipients")}
          isOpen={isSignersModal}
          handleClose={handleModal}
        >
          {props.signersdata.length > 0 || props.prefillSigner.length > 0 ? (
            <div className="max-h-[600px] overflow-auto pb-1">
              <RecipientList
                signerPos={props.signerPos}
                signersdata={props.signersdata}
                isSelectListId={props.isSelectListId}
                setIsSelectId={props.setIsSelectId}
                setUniqueId={props.setUniqueId}
                setRoleName={props.setRoleName}
                handleDeleteUser={props.handleDeleteUser}
                handleRoleChange={props.handleRoleChange}
                handleOnBlur={props.handleOnBlur}
                handleModal={handleModal}
                sendInOrder={props.sendInOrder}
                setSignersData={props.setSignersData}
                setBlockColor={props.setBlockColor}
                uniqueId={props.uniqueId}
                setSignerPos={props.setSignerPos}
                prefillSigner={props.prefillSigner}
              />
            </div>
          ) : (
            <div className=" p-[20px] text-[15px] font-medium text-center">
              {t("please-add")} {props.title ? props.title : t("recipients")}
            </div>
          )}
        </ModalUi>
      )}
    </>
  );
}

export default WidgetComponent;
