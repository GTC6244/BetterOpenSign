import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { findContact } from "../../../constant/Utils";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function findScrollParent(el) {
  let parent = el?.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return window; // fallback
}

const normalizeEmailQuery = (v) => v?.toLowerCase?.().replace(/\s/g, "") ?? "";

const SuggestionInput = (props) => {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState(props?.value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const hasInteractedRef = useRef(false);
  const skipNextSearchRef = useRef(false);
  const isFocusedRef = useRef(false);

  // ✅ keep latest input value in a ref (so props-sync can compare without depending on state)
  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom" // bottom | top
  });

  const updateDropdownPosition = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const rect = inputEl.getBoundingClientRect();
    const desiredHeight = 120; // roughly max-h (adjust if you want)
    const gap = 6;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < desiredHeight + gap;

    const top = openUpwards
      ? Math.max(gap, rect.top - desiredHeight - gap)
      : rect.bottom + gap;

    setDropdownPos({
      top,
      left: rect.left,
      width: rect.width,
      placement: openUpwards ? "top" : "bottom"
    });
  };

  // ✅ Sync from props ONLY when it's not the echo of user typing
  useEffect(() => {
    const next = props?.value ?? "";
    const current = inputValueRef.current ?? "";

    // nothing to do
    if (next === current) return;

    // if the user is focused/typing, DO NOT override local value,
    // otherwise you will kill search + cursor behavior
    if (isFocusedRef.current && hasInteractedRef.current) return;

    skipNextSearchRef.current = true;
    setInputValue(next);
  }, [props?.value]);

  useLayoutEffect(() => {
    if (!showSuggestions) return;
    updateDropdownPosition();
  }, [showSuggestions, inputValue, suggestions.length]);

  useEffect(() => {
    const Clickout = (e) => {
      if (
        inputRef.current?.contains(e.target) ||
        dropdownRef.current?.contains(e.target)
      )
        return;
      setShowSuggestions(false);
    };
    document.addEventListener("mousedown", Clickout);
    return () => document.removeEventListener("mousedown", Clickout);
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;

    const inputEl = inputRef.current;
    if (!inputEl) return;

    const scrollParent = findScrollParent(inputEl);

    const onScroll = () => updateDropdownPosition();
    const onResize = () => updateDropdownPosition();

    // capture scroll on window + scroll parent
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    if (scrollParent !== window)
      scrollParent.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      if (scrollParent !== window)
        scrollParent.removeEventListener("scroll", onScroll);
    };
  }, [showSuggestions]);

  // ✅ Debounced search
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    // ✅ don’t search unless user typed at least once
    if (!hasInteractedRef.current) return;

    // ✅ optional: keep this so blur won’t trigger searches
    if (!isFocusedRef.current) return;

    const q = normalizeEmailQuery(inputValue);
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      (async () => {
        try {
          const res = await findContact(
            q,
          );

          if (cancelled) return;

          if (res?.length > 0) {
            setSuggestions(res);
            setShowSuggestions(true); // ✅ show only after typing + results
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch {
          if (cancelled) return;
          setSuggestions([]);
          setShowSuggestions(false);
        }
      })();
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputValue, props.jwttoken]);

  const handleInputChange = (e) => {
    hasInteractedRef.current = true; // ✅ only typing enables search

    const raw = e.target.value;
    const normalized = normalizeEmailQuery(raw);

    setInputValue(normalized);
    props.onChange?.(normalized);

    if (!raw.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    skipNextSearchRef.current = true; // ✅ prevents searching for selected value
    setInputValue(suggestion.Email);
    setSuggestions([]);
    setShowSuggestions(false);
    props.onChange?.(suggestion);
  };

  const dropdown =
    showSuggestions && suggestions.length > 0
      ? createPortal(
          <Box
            component="ul"
            ref={dropdownRef}
            sx={{
              position: "fixed",
              zIndex: 1002,
              maxHeight: "250px",
              overflowY: "auto",
              bgcolor: "surface.container",
              color: "text.primary",
              border: "1px solid",
              borderColor: "outline.variant",
              borderRadius: 1,
              boxShadow: 3,
              listStyle: "none",
              m: 0,
              p: 0
            }}
            style={{
              top: dropdownPos?.top,
              left: dropdownPos?.left,
              maxWidth: dropdownPos?.width > 200 ? dropdownPos?.width : 200
            }}
          >
            {suggestions.map((suggestion, index) => (
              <Box
                component="li"
                key={index}
                sx={{
                  display: "block",
                  py: 1,
                  px: 1,
                  width: "100%",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "surface.containerHigh" }
                }}
                // use onMouseDown so click registers BEFORE input blur
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
              >
                {suggestion.Name} {"<" + suggestion.Email + ">"}
              </Box>
            ))}
          </Box>,
          document.body
        )
      : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        color: "text.primary"
      }}
    >
      <TextField
        inputRef={inputRef}
        type={props?.type || "text"}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={`${t("enter-value", { value: t("Email") })}...`}
        required={props.required}
        size="small"
        fullWidth
        slotProps={{
          htmlInput: {
            autoComplete: "off",
            autoCorrect: "off",
            autoCapitalize: "none",
            style: { textTransform: "lowercase", fontSize: "0.75rem" }
          }
        }}
        sx={{
          minWidth: "150px",
          "& input::placeholder": { textTransform: "capitalize" }
        }}
        onFocus={() => {
          // ✅ focus should NOT trigger suggestions OR server call
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
      />
      {dropdown}
    </Box>
  );
};
export default SuggestionInput;
