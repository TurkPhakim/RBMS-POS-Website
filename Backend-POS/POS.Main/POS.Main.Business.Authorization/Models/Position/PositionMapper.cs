using POS.Main.Dal.Entities;

namespace POS.Main.Business.Authorization.Models.Position;

public static class PositionMapper
{
    public static TbmPosition ToEntity(CreatePositionRequestModel request)
        => new()
        {
            PositionName = request.PositionName,
            Description = request.Description,
            IsActive = request.IsActive
        };

    public static void UpdateEntity(TbmPosition entity, UpdatePositionRequestModel request)
    {
        entity.PositionName = request.PositionName;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
    }

    public static PositionResponseModel ToResponse(TbmPosition entity)
        => new()
        {
            PositionId = entity.PositionId,
            PositionName = entity.PositionName,
            Description = entity.Description,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };

    public static PositionDropdownModel ToDropdown(TbmPosition entity)
        => new()
        {
            PositionId = entity.PositionId,
            PositionName = entity.PositionName
        };
}
