namespace POS.Main.Business.Admin.Models.Files;

public record FileDownloadResult(Stream Content, string ContentType, string FileName);
