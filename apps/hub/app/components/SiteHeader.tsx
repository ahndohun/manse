import Link from "next/link";

const navigation = [
  { href: "/#games", label: "Games" },
  { href: "/#platform", label: "Platform" },
  { href: "/docs", label: "Docs" },
  { href: "/submit", label: "List a game" },
];

export function SiteHeader() {
  return (
    <header className="site-header platform-shell">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Manse home">
          MANSE
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="button button-small button-light header-cta" href="/playground">
          Try the engine
        </Link>
      </div>
    </header>
  );
}
