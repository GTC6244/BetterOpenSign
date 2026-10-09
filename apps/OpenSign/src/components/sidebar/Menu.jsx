import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";

const Menu = ({ item, isOpen, closeSidebar }) => {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  const { selectedMenu } = useSelector((state) => state.sidebar);

  return (
    <Box component="li" role="none" sx={{ my: 0.25 }}>
      <ListItemButton
        component={NavLink}
        to={
          item.pageType
            ? `/${item.pageType}/${item.objectId}`
            : `/${item.objectId}`
        }
        onClick={() => closeSidebar(item.title)}
        tabIndex={isOpen ? 0 : -1}
        role="menuitem"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "left",
          columnGap: 2.5,
          p: 1.5,
          color: "text.primary",
          "&:hover": {
            bgcolor: "surface.container",
            color: "text.primary",
            textDecoration: "none"
          },
          "&:focus": { bgcolor: "surface.container", outline: "none" },
          ...(selectedMenu && {
            "&.active": { bgcolor: "surface.container", color: "text.primary" }
          })
        }}
      >
        <Box
          component="span"
          sx={{
            width: 20,
            height: 20,
            display: "flex",
            justifyContent: "center"
          }}
        >
          <i className={`${item.icon} text-[20px]`} aria-hidden="true"></i>
        </Box>
        <Box
          component="span"
          sx={{ display: "flex", alignItems: "center", mb: 0.25 }}
        >
          {t(`sidebar.${item.title}`, { appName: drivename })}
        </Box>
      </ListItemButton>
    </Box>
  );
};

export default Menu;
