using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface ICustomerSessionRepository
{
    Task<TbCustomerSession?> GetByIdAsync(int sessionId, CancellationToken ct = default);
    Task<TbCustomerSession?> GetBySessionTokenAsync(string sessionToken, CancellationToken ct = default);
    Task<TbCustomerSession?> GetActiveByTableAndDeviceAsync(int tableId, string deviceFingerprint, CancellationToken ct = default);
    Task<List<TbCustomerSession>> GetActiveByTableAsync(int tableId, CancellationToken ct = default);
    Task AddAsync(TbCustomerSession session, CancellationToken ct = default);
    Task DeactivateAllByTableAsync(int tableId, CancellationToken ct = default);
}
