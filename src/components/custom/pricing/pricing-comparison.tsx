import { PRICING_COMPARISON_ROWS } from "@/lib/pricing/tiers";

export function PricingComparison() {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-elev overflow-hidden">
      <div className="px-4 py-4 sm:px-6 border-b border-border/60">
        <h2 className="font-display text-lg font-bold">So sánh gói</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Giới hạn dự kiến — chỉ áp dụng khi bật billing (hiện chưa bật).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="text-left font-semibold px-4 py-3 sm:px-6">Tính năng</th>
              <th className="text-left font-semibold px-3 py-3">Free / Beta</th>
              <th className="text-left font-semibold px-3 py-3">Creator</th>
              <th className="text-left font-semibold px-3 py-3 sm:pr-6">Agency</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_COMPARISON_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 sm:px-6 text-muted-foreground">{row.label}</td>
                <td className="px-3 py-3 font-medium">{row.free}</td>
                <td className="px-3 py-3 font-medium">{row.creator}</td>
                <td className="px-3 py-3 sm:pr-6 font-medium">{row.agency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
