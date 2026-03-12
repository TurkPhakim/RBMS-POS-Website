using POS.Main.Dal.Entities;

namespace POS.Main.Business.Admin.Models.AdminSettings;

public static class ServiceChargeMapper
{
    public static TbServiceCharge ToEntity(CreateServiceChargeRequestModel request)
        => new()
        {
            Name = request.Name,
            PercentageRate = request.PercentageRate,
            Description = request.Description,
            IsActive = request.IsActive
        };

    public static void UpdateEntity(TbServiceCharge entity, UpdateServiceChargeRequestModel request)
    {
        entity.Name = request.Name;
        entity.PercentageRate = request.PercentageRate;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
    }

    public static ServiceChargeResponseModel ToResponse(TbServiceCharge entity)
        => new()
        {
            ServiceChargeId = entity.ServiceChargeId,
            Name = entity.Name,
            PercentageRate = entity.PercentageRate,
            Description = entity.Description,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };

    public static ServiceChargeDropdownModel ToDropdown(TbServiceCharge entity)
        => new()
        {
            Value = entity.ServiceChargeId,
            Label = $"{entity.PercentageRate}%"
        };
}
