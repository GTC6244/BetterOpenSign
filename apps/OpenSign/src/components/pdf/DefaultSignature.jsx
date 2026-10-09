import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
function DefaultSignature(props) {
  const { t } = useTranslation();
  const defaultSignImg = useSelector((state) => state.widget.defaultSignImg);
  const myInitial = useSelector((state) => state.widget.myInitial);
  const tabName = ["my-signature", "my-initials"];
  const [activeTab, setActiveTab] = useState(0);
  const confirmToaddDefaultSign = (type) => {
    if (props?.xyPosition.length > 0) {
      //check signature or initial widgets exist or not for auto signing
      const getCurrentSignerXY = props?.xyPosition.filter(
        (data) => data.Id === props.uniqueId
      );
      const checkIsSignInitialExist = getCurrentSignerXY?.every(
        (placeholderObj) =>
          placeholderObj?.placeHolder?.some((placeholder) =>
            placeholder?.pos?.some((posItem) => posItem?.type === type)
          )
      );
      if (checkIsSignInitialExist) {
        props?.setDefaultSignAlert({
          isShow: true,
          alertMessage: t("default-sign-alert", { widgetsType: type }),
          type: type
        });
      } else {
        props?.setDefaultSignAlert({
          isShow: true,
          alertMessage: t("defaultSign-alert", { widgetsType: type })
        });
      }
    } else {
      props?.setDefaultSignAlert({
        isShow: true,
        alertMessage: t("please-select-position!")
      });
    }
  };

  return (
    <Box data-tut="reactourThird">
      <Box
        sx={{
          mx: 1,
          pr: 1,
          pt: 1,
          pb: 0.5,
          fontSize: "15px",
          fontWeight: 600,
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Typography
          component="p"
          sx={{ color: "text.primary", fontSize: "15px", fontWeight: 600 }}
        >
          {t("signature")}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 1
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{ minHeight: 0 }}
        >
          {tabName.map((tabData, ind) => (
            <Tab
              key={ind}
              label={t(`${tabData}`)}
              sx={{
                minHeight: 0,
                textTransform: "none",
                fontSize: { xs: "7px", md: "12px" }
              }}
            />
          ))}
        </Tabs>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: "10px",
          fontWeight: 600,
          position: "relative"
        }}
      >
        <Card sx={{ boxShadow: 3, height: "111px", width: "90%", p: 1 }}>
          {activeTab === 0 ? (
            <Box
              component="img"
              alt="signature"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              src={defaultSignImg}
            />
          ) : (
            activeTab === 1 &&
            (myInitial ? (
              <Box
                component="img"
                alt="signature"
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                src={myInitial}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%"
                }}
              >
                <Box component="span">{t("initial-alert")}</Box>
              </Box>
            ))
          )}
        </Card>
        <Button
          type="button"
          variant="contained"
          size="small"
          sx={{ mt: "10px" }}
          onClick={() =>
            confirmToaddDefaultSign(
              activeTab === 0 ? "signature" : activeTab === 1 && "initials"
            )
          }
          disabled={
            activeTab === 0 && !props?.isDefault
              ? true
              : activeTab === 1 && !myInitial
                ? true
                : false
          }
        >
          {t("auto-sign-all")}
        </Button>
        {!props.isDefault && (
          <Box
            sx={{
              position: "absolute",
              bgcolor: "rgba(0,0,0,0.7)",
              color: "common.white",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              cursor: "default"
            }}
          >
            <Box component="span" sx={{ transform: "rotate(-45deg)" }}>
              {t("option-disabled-by-owner")}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DefaultSignature;
