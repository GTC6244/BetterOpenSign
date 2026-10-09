import { useEffect, useState } from "react";
import RenderAllPdfPage from "../components/pdf/RenderAllPdfPage";
import RenderDebugPdf from "../components/RenderDebugPdf";
import { pdfjs } from "react-pdf";
import ModalUi from "../primitives/ModalUi";
import Alert from "../primitives/Alert";
import HandleError from "../primitives/HandleError";
import { useWindowSize } from "../hook/useWindowSize";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

function processDimensions(x, y, width, height) {
  if (width < 0) {
    x -= Math.abs(width);
    width = Math.abs(width);
  }

  if (height < 0) {
    y -= Math.abs(height);
    height = Math.abs(height);
  }

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.floor(width),
    height: Math.floor(height)
  };
}
const DebugPdf = () => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const [pdf, setPdf] = useState("");
  const [isModal, setIsModal] = useState(true);
  const [allPages, setAllPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const [pdfDetails, setPdfDetails] = useState({
    name: "",
    pdftype: "",
    totalPages: "",
    currentPage: 1,
    x: 0,
    y: 0,
    base64: ""
  });
  const [hoverCoordinates, setHoverCoordinates] = useState({ x: 0, y: 0 });
  const [pdfDimension, setPdfDimension] = useState({ width: 0, height: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pdf && pdf.name) {
      const fetchPdfMetadata = async () => {
        try {
          const pdfDataURL = URL.createObjectURL(pdf); // Convert File to data URL
          // console.log("pdfDataURL ", pdfDataURL);
          const pdfInfo = await pdfjs.getDocument({ url: pdfDataURL }).promise;
          const pdfType = await inferPdfType(pdfInfo);
          setPdfDetails((prevDetails) => ({
            ...prevDetails,
            pdftype: pdfType
          }));
        } catch (error) {
          console.error("Error fetching PDF metadata:", error);
        }
      };

      fetchPdfMetadata();
    }
  }, [pdf]);

  const inferPdfType = async (pdf) => {
    try {
      const firstPage = await pdf.getPage(pdf?.numPages > 1 ? 2 : 1);
      const scale = 1;
      const { width, height } = firstPage.getViewport({ scale });
      setPdfDimension({ width: width, height: height });

      // Assuming a standard DPI of 72, you can adjust this value if needed
      const dpi = 72;

      const widthInInches = width / dpi;
      const heightInInches = height / dpi;

      const isA1 = widthInInches > 23.39 && heightInInches > 16.54;
      const isA2 = widthInInches > 16.54 && heightInInches > 11.69;
      const isA3 = widthInInches > 11.69 && heightInInches > 8.27;
      const isA4 = widthInInches > 8.27 && heightInInches > 5.83;
      const isLegal = widthInInches > 8.5 && heightInInches > 14;
      const isLetter = widthInInches > 8.5 && heightInInches > 11;
      const isLedger = widthInInches > 11 && heightInInches > 17;

      if (isA1) return "A1";
      if (isA2) return "A2";
      if (isA3) return "A3";
      if (isA4) return "A4";
      if (isLegal) return "Legal";
      if (isLetter) return "Letter";
      if (isLedger) return "Ledger";

      return "Unknown";
    } catch (error) {
      console.error("Error getting page dimensions:", error);
      return "Unknown";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModal(false);
    setPdfDetails((prevData) => ({ ...prevData, name: pdf?.name }));
  };

  //function for get pdf page details
  const pageDetails = async ({ numPages }) => {
    const load = {
      status: true
    };
    setPdfDetails((prevDetails) => ({ ...prevDetails, totalPages: numPages }));
    setPdfLoadFail(load);
  };

  const handleMouseMoveDiv = (event) => {
    setHoverCoordinates({
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY
    });
  };
  const handleMouseDown = (event) => {
    if (newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([
        { x, y, width: 0, height: 0, key: "0", page: pageNumber }
      ]);
    }
  };

  const handleMouseUp = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const result = processDimensions(sx, sy, x - sx, y - sy);
      const annotationToAdd = {
        ...result,
        key: annotations.length + 1,
        page: pageNumber
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
      setPdfDetails((prevDetails) => ({
        ...prevDetails,
        x: result.x,
        y: result.y
      }));
    }
  };

  const handleMouseMove = (event) => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          page: pageNumber,
          key: "0"
        }
      ]);
    }
  };

  const annotationsToDraw = [...annotations, ...newAnnotation];

  const handlePageLoadSuccess = (page) => {
    setPdfDetails((prevDetails) => ({
      ...prevDetails,
      currentPage: page.pageNumber
    }));
  };

  const copytoclipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset copied state after 1.5 seconds
  };
  const handleFileChange = (files) => {
    const file = files[0];
    setPdf(file);

    if (file && file.type === "application/pdf") {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setPdfDetails((prevdata) => ({ ...prevdata, base64: base64String }));
      };

      reader.readAsDataURL(file);
    }
  };
  const handleDelete = (key) => {
    const updateAnnotations = annotations.filter((x) => x.key !== key);
    setAnnotations(updateAnnotations);
  };
  return (
    <Box>
      {copied && <Alert type="success">{t("copied")}</Alert>}
      {width < 800 ? (
        <HandleError handleError={"Debug PDF only availble for PC"} />
      ) : (
        <>
          {!isModal && (
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
              {/* this component used to render all pdf pages in left side */}
              <RenderAllPdfPage
                pdfBase64Url={pdfDetails.base64}
                allPages={allPages}
                setAllPages={setAllPages}
                setPageNumber={setPageNumber}
                pageNumber={pageNumber}
              />
              {/* pdf render view */}
              <div>
                <div data-tut="reactourThird">
                  <RenderDebugPdf
                    pdfUrl={pdf}
                    pageDetails={pageDetails}
                    pageNumber={pageNumber}
                    setPdfLoadFail={setPdfLoadFail}
                    pdfLoadFail={pdfLoadFail}
                    handlePageLoadSuccess={handlePageLoadSuccess}
                    handleMouseMove={handleMouseMove}
                    handleMouseUp={handleMouseUp}
                    handleMouseDown={handleMouseDown}
                    hoverCoordinates={hoverCoordinates}
                    annotations={annotationsToDraw}
                    pdfDimension={pdfDimension}
                    handleMouseMoveDiv={handleMouseMoveDiv}
                  />
                </div>
              </div>
              <Box sx={{ width: 220, bgcolor: "surface.main" }}>
                <Box
                  sx={{
                    fontSize: "18px",
                    fontWeight: 500,
                    py: "10px",
                    px: "12px",
                    borderBottom: "1px solid",
                    borderColor: "outline.main"
                  }}
                >
                  PDF details
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  Name: {pdfDetails?.name}
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  Pdf type: {pdfDetails?.pdftype}
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  Total Pages: {pdfDetails?.totalPages}
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  Current Page: {pdfDetails?.currentPage}
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  Base64 : {pdfDetails?.base64.slice(0, 10)}...
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{ width: 25, height: 25, fontSize: "12px", m: "2px" }}
                    onClick={() => copytoclipboard(pdfDetails?.base64)}
                  >
                    <i className="fa-light fa-copy"></i>
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    fontSize: "18px",
                    fontWeight: 500,
                    py: "10px",
                    px: "12px",
                    borderBottom: "1px solid",
                    borderColor: "outline.main"
                  }}
                >
                  Last click
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  x co-ordinate: {pdfDetails?.x}
                </Box>
                <Box sx={{ fontSize: "14px", py: "5px", px: "12px" }}>
                  y co-ordinate: {pdfDetails?.y}
                </Box>
                <Box
                  sx={{
                    fontSize: "18px",
                    fontWeight: 500,
                    py: "10px",
                    px: "12px",
                    borderTop: "1px solid",
                    borderBottom: "1px solid",
                    borderColor: "outline.main"
                  }}
                >
                  Annotation
                </Box>
                <Box
                  component="ul"
                  sx={{
                    listStyle: "none",
                    p: "10px",
                    m: 0,
                    height: 500,
                    overflowY: "auto"
                  }}
                >
                  {annotations.map((coord, index) => (
                    <li key={index}>
                      <Box
                        component="span"
                        sx={{ fontSize: "13px", fontWeight: 500 }}
                      >{`Box ${index + 1}:`}</Box>
                      <Box
                        component="code"
                        sx={{
                          fontSize: "12px",
                          color: "text.primary",
                          userSelect: "none"
                        }}
                      >
                        {` ["page":${coord?.page}, "x": ${coord.x}, "y": ${coord.y}, "w": ${coord.width}, "h": ${coord.height}]`}
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{
                            width: 23,
                            height: 20,
                            fontSize: "12px",
                            m: "2px"
                          }}
                          onClick={() =>
                            copytoclipboard(
                              `"page":${coord?.page}, "x": ${coord.x}, "y": ${coord.y}, "w": ${coord.width}, "h": ${coord.height}`
                            )
                          }
                        >
                          <i className="fa-light fa-copy"></i>
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            width: 23,
                            height: 20,
                            fontSize: "12px",
                            m: "2px"
                          }}
                          onClick={() => handleDelete(coord.key)}
                        >
                          <i className="fa-light fa-trash-can"></i>
                        </IconButton>
                      </Box>
                    </li>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
          <ModalUi title={"Select PDF"} isOpen={isModal}>
            <Box component="form" onSubmit={handleSubmit} sx={{ m: "10px" }}>
              <TextField
                type="file"
                fullWidth
                onChange={(e) => handleFileChange(e.target.files)}
                slotProps={{
                  htmlInput: { accept: ".pdf", required: true }
                }}
              />
              <Button
                variant="contained"
                fullWidth
                type="submit"
                sx={{ mt: 1.5, mb: 0.5 }}
              >
                Submit
              </Button>
            </Box>
          </ModalUi>
        </>
      )}
    </Box>
  );
};

export default DebugPdf;
