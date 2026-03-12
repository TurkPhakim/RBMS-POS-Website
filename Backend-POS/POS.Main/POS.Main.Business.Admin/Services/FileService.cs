using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.Files;
using POS.Main.Core.Exceptions;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class FileService : IFileService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IS3StorageService _s3;
    private readonly ILogger<FileService> _logger;

    public FileService(IUnitOfWork unitOfWork, IS3StorageService s3, ILogger<FileService> logger)
    {
        _unitOfWork = unitOfWork;
        _s3 = s3;
        _logger = logger;
    }

    public async Task<FileResponseModel> UploadAsync(IFormFile file, CancellationToken ct = default)
    {
        ValidateFile(file);

        using var stream = file.OpenReadStream();
        var s3Key = await _s3.UploadAsync(stream, file.FileName, file.ContentType, ct);

        var extension = Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
        var entity = new TbFile
        {
            FileName = file.FileName,
            MimeType = file.ContentType,
            FileExtension = extension,
            FileSize = file.Length,
            S3Key = s3Key
        };

        await _unitOfWork.Files.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("File uploaded: {FileId} {FileName}", entity.FileId, entity.FileName);
        return FileMapper.ToResponse(entity);
    }

    public async Task<FileDownloadResult> DownloadAsync(int fileId, CancellationToken ct = default)
    {
        var file = await _unitOfWork.Files.QueryNoTracking()
                .FirstOrDefaultAsync(f => f.FileId == fileId, ct)
            ?? throw new EntityNotFoundException("File", fileId);

        var stream = await _s3.DownloadAsync(file.S3Key, ct);
        return new FileDownloadResult(stream, file.MimeType, file.FileName);
    }

    public async Task DeleteAsync(int fileId, CancellationToken ct = default)
    {
        var file = await _unitOfWork.Files.GetByIdAsync(fileId, ct)
            ?? throw new EntityNotFoundException("File", fileId);

        file.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("File deleted (soft): {FileId}", fileId);
    }

    private static void ValidateFile(IFormFile file)
    {
        const long maxSize = 10 * 1024 * 1024; // 10 MB
        string[] allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

        if (file.Length == 0)
            throw new ValidationException("ไฟล์ว่างเปล่า");

        if (file.Length > maxSize)
            throw new ValidationException($"ไฟล์ต้องไม่เกิน {maxSize / 1024 / 1024} MB");

        if (!allowedTypes.Contains(file.ContentType))
            throw new ValidationException("ประเภทไฟล์ไม่รองรับ รองรับเฉพาะ: JPEG, PNG, WebP, PDF");
    }
}
