namespace POS.Main.Business.Admin.Interfaces;

public interface IS3StorageService
{
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default);
    Task<Stream> DownloadAsync(string s3Key, CancellationToken ct = default);
    Task DeleteAsync(string s3Key, CancellationToken ct = default);
}
