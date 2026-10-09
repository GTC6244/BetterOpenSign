import { useTranslation } from "react-i18next";
import { formatDateTime, getSignerEmail } from "../constant/Utils";
import { useState } from "react";
import ModalUi from "./ModalUi";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import CloseIcon from "@mui/icons-material/Close";

// Signer is used in report to show signer list conditionally
const SignerCell = ({ reportName, item, handleRemovePrefill }) => {
  const { t } = useTranslation();
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const isTemplateReport = reportName === "Templates";
  const isCompletedReport = reportName === "Completed Documents";
  const [isShowAllSigners, setIsShowAllSigners] = useState({});
  const [isModal, setIsModal] = useState(false);
  const shouldShowSigner = [
    "In-progress documents",
    "Need your sign",
    "Completed Documents"
  ].includes(reportName);
  const shouldRender =
    !item?.IsSignyourself && handleRemovePrefill(item?.Placeholders);

  const handleCloseModal = () => {
    setIsModal({});
  };
  const handleViewSigners = (item) => {
    setIsModal({ ["view_" + item.objectId]: true });
  };
  // Map signer activity to an MD3 chip color role
  const activityColor = (activity) => {
    if (activity === "SIGNED") return "primary";
    if (activity === "VIEWED") return "success";
    return "default";
  };
  // `formatStatusRow` is used to format status row
  const formatStatusRow = (item) => {
    const timezone = extClass?.[0]?.Timezone || "";
    const DateFormat = extClass?.[0]?.DateFormat || "MM/DD/YYYY";
    const Is12Hr = extClass?.[0]?.Is12HourTime || false;
    const removePrefill = item?.Placeholders.filter(
      (data) => data?.Role !== "prefill"
    );
    const signers = removePrefill?.map((x, i) => {
      const audit = item?.AuditTrail?.find(
        (audit) => audit?.UserPtr?.objectId === x.signerObjId
      );
      const format = (date) =>
        date
          ? formatDateTime(new Date(date), DateFormat, timezone, Is12Hr)
          : "-";
      return {
        id: i,
        Email: getSignerEmail(x, item?.Signers) || x?.email || "-",
        Activity: audit?.Activity?.toUpperCase() || "SENT",
        SignedOn: format(audit?.SignedOn),
        ViewedOn: format(audit?.ViewedOn)
      };
    });
    // Decide how many signers to display based on `showAllSignes` state
    const displaySigners = isShowAllSigners[item.objectId]
      ? signers
      : signers.slice(0, 3);
    return (
      <>
        {displaySigners?.map((x, i) => (
          <Box
            key={i}
            sx={{
              fontSize: "0.875rem",
              display: "flex",
              flexDirection: "row",
              gap: 1,
              alignItems: "center",
              mb: i !== displaySigners.length - 1 ? 1 : 0
            }}
          >
            {!isCompletedReport && (
              <Chip
                size="small"
                variant="outlined"
                color={activityColor(x.Activity)}
                label={x?.Activity?.toUpperCase() || "-"}
                onClick={() => setIsModal({ [`${item.objectId}_${i}`]: true })}
                sx={{
                  width: 60,
                  height: 30,
                  fontSize: "11px",
                  borderRadius: 9999,
                  borderWidth: 2
                }}
              />
            )}
            <Box sx={{ fontSize: "12px" }}>{x?.Email || "-"}</Box>
            {!isCompletedReport && isModal[`${item.objectId}_${i}`] && (
              <ModalUi
                isOpen
                title={t("document-logs")}
                handleClose={handleCloseModal}
              >
                <Box
                  sx={{
                    pl: 1.5,
                    mt: 1,
                    borderTop: "1px solid",
                    borderColor: "outline.main",
                    fontSize: "12px",
                    py: 1
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}> {x?.Email}</Typography>
                  <Typography>
                    {t("viewed-on", { ViewedOn: x?.ViewedOn })}
                  </Typography>
                  <Typography>
                    {t("signed-on", { SignedOn: x?.SignedOn })}
                  </Typography>
                </Box>
              </ModalUi>
            )}
          </Box>
        ))}
        {/* Show More / Hide button */}
        {signers?.length > 3 && (
          <Link
            component="button"
            underline="always"
            onClick={() =>
              setIsShowAllSigners({
                [item.objectId]: !isShowAllSigners[item.objectId]
              })
            }
            sx={{ ml: 1, mt: 0.5, fontSize: "0.75rem", fontWeight: 500 }}
          >
            {isShowAllSigners[item.objectId] ? t("hide") : t("show-more")}
          </Link>
        )}
      </>
    );
  };

  if (shouldShowSigner) {
    return (
      <td className="px-1 py-2">
        {shouldRender ? <>{formatStatusRow(item)}</> : <>-</>}
      </td>
    );
  }

  return (
    <td className="p-2 text-center">
      {shouldRender ? (
        <Link
          component="button"
          color="primary"
          underline="hover"
          onClick={() => handleViewSigners(item)}
        >
          {t("view")}
        </Link>
      ) : (
        "-"
      )}
      {isModal["view_" + item.objectId] && (
        <ModalUi
          isOpen
          showHeader={isTemplateReport}
          title={t("signers")}
          reduceWidth={"md:max-w-[450px]"}
          handleClose={() => handleCloseModal()}
        >
          {!isTemplateReport && (
            <IconButton
              size="small"
              onClick={() => handleCloseModal()}
              sx={{
                position: "absolute",
                right: 8,
                top: 4,
                zIndex: 40,
                color: "text.primary"
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Table size="small" sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                {isTemplateReport && (
                  <TableCell sx={{ width: "30%", pl: 1.5 }}>
                    {t("roles")}
                  </TableCell>
                )}
                <TableCell sx={{ pl: 1.5 }}>
                  {isTemplateReport ? t("email") : t("signers")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {item?.Placeholders?.map(
                (x, i) =>
                  x.Role !== "prefill" && (
                    <TableRow key={i}>
                      {isTemplateReport && (
                        <TableCell
                          sx={{ fontSize: "12px", width: "30%", pl: 1.5 }}
                        >
                          {x.Role && x.Role}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{ pl: 1.5, fontSize: "12px", wordBreak: "break-all" }}
                      >
                        {x?.email || getSignerEmail(x, item?.Signers) || "-"}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </ModalUi>
      )}
    </td>
  );
};

export default SignerCell;
