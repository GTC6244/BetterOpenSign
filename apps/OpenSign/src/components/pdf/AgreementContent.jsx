import React from "react";
import { useTranslation } from "react-i18next";
import ModalUi from "../../primitives/ModalUi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

function AgreementContent(props) {
  const { t } = useTranslation();
  const appName =
    "OpenSign™";
  const h2Sx = {
    color: "text.primary",
    fontWeight: 500,
    fontSize: "1.125rem"
  };
  const ulSx = {
    listStyleType: "disc",
    pl: 2,
    py: 1.5,
    my: 0
  };
  const handleOnclick = () => {
    props.setIsAgree(true);
    props.setIsShowAgreeTerms(false);
    props.showFirstWidget();
  };
  return (
    <div>
      <ModalUi
        isOpen={true}
        title={t("term-cond-title")}
        handleClose={() => props.setIsShowAgreeTerms(false)}
      >
        <Box sx={{ height: "100%", p: 2.5 }}>
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p1", { appName: appName })}
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h1")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p2", { appName: appName })}
          </Box>
          <Box component="ul" sx={ulSx}>
            <li>{t("term-cond-p3", { appName: appName })}</li>
            <li>{t("term-cond-p4")}</li>
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h2")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p5")}
          </Box>
          <Box component="ul" sx={ulSx}>
            <li>{t("term-cond-p6", { appName: appName })}</li>
            <li>{t("term-cond-p7", { appName: appName })}</li>
            <li>{t("term-cond-p8")}</li>
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h3")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p9")}
          </Box>
          <Box component="ul" sx={ulSx}>
            <li>{t("term-cond-p10")}</li>
            <li>{t("term-cond-p11")}</li>
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h4")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p12", { appName: appName })}
          </Box>
          <Box component="ul" sx={ulSx}>
            <li>{t("term-cond-p13")}</li>
            <li>{t("term-cond-p14")}</li>
            <li>{t("term-cond-p15")}</li>
          </Box>
          <Box component="span">{t("term-cond-p16", { appName: appName })}</Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h5")}
          </Typography>
          <p>{t("term-cond-p17", { appName: appName })}</p>
          <Box component="p" sx={{ mt: 1 }}>
            {t("term-cond-p18")}
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h6")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p19")}
          </Box>
          <Box component="ul" sx={ulSx}>
            <li>{t("term-cond-p20")}</li>
            <li>{t("term-cond-p21")}</li>
            <li>{t("term-cond-p22", { appName: appName })}</li>
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h7")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p23", { appName: appName })}
          </Box>
          <Box component="ul" sx={ulSx}>
            <li>{t("term-cond-p24")}</li>
            <li>{t("term-cond-p25")}</li>
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h8")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p26", { appName: appName })}
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Typography component="h2" sx={h2Sx}>
            {t("term-cond-h9")}
          </Typography>
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p27", { appName: appName })}
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Box component="span" sx={{ mt: 1, fontWeight: 500 }}>
            {t("term-cond-p28", { appName: appName })}
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Box component="span" sx={{ mt: 1 }}>
            {t("term-cond-p29", { appName: appName })}
          </Box>
          <Link
            href="www.opensignlabs.com"
            target="_blank"
            sx={{ cursor: "pointer" }}
          >
            www.opensignlabs.com
          </Link>

          <Box component="span">{t("term-cond-p30")}</Box>
          <Box component="span" sx={{ fontWeight: 500 }}>
            {" "}
            support@opensignlabs.com{" "}
          </Box>
          <Divider sx={{ my: 1.875 }} />
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start", gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => handleOnclick()}
            >
              {t("agrre-button")}
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => props.setIsShowAgreeTerms(false)}
            >
              {t("close")}
            </Button>
          </Box>
        </Box>
      </ModalUi>
    </div>
  );
}

export default AgreementContent;
