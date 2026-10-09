import { isMobile } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import getWidgetType from "./getWidgetType";
import Box from "@mui/material/Box";

function WidgetList(props) {
  const { t } = useTranslation();
  const getWidgetList = props.updateWidgets();
  return getWidgetList?.map((item, ind) => {
    return (
      <Box className="2xl:p-1" sx={{ mb: "5px" }} key={ind}>
        <Box
          data-tut="isSignatureWidget"
          sx={{
            userSelect: "none",
            mx: { xs: "2px", md: 0 },
            cursor: "all-scroll"
          }}
          onClick={() => {
            props.addPositionOfSignature &&
              props.addPositionOfSignature("onclick", item);
          }}
          ref={(element) => !isMobile && item.ref(element)}
          onMouseMove={(e) => !isMobile && props?.handleDivClick(e)}
          onMouseDown={() => !isMobile && props?.handleMouseLeave()}
          onTouchStart={(e) => !isMobile && props?.handleDivClick(e)}
        >
          {item.ref && getWidgetType(item, t(`widgets-name.${item.type}`))}
        </Box>
      </Box>
    );
  });
}

export default WidgetList;
