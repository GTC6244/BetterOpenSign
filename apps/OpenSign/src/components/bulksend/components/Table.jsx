import {
  useState
} from "react";
import { useTranslation } from "react-i18next";
import SuggestionInput from "../../shared/fields/SuggestionInput";
import RenderWidgets from "./RenderWidgets";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import MuiTable from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

const Table = ({
  headers = [],
  rowData = [],
  handleInputChange,
  handleWidgetDetails,
  initialPerPage = 25,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = rowData.slice(startIndex, endIndex);


  return (
    <Box sx={{ width: "100%" }}>

      {/* Table */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ overflowX: "auto", borderColor: "outline.variant" }}
      >
        <MuiTable size="small" sx={{ borderCollapse: "collapse", width: "100%" }}>
          <TableHead>
            <TableRow>
              {headers?.map((header) => (
                <TableCell
                  key={header.label}
                  align="center"
                  sx={{ fontSize: "13px", fontWeight: 600 }}
                >
                  {header.label}
                  {header?.isRequired && (
                    <Box component="span" sx={{ color: "error.main" }}>
                      {" *"}
                    </Box>
                  )}
                </TableCell>
              ))}
              {rowData.length > 1 && (
                <TableCell
                  align="center"
                  sx={{ fontSize: "13px", fontWeight: 600 }}
                >
                  {t("action")}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData.length > 0 &&
              currentData.map((form, formIndex) => {
                const globalIndex = startIndex + formIndex;
                const fields = form?.fields ?? [];

                const emailFields = fields.filter((f) => f.label !== "prefill");

                const widgets = fields.flatMap((f, fieldIndex) =>
                  (f.widgets ?? []).map((widget, widgetIndex) => ({
                    widget,
                    fieldIndex, // keep the fieldIndex that produced this widget
                    widgetIndex
                  }))
                );
                return (
                  <TableRow key={form.Id} id={`table-row-${formIndex}`}>
                    {emailFields.map((field, fieldIndex) => (
                      <TableCell key={field.fieldId}>
                        <SuggestionInput
                          required
                          type="email"
                          value={field.email ?? ""}
                          index={fieldIndex}
                          onChange={(signer) =>
                            handleInputChange(globalIndex, signer, field.label)
                          }
                        />
                      </TableCell>
                    ))}

                    {widgets.map(({ widget, fieldIndex, widgetIndex }) => (
                      <TableCell key={`${form.Id}-${widget.key}`}>
                        <RenderWidgets
                          widget={widget}
                          handleWidgetDetails={(value) =>
                            handleWidgetDetails(
                              value,
                              globalIndex, // formIndex,
                              fieldIndex,
                              widgetIndex
                            )
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </MuiTable>
      </TableContainer>

    </Box>
  );
};

export default Table;
