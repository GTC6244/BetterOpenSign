import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Parse from "parse";
import { emailRegex } from "../../constant/const";
import { withSessionValidation } from "../../utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";

const ImportContact = ({ setLoader, onImport, showAlert }) => {
  const { t } = useTranslation();
  const [currentImportPage, setCurrentImportPage] = useState(1);
  const [importedData, setImportedData] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState(0);
  const recordsPerPage = 5;

  // `capitalize` is used to make word capitalize
  const capitalize = (s) =>
    s && String(s[0]).toUpperCase() + String(s).slice(1);

  // `checkRequiredHeaders` is used to check required headers present or not in csv/excel file
  const checkRequiredHeaders = (headers) => {
    const requiredHeaders = ["Name", "Email"];
    // Normalize headers to lowercase once
    const headersSet = new Set(headers.map((header) => header.toLowerCase()));

    // Check all required headers
    const allPresent = requiredHeaders.every((requiredHeader) =>
      headersSet.has(requiredHeader.toLowerCase())
    );
    return allPresent;
  };
  const processCSVFile = async (file, event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Parse CSV data
      const rows = text.split("\n").map((row) => row.trim());
      const headers = rows[0].split(",").map((header) => header.trim());
      if (checkRequiredHeaders(headers)) {
        const records = rows.slice(1).reduce((acc, row) => {
          const values = row?.split(",").map((value) => value.trim()) || [];
          if (values.length > 1) {
            acc.push(
              headers.reduce(
                (obj, header, index) => ({
                  ...obj,
                  [capitalize(header)]: values[index] || ""
                }),
                {}
              )
            );
          }
          return acc;
        }, []);
        if (records.length <= 100) {
          const validRecords = records.length
            ? records.filter((x) => emailRegex.test(x.Email))
            : [];
          const invalidItems = records?.length - validRecords?.length;
          setInvalidRecords(invalidItems);
          setImportedData(validRecords);
        } else {
          alert(t("100-records-only"));
          event.target.value = "";
          setImportedData([]);
        }
      } else {
        alert(t("invalid-data"));
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const processExcelFile = (file, event) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array"
        });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        if (sheetData.length <= 100) {
          // Get all unique keys from the data to handle missing fields
          const headers = [
            ...new Set(sheetData.flatMap((item) => Object.keys(item)))
          ];

          if (checkRequiredHeaders(headers)) {
            const updateSheetData = sheetData.map((obj) => {
              for (let key in obj) {
                const capitalizedKey = capitalize(key);
                if (capitalizedKey !== key) {
                  obj[capitalizedKey] = obj[key];
                  delete obj[key]; // delete the old key to avoid duplicates
                }
              }
              return obj;
            });
            const validRecords = updateSheetData.length
              ? updateSheetData.filter((x) => emailRegex.test(x.Email))
              : [];
            const invalidItems = updateSheetData?.length - validRecords?.length;
            setInvalidRecords(invalidItems);
            setImportedData(validRecords);
          } else {
            alert(t("invalid-data"));
            event.target.value = "";
          }
        } else {
          alert(t("100-records-only"));
          event.target.value = "";
          setImportedData([]);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Get all unique keys from the data to handle missing fields
  const allKeys = importedData?.length
    ? [...new Set(importedData.flatMap((item) => Object.keys(item)))]
    : [];

  // Pagination logic for import data table in modal
  const totalImportPages = Math.ceil(importedData.length / recordsPerPage);
  const currentRecords = importedData.slice(
    (currentImportPage - 1) * recordsPerPage,
    currentImportPage * recordsPerPage
  );

  // `handleFileUpload` is trigger when user upload excel file from contactbook
  const handleFileUpload = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const fileName = file.name;
      const fileNameExt = fileName
        .substr(fileName.lastIndexOf(".") + 1)
        .toLowerCase();
      const isValidExt = ["csv", "xlsx", "xls"].includes(fileNameExt);
      if (isValidExt) {
        setCurrentImportPage(1);
        if (fileNameExt !== "csv") {
          processExcelFile(file, event);
        } else {
          processCSVFile(file, event);
        }
      } else {
        event.target.value = "";
        alert(t("csv-excel-support-only"));
      }
    } else {
      setImportedData([]);
      setCurrentImportPage(1);
      setInvalidRecords(0);
    }
  };

  // `handleNextPage` is used to importdata table in modal
  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentImportPage < totalImportPages) {
      setCurrentImportPage(currentImportPage + 1);
    }
  };

  // `handlePreviousPage` is used to importdata table in modal
  const handlePreviousPage = (e) => {
    e.preventDefault();
    if (currentImportPage > 1) {
      setCurrentImportPage(currentImportPage - 1);
    }
  };
  // `handleImportData` is used to create batch in contact
  const handleImportData = withSessionValidation(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoader(true);
    try {
      const filterdata = importedData.map((x) => ({
        Name: x.Name,
        Email: x.Email,
        Phone: x.Phone,
        Company: x.Company,
        JobTitle: x.JobTitle,
        TenantId: localStorage.getItem("TenantId")
      }));
      const contacts = JSON.stringify(filterdata);
      const res = await Parse.Cloud.run("createbatchcontact", { contacts });
      if (res) {
        showAlert(
          "info",
          t("contact-imported", {
            imported: res?.success || 0,
            failed: res?.failed || 0
          })
        );
        if (res?.success > 0) {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err) {
      console.log("err while creating batch contact", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      onImport && onImport();
      setImportedData([]);
      setInvalidRecords(0);
    }
  });

  return (
    <Box component="form" onSubmit={handleImportData} sx={{ p: "20px", height: "100%" }}>
      <Box sx={{ fontSize: "0.75rem" }}>
        <Typography component="label" sx={{ display: "block", ml: 2, fontSize: "0.75rem" }}>
          {t("contacts-file")}
          <Box component="span" sx={{ color: "error.main", fontSize: "13px" }}>
            {" *"}
          </Box>
        </Typography>
        <Box sx={{ width: "100%", my: 1 }}>
          <Button
            variant="outlined"
            component="label"
            size="small"
            fullWidth
            sx={{ justifyContent: "flex-start", textTransform: "none" }}
          >
            {t("contacts-file")}
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              required
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
                border: 0
              }}
            />
          </Button>
        </Box>
        <Typography sx={{ mt: 0.5, ml: 2, fontSize: "11px", color: "text.secondary" }}>
          {t("import-guideline")}{" "}
          <Link
            href="/sample_contacts.csv"
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
            sx={{ cursor: "pointer" }}
          >
            {t("download-sample")}
          </Link>
        </Typography>
      </Box>
      <Box sx={{ fontSize: "1rem", m: 2 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 0.5 }}>
          <Box component="span">
            {t("total-records-found", {
              count: importedData.length
            })}
          </Box>
          <Box component="span">
            {t("Invalid-records-found", {
              records: invalidRecords
            })}
          </Box>
        </Box>
        {importedData?.length > 0 && (
          <Box sx={{ p: 0.5 }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {allKeys.map((key, index) => (
                      <TableCell key={index}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRecords.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {allKeys.map((key, colIndex) => (
                        <TableCell key={colIndex}>{row[key] || "-"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2
              }}
            >
              <Button
                variant="contained"
                size="small"
                disabled={currentImportPage === 1}
                onClick={handlePreviousPage}
              >
                {t("previous")}
              </Button>
              <Box component="span">
                {t("page-n-of-n", {
                  currentPage: currentImportPage,
                  totalPages: totalImportPages
                })}
              </Box>
              <Button
                variant="contained"
                size="small"
                disabled={currentImportPage === totalImportPages}
                onClick={handleNextPage}
              >
                {t("next")}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      <Divider sx={{ my: "15px" }} />
      <Button type="submit" variant="contained">
        {t("import")}
      </Button>
    </Box>
  );
};

export default ImportContact;
