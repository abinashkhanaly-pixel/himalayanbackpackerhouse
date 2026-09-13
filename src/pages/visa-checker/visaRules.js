const OFFICIAL_NEPAL_IMMIGRATION =
  "https://www.immigration.gov.np/visa-information";

const OFFICIAL_NEPAL_VISA_FEES =
  "https://www.immigration.gov.np/eta-visa-nepal";

const OFFICIAL_NEPAL_APPLICATION =
  "https://immigration.gov.np/online-visa-application-process";

/*
  GENERAL INFORMATION ONLY

  This data is intended to generate a travel-information guide.
  It is NOT a visa eligibility decision and does not replace
  official immigration advice.

  Always verify the latest requirements with the Department
  of Immigration, Government of Nepal.
*/

const commonTouristRules = {
  visaType: "Tourist Visa",
  touristVisaAvailable: true,

  visaOnArrival: true,

  passportValidityMonths: 6,

  touristVisaDurations: [
    {
      days: 15,
      fee: 30,
      currency: "USD",
    },
    {
      days: 30,
      fee: 50,
      currency: "USD",
    },
    {
      days: 90,
      fee: 125,
      currency: "USD",
    },
  ],

  commonlyRequestedDocuments: [
    "Valid passport",
    "Completed visa / arrival application where applicable",
    "Arrival information",
    "Travel itinerary or onward travel information where requested",
    "Accommodation details where requested",
    "Additional supporting documents where applicable",
  ],

  generalSteps: [
    "Check the latest Nepal immigration requirements before travel.",
    "Complete the applicable online or arrival visa process.",
    "Keep your passport and supporting travel information ready.",
    "Pay the applicable visa fee if required.",
    "Present your documents to Nepal immigration for final assessment.",
  ],

  importantNotes: [
    "Visa rules and fees can change.",
    "Visa on Arrival is subject to nationality and immigration restrictions.",
    "The immigration officer makes the final decision on entry.",
    "Passport validity requirements should be checked before travelling.",
  ],

  officialUrl: OFFICIAL_NEPAL_IMMIGRATION,
  applicationUrl: OFFICIAL_NEPAL_APPLICATION,
  feeUrl: OFFICIAL_NEPAL_VISA_FEES,

  source: "Department of Immigration, Government of Nepal",
};


/*
  Countries where ordinary-passport travellers generally
  need to check the standard tourist visa / VOA process.

  Keep this as GENERAL GUIDANCE only.
*/

const standardTouristCountries = [
  "US",
  "CA",
  "GB",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "CH",
  "AT",
  "SE",
  "NO",
  "DK",
  "FI",
  "IE",
  "PT",
  "PL",
  "GR",
  "CZ",
  "HU",
  "RO",
  "HR",
  "SK",
  "SI",
  "EE",
  "LV",
  "LT",
  "LU",
  "MT",
  "CY",
  "IS",
  "AU",
  "NZ",
  "CN",
  "JP",
  "KR",
  "SG",
  "MY",
  "TH",
  "BR",
];


/*
  Countries whose nationals are currently listed by Nepal
  Immigration as NOT eligible for Visa on Arrival.

  They should obtain the appropriate visa in advance
  through a Nepali diplomatic mission / applicable official
  process.

  NOTE: Keep this list maintained from official sources.
*/

const visaOnArrivalRestrictedCountries = [
  "NG", // Nigeria
  "GH", // Ghana
  "ZW", // Zimbabwe
  "SZ", // Eswatini / formerly Swaziland
  "CM", // Cameroon
  "SO", // Somalia
  "LR", // Liberia
  "ET", // Ethiopia
  "IQ", // Iraq
  "PS", // Palestine
  "AF", // Afghanistan
  "SY", // Syria
];


/*
  Current special case reported by Nepal Immigration:
  ordinary Iranian passport holders require a prior visa.

  Diplomatic / Official passport arrangements can differ.
*/

const specialCases = {
  IR: {
    visaRequired: true,
    visaOnArrival: false,

    visaType:
      "Tourist / Entry Visa — prior visa required for ordinary passport holders",

    passportValidityMonths: 6,

    specialNotice:
      "Nepal Immigration has announced that Iranian nationals holding ordinary passports must obtain a valid entry visa from a Nepali diplomatic mission before arrival. Check the latest official notice before travel.",

    advanceApplicationRequired: true,
  },

  IN: {
    visaRequired: false,
    visaOnArrival: false,

    visaType: "Visa exemption / special entry arrangement",

    passportValidityMonths: 0,

    specialNotice:
      "Indian citizens do not normally require a visa to enter Nepal. Valid identification requirements should be checked before travel.",

    advanceApplicationRequired: false,

    commonlyRequestedDocuments: [
      "Valid Indian passport",
      "Or other identification accepted by Nepal Immigration for eligible Indian citizens",
    ],
  },
};


/*
  Build the rule set for a selected country.
*/

const buildVisaRule = (countryCode) => {
  if (specialCases[countryCode]) {
    return {
      ...commonTouristRules,
      ...specialCases[countryCode],
    };
  }

  if (visaOnArrivalRestrictedCountries.includes(countryCode)) {
    return {
      ...commonTouristRules,

      visaRequired: true,
      visaOnArrival: false,

      visaType:
        "Tourist Visa — advance visa process may be required",

      advanceApplicationRequired: true,

      specialNotice:
        "This nationality is currently listed by Nepal Immigration among those not eligible for Visa on Arrival. Check the latest official instructions and obtain the required visa before travelling.",

      commonlyRequestedDocuments: [
        ...commonTouristRules.commonlyRequestedDocuments,
        "Additional documents requested by the relevant Nepali diplomatic mission",
      ],
    };
  }

  return {
    ...commonTouristRules,

    visaRequired: true,

    advanceApplicationRequired: false,

    specialNotice:
      "Tourist visa requirements generally apply. Depending on nationality and current immigration rules, Visa on Arrival may be available. Confirm the latest requirements before travelling.",

    countryCategory: standardTouristCountries.includes(countryCode)
      ? "Standard tourist visa guidance"
      : "General tourist visa guidance",
  };
};


/*
  Export country rules.

  The VisaChecker can continue using:
  visaRules[countryCode]
*/

const visaRules = {};

standardTouristCountries.forEach((countryCode) => {
  visaRules[countryCode] = buildVisaRule(countryCode);
});

Object.keys(specialCases).forEach((countryCode) => {
  visaRules[countryCode] = buildVisaRule(countryCode);
});

visaOnArrivalRestrictedCountries.forEach((countryCode) => {
  visaRules[countryCode] = buildVisaRule(countryCode);
});


/*
  Export useful constants as well.
  These will help when we build the PDF guide.
*/

export {
  OFFICIAL_NEPAL_IMMIGRATION,
  OFFICIAL_NEPAL_VISA_FEES,
  OFFICIAL_NEPAL_APPLICATION,
  commonTouristRules,
  visaOnArrivalRestrictedCountries,
  specialCases,
};

export default visaRules;