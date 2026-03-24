using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.CashierSession;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Payment.Services;

public class CashierSessionService : ICashierSessionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CashierSessionService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CashierSessionService(IUnitOfWork unitOfWork, ILogger<CashierSessionService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<CashierSessionResponseModel?> GetCurrentSessionAsync(CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();

        var session = await _unitOfWork.CashierSessions.QueryNoTracking()
            .Include(cs => cs.User)
                .ThenInclude(u => u.Employee)
                    .ThenInclude(e => e.Position)
            .Include(cs => cs.CashDrawerTransactions)
            .Include(cs => cs.Payments)
                .ThenInclude(p => p.OrderBill)
                    .ThenInclude(ob => ob.Order)
                        .ThenInclude(o => o.Table)
                            .ThenInclude(t => t.Zone)
            .Where(cs => cs.UserId == userId && cs.Status == ECashierSessionStatus.Open)
            .FirstOrDefaultAsync(ct);

        return session == null ? null : CashierSessionMapper.ToResponse(session);
    }

    public async Task<CashierSessionResponseModel> GetSessionByIdAsync(int cashierSessionId, CancellationToken ct = default)
    {
        var session = await _unitOfWork.CashierSessions.QueryNoTracking()
            .Include(cs => cs.User)
                .ThenInclude(u => u.Employee)
                    .ThenInclude(e => e.Position)
            .Include(cs => cs.CashDrawerTransactions)
            .Include(cs => cs.Payments)
                .ThenInclude(p => p.OrderBill)
                    .ThenInclude(ob => ob.Order)
                        .ThenInclude(o => o.Table)
                            .ThenInclude(t => t.Zone)
            .Where(cs => cs.CashierSessionId == cashierSessionId)
            .FirstOrDefaultAsync(ct)
            ?? throw new EntityNotFoundException("CashierSession", cashierSessionId);

        return CashierSessionMapper.ToResponse(session);
    }

    public async Task<PaginationResult<CashierSessionResponseModel>> GetSessionHistoryAsync(
        PaginationModel param, DateTime? dateFrom = null, DateTime? dateTo = null, int? shiftPeriod = null, CancellationToken ct = default)
    {
        var query = _unitOfWork.CashierSessions.QueryNoTracking()
            .Include(cs => cs.User)
                .ThenInclude(u => u.Employee)
                    .ThenInclude(e => e.Position)
            .Include(cs => cs.CashDrawerTransactions)
            .Include(cs => cs.Payments)
                .ThenInclude(p => p.OrderBill)
                    .ThenInclude(ob => ob.Order)
                        .ThenInclude(o => o.Table)
                            .ThenInclude(t => t.Zone)
            .AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(cs => cs.OpenedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(cs => cs.OpenedAt <= dateTo.Value);

        if (shiftPeriod.HasValue)
            query = query.Where(cs => cs.ShiftPeriod == shiftPeriod.Value);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var search = param.Search.Trim().ToLower();
            query = query.Where(cs => cs.User.Username.ToLower().Contains(search));
        }

        var orderedQuery = query.OrderByDescending(cs => cs.OpenedAt);

        var total = await orderedQuery.CountAsync(ct);
        var items = await orderedQuery
            .Skip((param.Page - 1) * param.ItemPerPage)
            .Take(param.ItemPerPage)
            .ToListAsync(ct);

        return new PaginationResult<CashierSessionResponseModel>
        {
            Results = items.Select(CashierSessionMapper.ToResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<CashierSessionResponseModel> OpenSessionAsync(OpenCashierSessionRequestModel request, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();

        // ตรวจว่ามีกะเปิดอยู่แล้วหรือไม่
        var existingOpen = await _unitOfWork.CashierSessions.ExistsAsync(
            cs => cs.UserId == userId && cs.Status == ECashierSessionStatus.Open, ct);

        if (existingOpen)
            throw new ValidationException("คุณมีกะที่เปิดอยู่แล้ว กรุณาปิดกะก่อนเปิดกะใหม่");

        var session = new TbCashierSession
        {
            UserId = userId,
            Status = ECashierSessionStatus.Open,
            OpenedAt = DateTime.UtcNow,
            OpeningCash = request.OpeningCash,
            ShiftPeriod = request.ShiftPeriod
        };

        await _unitOfWork.CashierSessions.AddAsync(session, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cashier session opened: {SessionId} by user {UserId}", session.CashierSessionId, userId);

        return await GetSessionByIdAsync(session.CashierSessionId, ct);
    }

    public async Task<CashierSessionResponseModel> CashInAsync(int cashierSessionId, CashDrawerTransactionRequestModel request, CancellationToken ct = default)
    {
        var session = await GetOpenSessionAsync(cashierSessionId, ct);

        var transaction = new TbCashDrawerTransaction
        {
            CashierSessionId = cashierSessionId,
            TransactionType = ECashDrawerTransactionType.CashIn,
            Amount = request.Amount,
            Reason = request.Reason
        };

        await _unitOfWork.CashDrawerTransactions.AddAsync(transaction, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cash-in {Amount} to session {SessionId}", request.Amount, cashierSessionId);

        return await GetSessionByIdAsync(cashierSessionId, ct);
    }

    public async Task<CashierSessionResponseModel> CashOutAsync(int cashierSessionId, CashDrawerTransactionRequestModel request, CancellationToken ct = default)
    {
        var session = await GetOpenSessionAsync(cashierSessionId, ct);

        var transaction = new TbCashDrawerTransaction
        {
            CashierSessionId = cashierSessionId,
            TransactionType = ECashDrawerTransactionType.CashOut,
            Amount = request.Amount,
            Reason = request.Reason
        };

        await _unitOfWork.CashDrawerTransactions.AddAsync(transaction, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cash-out {Amount} from session {SessionId}", request.Amount, cashierSessionId);

        return await GetSessionByIdAsync(cashierSessionId, ct);
    }

    public async Task<CashierSessionResponseModel> CloseSessionAsync(int cashierSessionId, CloseCashierSessionRequestModel request, CancellationToken ct = default)
    {
        var session = await GetOpenSessionAsync(cashierSessionId, ct);

        // คำนวณ ExpectedCash
        var cashDrawerTransactions = await _unitOfWork.CashDrawerTransactions.QueryNoTracking()
            .Where(t => t.CashierSessionId == cashierSessionId)
            .ToListAsync(ct);

        var totalCashIn = cashDrawerTransactions
            .Where(t => t.TransactionType == ECashDrawerTransactionType.CashIn)
            .Sum(t => t.Amount);

        var totalCashOut = cashDrawerTransactions
            .Where(t => t.TransactionType == ECashDrawerTransactionType.CashOut)
            .Sum(t => t.Amount);

        var expectedCash = session.OpeningCash + session.TotalCashSales + totalCashIn - totalCashOut;

        session.Status = ECashierSessionStatus.Closed;
        session.ClosedAt = DateTime.UtcNow;
        session.ExpectedCash = expectedCash;
        session.ActualCash = request.ActualCash;
        session.Variance = request.ActualCash - expectedCash;

        _unitOfWork.CashierSessions.Update(session);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cashier session closed: {SessionId}, Variance: {Variance}",
            cashierSessionId, session.Variance);

        return await GetSessionByIdAsync(cashierSessionId, ct);
    }

    private async Task<TbCashierSession> GetOpenSessionAsync(int cashierSessionId, CancellationToken ct)
    {
        var session = await _unitOfWork.CashierSessions.GetAll()
            .Where(cs => cs.CashierSessionId == cashierSessionId)
            .FirstOrDefaultAsync(ct)
            ?? throw new EntityNotFoundException("CashierSession", cashierSessionId);

        if (session.Status != ECashierSessionStatus.Open)
            throw new ValidationException("กะแคชเชียร์นี้ปิดไปแล้ว ไม่สามารถทำรายการได้");

        return session;
    }

    private Guid GetCurrentUserId()
    {
        var claim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;

        return Guid.TryParse(claim, out var userId) ? userId : throw new AuthenticationException("ไม่พบข้อมูลผู้ใช้งาน");
    }
}
