import { useState, useEffect } from "react";
import {
  nonPresentMaskCss
} from "../constant/Utils";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/sidebar/Sidebar";
import Tour from "../primitives/Tour";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Parse from "parse";
import {
  Outlet
} from "react-router";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { sessionStatus } from "../redux/reducers/userReducer";
import SessionExpiredModal from "../primitives/SessionExpiredModal";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

const HomeLayout = () => {
  const appName =
    "OpenSign™";
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const tourArr = useSelector((state) => state.TourSteps);
  const isValidSession = useSelector((state) => state.user.isValidSession);
  const [isLoader, setIsLoader] = useState(true);
  const [isCloseBtn, setIsCloseBtn] = useState(true);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [tourConfigs, setTourConfigs] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const tenantId = localStorage.getItem("TenantId");

  useEffect(() => {
    const language = localStorage.getItem("i18nextLng");
    i18n.changeLanguage(language);
    localStorage.setItem("isGuestSigner", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      if (!tenantId) {
        dispatch(sessionStatus(false));
      } else {
        (async () => {
          try {
            // Use the session token to validate the user
            const userQuery = new Parse.Query(Parse.User);
            const user = await userQuery.get(Parse?.User?.current()?.id, {
              sessionToken: localStorage.getItem("accesstoken")
            });
            if (user) {
              localStorage.setItem("profileImg", user.get("ProfilePic") || "");
                dispatch(sessionStatus(true));
                setIsLoader(false);
            } else {
              dispatch(sessionStatus(true));
            }
          } catch (error) {
            console.error("error in authentication:", error?.message);
            // Session token is invalid or there was an error
            dispatch(sessionStatus(false));
          }
        })();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);


  useEffect(() => {
    if (tourArr && tourArr.length > 0) {
      handleDynamicSteps();
    } else {
      setIsTour(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourArr]);

  const handleDynamicSteps = () => {
    const github = "https://github.com/OpenSignLabs/OpenSign";
    if (tourArr && tourArr.length > 0) {
      const resArr = tourArr.map((obj, index) => {
        if (tourArr.length - 1 === index) {
          return obj;
        } else {
          return { ...obj, actions: () => setIsCloseBtn(false) };
        }
      });
      setTourConfigs([
        {
          selector: '[data-tut="nonpresentmask"]',
          content: t("tour-mssg.home-layout-1"),
          position: "center",
          styles: { fontSize: "13px", maskArea: nonPresentMaskCss }
        },
        {
          selector: '[data-tut="tourbutton"]',
          content: t("tour-mssg.home-layout-2"),
          position: "top",
          styles: { fontSize: "13px" }
        },
        ...resArr,
        {
          selector: '[data-tut="nonpresentmask"]',
          content: () => (
            <Box>
              {t("tour-mssg.home-layout-3", { appName })}
              <Box component="p" sx={{ mt: "3px" }}>
                ⭐ Star us on
                <Link
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="always"
                  sx={{ fontWeight: 500, pl: 1, cursor: "pointer" }}
                >
                  GitHub
                </Link>
              </Box>
            </Box>
          ),
          position: "center",
          styles: { fontSize: "13px", maskArea: nonPresentMaskCss }
        }
      ]);
      checkTourStatus();
    }
  };
  const closeTour = async () => {
    setIsTour(false);
    const serverUrl = localStorage.getItem("baseUrl");
    const appId = localStorage.getItem("parseAppId");
    const json = JSON.parse(localStorage.getItem("Extand_Class"));
    const extUserId = json && json.length > 0 && json[0].objectId;

    let updatedTourStatus = [];
    if (tourStatusArr.length > 0) {
      updatedTourStatus = [...tourStatusArr];
      const loginTourIndex = tourStatusArr.findIndex(
        (obj) => obj["loginTour"] === false || obj["loginTour"] === true
      );
      if (loginTourIndex !== -1) {
        updatedTourStatus[loginTourIndex] = { loginTour: true };
      } else {
        updatedTourStatus.push({ loginTour: true });
      }
    } else {
      updatedTourStatus = [{ loginTour: true }];
    }

    await axios.put(
      serverUrl + "classes/contracts_Users/" + extUserId,
      { TourStatus: updatedTourStatus },
      { headers: { "X-Parse-Application-Id": appId } }
    );
  };

  async function checkTourStatus() {
    const cloudRes = await Parse.Cloud.run("getUserDetails");
    if (cloudRes) {
      const extUser = JSON.parse(JSON.stringify(cloudRes));
      localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
      const tourStatus = extUser?.TourStatus || [];
      setTourStatusArr(tourStatus);
      const loginTour = tourStatus.find((obj) => obj.loginTour)?.loginTour;
      setIsTour(!loginTour);
    } else {
      setIsTour(true);
    }
  }

  return isValidSession && localStorage.getItem("accesstoken") ? (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* HEADER */}
      <Box component="header" sx={{ zIndex: 501 }}>
        {!isLoader && <Header setIsLoggingOut={setIsLoggingOut} />}
      </Box>
      {isLoader ? (
        <Box sx={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
          <Loader />
        </Box>
      ) : (
        <>
          {isLoggingOut && (
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                bgcolor: "rgba(0,0,0,0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Loader />
            </Box>
          )}
          {/* BODY */}
          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* SIDEBAR with width animation */}
            <Sidebar />
            {/* MAIN (includes both content + footer in one scrollable column) */}
            <Box
              component="main"
              id="renderList"
              sx={{
                flex: 1,
                overflow: "auto",
                transition: "all 0.3s ease-in-out"
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
                {/* your page content */}
                <Box sx={{ p: 1.5 }}>{<Outlet />}</Box>
                {/* sticky-but-scrollable footer */}
                <Box sx={{ mt: "auto", zIndex: 30 }}>
                  <Footer />
                </Box>
              </Box>
            </Box>
          </Box>
          {isTour && (
            <Tour
              onRequestClose={closeTour}
              steps={tourConfigs}
              isOpen={isTour}
              // scrollOffset={-100}
              showCloseButton={isCloseBtn}
            />
          )}
        </>
      )}
    </Box>
  ) : (
    <SessionExpiredModal />
  );
};

export default HomeLayout;
