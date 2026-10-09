/* ---------------- Wizard Header ---------------- */

import React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

function WizardHeader({ steps, step, onStepClick }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 0, md: 1 }
      }}
    >
      {steps.map((s, i) => {
        const isActive = i === step;
        const isDone = i < step;

        return (
          <React.Fragment key={s.key}>
            <ButtonBase
              onClick={() => onStepClick?.(i)}
              title={s.label}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                borderRadius: "8px",
                px: 1.5,
                py: 1,
                fontSize: { xs: "0.75rem", lg: "0.875rem" },
                fontWeight: 500,
                border: 1,
                ...(isActive
                  ? {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      borderColor: "primary.main"
                    }
                  : isDone
                    ? {
                        bgcolor: "background.paper",
                        color: "text.primary",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "surface.containerHigh" }
                      }
                    : {
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        borderColor: "divider"
                      })
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  height: 20,
                  width: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  fontSize: "0.75rem",
                  ...(isActive
                    ? {
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "primary.contrastText"
                      }
                    : {
                        bgcolor: "surface.containerHighest",
                        color: isDone ? "text.primary" : "text.secondary"
                      })
                }}
              >
                {i + 1}
              </Box>

              <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                {s.label}
              </Box>

              {/* info icon like screenshot */}
              <Box
                component="a"
                data-tooltip-id={`${s.key}-tooltip`}
                sx={{ ml: 0.5, display: "inline-flex" }}
              >
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    display: "inline-flex",
                    height: "1.10rem",
                    width: "1.10rem",
                    alignItems: "center",
                    justifyContent: "center",
                    border: 1,
                    borderRadius: "50%",
                    ...(!isActive
                      ? { borderColor: "#33bbff", color: "#33bbff" }
                      : { borderColor: "divider", color: "divider" })
                  }}
                >
                  <HelpOutlineIcon sx={{ fontSize: 13 }} />
                </Box>
              </Box>
              <Box component="span" sx={{ textAlign: "left" }}>
                {s.help}
              </Box>
            </ButtonBase>

            {i < steps.length - 1 && (
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  mx: 0.5,
                  userSelect: "none",
                  color: "text.disabled",
                  textAlign: "center",
                  fontSize: "1.5rem",
                  transform: { xs: "rotate(90deg)", md: "none" },
                  mb: { md: 1 }
                }}
              >
                &#8250;
              </Box>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

export default WizardHeader;
