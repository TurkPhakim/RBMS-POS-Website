using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Table.Models.FloorObject;

public static class FloorObjectMapper
{
    public static FloorObjectResponseModel ToResponse(TbFloorObject entity)
    {
        return new FloorObjectResponseModel
        {
            FloorObjectId = entity.FloorObjectId,
            ZoneId = entity.ZoneId,
            ZoneName = entity.Zone?.ZoneName,
            ObjectType = entity.ObjectType.ToString(),
            Label = entity.Label,
            PositionX = entity.PositionX,
            PositionY = entity.PositionY,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static TbFloorObject ToEntity(CreateFloorObjectRequestModel request)
    {
        return new TbFloorObject
        {
            ZoneId = request.ZoneId,
            ObjectType = Enum.Parse<EFloorObjectType>(request.ObjectType),
            Label = request.Label,
            PositionX = request.PositionX,
            PositionY = request.PositionY
        };
    }

    public static void UpdateEntity(TbFloorObject entity, UpdateFloorObjectRequestModel request)
    {
        entity.ZoneId = request.ZoneId;
        entity.ObjectType = Enum.Parse<EFloorObjectType>(request.ObjectType);
        entity.Label = request.Label;
        entity.PositionX = request.PositionX;
        entity.PositionY = request.PositionY;
    }
}
