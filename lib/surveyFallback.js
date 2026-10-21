import { CRITERIA_GROUPS, QUICK_TAGS_POSITIVE, QUICK_TAGS_IMPROVEMENT } from "./hospitalData";

const FALLBACK_FORM_ID = "fallback-default";

export const FALLBACK_SURVEY_FORM = {
  id: FALLBACK_FORM_ID,
  scope: "hospital",
  title: "Bộ khảo sát chất lượng Bệnh viện Quân y 7A",
  version: 1,
  greeting: null,
  thank_you: null,
  questions: [
    ...CRITERIA_GROUPS.map((crit, i) => ({
      id: crit.id,
      type: "star",
      title: crit.title,
      description: crit.description,
      required: true,
      order_index: i + 1,
      criteria_key: crit.id,
      weight_csat: 0.2,
      config: {
        labels: {
          1: "Rất không hài lòng",
          2: "Chưa hài lòng",
          3: "Bình thường",
          4: "Hài lòng",
          5: "Rất hài lòng",
        },
      },
    })),
    {
      id: "nps",
      type: "nps",
      title: "Mức độ sẵn sàng giới thiệu",
      description: "Quý khách sẵn sàng giới thiệu Bệnh viện Quân y 7A cho người thân ở mức độ nào (0–10)?",
      required: true,
      order_index: 6,
      criteria_key: null,
      weight_csat: null,
      config: null,
    },
    {
      id: "tags_positive",
      type: "multi",
      title: "Điểm hài lòng",
      description: "Chạm để chọn nhanh những điểm Quý khách hài lòng:",
      required: false,
      order_index: 7,
      criteria_key: null,
      weight_csat: null,
      config: { tags: QUICK_TAGS_POSITIVE },
    },
    {
      id: "tags_improvement",
      type: "multi",
      title: "Điểm cần cải thiện",
      description: "Chạm để chọn nhanh những điểm cần cải thiện:",
      required: false,
      order_index: 8,
      criteria_key: null,
      weight_csat: null,
      config: { tags: QUICK_TAGS_IMPROVEMENT, urgent: true },
    },
  ],
};

export function isFallbackForm(form) {
  return !form || form.id === FALLBACK_FORM_ID;
}
