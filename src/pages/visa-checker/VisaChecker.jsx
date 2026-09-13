
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./VisaChecker.css";
import visaRules from "./visaRules";

const countries = [
  { name: "United States", code: "US", flag: "🇺🇸", region: "North America" },
  { name: "Canada", code: "CA", flag: "🇨🇦", region: "North America" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", region: "Europe" },
  { name: "Germany", code: "DE", flag: "🇩🇪", region: "Europe" },
  { name: "France", code: "FR", flag: "🇫🇷", region: "Europe" },
  { name: "Italy", code: "IT", flag: "🇮🇹", region: "Europe" },
  { name: "Spain", code: "ES", flag: "🇪🇸", region: "Europe" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", region: "Europe" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", region: "Europe" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", region: "Europe" },
  { name: "Austria", code: "AT", flag: "🇦🇹", region: "Europe" },
  { name: "Sweden", code: "SE", flag: "🇸🇪", region: "Europe" },
  { name: "Norway", code: "NO", flag: "🇳🇴", region: "Europe" },
  { name: "Denmark", code: "DK", flag: "🇩🇰", region: "Europe" },
  { name: "Finland", code: "FI", flag: "🇫🇮", region: "Europe" },
  { name: "Ireland", code: "IE", flag: "🇮🇪", region: "Europe" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", region: "Europe" },
  { name: "Poland", code: "PL", flag: "🇵🇱", region: "Europe" },
  { name: "Greece", code: "GR", flag: "🇬🇷", region: "Europe" },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿", region: "Europe" },
  { name: "Hungary", code: "HU", flag: "🇭🇺", region: "Europe" },
  { name: "Romania", code: "RO", flag: "🇷🇴", region: "Europe" },
  { name: "Croatia", code: "HR", flag: "🇭🇷", region: "Europe" },
  { name: "Slovakia", code: "SK", flag: "🇸🇰", region: "Europe" },
  { name: "Slovenia", code: "SI", flag: "🇸🇮", region: "Europe" },
  { name: "Estonia", code: "EE", flag: "🇪🇪", region: "Europe" },
  { name: "Latvia", code: "LV", flag: "🇱🇻", region: "Europe" },
  { name: "Lithuania", code: "LT", flag: "🇱🇹", region: "Europe" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺", region: "Europe" },
  { name: "Malta", code: "MT", flag: "🇲🇹", region: "Europe" },
  { name: "Cyprus", code: "CY", flag: "🇨🇾", region: "Europe" },
  { name: "Iceland", code: "IS", flag: "🇮🇸", region: "Europe" },
  { name: "Australia", code: "AU", flag: "🇦🇺", region: "Oceania" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", region: "Oceania" },
  { name: "India", code: "IN", flag: "🇮🇳", region: "Asia" },
  { name: "China", code: "CN", flag: "🇨🇳", region: "Asia" },
  { name: "Japan", code: "JP", flag: "🇯🇵", region: "Asia" },
  { name: "South Korea", code: "KR", flag: "🇰🇷", region: "Asia" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", region: "Asia" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", region: "Asia" },
  { name: "Thailand", code: "TH", flag: "🇹🇭", region: "Asia" },
  { name: "Brazil", code: "BR", flag: "🇧🇷", region: "South America" },
];

const purposes = [
  "Tourism",
  "Trekking / Adventure",
  "Business",
  "Study",
  "Transit",
  "Other",
];

const stayOptions = [
  "Up to 15 days",
  "16–30 days",
  "31–90 days",
  "More than 90 days",
];

const passportTypes = [
  "Ordinary passport",
  "Diplomatic passport",
  "Official passport",
  "Service passport",
];

export default function VisaChecker() {
  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("Tourism");
  const [stay, setStay] = useState("Up to 15 days");
  const [passportType, setPassportType] =
    useState("Ordinary passport");

  const [result, setResult] = useState(null);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return countries;

    return countries.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [search]);

  const selectedCountry = countries.find(
    (item) => item.code === country
  );

  const selectedRule = country
    ? visaRules[country]
    : null;

  const checkRequirements = (e) => {
    e.preventDefault();

    if (!country || !selectedCountry) {
      alert("Please select your passport country.");
      return;
    }

    setResult({
      country: selectedCountry,
      rule: selectedRule,
      purpose,
      stay,
      passportType,
    });

    setTimeout(() => {
      document
        .getElementById("visa-result")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const resetChecker = () => {
    setCountry("");
    setSearch("");
    setPurpose("Tourism");
    setStay("Up to 15 days");
    setPassportType("Ordinary passport");
    setResult(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ---------------------------------------------------------
   * DOWNLOAD COMPLETE GUIDE
   * ---------------------------------------------------------
   */
  const downloadGuide = () => {
    if (!result) return;

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 17;
    const contentWidth = pageWidth - margin * 2;

    const colors = {
      green: [18, 72, 55],
      darkGreen: [10, 48, 38],
      red: [190, 43, 43],
      gold: [218, 166, 67],
      blue: [39, 92, 125],
      lightGreen: [235, 246, 241],
      lightBlue: [237, 245, 250],
      lightGold: [252, 246, 230],
      lightRed: [253, 239, 239],
      dark: [40, 45, 43],
      gray: [105, 110, 108],
      white: [255, 255, 255],
    };

    let y = 20;

    const addPageIfNeeded = (height = 10) => {
      if (y + height > 272) {
        addFooter();
        doc.addPage();
        y = 20;
        addHeader();
      }
    };

    const addHeader = () => {
      doc.setFillColor(...colors.green);
      doc.rect(0, 0, pageWidth, 11, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);

      doc.text(
        "BACKPACKER GATEWAYS",
        margin,
        7
      );

      doc.setFont("helvetica", "normal");

      doc.text(
        "NEPAL TRAVEL GUIDE",
        pageWidth - margin,
        7,
        { align: "right" }
      );
    };

    const addFooter = () => {
      const pageNumber =
        doc.internal.getCurrentPageInfo().pageNumber;

      doc.setDrawColor(225, 225, 225);
      doc.line(
        margin,
        282,
        pageWidth - margin,
        282
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...colors.gray);

      doc.text(
        "General travel information • Verify current requirements before travel",
        margin,
        288
      );

      doc.text(
        `Page ${pageNumber}`,
        pageWidth - margin,
        288,
        { align: "right" }
      );
    };

    const addSectionTitle = (
      number,
      title,
      color = colors.green
    ) => {
      addPageIfNeeded(18);

      doc.setFillColor(...color);
      doc.roundedRect(
        margin,
        y,
        10,
        10,
        2,
        2,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);

      doc.text(
        String(number).padStart(2, "0"),
        margin + 5,
        y + 6.7,
        { align: "center" }
      );

      doc.setFontSize(13);
      doc.setTextColor(...colors.darkGreen);

      doc.text(
        title,
        margin + 15,
        y + 7
      );

      y += 16;
    };

    const addParagraph = (text) => {
      const lines = doc.splitTextToSize(
        text,
        contentWidth
      );

      addPageIfNeeded(lines.length * 4.8 + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...colors.dark);

      doc.text(lines, margin, y);

      y += lines.length * 4.8 + 6;
    };

    const addBullet = (text, color = colors.green) => {
      const lines = doc.splitTextToSize(
        text,
        contentWidth - 8
      );

      addPageIfNeeded(lines.length * 4.8 + 5);

      doc.setFillColor(...color);

      doc.circle(
        margin + 1.8,
        y - 1.1,
        1.1,
        "F"
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      doc.setTextColor(...colors.dark);

      doc.text(
        lines,
        margin + 7,
        y
      );

      y += lines.length * 4.8 + 4;
    };

    const addInfoBox = (
      title,
      value,
      background,
      accent
    ) => {
      const valueLines = doc.splitTextToSize(
        value,
        contentWidth - 45
      );

      const boxHeight =
        Math.max(17, valueLines.length * 4.5 + 11);

      addPageIfNeeded(boxHeight + 4);

      doc.setFillColor(...background);

      doc.roundedRect(
        margin,
        y,
        contentWidth,
        boxHeight,
        3,
        3,
        "F"
      );

      doc.setFillColor(...accent);

      doc.roundedRect(
        margin,
        y,
        4,
        boxHeight,
        2,
        2,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...colors.gray);

      doc.text(
        title.toUpperCase(),
        margin + 10,
        y + 7
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...colors.darkGreen);

      doc.text(
        valueLines,
        margin + 10,
        y + 13
      );

      y += boxHeight + 5;
    };

    /*
     * FIRST PAGE
     */
    addHeader();

    y = 25;

    doc.setFillColor(...colors.red);
    doc.rect(0, 11, pageWidth, 3, "F");

    doc.setFillColor(...colors.green);
    doc.roundedRect(
      margin,
      y,
      contentWidth,
      57,
      5,
      5,
      "F"
    );

    doc.setFillColor(...colors.gold);
    doc.circle(
      pageWidth - 35,
      y + 28,
      18,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.gold);

    doc.text(
      "NEPAL TRAVEL INFORMATION",
      margin + 10,
      y + 13
    );

    doc.setFontSize(22);
    doc.setTextColor(...colors.white);

    doc.text(
      "Nepal Visa &",
      margin + 10,
      y + 29
    );

    doc.text(
      "Entry Guide",
      margin + 10,
      y + 39
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    doc.text(
      `Prepared for ${result.country.name} passport holders`,
      margin + 10,
      y + 49
    );

    y += 67;

    addInfoBox(
      "Passport Country",
      `${result.country.name}`,
      colors.lightBlue,
      colors.blue
    );

    addInfoBox(
      "Travel Purpose",
      result.purpose,
      colors.lightGreen,
      colors.green
    );

    addInfoBox(
      "Planned Stay",
      result.stay,
      colors.lightGold,
      colors.gold
    );

    addInfoBox(
      "Passport Type",
      result.passportType,
      colors.lightRed,
      colors.red
    );

    addSectionTitle(
      1,
      "About this guide",
      colors.blue
    );

    addParagraph(
      `This guide provides general travel information for ${result.country.name} passport holders planning a trip to Nepal. It is designed as a practical preparation reference covering common visa, entry and travel-document considerations.`
    );

    addParagraph(
      "Requirements can vary depending on nationality, passport type, travel purpose, length of stay and current immigration procedures."
    );

    /*
     * VISA
     */
    addSectionTitle(
      2,
      "Visa & entry information",
      colors.green
    );

    addInfoBox(
      "Visa information",
      result.rule?.visaType ||
        "Check the latest official Nepal Immigration information.",
      colors.lightGreen,
      colors.green
    );

    addInfoBox(
      "Visa on Arrival",
      result.rule?.visaOnArrival
        ? "Generally available for eligible travellers. Confirm current eligibility before travelling."
        : "Check the current official entry arrangement for your nationality.",
      colors.lightBlue,
      colors.blue
    );

    addInfoBox(
      "Passport validity",
      result.rule?.passportValidityMonths
        ? `${result.rule.passportValidityMonths} months guidance`
        : "Check the latest official requirement",
      colors.lightGold,
      colors.gold
    );

    if (result.rule?.notes) {
      addParagraph(result.rule.notes);
    }

    /*
     * COMMON DOCUMENTS
     */
    addSectionTitle(
      3,
      "Common documents to prepare",
      colors.red
    );

    addBullet(
      "Valid passport suitable for international travel."
    );

    addBullet(
      "Visa or other applicable entry permission, where required."
    );

    addBullet(
      "Visa application information or confirmation, where applicable."
    );

    addBullet(
      "Recent passport photographs if required by the applicable process."
    );

    addBullet(
      "Supporting documents related to your travel purpose."
    );

    addBullet(
      "Travel itinerary, accommodation details or onward travel information where requested."
    );

    /*
     * BEFORE TRAVEL
     */
    addSectionTitle(
      4,
      "Before you travel",
      colors.blue
    );

    addBullet(
      "Check your passport validity and condition."
    );

    addBullet(
      "Confirm the latest Nepal visa and entry requirements."
    );

    addBullet(
      "Check whether your nationality is eligible for Visa on Arrival."
    );

    addBullet(
      "Confirm current visa fees and payment procedures."
    );

    addBullet(
      "Keep copies of important travel documents."
    );

    addBullet(
      "Check trekking permits if your planned route requires them."
    );

    addBullet(
      "Make sure your travel insurance covers your planned activities."
    );

    /*
     * TRAVEL PURPOSE
     */
    addSectionTitle(
      5,
      "Travel-purpose considerations",
      colors.gold
    );

    if (result.purpose === "Tourism") {
      addParagraph(
        "For tourism, travellers should prepare their passport, applicable visa or entry permission, accommodation and travel details, and confirm the current tourist-entry process."
      );
    } else if (
      result.purpose === "Trekking / Adventure"
    ) {
      addParagraph(
        "For trekking and adventure travel, visa requirements are only one part of preparation. Check route-specific permits, conservation or national-park requirements, insurance coverage, weather and emergency arrangements."
      );
    } else if (result.purpose === "Business") {
      addParagraph(
        "Business travel may require additional documentation depending on the activity and applicable visa category. Confirm the appropriate visa type and supporting documents with the relevant official authority."
      );
    } else if (result.purpose === "Study") {
      addParagraph(
        "Study-related travel may require additional documentation such as institutional or admission documents. Confirm the appropriate visa category and current process before travelling."
      );
    } else if (result.purpose === "Transit") {
      addParagraph(
        "Transit requirements depend on your itinerary, nationality and transit circumstances. Confirm whether a Nepal entry visa or transit permission is applicable to your journey."
      );
    } else {
      addParagraph(
        "Because requirements can differ for other travel purposes, confirm the appropriate visa category and supporting documents with the relevant Nepal authority."
      );
    }

    /*
     * OFFICIAL SOURCE
     */
    addSectionTitle(
      6,
      "Verify before travelling",
      colors.green
    );

    doc.setFillColor(...colors.lightGreen);

    const officialBoxHeight = 45;

    addPageIfNeeded(officialBoxHeight + 5);

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      officialBoxHeight,
      4,
      4,
      "F"
    );

    doc.setFillColor(...colors.green);

    doc.circle(
      margin + 12,
      y + 13,
      6,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);

    doc.text(
      "✓",
      margin + 12,
      y + 15.5,
      { align: "center" }
    );

    doc.setFontSize(11);
    doc.setTextColor(...colors.darkGreen);

    doc.text(
      "Nepal Department of Immigration",
      margin + 24,
      y + 12
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.dark);

    const officialLines = doc.splitTextToSize(
      "Use the official Nepal government immigration information to verify the latest visa, entry, fee and documentation requirements before travelling.",
      contentWidth - 32
    );

    doc.text(
      officialLines,
      margin + 24,
      y + 21
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...colors.blue);

    doc.text(
      "www.immigration.gov.np",
      margin + 24,
      y + 38
    );

    y += officialBoxHeight + 8;

    /*
     * DISCLAIMER
     */
    addSectionTitle(
      7,
      "Information notice",
      colors.red
    );

    doc.setFillColor(...colors.lightRed);

    const disclaimer =
      "This document is a general travel-information guide prepared by Backpacker Gateways. It is not an official government document, visa approval, immigration decision, visa application or legal advice. Visa rules, fees, eligibility, procedures and entry requirements may change.";

    const disclaimerLines = doc.splitTextToSize(
      disclaimer,
      contentWidth - 16
    );

    const disclaimerHeight =
      disclaimerLines.length * 4.8 + 15;

    addPageIfNeeded(disclaimerHeight);

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      disclaimerHeight,
      4,
      4,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.red);

    doc.text(
      "IMPORTANT",
      margin + 8,
      y + 9
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.dark);

    doc.text(
      disclaimerLines,
      margin + 8,
      y + 16
    );

    y += disclaimerHeight + 8;

    addParagraph(
      "Always verify the latest requirements directly with the relevant Nepal government authority before booking flights or travelling."
    );

    /*
     * FOOTERS
     */
    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      doc.setPage(page);
      addFooter();
    }

    /*
     * SAFE FILE NAME
     */
    const safeCountry =
      result.country.name
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase();

    doc.save(
      `backpacker-gateways-nepal-visa-guide-${safeCountry}.pdf`
    );
  };

  return (
    <main className="visa-checker-page">

      {/* HERO */}
      <section className="visa-hero">
        <div className="visa-container">

          <span className="visa-kicker">
            🇳🇵 BEFORE YOU COME TO NEPAL
          </span>

          <h1>
            Nepal Visa & Entry
            <strong> Travel Guide</strong>
          </h1>

          <p>
            Select your passport and travel plans to
            receive general information to help you
            prepare for your Nepal trip.
          </p>

        </div>
      </section>


      {/* CHECKER */}
      <section className="visa-checker-section">

        <div className="visa-container">

          <form
            className="visa-form"
            onSubmit={checkRequirements}
          >

            {/* PASSPORT */}
            <div className="visa-form-header">

              <span>01</span>

              <div>
                <small>PASSPORT</small>

                <h2>
                  What passport do you hold?
                </h2>
              </div>

            </div>


            <div className="country-search">

              <input
                type="text"
                placeholder="🔍 Search your country..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <div className="country-grid">

              {filteredCountries.map((item) => (

                <button
                  type="button"
                  key={item.code}
                  className={`country-option ${
                    country === item.code
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setCountry(item.code);
                    setSearch("");
                  }}
                >

                  <span className="country-flag">
                    {item.flag}
                  </span>

                  <span>
                    {item.name}
                  </span>

                </button>

              ))}

            </div>


            {selectedCountry && (

              <div className="selected-country">

                <span>
                  {selectedCountry.flag}
                </span>

                <strong>
                  {selectedCountry.name}
                </strong>

                <button
                  type="button"
                  onClick={() => setCountry("")}
                >
                  Change
                </button>

              </div>

            )}


            {/* PURPOSE */}
            <div className="visa-form-block">

              <div className="visa-form-header">

                <span>02</span>

                <div>
                  <small>
                    TRAVEL PURPOSE
                  </small>

                  <h2>
                    Why are you coming to Nepal?
                  </h2>
                </div>

              </div>


              <div className="choice-grid">

                {purposes.map((item) => (

                  <button
                    type="button"
                    key={item}
                    className={`choice-button ${
                      purpose === item
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setPurpose(item)
                    }
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>


            {/* STAY */}
            <div className="visa-form-block">

              <div className="visa-form-header">

                <span>03</span>

                <div>
                  <small>STAY</small>

                  <h2>
                    How long will you stay?
                  </h2>
                </div>

              </div>


              <div className="choice-grid">

                {stayOptions.map((item) => (

                  <button
                    type="button"
                    key={item}
                    className={`choice-button ${
                      stay === item
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setStay(item)
                    }
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>


            {/* PASSPORT TYPE */}
            <div className="visa-form-block">

              <div className="visa-form-header">

                <span>04</span>

                <div>
                  <small>
                    PASSPORT TYPE
                  </small>

                  <h2>
                    What type of passport do you have?
                  </h2>
                </div>

              </div>


              <div className="choice-grid">

                {passportTypes.map((item) => (

                  <button
                    type="button"
                    key={item}
                    className={`choice-button ${
                      passportType === item
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setPassportType(item)
                    }
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>


            <button
              type="submit"
              className="check-visa-button"
            >
              GENERATE MY TRAVEL GUIDE
              <span>→</span>
            </button>

          </form>


          {/* RESULT */}
          {result && (

            <section
              className="visa-result"
              id="visa-result"
            >

              <div className="result-top">

                <span className="result-status">
                  YOUR TRAVEL GUIDE
                </span>

                <button
                  type="button"
                  className="start-over"
                  onClick={resetChecker}
                >
                  Start Over
                </button>

              </div>


              {/* COUNTRY */}
              <div className="result-country">

                <span className="result-flag">
                  {result.country.flag}
                </span>

                <div>

                  <small>
                    NEPAL TRAVEL GUIDE FOR
                  </small>

                  <h2>
                    {result.country.name} Citizens
                  </h2>

                </div>

              </div>


              {/* ENTRY GUIDANCE */}
              <div className="guide-section">

                <span className="guide-number">
                  01
                </span>

                <div>

                  <small>
                    NEPAL ENTRY GUIDANCE
                  </small>

                  <h3>
                    General visa information
                  </h3>

                  <p>
                    {result.rule?.notes ||
                      "Visa and entry requirements depend on nationality, passport type, travel purpose and current Nepal immigration procedures."}
                  </p>

                </div>

              </div>


              {/* TRIP PROFILE */}
              <div className="guide-section">

                <span className="guide-number">
                  02
                </span>

                <div>

                  <small>
                    YOUR TRIP
                  </small>

                  <h3>
                    Travel profile
                  </h3>

                  <div className="guide-details">

                    <div>
                      <span>
                        PASSPORT COUNTRY
                      </span>

                      <strong>
                        {result.country.flag}{" "}
                        {result.country.name}
                      </strong>
                    </div>

                    <div>
                      <span>
                        TRAVEL PURPOSE
                      </span>

                      <strong>
                        {result.purpose}
                      </strong>
                    </div>

                    <div>
                      <span>
                        PLANNED STAY
                      </span>

                      <strong>
                        {result.stay}
                      </strong>
                    </div>

                    <div>
                      <span>
                        PASSPORT TYPE
                      </span>

                      <strong>
                        {result.passportType}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>


              {/* VISA */}
              <div className="guide-section">

                <span className="guide-number">
                  03
                </span>

                <div>

                  <small>
                    VISA & ENTRY
                  </small>

                  <h3>
                    What to check
                  </h3>

                  <div className="guide-details">

                    <div>
                      <span>
                        VISA INFORMATION
                      </span>

                      <strong>
                        {result.rule?.visaType ||
                          "Check official source"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        VISA ON ARRIVAL
                      </span>

                      <strong>
                        {result.rule?.visaOnArrival
                          ? "Generally available for eligible travellers"
                          : "Check current official requirements"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        PASSPORT VALIDITY
                      </span>

                      <strong>
                        {result.rule?.passportValidityMonths
                          ? `${result.rule.passportValidityMonths} months guidance`
                          : "Check official requirements"}
                      </strong>
                    </div>

                  </div>

                </div>

              </div>


              {/* DOCUMENTS */}
              <div className="guide-section">

                <span className="guide-number">
                  04
                </span>

                <div>

                  <small>
                    DOCUMENTS
                  </small>

                  <h3>
                    Common documents to prepare
                  </h3>

                  <ul className="guide-list">

                    <li>
                      Valid passport
                    </li>

                    <li>
                      Applicable visa or entry permission
                    </li>

                    <li>
                      Visa application information where applicable
                    </li>

                    <li>
                      Passport photographs where required
                    </li>

                    <li>
                      Supporting documents based on travel purpose
                    </li>

                    <li>
                      Travel or accommodation information where requested
                    </li>

                  </ul>

                </div>

              </div>


              {/* BEFORE TRAVEL */}
              <div className="guide-section">

                <span className="guide-number">
                  05
                </span>

                <div>

                  <small>
                    PREPARE
                  </small>

                  <h3>
                    Before you travel
                  </h3>

                  <ul className="guide-list checklist">

                    <li>
                      Check passport validity
                    </li>

                    <li>
                      Confirm current Nepal visa requirements
                    </li>

                    <li>
                      Check Visa on Arrival eligibility
                    </li>

                    <li>
                      Confirm current visa fees
                    </li>

                    <li>
                      Prepare required documents
                    </li>

                    <li>
                      Check trekking permits if required
                    </li>

                    <li>
                      Check travel insurance coverage
                    </li>

                  </ul>

                </div>

              </div>


              {/* OFFICIAL */}
              <div className="guide-official">

                <span>
                  ✓
                </span>

                <div>

                  <small>
                    OFFICIAL VERIFICATION
                  </small>

                  <h3>
                    Nepal Department of Immigration
                  </h3>

                  <p>
                    Always verify the latest visa,
                    immigration, fee and entry
                    requirements directly with the
                    relevant Nepal government authority.
                  </p>

                </div>

              </div>


              {/* DISCLAIMER */}
              <div className="result-warning">

                <strong>
                  ⚠️ Important Information
                </strong>

                <p>
                  This guide provides general travel
                  information only. It is not an official
                  government document, visa approval,
                  immigration decision or legal advice.
                  Requirements, fees and procedures can
                  change.
                </p>

              </div>


              {/* ACTIONS */}
              <div className="guide-actions">

                <button
                  type="button"
                  className="download-guide-button"
                  onClick={downloadGuide}
                >
                  DOWNLOAD COMPLETE GUIDE
                  <span>↓</span>
                </button>


                <a
                  className="official-button"
                  href="https://www.immigration.gov.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VERIFY OFFICIAL INFORMATION
                  <span>↗</span>
                </a>

              </div>


              <p className="verified-text">
                General information only. Always verify
                current requirements with the official
                Nepal immigration authority before travel.
              </p>

            </section>

          )}

        </div>

      </section>

    </main>
  );
}

