using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.FloorObject;
using POS.Main.Core.Exceptions;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Table.Services;

public class FloorObjectService : IFloorObjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<FloorObjectService> _logger;

    public FloorObjectService(IUnitOfWork unitOfWork, ILogger<FloorObjectService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<FloorObjectResponseModel>> GetFloorObjectsAsync(
        int? zoneId, CancellationToken ct = default)
    {
        var query = _unitOfWork.FloorObjects.QueryNoTracking()
            .Include(f => f.Zone)
            .AsQueryable();

        if (zoneId.HasValue)
        {
            query = query.Where(f => f.ZoneId == zoneId.Value || f.ZoneId == null);
        }

        var items = await query.OrderBy(f => f.FloorObjectId).ToListAsync(ct);
        return items.Select(FloorObjectMapper.ToResponse).ToList();
    }

    public async Task<FloorObjectResponseModel> CreateFloorObjectAsync(
        CreateFloorObjectRequestModel request, CancellationToken ct = default)
    {
        if (request.ZoneId.HasValue)
        {
            var zoneExists = await _unitOfWork.Zones.QueryNoTracking()
                .AnyAsync(z => z.ZoneId == request.ZoneId.Value, ct);
            if (!zoneExists)
                throw new EntityNotFoundException("Zone", request.ZoneId.Value);
        }

        var entity = FloorObjectMapper.ToEntity(request);
        await _unitOfWork.FloorObjects.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created FloorObject {FloorObjectId} Type={Type} Label={Label}",
            entity.FloorObjectId, entity.ObjectType, entity.Label);

        return FloorObjectMapper.ToResponse(entity);
    }

    public async Task<FloorObjectResponseModel> UpdateFloorObjectAsync(
        int floorObjectId, UpdateFloorObjectRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.FloorObjects.GetByIdAsync(floorObjectId, ct)
            ?? throw new EntityNotFoundException("FloorObject", floorObjectId);

        if (request.ZoneId.HasValue)
        {
            var zoneExists = await _unitOfWork.Zones.QueryNoTracking()
                .AnyAsync(z => z.ZoneId == request.ZoneId.Value, ct);
            if (!zoneExists)
                throw new EntityNotFoundException("Zone", request.ZoneId.Value);
        }

        FloorObjectMapper.UpdateEntity(entity, request);
        _unitOfWork.FloorObjects.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated FloorObject {FloorObjectId}", floorObjectId);

        return FloorObjectMapper.ToResponse(entity);
    }

    public async Task DeleteFloorObjectAsync(int floorObjectId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.FloorObjects.GetByIdAsync(floorObjectId, ct)
            ?? throw new EntityNotFoundException("FloorObject", floorObjectId);

        entity.DeleteFlag = true;
        _unitOfWork.FloorObjects.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Deleted FloorObject {FloorObjectId}", floorObjectId);
    }

    public async Task UpdatePositionsAsync(
        UpdateFloorObjectPositionsRequestModel request, CancellationToken ct = default)
    {
        var ids = request.Items.Select(i => i.FloorObjectId).ToList();
        var entities = await _unitOfWork.FloorObjects.GetAll()
            .Where(f => ids.Contains(f.FloorObjectId))
            .ToListAsync(ct);

        foreach (var item in request.Items)
        {
            var entity = entities.FirstOrDefault(e => e.FloorObjectId == item.FloorObjectId);
            if (entity == null) continue;

            entity.PositionX = item.PositionX;
            entity.PositionY = item.PositionY;
            _unitOfWork.FloorObjects.Update(entity);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated positions for {Count} floor objects", request.Items.Count);
    }
}
