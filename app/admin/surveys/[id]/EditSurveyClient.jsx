"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import SurveyFormEditor from "../components/SurveyFormEditor";

export default function EditSurveyClient({ id }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/survey-forms/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setForm(data.data);
        else setError(data.message || "Không thể tải bộ khảo sát.");
      })
      .catch(() => setError("Lỗi kết nối."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <RefreshCw size={22} className="animate-spin mr-2" />
        <span className="font-bold">Đang tải bộ khảo sát...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-6 text-rose-800 font-bold text-center">
        {error}
      </div>
    );
  }

  return <SurveyFormEditor initialForm={form} formId={id} />;
}
