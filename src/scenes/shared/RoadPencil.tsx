import { useId } from "react";

export function RoadPencil({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 180 28" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-paint`} x2="0" y2="1">
          <stop stopColor="#ffe476" />
          <stop offset=".48" stopColor="#e5ad32" />
          <stop offset=".6" stopColor="#c68e21" />
          <stop offset="1" stopColor="#a76e16" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x2="0" y2="1">
          <stop stopColor="#f5f5eb" />
          <stop offset=".48" stopColor="#a9aaa4" />
          <stop offset=".75" stopColor="#d4d2c8" />
          <stop offset="1" stopColor="#787872" />
        </linearGradient>
      </defs>
      <path d="M23 5h132v18H23z" fill={`url(#${id}-paint)`} />
      <path d="M7 5h17v18H7Q0 22 0 14T7 5Z" fill="#c98690" />
      <path d="M20 5h21v18H20z" fill={`url(#${id}-metal)`} />
      <path d="M24 5v18m6-18v18m7-18v18" stroke="#777773" opacity=".7" />
      <path d="M154 5l26 9-26 9-3-4 3-5-3-5z" fill="#c7a275" />
      <path d="M173 11.6l7 2.4-7 2.4z" fill="#3f3832" />
    </svg>
  );
}
