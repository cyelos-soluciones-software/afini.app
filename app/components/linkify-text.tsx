import { Fragment } from "react";

/** Texto plano con URLs http(s) como enlaces (mensaje configurado por admin). */
export function LinkifyText({ text }: { text: string }) {
  const segments = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, i) =>
        /^https?:\/\//.test(segment) ? (
          <a
            key={i}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--primary)] underline underline-offset-2 hover:opacity-90"
          >
            {segment}
          </a>
        ) : (
          <Fragment key={i}>{segment}</Fragment>
        ),
      )}
    </span>
  );
}
