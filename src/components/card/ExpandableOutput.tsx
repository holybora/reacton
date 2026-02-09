interface ExpandableOutputProps {
  content: string | null;
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ExpandableOutput({ content }: ExpandableOutputProps) {
  if (!content) return null;

  return (
    <details className="group border-t border-gray-800">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-200 list-none [&::-webkit-details-marker]:hidden">
        <span>Output</span>
        <ChevronIcon className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">
        <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
          {content}
        </pre>
      </div>
    </details>
  );
}
