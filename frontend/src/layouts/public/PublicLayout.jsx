import PublicHeader from "../../components/public/PublicHeader/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter/PublicFooter";

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
