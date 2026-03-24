using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.UserManagement;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class UserManagementService : IUserManagementService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UserManagementService> _logger;

    public UserManagementService(IUnitOfWork unitOfWork, ILogger<UserManagementService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginationResult<UserListResponseModel>> GetUsersAsync(
        PaginationModel param, bool? isActive = null, bool? isLocked = null, int? positionId = null, CancellationToken ct = default)
    {
        var query = _unitOfWork.Users.GetUsersQuery(param.Search, isActive, isLocked, positionId);

        var total = await query.CountAsync(ct);
        var users = await query
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        return new PaginationResult<UserListResponseModel>
        {
            Results = users.Select(UserManagementMapper.ToListResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage,
        };
    }

    public async Task<UserDetailResponseModel> GetUserByIdAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdWithEmployeeReadOnlyAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        return UserManagementMapper.ToDetailResponse(user);
    }

    public async Task<UserDetailResponseModel> UpdateUserSettingsAsync(Guid userId, UpdateUserSettingsRequestModel request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdWithEmployeeAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        user.IsActive = request.IsActive;
        user.IsLockedByAdmin = request.IsLockedByAdmin;
        user.AutoUnlockDate = request.IsLockedByAdmin ? request.AutoUnlockDate : null;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("User settings updated: {UserId} - IsActive={IsActive}, IsLockedByAdmin={IsLockedByAdmin}",
            userId, request.IsActive, request.IsLockedByAdmin);

        return UserManagementMapper.ToDetailResponse(user);
    }

    public async Task ResetLoginAttemptsAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        user.FailedLoginAttempts = 0;
        user.LockoutCount = 0;
        user.LockedUntil = null;

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Login attempts reset for user: {UserId}", userId);
    }
}
