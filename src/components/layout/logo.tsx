import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-baseline font-[family-name:var(--font-poppins)] text-2xl tracking-tight transition-all duration-300"
    >
      <span className="font-light text-foreground">
        my
      </span>
      <span className="font-semibold text-primary ml-0.5 transition-all duration-500">
        Rupaiya
      </span>
    </Link>
  );
}
