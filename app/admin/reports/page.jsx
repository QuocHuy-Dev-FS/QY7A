"use client";

import { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  Star,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { CRITERIA_GROUPS, DEPARTMENTS } from "@/lib/hospitalData";

export default function QualityReportsPage() {
  const { feedbacks, stats, exportCSV } = useAdmin();

  // Compute criteria detail stats
  const criteriaStats = useMemo(() => {
    const total = feedbacks.length || 1;
    return CRITERIA_GROUPS.map((crit, idx) => {
      let sum = 0;
      let count5 = 0;
      let count4 = 0;
      let count3 = 0;
      let countBelow3 = 0;

      feedbacks.forEach((f) => {
        const sc = f.scores?.[crit.id] ?? 5;
        sum += sc;
        if (sc === 5) count5++;
        else if (sc === 4) count4++;
        else if (sc === 3) count3++;
        else countBelow3++;
      });

      const avg = Number((sum / total).toFixed(2));
      const percent = Math.round((avg / 5) * 100);

      return {
        id: crit.id,
        index: idx + 1,
        title: crit.title,
        subtitle: crit.subtitle,
        description: crit.description,
        avg,
        percent,
        count5,
        count4,
        count3,
        countBelow3,
      };
    });
  }, [feedbacks]);

  // Compute department matrix
  const departmentMatrix = useMemo(() => {
    return DEPARTMENTS.map((dept, idx) => {
      const deptFeedbacks = feedbacks.filter(
        (f) =>
          f.departmentKey === dept.value ||
          f.departmentCode === dept.code ||
          f.department === dept.label ||
          (typeof f.department === "string" && f.department.includes(dept.code))
      );

      const count = deptFeedbacks.length;
      let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;

      deptFeedbacks.forEach((f) => {
        if (f.scores) {
          c1 += f.scores.c1_access || 5;
          c2 += f.scores.c2_transparency || 5;
          c3 += f.scores.c3_facilities || 5;
          c4 += f.scores.c4_attitude || 5;
          c5 += f.scores.c5_outcome || 5;
        }
      });

      const avgC1 = count > 0 ? Number((c1 / count).toFixed(1)) : 5.0;
      const avgC2 = count > 0 ? Number((c2 / count).toFixed(1)) : 5.0;
      const avgC3 = count > 0 ? Number((c3 / count).toFixed(1)) : 5.0;
      const avgC4 = count > 0 ? Number((c4 / count).toFixed(1)) : 5.0;
      const avgC5 = count > 0 ? Number((c5 / count).toFixed(1)) : 5.0;

      const csat =
        count > 0
          ? Math.round(deptFeedbacks.reduce((s, f) => s + (f.csatPercent || 0), 0) / count)
          : 90;

      let grade = "Xuất sắc";
      let gradeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";

      if (csat < 75) {
        grade = "Cần cải thiện";
        gradeClass = "bg-rose-100 text-rose-800 border-rose-200";
      } else if (csat < 85) {
        grade = "Khá";
        gradeClass = "bg-blue-100 text-blue-800 border-blue-200";
      } else if (csat < 92) {
        grade = "Tốt";
        gradeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      }

      return {
        stt: idx + 1,
        code: dept.code,
        label: dept.label,
        count,
        c1: avgC1,
        c2: avgC2,
        c3: avgC3,
        c4: avgC4,
        c5: avgC5,
        csat,
        grade,
        gradeClass,
      };
    });
  }, [feedbacks]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Báo cáo &amp; Phân tích 5 Nhóm Tiêu chí Chất lượng Y tế
            </h2>
            <span className="rounded-full bg-emerald-100 text-emerald-950 border border-emerald-200 px-2.5 py-0.5 text-xs font-black">
              Chuẩn Bộ Y tế
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đánh giá theo các chỉ tiêu chuyên môn phục vụ giao ban bệnh viện và nâng cao chất lượng điều trị
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 shrink-0"
        >
          <Download size={16} className="text-emerald-200" />
          <span>Xuất Báo cáo Excel / CSV</span>
        </button>
      </section>

      {/* 2. 5 Quality Criteria Deep Dive Cards */}
      <section aria-label="Chi tiết 5 tiêu chí">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
          1. Đánh giá chi tiết từng tiêu chí chất lượng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {criteriaStats.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-800 text-white font-black text-xs shrink-0">
                    {item.index}
                  </span>
                  <span className="text-lg font-black text-emerald-900">
                    {item.avg} / 5.0★
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {item.subtitle}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Mức độ đạt:</span>
                  <span className="text-emerald-700 font-black">{item.percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>

                {/* Rating distribution mini tags */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-2 pt-1 border-t border-slate-50">
                  <span>5★: {item.count5} lượt</span>
                  <span>4★: {item.count4} lượt</span>
                  <span>≤3★: {item.count3 + item.countBelow3} lượt</span>
                </div>
              </div>
            </div>
          ))}

          {/* Overall CSAT Card */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-700 text-white font-black text-xs">
                  ✓
                </div>
                <span className="text-xs font-black uppercase text-emerald-800">
                  Chỉ số tổng hợp CSAT
                </span>
              </div>

              <h4 className="text-2xl font-black text-emerald-950 mt-1">
                {stats.avgCsat}% Hài lòng
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Tỷ lệ đáp ứng chuẩn phục vụ người bệnh theo tiêu chuẩn Bệnh viện Hạng I Quân đội.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/60">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                <span>Bệnh viện Quân y 7A • Tuyến cuối QK7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NPS Analysis Breakdown */}
      <section aria-label="Phân tích NPS">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
          2. Phân tích chỉ số sẵn sàng giới thiệu bệnh viện (NPS)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Promoters */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-800">
                Người ủng hộ (Promoters)
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                Điểm 9 - 10
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-900 mt-2">
              {stats.promoterCount} <span className="text-sm font-semibold text-slate-500">phiếu</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Người bệnh rất hài lòng, sẵn sàng giới thiệu người thân đến khám và điều trị tại 7A.
            </p>
          </div>

          {/* Passives */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-800">
                Trung lập (Passives)
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Điểm 7 - 8
              </span>
            </div>
            <p className="text-3xl font-black text-amber-900 mt-2">
              {stats.passiveCount} <span className="text-sm font-semibold text-slate-500">phiếu</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Đánh giá ở mức bình thường, chưa có ấn tượng sâu sắc hoặc còn băn khoăn về thời gian chờ.
            </p>
          </div>

          {/* Detractors */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-rose-800">
                Chưa hài lòng (Detractors)
              </span>
              <span className="text-xs font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
                Điểm 0 - 6
              </span>
            </div>
            <p className="text-3xl font-black text-rose-900 mt-2">
              {stats.detractorCount} <span className="text-sm font-semibold text-slate-500">phiếu</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Có trải nghiệm chưa tốt, cần liên hệ tìm hiểu nguyên nhân và khắc phục dịch vụ ngay.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Full Quality Matrix Table by Department */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <h3 className="text-sm font-black text-slate-900">
            3. Ma trận Điểm chất lượng chi tiết giữa các Khoa / Phòng
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng tổng hợp điểm 5 tiêu chí (thang điểm 5) và chỉ số CSAT trung bình của 13 chuyên khoa
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3 text-center w-12 text-[11px] font-bold uppercase text-slate-700">STT</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-slate-700 min-w-[180px]">Khoa / Phòng</th>
                <th className="py-3 px-3 text-center text-[11px] font-bold uppercase text-slate-700 w-24">Số phiếu</th>
                <th className="py-3 px-2 text-center text-[11px] font-bold uppercase text-slate-700 w-16" title="Tiếp cận & Thời gian chờ">TC1</th>
                <th className="py-3 px-2 text-center text-[11px] font-bold uppercase text-slate-700 w-16" title="Minh bạch thông tin & Chi phí">TC2</th>
                <th className="py-3 px-2 text-center text-[11px] font-bold uppercase text-slate-700 w-16" title="Cơ sở vật chất & Môi trường">TC3</th>
                <th className="py-3 px-2 text-center text-[11px] font-bold uppercase text-slate-700 w-16" title="Thái độ quân y & Giao tiếp">TC4</th>
                <th className="py-3 px-2 text-center text-[11px] font-bold uppercase text-slate-700 w-16" title="Hiệu quả điều trị">TC5</th>
                <th className="py-3 px-3 text-center text-[11px] font-bold uppercase text-slate-700 w-24">CSAT</th>
                <th className="py-3 px-3 text-center text-[11px] font-bold uppercase text-slate-700 w-32">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {departmentMatrix.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">{item.stt}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    <span className="font-mono text-emerald-900 mr-1.5">[{item.code}]</span>
                    {item.label}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.count}</td>
                  <td className="py-2.5 px-2 text-center">{item.c1}★</td>
                  <td className="py-2.5 px-2 text-center">{item.c2}★</td>
                  <td className="py-2.5 px-2 text-center">{item.c3}★</td>
                  <td className="py-2.5 px-2 text-center">{item.c4}★</td>
                  <td className="py-2.5 px-2 text-center">{item.c5}★</td>
                  <td className="py-2.5 px-3 text-center font-black text-emerald-700">
                    {item.csat}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border ${item.gradeClass}`}>
                      {item.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>* Ghi chú: TC1: Tiếp cận &amp; Chờ • TC2: Minh bạch viện phí • TC3: Cơ sở vật chất • TC4: Thái độ phục vụ • TC5: Hiệu quả điều trị</span>
          <span className="font-bold text-emerald-950">Phòng Quản lý chất lượng Bệnh viện Quân y 7A</span>
        </div>
      </section>
    </div>
  );
}
