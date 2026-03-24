using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class CustomerSessionRepository : ICustomerSessionRepository
{
    private readonly POSMainContext _context;

    public CustomerSessionRepository(POSMainContext context)
    {
        _context = context;
    }

    public async Task<TbCustomerSession?> GetByIdAsync(int sessionId, CancellationToken ct = default)
        => await _context.CustomerSessions
            .FirstOrDefaultAsync(cs => cs.CustomerSessionId == sessionId && cs.IsActive && cs.ExpiresAt > DateTime.UtcNow, ct);

    public async Task<TbCustomerSession?> GetBySessionTokenAsync(string sessionToken, CancellationToken ct = default)
        => await _context.CustomerSessions
            .Include(cs => cs.Table)
            .FirstOrDefaultAsync(cs => cs.SessionToken == sessionToken, ct);

    public async Task<TbCustomerSession?> GetActiveByTableAndDeviceAsync(int tableId, string deviceFingerprint, CancellationToken ct = default)
        => await _context.CustomerSessions
            .FirstOrDefaultAsync(cs => cs.TableId == tableId
                && cs.DeviceFingerprint == deviceFingerprint
                && cs.IsActive
                && cs.ExpiresAt > DateTime.UtcNow, ct);

    public async Task<List<TbCustomerSession>> GetActiveByTableAsync(int tableId, CancellationToken ct = default)
        => await _context.CustomerSessions
            .Where(cs => cs.TableId == tableId && cs.IsActive && cs.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);

    public async Task AddAsync(TbCustomerSession session, CancellationToken ct = default)
        => await _context.CustomerSessions.AddAsync(session, ct);

    public async Task DeactivateAllByTableAsync(int tableId, CancellationToken ct = default)
    {
        var sessions = await _context.CustomerSessions
            .Where(cs => cs.TableId == tableId && cs.IsActive)
            .ToListAsync(ct);

        foreach (var session in sessions)
        {
            session.IsActive = false;
        }
    }
}
