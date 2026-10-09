import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";

const Submenu = ({ item, closeSidebar, toggleSubmenu, submenuOpen }) => {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  const { title, icon, children } = item;
  const { selectedMenu } = useSelector((state) => state.sidebar);

  const linkSx = {
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
    "&:focus": { bgcolor: "surface.container", outline: "none" }
  };

  return (
    <Box component="li" role="none" sx={{ my: 0.25 }}>
      <ListItemButton
        onClick={() => toggleSubmenu(item.title)}
        sx={linkSx}
        aria-expanded={submenuOpen}
        aria-haspopup="true"
        aria-controls={`submenu-${title}`}
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
          <i className={`${icon} text-[20px]`}></i>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%"
          }}
        >
          <Box component="span" sx={{ display: "flex", alignItems: "center", mb: 0.25 }}>
            {t(`sidebar.${item.title}`, { appName })}
          </Box>
          <i
            className={`${
              submenuOpen[item.title]
                ? "fa-light fa-angle-down"
                : "fa-light fa-angle-right"
            }`}
            aria-hidden="true"
          ></i>
        </Box>
      </ListItemButton>
      {submenuOpen[item.title] && (
        <Box
          component="ul"
          id={`submenu-${title}`}
          role="menu"
          aria-label={`${title} submenu`}
        >
          {children.map((childItem) => (
            <Box component="li" key={childItem.title} role="none" sx={{ my: 0.25 }}>
              <ListItemButton
                component={NavLink}
                to={
                  childItem.pageType
                    ? `/${childItem.pageType}/${childItem.objectId}`
                    : `/${childItem.objectId}`
                }
                onClick={() => closeSidebar(childItem.title)}
                role="menuitem"
                tabIndex={submenuOpen ? 0 : -1}
                sx={{
                  pl: 2,
                  display: "flex",
                  alignItems: "center",
                  columnGap: 2.5,
                  py: 1,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  color: "text.primary",
                  "&:hover": {
                    bgcolor: "surface.container",
                    color: "text.primary",
                    textDecoration: "none"
                  },
                  "&:focus": { bgcolor: "surface.container", outline: "none" },
                  ...(selectedMenu && {
                    "&.active": {
                      bgcolor: "surface.container",
                      color: "text.primary"
                    }
                  })
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 18,
                    height: 18,
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <i
                    className={`${childItem.icon} text-[18px]`}
                    aria-hidden="true"
                  ></i>
                </Box>
                <Box component="span" sx={{ mb: 0.25 }}>
                  {t(`sidebar.${item.title}-Children.${childItem.title}`, {
                    appName: drivename
                  })}
                </Box>
              </ListItemButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Submenu;
