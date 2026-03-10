import {
  Archive,
  Code,
  File,
  FileSpreadsheet,
  FileText,
  Image,
  Music,
  Presentation,
  Video,
} from "lucide-react";

export function getMimeIcon(mimeType: string, className?: string) {
  const type = mimeType?.toLowerCase() ?? "";

  if (type.startsWith("image/")) return <Image className={className} />;
  if (type.startsWith("video/")) return <Video className={className} />;
  if (type.startsWith("audio/")) return <Music className={className} />;
  if (type === "application/pdf" || type.startsWith("text/"))
    return <FileText className={className} />;
  if (
    type.includes("zip") ||
    type.includes("tar") ||
    type.includes("rar") ||
    type.includes("7z") ||
    type.includes("gzip") ||
    type.includes("bzip")
  )
    return <Archive className={className} />;
  if (
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("json") ||
    type.includes("xml") ||
    type.includes("html")
  )
    return <Code className={className} />;
  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type.includes("csv")
  )
    return <FileSpreadsheet className={className} />;
  if (type.includes("presentation") || type.includes("powerpoint"))
    return <Presentation className={className} />;

  return <File className={className} />;
}
