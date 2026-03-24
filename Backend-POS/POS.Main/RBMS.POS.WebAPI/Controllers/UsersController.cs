using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.UserManagement;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Route("api/admin/users")]
[Authorize]
public class UsersController : BaseController
{
    private readonly IUserManagementService _userManagementService;

    public UsersController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.UserManagement.Read)]
    [ProducesResponseType(typeof(PaginationResult<UserListResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] PaginationModel param,
        [FromQuery] bool? isActive,
        [FromQuery] bool? isLocked,
        [FromQuery] int? positionId,
        CancellationToken ct = default)
        => PagedSuccess(await _userManagementService.GetUsersAsync(param, isActive, isLocked, positionId, ct));

    [HttpGet("{userId}")]
    [PermissionAuthorize(Permissions.UserManagement.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<UserDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUser(Guid userId, CancellationToken ct = default)
        => Success(await _userManagementService.GetUserByIdAsync(userId, ct));

    [HttpPut("{userId}")]
    [PermissionAuthorize(Permissions.UserManagement.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<UserDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateUserSettings(Guid userId, [FromBody] UpdateUserSettingsRequestModel request, CancellationToken ct = default)
        => Success(await _userManagementService.UpdateUserSettingsAsync(userId, request, ct));

    [HttpPost("{userId}/reset-login-attempts")]
    [PermissionAuthorize(Permissions.UserManagement.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetLoginAttempts(Guid userId, CancellationToken ct = default)
    {
        await _userManagementService.ResetLoginAttemptsAsync(userId, ct);
        return Success("รีเซ็ตจำนวนครั้งที่เข้าสู่ระบบผิดพลาดเรียบร้อยแล้ว");
    }
}
