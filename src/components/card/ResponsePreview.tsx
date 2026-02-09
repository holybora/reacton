interface ResponsePreviewProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResponsePreview({
  content,
  isLoading,
  error,
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

  if (error) {
    return (
      <div className="min-h-[300px] bg-red-950/30 border border-red-900/50 rounded-lg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium mb-1">Error</p>
          <p className="text-red-300/80 text-sm">{error}</p>
        </div>
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
