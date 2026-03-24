using Microsoft.EntityFrameworkCore.Storage;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRefreshTokenRepository RefreshTokens { get; }
IServiceChargeRepository ServiceCharges { get; }
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
    IMenuSubCategoryRepository MenuSubCategories { get; }
    IMenuRepository Menus { get; }
    IOptionGroupRepository OptionGroups { get; }
    IMenuOptionGroupRepository MenuOptionGroups { get; }
    IZoneRepository Zones { get; }
    ITableRepository Tables { get; }
    ITableLinkRepository TableLinks { get; }
    IReservationRepository Reservations { get; }
    IFloorObjectRepository FloorObjects { get; }
    IOrderRepository Orders { get; }
    IOrderItemRepository OrderItems { get; }
    IOrderItemOptionRepository OrderItemOptions { get; }
    IOrderBillRepository OrderBills { get; }
    IPaymentRepository Payments { get; }
    ICashierSessionRepository CashierSessions { get; }
    ICashDrawerTransactionRepository CashDrawerTransactions { get; }
    INotificationRepository Notifications { get; }
    INotificationReadRepository NotificationReads { get; }
    ICustomerSessionRepository CustomerSessions { get; }

    Task<int> CommitAsync(CancellationToken ct = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct = default);
}
