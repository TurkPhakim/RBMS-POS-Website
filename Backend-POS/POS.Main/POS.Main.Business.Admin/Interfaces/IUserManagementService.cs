using POS.Main.Business.Admin.Models.UserManagement;
using POS.Main.Core.Models;

namespace POS.Main.Business.Admin.Interfaces;

public interface IUserManagementService
{
    Task<PaginationResult<UserListResponseModel>> GetUsersAsync(
        PaginationModel param, bool? isActive = null, bool? isLocked = null, int? positionId = null, CancellationToken ct = default);

    Task<UserDetailResponseModel> GetUserByIdAsync(Guid userId, CancellationToken ct = default);

    Task<UserDetailResponseModel> UpdateUserSettingsAsync(Guid userId, UpdateUserSettingsRequestModel request, CancellationToken ct = default);

    Task ResetLoginAttemptsAsync(Guid userId, CancellationToken ct = default);
}
