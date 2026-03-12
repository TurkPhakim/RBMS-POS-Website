using Microsoft.AspNetCore.Http;
using POS.Main.Business.Admin.Models.Files;

namespace POS.Main.Business.Admin.Interfaces;

public interface IFileService
{
    Task<FileResponseModel> UploadAsync(IFormFile file, CancellationToken ct = default);
    Task<FileDownloadResult> DownloadAsync(int fileId, CancellationToken ct = default);
    Task DeleteAsync(int fileId, CancellationToken ct = default);
}
