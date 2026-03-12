using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Controllers;

[ApiController]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    protected IActionResult Success<T>(T data, string? message = null)
        => Ok(new BaseResponseModel<T>
        {
            Status = constResultType.Success,
            Result = data,
            Message = message
        });

    protected IActionResult Success(string? message = null)
        => Ok(new BaseResponseModel<object>
        {
            Status = constResultType.Success,
            Message = message
        });

    protected IActionResult ListSuccess<T>(IEnumerable<T> data, string? message = null)
        => Ok(new ListResponseModel<T>
        {
            Status = constResultType.Success,
            Results = data.ToList(),
            Message = message
        });

    protected IActionResult PagedSuccess<T>(PaginationResult<T> result)
    {
        result.Status = constResultType.Success;
        return Ok(result);
    }

    protected string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"].ToString();

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }

    protected Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        return Guid.Parse(userIdClaim ?? Guid.Empty.ToString());
    }
}
