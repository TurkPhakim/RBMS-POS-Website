namespace POS.Main.Dal.Entities;

public class TbFile : BaseEntity
{
    public int FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string S3Key { get; set; } = string.Empty;
}
