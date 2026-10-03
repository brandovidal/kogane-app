export interface LinkifiedTextProps {
  text: string;
}

// React escapes text; only explicit HTTP(S) links become anchors.
export function LinkifiedText({ text }: LinkifiedTextProps) {
  const parts = text.split(/(https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?])/g);
  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
