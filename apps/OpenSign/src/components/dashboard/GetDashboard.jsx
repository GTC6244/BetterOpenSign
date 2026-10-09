import { useState, useEffect, Suspense } from "react";
import { lazyWithRetry } from "../../utils";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
const DashboardButton = lazyWithRetry(() => import("./DashboardButton"));
const DashboardCard = lazyWithRetry(() => import("./DashboardCard"));
const DashboardReport = lazyWithRetry(() => import("./DashboardReport"));
const buttonList = [
  {
    label: "Sign yourself",
    redirectId: "sHAnZphf69",
    redirectType: "Form",
    icon: "fa-light fa-pen-nib"
  },
  {
    label: "Request signatures",
    redirectId: "8mZzFxbG1z",
    redirectType: "Form",
    icon: "fa-light fa-paper-plane"
  }
];
const GetDashboard = (props) => {
  const { t } = useTranslation();

  const Button = ({ label, redirectId, redirectType, icon }) => (
    <DashboardButton
      Icon={icon}
      Label={label}
      Data={{ Redirect_type: redirectType, Redirect_id: redirectId }}
    />
  );
  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <Box
            className={
              col?.widget?.bgColor ? col.widget.bgColor : "bg-[#2ed8b6]"
            }
            data-tut={col.widget.data.tourSection}
            sx={{
              position: "relative",
              width: "100%",
              height: 140,
              px: 1.5,
              pt: 2,
              mb: 1.5,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <Suspense
              fallback={
                <Box
                  sx={{
                    height: 150,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {t("loading")}
                </Box>
              }
            >
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
              />
            </Suspense>
          </Box>
        );
      case "report": {
        return (
          <div data-tut={col.widget.data.tourSection}>
            <Suspense fallback={<div>please wait</div>}>
              <Box sx={{ mb: { xs: 1.5, md: 0 } }}>
                <DashboardReport
                  Record={col.widget}
                />
              </Box>
            </Suspense>
          </div>
        );
      }
      default:
        return <></>;
    }
  };
  const renderSwitch = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <Box
            className={
              col?.widget?.bgColor ? col.widget.bgColor : "bg-[#2ed8b6]"
            }
            sx={{
              position: "relative",
              width: "100%",
              height: 140,
              px: 1.5,
              pt: 2,
              mb: 1.5,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <Suspense fallback={<div>please wait</div>}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
              />
            </Suspense>
          </Box>
        );
      case "report": {
        return (
          <Suspense fallback={<div>please wait</div>}>
            <Box sx={{ mb: { xs: 1.5, md: 0 } }}>
              <DashboardReport
                Record={col.widget}
              />
            </Box>
          </Suspense>
        );
      }
      default:
        return <></>;
    }
  };
  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Box
          data-tut={"tourbutton"}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2
          }}
        >
          {buttonList.map((btn) => (
            <Button
              key={btn.label}
              label={btn.label}
              redirectType={btn.redirectType}
              redirectId={btn.redirectId}
              icon={btn.icon}
            />
          ))}
        </Box>
      </Box>
      <div className="grid grid-cols-12 w-full gap-x-4">
        {props?.dashboard?.columns?.map((col, i) =>
          col.widget.data && col.widget.data.tourSection ? (
            <div key={i} className={col?.colsize}>
              {renderSwitchWithTour(col)}
            </div>
          ) : (
            <div key={i} className={col?.colsize}>
              {renderSwitch(col)}
            </div>
          )
        )}
      </div>
    </Box>
  );
};

export default GetDashboard;
