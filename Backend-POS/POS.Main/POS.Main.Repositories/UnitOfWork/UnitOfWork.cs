using Microsoft.EntityFrameworkCore.Storage;
using POS.Main.Dal;
using POS.Main.Repositories.Implementations;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly POSMainContext _context;
    private bool _disposed = false;

    private IUserRepository? _users;
    private IRefreshTokenRepository? _refreshTokens;
private IServiceChargeRepository? _serviceCharges;
    private IEmployeeRepository? _employees;
    private IEmployeeAddressRepository? _employeeAddresses;
    private IEmployeeEducationRepository? _employeeEducations;
    private IEmployeeWorkHistoryRepository? _employeeWorkHistories;
    private IFileRepository? _files;
    private IPositionRepository? _positions;
    private IModuleRepository? _modules;
    private IAuthorizeMatrixRepository? _authorizeMatrices;
    private IAuthorizeMatrixPositionRepository? _authorizeMatrixPositions;
    private IShopSettingsRepository? _shopSettings;
    private IPasswordResetTokenRepository? _passwordResetTokens;
    private IPasswordHistoryRepository? _passwordHistory;
    private IMenuSubCategoryRepository? _menuSubCategories;
    private IMenuRepository? _menus;
    private IOptionGroupRepository? _optionGroups;
    private IMenuOptionGroupRepository? _menuOptionGroups;
    private IZoneRepository? _zones;
    private ITableRepository? _tables;
    private ITableLinkRepository? _tableLinks;
    private IReservationRepository? _reservations;
    private IFloorObjectRepository? _floorObjects;
    private IOrderRepository? _orders;
    private IOrderItemRepository? _orderItems;
    private IOrderItemOptionRepository? _orderItemOptions;
    private IOrderBillRepository? _orderBills;
    private IPaymentRepository? _payments;
    private ICashierSessionRepository? _cashierSessions;
    private ICashDrawerTransactionRepository? _cashDrawerTransactions;
    private INotificationRepository? _notifications;
    private INotificationReadRepository? _notificationReads;
    private ICustomerSessionRepository? _customerSessions;

    public UnitOfWork(POSMainContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_context);
public IServiceChargeRepository ServiceCharges => _serviceCharges ??= new ServiceChargeRepository(_context);
    public IEmployeeRepository Employees => _employees ??= new EmployeeRepository(_context);
    public IEmployeeAddressRepository EmployeeAddresses => _employeeAddresses ??= new EmployeeAddressRepository(_context);
    public IEmployeeEducationRepository EmployeeEducations => _employeeEducations ??= new EmployeeEducationRepository(_context);
    public IEmployeeWorkHistoryRepository EmployeeWorkHistories => _employeeWorkHistories ??= new EmployeeWorkHistoryRepository(_context);
    public IFileRepository Files => _files ??= new FileRepository(_context);
    public IPositionRepository Positions => _positions ??= new PositionRepository(_context);
    public IModuleRepository Modules => _modules ??= new ModuleRepository(_context);
    public IAuthorizeMatrixRepository AuthorizeMatrices => _authorizeMatrices ??= new AuthorizeMatrixRepository(_context);
    public IAuthorizeMatrixPositionRepository AuthorizeMatrixPositions => _authorizeMatrixPositions ??= new AuthorizeMatrixPositionRepository(_context);
    public IShopSettingsRepository ShopSettings => _shopSettings ??= new ShopSettingsRepository(_context);
    public IPasswordResetTokenRepository PasswordResetTokens => _passwordResetTokens ??= new PasswordResetTokenRepository(_context);
    public IPasswordHistoryRepository PasswordHistory => _passwordHistory ??= new PasswordHistoryRepository(_context);
    public IMenuSubCategoryRepository MenuSubCategories => _menuSubCategories ??= new MenuSubCategoryRepository(_context);
    public IMenuRepository Menus => _menus ??= new MenuRepository(_context);
    public IOptionGroupRepository OptionGroups => _optionGroups ??= new OptionGroupRepository(_context);
    public IMenuOptionGroupRepository MenuOptionGroups => _menuOptionGroups ??= new MenuOptionGroupRepository(_context);
    public IZoneRepository Zones => _zones ??= new ZoneRepository(_context);
    public ITableRepository Tables => _tables ??= new TableRepository(_context);
    public ITableLinkRepository TableLinks => _tableLinks ??= new TableLinkRepository(_context);
    public IReservationRepository Reservations => _reservations ??= new ReservationRepository(_context);
    public IFloorObjectRepository FloorObjects => _floorObjects ??= new FloorObjectRepository(_context);
    public IOrderRepository Orders => _orders ??= new OrderRepository(_context);
    public IOrderItemRepository OrderItems => _orderItems ??= new OrderItemRepository(_context);
    public IOrderItemOptionRepository OrderItemOptions => _orderItemOptions ??= new OrderItemOptionRepository(_context);
    public IOrderBillRepository OrderBills => _orderBills ??= new OrderBillRepository(_context);
    public IPaymentRepository Payments => _payments ??= new PaymentRepository(_context);
    public ICashierSessionRepository CashierSessions => _cashierSessions ??= new CashierSessionRepository(_context);
    public ICashDrawerTransactionRepository CashDrawerTransactions => _cashDrawerTransactions ??= new CashDrawerTransactionRepository(_context);
    public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);
    public INotificationReadRepository NotificationReads => _notificationReads ??= new NotificationReadRepository(_context);
    public ICustomerSessionRepository CustomerSessions => _customerSessions ??= new CustomerSessionRepository(_context);

    public async Task<int> CommitAsync(CancellationToken ct = default)
    {
        return await _context.SaveChangesAsync(ct);
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct = default)
    {
        return await _context.Database.BeginTransactionAsync(ct);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
        }
        _disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
