using POS.Main.Dal.Entities;

namespace POS.Main.Business.Admin.Models.Files;

public static class FileMapper
{
    public static FileResponseModel ToResponse(TbFile entity)
        => new()
        {
            FileId = entity.FileId,
            FileName = entity.FileName,
            MimeType = entity.MimeType,
            FileExtension = entity.FileExtension,
            FileSize = entity.FileSize,
            CreatedAt = entity.CreatedAt
        };
}
