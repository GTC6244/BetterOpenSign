import { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import ThemeToggle from "./ThemeToggle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import {
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";
import { useTranslation } from "react-i18next";
import { appInfo } from "../constant/appinfo";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../redux/reducers/sidebarReducer";
import { sessionStatus } from "../redux/reducers/userReducer";

const Header = ({ isConsole, setIsLoggingOut }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [applogo, setAppLogo] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    closeSidebar();
  };
  const closeSidebar = () => {
    if (width && width <= 768) {
      dispatch(toggleSidebar(false));
    }
  };

  useEffect(() => {
    initializeHead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [width]);

  const showSidebar = () => {
    dispatch(toggleSidebar());
  };


  async function initializeHead() {
      const applogo = await getAppLogo();
      if (applogo?.logo) {
        setAppLogo(applogo?.logo);
      } else {
        const logo = localStorage.getItem("appLogo") || appInfo.applogo;
        setAppLogo(logo);
      }
  }
  const handleLogout = async () => {
    setIsOpen(false);
    setIsLoggingOut(true);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    } finally {
      dispatch(sessionStatus(true));
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");
    let favicon = localStorage.getItem("favicon");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("favicon", favicon);
    setIsLoggingOut(false);
    navigate("/");
  };

  //handle to close profile drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest("#profile-menu")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isOpen]);


  useEffect(() => {
    const updateThemeStatus = () => {
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "opensigndark";
      setIsDarkTheme(isDarkTheme);
    };
    updateThemeStatus();

    const observer = new MutationObserver(() => {
      updateThemeStatus();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minHeight: 64,
          px: 1,
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          touchAction: "none"
        }}
      >
        <Box sx={{ flex: "none" }}>
          <IconButton
            onClick={showSidebar}
            size="small"
            sx={{ color: "text.primary" }}
          >
            <i className="fa-light fa-bars" style={{ fontSize: "1.25rem" }}></i>
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, ml: 1 }}>
          <Box
            onClick={() => navigate("/dashboard/35KBoSgoAK")}
            sx={{
              height: { xs: "25px", md: "40px" },
              width: "auto",
              overflow: "hidden",
              cursor: "pointer"
            }}
          >
            {applogo && (
              <Box
                component="img"
                sx={{ objectFit: "contain", height: "100%", width: "auto" }}
                src={
                  isDarkTheme
                    ? "/static/js/assets/images/logo-dark.png"
                    : applogo
                }
                alt="logo"
              />
            )}
          </Box>
        </Box>
        <Box
          id="profile-menu"
          sx={{ flex: "none", display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box>
            <FullScreenButton />
          </Box>
          {width >= 768 && (
            <Avatar
              onClick={toggleDropdown}
              src={image}
              alt="img"
              sx={{
                width: 35,
                height: 35,
                cursor: "pointer",
                border: "1px solid",
                borderColor: "outline.main"
              }}
            />
          )}
          {width >= 768 && (
            <Box
              onClick={toggleDropdown}
              role="button"
              tabIndex="0"
              sx={{ cursor: "pointer", color: "text.primary", fontSize: "0.875rem" }}
            >
              {username && username}
            </Box>
          )}
          <Box sx={{ position: "relative" }} id="profile-menu">
            <IconButton
              tabIndex={0}
              role="button"
              onClick={toggleDropdown}
              size="small"
              sx={{ color: "text.primary" }}
            >
              <i className="fa-light fa-angle-down"></i>
            </IconButton>
            {isOpen && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  right: 0,
                  mt: 2,
                  zIndex: 1,
                  width: 224,
                  borderRadius: 2,
                  color: "text.primary"
                }}
              >
                <MenuList dense>
                  {!isConsole && (
                    <>
                      <MenuItem
                        onClick={() =>
                          openInNewTab("https://docs.opensignlabs.com")
                        }
                      >
                        <i className="fa-light fa-book"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("docs")}
                        </Box>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/profile");
                        }}
                      >
                        <i className="fa-light fa-user"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("profile")}
                        </Box>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/changepassword");
                        }}
                      >
                        <i className="fa-light fa-lock"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("change-password")}
                        </Box>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsOpen(false);
                          navigate("/verify-document");
                        }}
                      >
                        <i className="fa-light fa-check-square"></i>
                        <Box component="span" sx={{ ml: 1 }}>
                          {t("verify-document")}
                        </Box>
                      </MenuItem>
                      <MenuItem disableRipple sx={{ gap: 1 }}>
                        <i className="fa-light fa-moon"></i>
                        <Box component="span">{t("dark-mode")}</Box>
                        <Chip
                          label="BETA"
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "10px",
                            fontWeight: 600,
                            bgcolor: "surface.containerHighest",
                            color: "text.primary"
                          }}
                        />
                        <ThemeToggle />
                      </MenuItem>
                    </>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <i className="fa-light fa-arrow-right-from-bracket"></i>
                    <Box component="span" sx={{ ml: 1 }}>
                      {t("log-out")}
                    </Box>
                  </MenuItem>
                </MenuList>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Header;
