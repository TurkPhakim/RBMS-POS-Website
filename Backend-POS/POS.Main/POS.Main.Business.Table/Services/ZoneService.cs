using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.Zone;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Table.Services;

public class ZoneService : IZoneService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ZoneService> _logger;

    public ZoneService(IUnitOfWork unitOfWork, ILogger<ZoneService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginationResult<ZoneResponseModel>> GetZonesAsync(
        PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.Zones.QueryNoTracking();

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(z => z.ZoneName.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(z => z.SortOrder)
            .ThenBy(z => z.ZoneId)
            .Skip(param.Skip)
            .Take(param.Take)
            .Select(z => new ZoneResponseModel
            {
                ZoneId = z.ZoneId,
                ZoneName = z.ZoneName,
                Color = z.Color,
                SortOrder = z.SortOrder,
                IsActive = z.IsActive,
                TableCount = z.Tables.Count(),
                CreatedAt = z.CreatedAt
            })
            .ToListAsync(ct);

        return new PaginationResult<ZoneResponseModel>
        {
            Results = items,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<ZoneResponseModel> GetZoneByIdAsync(int zoneId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Zones.QueryNoTracking()
            .Include(z => z.CreatedByEmployee)
            .Include(z => z.UpdatedByEmployee)
            .FirstOrDefaultAsync(z => z.ZoneId == zoneId, ct)
            ?? throw new EntityNotFoundException("Zone", zoneId);

        var tableCount = await _unitOfWork.Tables.QueryNoTracking()
            .CountAsync(t => t.ZoneId == zoneId, ct);

        return ZoneMapper.ToResponse(entity, tableCount);
    }

    public async Task<ZoneResponseModel> CreateZoneAsync(
        CreateZoneRequestModel request, CancellationToken ct = default)
    {
        var exists = await _unitOfWork.Zones.QueryNoTracking()
            .AnyAsync(z => z.ZoneName == request.ZoneName, ct);
        if (exists)
            throw new ValidationException("ชื่อโซนนี้มีอยู่แล้ว");

        var maxSortOrder = await _unitOfWork.Zones.QueryNoTracking()
            .Select(z => (int?)z.SortOrder)
            .MaxAsync(ct) ?? -1;

        var entity = ZoneMapper.ToEntity(request);
        entity.SortOrder = maxSortOrder + 1;

        await _unitOfWork.Zones.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created Zone {ZoneId} Name={ZoneName}", entity.ZoneId, entity.ZoneName);

        return ZoneMapper.ToResponse(entity);
    }

    public async Task<ZoneResponseModel> UpdateZoneAsync(
        int zoneId, UpdateZoneRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Zones.GetByIdAsync(zoneId, ct)
            ?? throw new EntityNotFoundException("Zone", zoneId);

        var duplicate = await _unitOfWork.Zones.QueryNoTracking()
            .AnyAsync(z => z.ZoneName == request.ZoneName && z.ZoneId != zoneId, ct);
        if (duplicate)
            throw new ValidationException("ชื่อโซนนี้มีอยู่แล้ว");

        ZoneMapper.UpdateEntity(entity, request);
        _unitOfWork.Zones.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated Zone {ZoneId}", zoneId);

        var updated = await _unitOfWork.Zones.QueryNoTracking()
            .Include(z => z.CreatedByEmployee)
            .Include(z => z.UpdatedByEmployee)
            .FirstAsync(z => z.ZoneId == zoneId, ct);

        var tableCount = await _unitOfWork.Tables.QueryNoTracking()
            .CountAsync(t => t.ZoneId == zoneId, ct);

        return ZoneMapper.ToResponse(updated, tableCount);
    }

    public async Task DeleteZoneAsync(int zoneId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Zones.GetByIdAsync(zoneId, ct)
            ?? throw new EntityNotFoundException("Zone", zoneId);

        var tableCount = await _unitOfWork.Tables.QueryNoTracking()
            .CountAsync(t => t.ZoneId == zoneId, ct);
        if (tableCount > 0)
            throw new BusinessException($"ไม่สามารถลบโซนที่ยังมีโต๊ะอยู่ ({tableCount} โต๊ะ)");

        entity.DeleteFlag = true;
        _unitOfWork.Zones.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Deleted Zone {ZoneId}", zoneId);
    }

    public async Task UpdateSortOrderAsync(
        UpdateZoneSortOrderRequestModel request, CancellationToken ct = default)
    {
        foreach (var item in request.Items)
        {
            var entity = await _unitOfWork.Zones.GetByIdAsync(item.Id, ct)
                ?? throw new EntityNotFoundException("Zone", item.Id);

            entity.SortOrder = item.SortOrder;
            _unitOfWork.Zones.Update(entity);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated SortOrder for {Count} Zones", request.Items.Count);
    }

    public async Task<List<ZoneResponseModel>> GetActiveZonesAsync(CancellationToken ct = default)
    {
        return await _unitOfWork.Zones.QueryNoTracking()
            .Where(z => z.IsActive)
            .OrderBy(z => z.SortOrder)
            .Select(z => new ZoneResponseModel
            {
                ZoneId = z.ZoneId,
                ZoneName = z.ZoneName,
                Color = z.Color,
                SortOrder = z.SortOrder,
                IsActive = z.IsActive,
                TableCount = z.Tables.Count()
            })
            .ToListAsync(ct);
    }
}
