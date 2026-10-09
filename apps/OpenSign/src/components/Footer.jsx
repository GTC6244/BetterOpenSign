import React, { useEffect, useState } from "react";
import Package from "../../package.json";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { openInNewTab } from "../constant/Utils";
import { useTranslation } from "react-i18next";
const Footer = () => {
  const appName = "OpenSign™";
  const { t } = useTranslation();
  const [showButton, setShowButton] = useState(false);
  const [version, setVersion] = useState("");
  useEffect(() => {
    axios
      .get("/version.txt")
      .then((response) => {
        setVersion(response.data); // Set the retrieved data to the state variable
      })
      .catch((error) => {
        console.error("Error reading the file:", error);
      });
  }, []);

  const handleScroll = () => {
    if (window.pageYOffset >= 50) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    setShowButton(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const openUrl = () => {
    openInNewTab(
      "https://github.com/OpenSignLabs/OpenSign/releases/tag/" + version
    );
  };
  return (
    <>
      <Box
        component="footer"
        sx={{
          py: 1.5,
          bgcolor: "surface.containerHighest",
          color: "text.primary",
          textAlign: "center",
          fontSize: "13px"
        }}
      >
        <Typography variant="body2" component="p" sx={{ fontSize: "13px" }}>
          {t("all-right")} &copy; {new Date().getFullYear()} &nbsp;
          <Box
            component="span"
            onClick={openUrl}
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            {appName} ( {t("version")}:{" "}
            {version ? version : `${Package.version} `})
          </Box>
        </Typography>
      </Box>
      {showButton && (
        <Fab
          onClick={scrollToTop}
          size="medium"
          color="secondary"
          aria-label="scroll to top"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </>
  );
};

export default Footer;
