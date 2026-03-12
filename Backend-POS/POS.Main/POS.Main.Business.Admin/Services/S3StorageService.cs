using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;

namespace POS.Main.Business.Admin.Services;

public class S3StorageService : IS3StorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3StorageService> logger)
    {
        _s3Client = s3Client;
        _bucketName = configuration["S3:BucketName"]
            ?? throw new InvalidOperationException("S3:BucketName is not configured");
        _logger = logger;
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var s3Key = $"{now:yyyy}/{now:MM}/{Guid.NewGuid()}_{fileName}";

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = s3Key,
            InputStream = stream,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(request, ct);

        _logger.LogInformation("File uploaded to S3: {S3Key}", s3Key);
        return s3Key;
    }

    public async Task<Stream> DownloadAsync(string s3Key, CancellationToken ct = default)
    {
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = s3Key
        };

        var response = await _s3Client.GetObjectAsync(request, ct);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(string s3Key, CancellationToken ct = default)
    {
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = s3Key
        };

        await _s3Client.DeleteObjectAsync(request, ct);

        _logger.LogInformation("File deleted from S3: {S3Key}", s3Key);
    }
}
