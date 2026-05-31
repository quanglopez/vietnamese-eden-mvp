import { BetaWaitlistForm } from "@/components/custom/landing/beta-waitlist-form";

export function LandingWaitlist() {
  return (
    <section id="waitlist" className="scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Tham gia beta waitlist
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Để lại email — chúng tôi mời từng đợt. Nếu bạn đã có quyền truy cập, đăng ký tài
            khoản và bắt đầu luôn.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Không spam — chỉ email về beta và cập nhật sản phẩm.</li>
            <li>• Dữ liệu lưu an toàn trên Supabase (insert-only, không public read).</li>
            <li>• Email trùng sẽ được báo để bạn không đăng ký nhầm hai lần.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 bg-surface-elev p-6 shadow-card sm:p-8">
          <BetaWaitlistForm />
        </div>
      </div>
    </section>
  );
}
