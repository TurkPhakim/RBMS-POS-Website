using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    ILoginHistoryRepository LoginHistory { get; }
    IServiceChargeRepository ServiceCharges { get; }
    IMenuRepository Menus { get; }
    IEmployeeRepository Employees { get; }
    IEmployeeAddressRepository EmployeeAddresses { get; }
    IEmployeeEducationRepository EmployeeEducations { get; }
    IEmployeeWorkHistoryRepository EmployeeWorkHistories { get; }
    IFileRepository Files { get; }
    IPositionRepository Positions { get; }
    IModuleRepository Modules { get; }
    IAuthorizeMatrixRepository AuthorizeMatrices { get; }
    IAuthorizeMatrixPositionRepository AuthorizeMatrixPositions { get; }
    IShopSettingsRepository ShopSettings { get; }
    IPasswordResetTokenRepository PasswordResetTokens { get; }
    IPasswordHistoryRepository PasswordHistory { get; }

    Task<int> CommitAsync(CancellationToken ct = default);
}
