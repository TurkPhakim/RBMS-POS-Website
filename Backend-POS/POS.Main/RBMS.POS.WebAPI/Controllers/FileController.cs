using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;

namespace RBMS.POS.WebAPI.Controllers;

/// <summary>
/// File download endpoint
/// </summary>
[Authorize]
[Route("api/admin/file")]
public class FileController : BaseController
{
    private readonly IFileService _fileService;

    public FileController(IFileService fileService)
    {
        _fileService = fileService;
    }

    /// <summary>
    /// Download file by ID
    /// </summary>
    [HttpGet("{fileId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(int fileId, CancellationToken ct = default)
    {
        var result = await _fileService.DownloadAsync(fileId, ct);
        return File(result.Content, result.ContentType, result.FileName);
    }
}
