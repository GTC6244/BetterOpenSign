import RenderWidgets from "./RenderWidgets";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

const PrefillWidgets = ({ prefills = [], setPrefills, onNext }) => {
  const { t } = useTranslation();

  const handleWidgetDetails = (value, widgetLabel) => {
    setPrefills((prev) => {
      const widgets = [...(prev ?? [])];
      const index = widgets.findIndex((w) => w?.label === widgetLabel);
      if (index === -1) return prev;
      widgets[index] = {
        ...widgets[index],
        options: { ...widgets[index].options, response: value },
        response: value
      };
      return widgets;
    });
  };

  const handleNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onNext?.();
  };
  return (
    <>
      {prefills?.length > 0 && (
        <Box
          component="form"
          onSubmit={handleNext}
          sx={{
            m: { xs: 1.5, md: 3 },
            display: "flex",
            flexDirection: "column",
            position: "relative",
            color: "text.primary"
          }}
        >
          <Card sx={{ py: 1.5, px: 1.25 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                columnGap: 5,
                rowGap: 2,
                width: "100%"
              }}
            >
              {[...prefills]
                .sort((a, b) =>
                  a.pageNumber !== b.pageNumber
                    ? a.pageNumber - b.pageNumber
                    : (a.yPosition ?? 0) - (b.yPosition ?? 0)
                )
                .map((widget) => (
                  <RenderWidgets
                    key={widget.key}
                    showLabel
                    widget={widget}
                    handleWidgetDetails={(value) =>
                      handleWidgetDetails(value, widget.label)
                    }
                  />
                ))}
            </Box>
          </Card>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              mt: 1.5,
              gap: 1.5,
              justifyContent: "center"
            }}
          >
            <Button type="submit" variant="contained" sx={{ width: 150 }}>
              {t("next")}
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default PrefillWidgets;
