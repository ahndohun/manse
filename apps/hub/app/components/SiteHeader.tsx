import Image from "next/image";
import Link from "next/link";
import logo from "../../../landing/src/assets/brand/manse-logo-trim.png";

const navigation = [
  { href: "/#games", label: "Games" },
  { href: "/#platform", label: "Platform" },
  { href: "/docs", label: "Docs" },
  { href: "/submit", label: "List a game" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Manse home">
          <Image className="brand-image" src={logo} alt="Manse" priority />
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="button button-small button-ink header-cta" href="/playground">
          Try the engine
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
