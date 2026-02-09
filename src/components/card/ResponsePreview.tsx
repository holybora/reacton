interface ResponsePreviewProps {
  content: string | null;
  isLoading: boolean;
}

export default function ResponsePreview({
  content,
  isLoading,
}: ResponsePreviewProps) {
  if (isLoading) {
    return (
      <div className="min-h-[300px] bg-gray-800/50 rounded-lg p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-[85%]" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-[92%]" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-[70%]" />
        <div className="h-4 bg-gray-700 rounded animate-pulse w-[60%]" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-[300px] bg-gray-800/50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm italic">
          Submit a prompt to see the response
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[300px] rounded-lg overflow-hidden border border-gray-700">
      <iframe
        srcDoc={content}
        sandbox="allow-scripts"
        className="w-full min-h-[300px] bg-white rounded-lg"
        title="Response preview"
      />
    </div>
  );
}
