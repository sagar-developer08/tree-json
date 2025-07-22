import debounce from "lodash.debounce";
import { event as gaEvent } from "nextjs-google-analytics";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { FileFormat } from "../enums/file.enum";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import { isIframe } from "../lib/utils/helpers";
import { contentToJson, jsonToContent } from "../lib/utils/jsonAdapter";
import { jsonApiService } from "../lib/services/jsonApi";
import useConfig from "./useConfig";
import useJson from "./useJson";

const defaultJson = JSON.stringify(
  {
    "patient_information": {
      "name": "Pushpa Rani",
      "age": "58 Years",
      "gender": "Female",
      "dob": "",
      "medical_record_number": "SKDD 238540"
    },
    "admission_details": {
      "admission_date": "03.03.2025",
      "discharge_date": "05.03.2025",
      "admitting_physician": "Dr. Pankaj Dougall",
      "discharge_physician": "Dr. Saurav Jha / Dr. Jaspriya Bal",
      "hospital_name": "MAX Healthcare / Max Super Speciality Hospital, Saket"
    },
    "diagnosis": [
      {
        "primary_diagnosis": "Metastatic follicular carcinoma thyroid",
        "secondary_diagnosis": "Post lobectomy (2005), post excision of metastatic left frontal calvarial mass (Feb 2010), history of EBRT to frontal calvarial lesion and lumbar vertebrae (2012), SBRT to lumbar spine (2016), and multiple doses of radio-iodine therapy (cumulative dose ~1100mCi)"
      }
    ],
    "treatment_summary": {
      "procedures_performed": [
        "High dose (200 mCi) Radioactive I-131 therapy on 03.03.2025"
      ],
      "medications_administered": [],
      "lab_tests": [
        {
          "test_name": "TSH",
          "test_result": "80.1 uIU/L"
        },
        {
          "test_name": "Serum Thyroglobulin",
          "test_result": "138.2 ng/ml"
        },
        {
          "test_name": "Anti Thyroglobulin Antibody",
          "test_result": "< 5.0 IU/ml"
        }
      ]
    },
    "medical_history": {
      "previous_conditions": [
        "Follicular carcinoma thyroid"
      ],
      "previous_procedures": [
        "Thyroid lobectomy in 2005",
        "Excision of metastatic left frontal calvarial mass (Feb 2010)",
        "High dose I-131 therapy (149.8 mCi on 12.04.12, 203.0 mCi on 16.07.12, 249 mCi on 11.01.13, therapy in 2015, and 250 mCi on 19.06.2017)",
        "EBRT to 12th vertebra and frontal calvarial lesion (06.06.12 to 16.06.12)",
        "SBRT to lumbar spine in 2016",
        "Surgery for recurrent neck node in January 2025 (surgery on 27.01.2025)"
      ],
      "previous_medications": [],
      "lab_tests": [
        {
          "test_name": "MRI D-L spine",
          "test_result": "Altered signals in L.2 with posterior bulge causing cord compression"
        },
        {
          "test_name": "USG Neck",
          "test_result": "Possibility of recurrent disease in thyroid bed and level IV right cervical lymph nodes (done on 11.01.2021)"
        },
        {
          "test_name": "Whole body I-131 scan",
          "test_result": "I-131 uptake in right level IV cervical lymph node and metastatic lesions in 1st and 2nd lumbar vertebrae (done on 16.04.2021)"
        }
      ]
    },
    "discharge_instructions": {
      "follow_up_appointments": [
        {
          "appointment_date": "06.03.2025",
          "appointment_time": "09:00",
          "physician_name": "Nuclear Medicine Department, Max Saket"
        },
        {
          "appointment_date": "6 weeks post discharge",
          "appointment_time": "",
          "physician_name": "For re-evaluation (Complete Blood Counts, FT3, FT4, TSH and S. Calcium)"
        },
        {
          "appointment_date": "3 months post discharge",
          "appointment_time": "",
          "physician_name": "For re-evaluation (FT3, FT4, TSH and S. Calcium)"
        },
        {
          "appointment_date": "6 months post discharge",
          "appointment_time": "",
          "physician_name": "For re-evaluation (S. TSH, S. Thyroglobulin, Anti Thyroglobulin Antibody, S. Calcium and whole body I-131 scan after stopping Eltroxin for 3 weeks)"
        }
      ],
      "medication_prescriptions": [
        {
          "medication_name": "Lemon candy/lozenges",
          "dosage": "4-5 times a day",
          "duration": "3 days"
        },
        {
          "medication_name": "Ondansetron",
          "dosage": "4 mg once a day",
          "duration": "3 days"
        },
        {
          "medication_name": "Pantoprazole",
          "dosage": "40 mg once a day",
          "duration": "5 days"
        },
        {
          "medication_name": "Eltroxin",
          "dosage": "100 mcg once a day on empty stomach for 3 days, then 150 mcg once a day on empty stomach to continue",
          "duration": ""
        }
      ],
      "lifestyle_recommendations": [
        "Avoid prolonged close contact with others, especially infants, children, and pregnant women",
        "Do not share personal items such as bed, soap, towel",
        "Wash clothes separately and clean the bathroom properly after bathing",
        "Flush toilet twice after use and avoid spillage of urine",
        "Avoid mouth-to-mouth contact and sharing food or eating utensils; use a dedicated set of utensils"
      ]
    },
    "notes": [
      "Patient was discharged in a stable condition with background radiation levels within normal limits (37.0 uSv/hr at 1 meter).",
      "Follow up as per Nuclear Medicine Department instructions for post therapy scan and re-evaluations."
    ]
  },
  null,
  2,
);

type SetContents = {
  contents?: string;
  hasChanges?: boolean;
  skipUpdate?: boolean;
  format?: FileFormat;
};

type Query = string | string[] | undefined;

interface JsonActions {
  getContents: () => string;
  getFormat: () => FileFormat;
  getHasChanges: () => boolean;
  setError: (error: string | null) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setContents: (data: SetContents) => void;
  fetchUrl: (url: string) => void;
  setFormat: (format: FileFormat) => void;
  clear: () => void;
  setFile: (fileData: File) => void;
  setJsonSchema: (jsonSchema: object | null) => void;
  checkEditorSession: (url: Query, widget?: boolean) => void;
  loadFromApi: () => Promise<void>;
  saveToApi: () => Promise<void>;
  isApiConnected: () => Promise<boolean>;
}

export type File = {
  id: string;
  views: number;
  owner_email: string;
  name: string;
  content: string;
  private: boolean;
  format: FileFormat;
  created_at: string;
  updated_at: string;
};

const initialStates = {
  fileData: null as File | null,
  format: FileFormat.JSON,
  contents: defaultJson,
  error: null as any,
  hasChanges: false,
  jsonSchema: null as object | null,
};

export type FileStates = typeof initialStates;

const isURL = (value: string) => {
  return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(
    value
  );
};

const debouncedUpdateJson = debounce((value: unknown) => {
  useGraph.getState().setLoading(true);
  useJson.getState().setJson(JSON.stringify(value, null, 2));
}, 800);

const useFile = create<FileStates & JsonActions>()((set, get) => ({
  ...initialStates,
  clear: () => {
    set({ contents: "" });
    useJson.getState().clear();
  },
  setJsonSchema: (jsonSchema) => set({ jsonSchema }),
  setFile: (fileData) => {
    set({ fileData, format: fileData.format || FileFormat.JSON });
    get().setContents({ contents: fileData.content, hasChanges: false });
    gaEvent("set_content", { label: fileData.format });
  },
  getContents: () => get().contents,
  getFormat: () => get().format,
  getHasChanges: () => get().hasChanges,
  setFormat: async (format) => {
    try {
      const prevFormat = get().format;

      set({ format });
      const contentJson = await contentToJson(get().contents, prevFormat);
      const jsonContent = await jsonToContent(
        JSON.stringify(contentJson, null, 2),
        format,
      );

      get().setContents({ contents: jsonContent });
    } catch (error) {
      get().clear();
      console.warn(
        "The content was unable to be converted, so it was cleared instead.",
      );
    }
  },
  setContents: async ({
    contents,
    hasChanges = true,
    skipUpdate = false,
    format,
  }) => {
    try {
      set({
        ...(contents && { contents }),
        error: null,
        hasChanges,
        format: format ?? get().format,
      });

      const isFetchURL = window.location.href.includes("?");
      const json = await contentToJson(get().contents, get().format);

      if (!useConfig.getState().liveTransformEnabled && skipUpdate) return;

      if (
        get().hasChanges &&
        contents &&
        contents.length < 80_000 &&
        !isIframe() &&
        !isFetchURL
      ) {
        sessionStorage.setItem("content", contents);
        sessionStorage.setItem("format", get().format);
        set({ hasChanges: true });
      }

      debouncedUpdateJson(json);
    } catch (error: any) {
      if (error?.mark?.snippet) return set({ error: error.mark.snippet });
      if (error?.message) set({ error: error.message });
      useJson.setState({ loading: false });
      useGraph.setState({ loading: false });
    }
  },
  setError: (error) => set({ error }),
  setHasChanges: (hasChanges) => set({ hasChanges }),
  fetchUrl: async (url) => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      const jsonStr = JSON.stringify(json, null, 2);

      get().setContents({ contents: jsonStr });
      return useJson.setState({ json: jsonStr, loading: false });
    } catch (error) {
      get().clear();
      toast.error("Failed to fetch document from URL!");
    }
  },
  checkEditorSession: async (url, widget) => {
    if (url && typeof url === "string" && isURL(url)) {
      return get().fetchUrl(url);
    }

    const sessionContent = sessionStorage.getItem("content") as string | null;
    const format = sessionStorage.getItem("format") as FileFormat | null;

    // Try to load from API first
    try {
      const response = await jsonApiService.getJsonData();
      if (response.success && response.data) {
        const jsonString = JSON.stringify(response.data, null, 2);
        if (format) set({ format });
        return get().setContents({ contents: jsonString, hasChanges: false });
      }
    } catch (error) {
      console.log("API not available, using fallback data");
    }

    // Fallback to session storage or default JSON
    let contents = defaultJson;
    if (sessionContent && !widget) contents = sessionContent;

    if (format) set({ format });
    get().setContents({ contents, hasChanges: false });
  },
  loadFromApi: async () => {
    try {
      const response = await jsonApiService.getJsonData();
      if (response.success && response.data) {
        const jsonString = JSON.stringify(response.data, null, 2);
        get().setContents({ contents: jsonString, hasChanges: false });
        toast.success("JSON data loaded from API successfully!");
      } else {
        toast.error(response.error || "Failed to load data from API");
      }
    } catch (error) {
      toast.error("Failed to connect to API");
      console.error("API load error:", error);
    }
  },
  saveToApi: async () => {
    try {
      const contents = get().contents;
      if (!contents) {
        toast.error("No data to save");
        return;
      }

      const jsonData = JSON.parse(contents);
      const response = await jsonApiService.updateJsonData(jsonData);
      
      if (response.success) {
        set({ hasChanges: false });
        toast.success("JSON data saved to API successfully!");
      } else {
        toast.error(response.error || "Failed to save data to API");
      }
    } catch (error) {
      toast.error("Failed to save data to API");
      console.error("API save error:", error);
    }
  },
  isApiConnected: async () => {
    try {
      const response = await jsonApiService.checkHealth();
      return response.success;
    } catch (error) {
      return false;
    }
  },
}));

export default useFile;
