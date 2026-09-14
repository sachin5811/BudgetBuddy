import React, { useState } from "react";
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import API from "../lib/api";
import { Card, Button } from "../components/ui";
import { PageHeader } from "../components/PageHeader";
import { currentMonth, monthLabel } from "../lib/utils";

export default function Reports() {
  const [month, setMonth] = useState(currentMonth());
  const [downloading, setDownloading] = useState("");

  const download = async (type) => {
    setDownloading(type);
    try {
      const res = await API.get(`/reports/${type}?month=${month}`, {
        responseType: "blob",
      });
      const ext = type === "pdf" ? "pdf" : "xlsx";
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `budgetbuddy_${month}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading("");
    }
  };

  const cards = [
    {
      type: "pdf",
      title: "PDF Report",
      desc: "A formatted financial summary with income, expenses & category breakdown — perfect for printing or sharing.",
      icon: FileText,
      color: "from-red-500 to-rose-600",
      testid: "export-pdf-button",
    },
    {
      type: "excel",
      title: "Excel Report",
      desc: "A multi-sheet workbook with summary, category spending, and full expense & income logs for deeper analysis.",
      icon: FileSpreadsheet,
      color: "from-brand-500 to-emerald-700",
      testid: "export-excel-button",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Export"
        subtitle="Generate and download your financial reports"
        action={
          <input
            type="month"
            data-testid="report-month-selector"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        }
      />

      <Card className="p-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-0">
        <p className="text-emerald-200/70 text-xs uppercase tracking-wider font-medium">
          Selected Period
        </p>
        <p className="text-2xl font-bold mt-1">{monthLabel(month)}</p>
        <p className="text-emerald-100/70 text-sm mt-2">
          Choose a format below to export your complete financial data for this
          month.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <Card key={c.type} className="p-6 flex flex-col">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white`}
            >
              <c.icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mt-4">
              {c.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1 flex-1">{c.desc}</p>
            <Button
              onClick={() => download(c.type)}
              disabled={!!downloading}
              className="mt-5 w-full"
              data-testid={c.testid}
            >
              <Download size={16} />
              {downloading === c.type ? "Generating..." : `Download ${c.title}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
