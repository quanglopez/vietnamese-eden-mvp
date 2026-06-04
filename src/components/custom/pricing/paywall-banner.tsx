export function PaywallBanner() {
  return (
    <div
      className="rounded-xl border border-brand/30 bg-gradient-brand-soft px-4 py-4 sm:px-5"
      role="status"
    >
      <p className="font-medium text-foreground">Gói cước sẽ sớm ra mắt</p>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        Hiện tại tất cả tính năng đều miễn phí trong giai đoạn beta. Billing Stripe sẽ được
        tích hợp sau — không thu phí trong MVP.
      </p>
    </div>
  );
}
