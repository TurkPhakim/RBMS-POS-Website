using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.Reservation;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Table.Services;

public class ReservationService : IReservationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITableService _tableService;
    private readonly ILogger<ReservationService> _logger;

    public ReservationService(
        IUnitOfWork unitOfWork,
        ITableService tableService,
        ILogger<ReservationService> logger)
    {
        _unitOfWork = unitOfWork;
        _tableService = tableService;
        _logger = logger;
    }

    public async Task<PaginationResult<ReservationResponseModel>> GetReservationsAsync(
        DateOnly? dateFrom, DateOnly? dateTo, string? status,
        PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.Reservations.QueryNoTracking()
            .Include(r => r.Table)
            .AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(r => r.ReservationDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(r => r.ReservationDate <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EReservationStatus>(status, true, out var statusEnum))
            query = query.Where(r => r.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(r =>
                r.CustomerName.ToLower().Contains(term) ||
                r.CustomerPhone.Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(r => r.ReservationDate)
            .ThenBy(r => r.ReservationTime)
            .Skip(param.Skip)
            .Take(param.Take)
            .Select(r => new ReservationResponseModel
            {
                ReservationId = r.ReservationId,
                CustomerName = r.CustomerName,
                CustomerPhone = r.CustomerPhone,
                ReservationDate = r.ReservationDate,
                ReservationTime = r.ReservationTime,
                GuestCount = r.GuestCount,
                TableId = r.TableId,
                TableName = r.Table != null ? r.Table.TableName : null,
                Note = r.Note,
                Status = r.Status.ToString(),
                ReminderSent = r.ReminderSent,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(ct);

        return new PaginationResult<ReservationResponseModel>
        {
            Results = items,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<List<ReservationResponseModel>> GetTodayReservationsAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return await _unitOfWork.Reservations.QueryNoTracking()
            .Include(r => r.Table)
            .Where(r => r.ReservationDate == today)
            .OrderBy(r => r.ReservationTime)
            .Select(r => new ReservationResponseModel
            {
                ReservationId = r.ReservationId,
                CustomerName = r.CustomerName,
                CustomerPhone = r.CustomerPhone,
                ReservationDate = r.ReservationDate,
                ReservationTime = r.ReservationTime,
                GuestCount = r.GuestCount,
                TableId = r.TableId,
                TableName = r.Table != null ? r.Table.TableName : null,
                Note = r.Note,
                Status = r.Status.ToString(),
                ReminderSent = r.ReminderSent,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(ct);
    }

    public async Task<ReservationResponseModel> GetReservationByIdAsync(
        int reservationId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Reservations.QueryNoTracking()
            .Include(r => r.Table)
            .Include(r => r.CreatedByEmployee)
            .Include(r => r.UpdatedByEmployee)
            .FirstOrDefaultAsync(r => r.ReservationId == reservationId, ct)
            ?? throw new EntityNotFoundException("Reservation", reservationId);

        return ReservationMapper.ToResponse(entity);
    }

    public async Task<ReservationResponseModel> CreateReservationAsync(
        CreateReservationRequestModel request, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (request.ReservationDate < today)
            throw new ValidationException("ไม่สามารถจองวันที่ผ่านไปแล้ว");

        if (request.TableId.HasValue)
            await ValidateTableAvailability(request.TableId.Value, request.ReservationDate, request.ReservationTime, null, ct);

        var entity = ReservationMapper.ToEntity(request);

        await _unitOfWork.Reservations.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created Reservation {ReservationId} Customer={CustomerName} Date={Date} Time={Time}",
            entity.ReservationId, entity.CustomerName, entity.ReservationDate, entity.ReservationTime);

        return await GetReservationByIdAsync(entity.ReservationId, ct);
    }

    public async Task<ReservationResponseModel> UpdateReservationAsync(
        int reservationId, UpdateReservationRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Reservations.GetByIdAsync(reservationId, ct)
            ?? throw new EntityNotFoundException("Reservation", reservationId);

        if (entity.Status == EReservationStatus.CheckedIn || entity.Status == EReservationStatus.Cancelled || entity.Status == EReservationStatus.NoShow)
            throw new BusinessException("ไม่สามารถแก้ไขการจองที่ดำเนินการแล้ว");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (request.ReservationDate < today)
            throw new ValidationException("ไม่สามารถจองวันที่ผ่านไปแล้ว");

        if (request.TableId.HasValue)
            await ValidateTableAvailability(request.TableId.Value, request.ReservationDate, request.ReservationTime, reservationId, ct);

        ReservationMapper.UpdateEntity(entity, request);
        _unitOfWork.Reservations.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated Reservation {ReservationId}", reservationId);

        return await GetReservationByIdAsync(reservationId, ct);
    }

    public async Task<ReservationResponseModel> ConfirmReservationAsync(
        int reservationId, ConfirmReservationRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Reservations.GetByIdAsync(reservationId, ct)
            ?? throw new EntityNotFoundException("Reservation", reservationId);

        if (entity.Status != EReservationStatus.Pending)
            throw new BusinessException("ยืนยันได้เฉพาะการจองที่อยู่ในสถานะรอยืนยัน");

        await ValidateTableAvailability(request.TableId, entity.ReservationDate, entity.ReservationTime, reservationId, ct);

        entity.Status = EReservationStatus.Confirmed;
        entity.TableId = request.TableId;
        _unitOfWork.Reservations.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Confirmed Reservation {ReservationId} TableId={TableId}",
            reservationId, request.TableId);

        return await GetReservationByIdAsync(reservationId, ct);
    }

    public async Task<ReservationResponseModel> CheckInReservationAsync(
        int reservationId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Reservations.GetByIdAsync(reservationId, ct)
            ?? throw new EntityNotFoundException("Reservation", reservationId);

        if (entity.Status != EReservationStatus.Confirmed)
            throw new BusinessException("การจองยังไม่ได้ยืนยัน");

        if (!entity.TableId.HasValue)
            throw new BusinessException("การจองยังไม่ได้ assign โต๊ะ");

        entity.Status = EReservationStatus.CheckedIn;
        _unitOfWork.Reservations.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        // Open table automatically
        await _tableService.OpenTableAsync(entity.TableId.Value,
            new POS.Main.Business.Table.Models.Table.OpenTableRequestModel
            {
                GuestType = "Reserved",
                GuestCount = entity.GuestCount,
                Note = $"จอง: {entity.CustomerName} ({entity.CustomerPhone})" +
                       (string.IsNullOrEmpty(entity.Note) ? "" : $" - {entity.Note}")
            }, ct);

        _logger.LogInformation("CheckedIn Reservation {ReservationId}", reservationId);

        return await GetReservationByIdAsync(reservationId, ct);
    }

    public async Task<ReservationResponseModel> CancelReservationAsync(
        int reservationId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Reservations.GetByIdAsync(reservationId, ct)
            ?? throw new EntityNotFoundException("Reservation", reservationId);

        if (entity.Status != EReservationStatus.Pending && entity.Status != EReservationStatus.Confirmed)
            throw new BusinessException("ยกเลิกได้เฉพาะการจองที่ยังไม่ Check-in");

        // If table was RESERVED, set back to AVAILABLE
        if (entity.TableId.HasValue && entity.Status == EReservationStatus.Confirmed)
        {
            var table = await _unitOfWork.Tables.GetByIdAsync(entity.TableId.Value, ct);
            if (table != null && table.Status == ETableStatus.Reserved)
            {
                table.Status = ETableStatus.Available;
                _unitOfWork.Tables.Update(table);
            }
        }

        entity.Status = EReservationStatus.Cancelled;
        _unitOfWork.Reservations.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cancelled Reservation {ReservationId}", reservationId);

        return await GetReservationByIdAsync(reservationId, ct);
    }

    public async Task<ReservationResponseModel> NoShowReservationAsync(
        int reservationId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Reservations.GetByIdAsync(reservationId, ct)
            ?? throw new EntityNotFoundException("Reservation", reservationId);

        if (entity.Status != EReservationStatus.Confirmed)
            throw new BusinessException("Mark No-show ได้เฉพาะการจองที่ยืนยันแล้ว");

        // If table was RESERVED, set back to AVAILABLE
        if (entity.TableId.HasValue)
        {
            var table = await _unitOfWork.Tables.GetByIdAsync(entity.TableId.Value, ct);
            if (table != null && table.Status == ETableStatus.Reserved)
            {
                table.Status = ETableStatus.Available;
                _unitOfWork.Tables.Update(table);
            }
        }

        entity.Status = EReservationStatus.NoShow;
        _unitOfWork.Reservations.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("NoShow Reservation {ReservationId}", reservationId);

        return await GetReservationByIdAsync(reservationId, ct);
    }

    private async Task ValidateTableAvailability(
        int tableId, DateOnly date, TimeOnly time, int? excludeReservationId, CancellationToken ct)
    {
        var tableExists = await _unitOfWork.Tables.QueryNoTracking()
            .AnyAsync(t => t.TableId == tableId, ct);
        if (!tableExists)
            throw new EntityNotFoundException("Table", tableId);

        // Check for conflicting reservations (±2 hours buffer)
        var timeFrom = time.AddHours(-2);
        var timeTo = time.AddHours(2);

        var conflictQuery = _unitOfWork.Reservations.QueryNoTracking()
            .Where(r => r.TableId == tableId
                && r.ReservationDate == date
                && r.ReservationTime >= timeFrom
                && r.ReservationTime <= timeTo
                && r.Status != EReservationStatus.Cancelled
                && r.Status != EReservationStatus.NoShow);

        if (excludeReservationId.HasValue)
            conflictQuery = conflictQuery.Where(r => r.ReservationId != excludeReservationId.Value);

        var hasConflict = await conflictQuery.AnyAsync(ct);
        if (hasConflict)
            throw new BusinessException("โต๊ะนี้มีการจองในช่วงเวลาใกล้เคียงแล้ว");
    }
}
