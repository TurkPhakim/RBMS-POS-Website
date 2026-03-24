using POS.Main.Dal.Entities;

namespace POS.Main.Business.Table.Models.Zone;

public static class ZoneMapper
{
    public static ZoneResponseModel ToResponse(TbZone entity, int tableCount = 0)
    {
        return new ZoneResponseModel
        {
            ZoneId = entity.ZoneId,
            ZoneName = entity.ZoneName,
            Color = entity.Color,
            SortOrder = entity.SortOrder,
            IsActive = entity.IsActive,
            TableCount = tableCount,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
    }

    public static TbZone ToEntity(CreateZoneRequestModel request)
    {
        return new TbZone
        {
            ZoneName = request.ZoneName,
            Color = request.Color,
            IsActive = request.IsActive
        };
    }

    public static void UpdateEntity(TbZone entity, UpdateZoneRequestModel request)
    {
        entity.ZoneName = request.ZoneName;
        entity.Color = request.Color;
        entity.IsActive = request.IsActive;
    }
}
