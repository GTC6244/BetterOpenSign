import MuiTooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { openInNewTab } from "../constant/Utils";

/**
 * MD3 help affordance: a small question-mark icon.
 *  - With `url`/`handleOnlickHelp`: acts as a button (opens link / runs handler).
 *  - Otherwise: shows the `message` as an MD3 tooltip on hover/focus.
 */
const Tooltip = ({ id, message, url, iconColor, maxWidth, handleOnlickHelp }) => {
  const color = iconColor || "#33bbff";

  const icon = (
    <HelpOutlineIcon sx={{ fontSize: 16, color }} />
  );

  if (url || handleOnlickHelp) {
    return (
      <IconButton
        size="small"
        aria-label="help"
        onClick={() =>
          handleOnlickHelp ? handleOnlickHelp() : openInNewTab(url)
        }
        sx={{ p: 0.25, verticalAlign: "super" }}
      >
        {icon}
      </IconButton>
    );
  }

  return (
    <MuiTooltip
      id={id || "my-tooltip"}
      title={message}
      arrow
      slotProps={{
        tooltip: {
          sx: { maxWidth: maxWidth ? undefined : 200 }
        }
      }}
    >
      <IconButton size="small" aria-label="info" sx={{ p: 0.25, verticalAlign: "super" }}>
        {icon}
      </IconButton>
    </MuiTooltip>
  );
};

export default Tooltip;
