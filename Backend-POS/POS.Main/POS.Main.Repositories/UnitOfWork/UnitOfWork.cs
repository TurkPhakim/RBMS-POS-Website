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
    private ILoginHistoryRepository? _loginHistory;
    private IServiceChargeRepository? _serviceCharges;
    private IMenuRepository? _menus;
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

    public UnitOfWork(POSMainContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_context);
    public ILoginHistoryRepository LoginHistory => _loginHistory ??= new LoginHistoryRepository(_context);
    public IServiceChargeRepository ServiceCharges => _serviceCharges ??= new ServiceChargeRepository(_context);
    public IMenuRepository Menus => _menus ??= new MenuRepository(_context);
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

    public async Task<int> CommitAsync(CancellationToken ct = default)
    {
        return await _context.SaveChangesAsync(ct);
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
