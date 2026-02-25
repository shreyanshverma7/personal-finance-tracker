import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-baseline font-[family-name:var(--font-poppins)] text-2xl tracking-tight transition-all duration-300"
    >
      <span className="font-light text-foreground group-hover:opacity-70 transition-all">
        my
      </span>
      <span className="font-semibold text-[#FB8500] ml-0.5 relative transition-all duration-500 group-hover:tracking-wider group-hover:translate-x-1">
        Rupaiya
        <span className="absolute -bottom-1 left-1/2 w-0 h-[1.5px] bg-[#FB8500] transition-all duration-500 group-hover:w-full group-hover:left-0" />
      </span>
    </Link>
  );
}
