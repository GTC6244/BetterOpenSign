import { useState, useEffect } from "react";
import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "../SocialMedia";
import dp from "../../assets/images/dp.png";
import sidebarList, { subSetting } from "../../json/menuJson";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "../../hook/useWindowSize";
import {
  setSelectedMenu,
  toggleSidebar
} from "../../redux/reducers/sidebarReducer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

const Sidebar = () => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const tenantname = localStorage.getItem("Extand_Class")
    ? JSON.parse(localStorage.getItem("Extand_Class"))?.[0]?.Company
    : "";

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const closeSidebar = () => {
    dispatch(setSelectedMenu(true));
    if (width <= 1023) {
      dispatch(toggleSidebar(false));
    }
  };

  const menuItem = async () => {
    try {
      if (localStorage.getItem("defaultmenuid")) {
        const Extand_Class = localStorage.getItem("Extand_Class");
        const extClass = Extand_Class && JSON.parse(Extand_Class);
        const userRole = extClass?.[0]?.UserRole || "contracts_User";
        const isAdmin =
          userRole === "contracts_Admin" || userRole === "contracts_OrgAdmin";
        const newSidebarList = sidebarList.map((item) => {
          if (item.title !== "Settings") return item;
          const newItem = { ...item };
          const baseChildren = isAdmin ? subSetting : subSetting?.slice(0, 1);
            const mysignature = newItem.children.slice(0, 1);
            newItem.children = [...mysignature, ...baseChildren];
          return newItem;
        });
        setmenuList(newSidebarList);
      }
    } catch (e) {
      console.error("Problem", e);
    }
  };

  const toggleSubmenu = (title) => {
    dispatch(setSelectedMenu(false));
    setSubmenuOpen({ [title]: !submenuOpen[title] });
  };

  const handleMenuItem = () => {
    dispatch(setSelectedMenu(true));
    closeSidebar();
    setSubmenuOpen({});
  };
  const handleProfile = () => {
    closeSidebar();
    navigate("/profile");
  };
  return (
    <Box
      component="aside"
      className="hide-scrollbar"
      sx={{
        position: { xs: "absolute", lg: "relative" },
        minHeight: { xs: "100vh", lg: "auto" },
        bgcolor: "surface.main",
        overflowY: "auto",
        transition: "all 0.2s",
        zIndex: 500,
        boxShadow: 3,
        width: isOpen ? { xs: "100%", md: "16rem" } : 0
      }}
    >
      <Box
        sx={{
          display: "flex",
          px: 1,
          py: 1.5,
          gap: 1,
          alignItems: "center",
          boxShadow: 2
        }}
      >
        <Avatar
          onClick={() => handleProfile()}
          src={image}
          alt="Profile"
          sx={{
            width: 75,
            height: 75,
            cursor: "pointer",
            border: "2px solid",
            borderColor: "outline.main",
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
            "& img": { objectFit: "contain" }
          }}
        />
        <Box>
          <Typography
            onClick={handleProfile}
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              color: "text.primary",
              cursor: "pointer"
            }}
          >
            {username}
          </Typography>
          <Typography
            onClick={handleProfile}
            sx={{
              cursor: "pointer",
              fontSize: "12px",
              color: "text.primary",
              mt: tenantname ? 1 : 0
            }}
          >
            {tenantname}
          </Typography>
        </Box>
      </Box>
      <Box
        component="nav"
        aria-label="OpenSign Sidebar Navigation"
      >
        <Box
          component="ul"
          sx={{ fontSize: "0.875rem", listStyle: "none", m: 0, p: 0 }}
          role="menubar"
          aria-label="OpenSign Sidebar Navigation"
        >
          {menuList.map((item) =>
            !item.children ? (
              <Menu
                key={item.title}
                item={item}
                isOpen={isOpen}
                closeSidebar={handleMenuItem}
              />
            ) : (
              <Submenu
                key={item.title}
                item={item}
                closeSidebar={closeSidebar}
                toggleSubmenu={toggleSubmenu}
                submenuOpen={submenuOpen}
              />
            )
          )}
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          my: 1.5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "25px",
          color: "text.primary",
          gap: 1.5
        }}
      >
        <SocialMedia />
      </Box>
    </Box>
  );
};

export default Sidebar;
