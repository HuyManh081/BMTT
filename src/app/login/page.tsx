import { signIn } from "@/auth";
import { ArrowUpRight, Check, Layers3, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-art" aria-label="Không gian Nhịp">
        <div className="art-top"><span className="brand-mark">n.</span><span>WORK, IN GOOD COMPANY</span></div>
        <div className="art-copy"><p className="eyebrow">MỌI VIỆC ĐÚNG NHỊP</p><h1>Một đội ngũ.<br />Một nhịp làm việc.</h1><p>Chỗ để ý tưởng thành việc làm, và việc làm thành kết quả.</p></div>
        <div className="art-note"><span className="note-check"><Check size={16} /></span><span>Tuần này, cùng nhau<br /><strong>làm nên điều tốt.</strong></span><span className="note-date">19—23<br />THÁNG 10</span></div>
        <div className="art-footer">NHỊP TEAMSPACE <span>01 / 04</span></div>
      </section>
      <section className="login-panel">
        <div className="login-small-brand"><span className="brand-mark">n.</span><span>Nhịp</span></div>
        <div className="login-content">
          <div className="login-icon"><Layers3 size={20} /></div>
          <p className="eyebrow">KHÔNG GIAN CỦA ĐỘI NGŨ</p>
          <h2>Chào bạn,<br />mình bắt đầu nhé.</h2>
          <p className="login-description">Đăng nhập bằng tài khoản tổ chức của bạn để tiếp tục.</p>
          <form action={async () => { "use server"; await signIn("google", { redirectTo: "/" }); }}>
            <button className="sign-in-button" type="submit">Tiếp tục với Google <ArrowUpRight size={17} /></button>
          </form>
          <div className="secure-note"><LockKeyhole size={14} /><span>Kết nối an toàn qua OpenID Connect</span></div>
        </div>
        <div className="login-bottom"><span>NHỊP · WORKSPACE</span><span>THỨ HAI, 19 THÁNG 10</span></div>
      </section>
    </main>
  );
}