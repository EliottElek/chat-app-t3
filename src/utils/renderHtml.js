export default function renderHtml(content) {
  return (
    <div className="truncate maw-w-full" dangerouslySetInnerHTML={{ __html: content }} />
  );
}
