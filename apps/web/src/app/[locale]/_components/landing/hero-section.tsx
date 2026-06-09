import { LogoIcon } from "@/components/ui/brand/logo";
import { Button } from "@/components/ui/primitives/actions/button";
import {
  Activity,
  BarChart3,
  BookOpen,
  Calculator,
  CandlestickChart,
  DollarSign,
  LineChart,
  type LucideIcon,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type FloatingIconProps = {
  icon: LucideIcon;
  className: string;
  delay: string;
  size?: "sm" | "md" | "lg";
  floatDuration?: string;
};

const sizeMap = {
  sm: { box: "w-10 h-10", icon: 16 },
  md: { box: "w-12 h-12", icon: 20 },
  lg: { box: "w-14 h-14", icon: 24 },
};

const FloatingIcon = ({ icon: Icon, className, delay, size = "md", floatDuration = "4s" }: FloatingIconProps) => (
  <div
    className={`absolute hidden lg:flex items-center justify-center ${sizeMap[size].box} rounded-lg bg-surface border border-stroke shadow-xl ${className}`}
    style={{
      animation: `fade-up 0.45s ease ${delay} both, float ${floatDuration} ease-in-out ${delay} infinite`,
      willChange: "transform",
      transform: "translateZ(0)",
    }}
  >
    <Icon size={sizeMap[size].icon} className="text-ink-secondary" />
  </div>
);

export function HeroSection() {
  const t = useTranslations("Landing");

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-center py-24 px-6 text-center w-full overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={TrendingUp} size="md" className="top-[4%]     left-[3%]   rotate-[-14deg]" delay="0.4s" floatDuration="3.8s" />
        <FloatingIcon
          icon={CandlestickChart}
          size="lg"
          className="top-[18%]    left-[11%]  rotate-[9deg]"
          delay="1.1s"
          floatDuration="4.6s"
        />
        <FloatingIcon icon={Wallet} size="sm" className="top-[34%]    left-[2%]   rotate-22" delay="0.65s" floatDuration="5.1s" />
        <FloatingIcon icon={DollarSign} size="lg" className="top-[53%]    left-[7%]   rotate-[-17deg]" delay="0.9s" floatDuration="4.2s" />
        <FloatingIcon icon={Calculator} size="sm" className="top-[72%]    left-[14%]  rotate-[8deg]" delay="1.3s" floatDuration="3.5s" />
        <FloatingIcon icon={BookOpen} size="md" className="bottom-[4%]  left-[4%]   rotate-[-11deg]" delay="0.75s" floatDuration="4.9s" />

        <FloatingIcon icon={BarChart3} size="sm" className="top-[8%]     right-[5%]  rotate-16" delay="0.5s" floatDuration="4.4s" />
        <FloatingIcon icon={LineChart} size="md" className="top-[27%]    right-[13%] rotate-[-8deg]" delay="1.0s" floatDuration="5.3s" />
        <FloatingIcon icon={Activity} size="lg" className="top-[45%]    right-[3%]  rotate-19" delay="0.6s" floatDuration="3.9s" />
        <FloatingIcon icon={PieChart} size="sm" className="top-[64%]    right-[10%] rotate-[-23deg]" delay="0.85s" floatDuration="4.7s" />
        <FloatingIcon icon={TrendingDown} size="md" className="bottom-[17%] right-[2%]  rotate-6" delay="1.2s" floatDuration="5.0s" />
        <FloatingIcon icon={Target} size="lg" className="bottom-[5%]  right-[16%] rotate-[-14deg]" delay="0.55s" floatDuration="4.1s" />
      </div>

      <div className="relative max-w-270 mx-auto w-full flex flex-col items-center">
        <h1
          className="mt-12 type-landing-hero animate-fade-up flex flex-col items-center"
          style={{ animationDelay: "0.05s", animationFillMode: "both" }}
        >
          <span>{t("hero.title")}</span>
          <span className="type-landing-hero-sub mt-2">{t("hero.subtitle")}</span>
        </h1>

        <p className="mt-4 type-landing-body-lg max-w-120 animate-fade-up" style={{ animationDelay: "0.12s", animationFillMode: "both" }}>
          {t("hero.description")}
        </p>

        <div className="mt-6 flex items-center gap-3 animate-fade-up" style={{ animationDelay: "0.24s", animationFillMode: "both" }}>
          <Link href="/register">
            <Button variant="primary" size="md">
              {t("hero.startForFree")}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="md">
              {t("hero.logIn")}
            </Button>
          </Link>
        </div>

        <div className="mt-12 opacity-20 animate-fade-up" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
          <LogoIcon size={28} />
        </div>
      </div>
    </section>
  );
}
