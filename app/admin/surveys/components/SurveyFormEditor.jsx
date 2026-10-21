"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Eye,
  ArrowLeft,
  Star,
  Hash,
  List,
  CheckSquare,
  AlignLeft,
  GripVertical,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

const QUESTION_TYPES = [
  { value: "star", label: "Đánh giá sao (1–5)", icon: Star },
  { value: "nps", label: "NPS (0–10)", icon: Hash },
  { value: "single", label: "Chọn một", icon: List },
  { value: "multi", label: "Chọn nhiều (thẻ)", icon: CheckSquare },
  { value: "text", label: "Văn bản tự do", icon: AlignLeft },
];

const DEFAULT_QUESTION = {
  type: "star",
  title: "",
  description: "",
  required: true,
  order_index: 1,
  criteria_key: "",
  weight_csat: "",
  config: null,
};

function QuestionCard({ q, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const TypeIcon = QUESTION_TYPES.find((t) => t.value === q.type)?.icon || Star;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical size={16} className="text-slate-300 shrink-0" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f2852] text-white text-xs font-black shrink-0">
            {index + 1}
          </span>
          <TypeIcon size={16} className="text-slate-500 shrink-0" />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition">
            <ChevronUp size={16} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition">
            <ChevronDown size={16} />
          </button>
          <button type="button" onClick={onRemove}
            className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Type */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Loại câu hỏi</label>
          <select
            value={q.type}
            onChange={(e) => onChange("type", e.target.value)}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 focus:border-[#0f2852] focus:outline-none"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Required */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={q.required}
              onChange={(e) => onChange("required", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-[#0f2852]"
            />
            <span className="text-sm font-bold text-slate-700">Bắt buộc</span>
          </label>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề câu hỏi <span className="text-rose-500">*</span></label>
        <input
          type="text"
          value={q.title}
          onChange={(e) => onChange("title", e.target.value)}
          maxLength={300}
          placeholder="Nhập tiêu đề câu hỏi..."
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Mô tả (tùy chọn)</label>
        <textarea
          rows={2}
          value={q.description}
          onChange={(e) => onChange("description", e.target.value)}
          maxLength={1000}
          placeholder="Mô tả thêm cho câu hỏi..."
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
        />
      </div>

      {/* Star-specific: criteria_key + weight_csat */}
      {q.type === "star" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu chí CSAT (criteria_key)</label>
            <select
              value={q.criteria_key}
              onChange={(e) => onChange("criteria_key", e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
            >
              <option value="">— Không ánh xạ —</option>
              <option value="c1_access">c1_access</option>
              <option value="c2_transparency">c2_transparency</option>
              <option value="c3_facilities">c3_facilities</option>
              <option value="c4_attitude">c4_attitude</option>
              <option value="c5_outcome">c5_outcome</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Trọng số CSAT (0–1)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={q.weight_csat}
              onChange={(e) => onChange("weight_csat", e.target.value)}
              placeholder="0.2"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Multi/Single: tags config */}
      {(q.type === "multi" || q.type === "single") && (
        <div className="pt-1 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Danh sách lựa chọn (mỗi dòng một mục)
          </label>
          <textarea
            rows={3}
            value={Array.isArray(q.config?.tags) ? q.config.tags.join("\n") : ""}
            onChange={(e) => {
              const tags = e.target.value.split("\n").map((t) => t.trim()).filter(Boolean);
              onChange("config", { ...(q.config || {}), tags });
            }}
            placeholder={"Tùy chọn 1\nTùy chọn 2\nTùy chọn 3"}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none font-mono"
          />
        </div>
      )}
    </div>
  );
}

export default function SurveyFormEditor({ initialForm = null, formId = null }) {
  const router = useRouter();
  const { showToast } = useAdmin();

  const [title, setTitle] = useState(initialForm?.title || "");
  const [scope, setScope] = useState(initialForm?.scope || "hospital");
  const [greeting, setGreeting] = useState(initialForm?.greeting || "");
  const [thankYou, setThankYou] = useState(initialForm?.thank_you || "");
  const [questions, setQuestions] = useState(
    (initialForm?.questions || []).map((q) => ({
      ...DEFAULT_QUESTION,
      ...q,
      criteria_key: q.criteria_key ?? "",
      weight_csat: q.weight_csat !== null && q.weight_csat !== undefined ? String(q.weight_csat) : "",
      config: q.config ?? null,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...DEFAULT_QUESTION, order_index: prev.length + 1 },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index, direction) => {
    setQuestions((prev) => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr.map((q, i) => ({ ...q, order_index: i + 1 }));
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Vui lòng nhập tiêu đề bộ khảo sát.", "error");
      return;
    }
    if (questions.some((q) => !q.title.trim())) {
      showToast("Tất cả câu hỏi phải có tiêu đề.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        scope,
        greeting: greeting.trim() || null,
        thank_you: thankYou.trim() || null,
        questions: questions.map((q, i) => ({
          type: q.type,
          title: q.title.trim(),
          description: q.description?.trim() || null,
          required: q.required,
          order_index: i + 1,
          criteria_key: q.criteria_key || null,
          weight_csat: q.weight_csat !== "" ? Number(q.weight_csat) : null,
          config: q.config || null,
        })),
      };

      const url = formId
        ? `/api/admin/survey-forms/${formId}`
        : "/api/admin/survey-forms";
      const method = formId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(formId ? "Đã lưu thay đổi." : "Đã tạo bộ khảo sát.");
        router.push("/admin/surveys");
      } else {
        showToast(data.message || "Không thể lưu.", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi lưu bộ khảo sát.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/admin/surveys")}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-[#0f2852]">
          {formId ? "Chỉnh sửa Bộ khảo sát" : "Tạo Bộ khảo sát mới"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition"
          >
            <Eye size={16} />
            {showPreview ? "Ẩn Preview" : "Preview Kiosk"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2852] hover:bg-[#163a75] text-white text-sm font-black transition shadow-md disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu bộ khảo sát"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Thông tin chung</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Tên bộ khảo sát <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="VD: Bộ khảo sát chất lượng Quý 4/2026"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phạm vi (scope)</label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              maxLength={50}
              placeholder="hospital"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-800 focus:border-[#0f2852] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Lời chào (tùy chọn)</label>
          <textarea
            rows={2}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            maxLength={500}
            placeholder="Kính chào Quý người bệnh!..."
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Lời cảm ơn (tùy chọn)</label>
          <textarea
            rows={2}
            value={thankYou}
            onChange={(e) => setThankYou(e.target.value)}
            maxLength={500}
            placeholder="Cảm ơn Quý người bệnh đã đánh giá!..."
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-[#0f2852] focus:outline-none"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">
            Câu hỏi ({questions.length}/20)
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 20}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#0f2852] text-[#0f2852] hover:bg-slate-50 text-xs font-black transition disabled:opacity-40"
          >
            <Plus size={14} />
            Thêm câu hỏi
          </button>
        </div>

        {questions.length === 0 && (
          <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="font-bold">Chưa có câu hỏi nào.</p>
            <p className="text-sm mt-1">Nhấn &ldquo;Thêm câu hỏi&rdquo; để bắt đầu.</p>
          </div>
        )}

        {questions.map((q, i) => (
          <QuestionCard
            key={i}
            q={q}
            index={i}
            total={questions.length}
            onChange={(field, value) => updateQuestion(i, field, value)}
            onRemove={() => removeQuestion(i)}
            onMoveUp={() => moveQuestion(i, -1)}
            onMoveDown={() => moveQuestion(i, 1)}
          />
        ))}
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-blue-700">
            Preview Kiosk (mô phỏng)
          </h2>
          <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {greeting && (
              <p className="text-sm text-slate-600 italic border-b pb-3">{greeting}</p>
            )}
            {questions.map((q, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-sm font-black text-[#0f2852]">
                  {i + 1}. {q.title}
                  {q.required && <span className="text-rose-500 ml-1">*</span>}
                </p>
                {q.description && (
                  <p className="text-xs text-slate-500 mt-1">{q.description}</p>
                )}
                <div className="mt-2 text-xs text-slate-400 font-mono">
                  [{QUESTION_TYPES.find((t) => t.value === q.type)?.label}]
                  {q.criteria_key && ` → ${q.criteria_key}`}
                  {q.weight_csat && ` (w=${q.weight_csat})`}
                </div>
                {(q.type === "multi" || q.type === "single") && q.config?.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.config.tags.map((tag, ti) => (
                      <span key={ti} className="px-2 py-1 rounded-full text-xs bg-slate-200 text-slate-700">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {thankYou && (
              <p className="text-sm text-emerald-700 font-bold border-t pt-3">{thankYou}</p>
            )}
          </div>
          <p className="text-xs text-blue-600 font-medium">
            * Preview tóm tắt. Giao diện thật trên Kiosk sẽ hiển thị theo thiết kế touch-screen đầy đủ.
          </p>
        </div>
      )}
    </div>
  );
}
