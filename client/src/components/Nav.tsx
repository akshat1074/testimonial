import { Link, useLocation } from "react-router-dom";

const LINKS = [
    { to: "/submit", label: "Submit" },
    { to: "/wall", label: "Wall" },
    { to: "/dashboard", label: "Dashboard" },
];

/**
 * Shown on the three "real" app pages. Deliberately absent from
 * WidgetPage (/embed) — that page renders inside an iframe on someone
 * else's site, where a nav bar linking back to our app would look broken
 * and out of place. See widget-demo.html for how the widget stands alone.
 */
export function Nav() {
    const { pathname } = useLocation();

    return (
        <nav className="fixed left-1/2 top-4 z-30 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-full border border-ink-700 bg-ink-800/90 p-1 shadow-lg backdrop-blur">
                {LINKS.map((link) => {
                    const active = pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${active
                                    ? "bg-seal-500 text-ink-950"
                                    : "text-paper-400 hover:bg-ink-700 hover:text-paper-100"
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}