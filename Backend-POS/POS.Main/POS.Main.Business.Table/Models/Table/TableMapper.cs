using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Table.Models.Table;


public static class TableMapper
{
    public static TableResponseModel ToResponse(TbTable entity, string? linkedGroupCode = null, List<string>? linkedTableNames = null)
    {
        return new TableResponseModel
        {
            TableId = entity.TableId,
            TableName = entity.TableName,
            ZoneId = entity.ZoneId,
            ZoneName = entity.Zone?.ZoneName ?? string.Empty,
            ZoneColor = entity.Zone?.Color ?? string.Empty,
            Capacity = entity.Capacity,
            PositionX = entity.PositionX,
            PositionY = entity.PositionY,
            Size = entity.Size.ToString(),
            Status = entity.Status.ToString(),
            CurrentGuests = entity.CurrentGuests,
            GuestType = entity.GuestType?.ToString(),
            OpenedAt = entity.OpenedAt,
            Note = entity.Note,
            LinkedGroupCode = linkedGroupCode,
            LinkedTableNames = linkedTableNames,
            HasQrToken = !string.IsNullOrEmpty(entity.QrToken),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
    }

    public static TbTable ToEntity(CreateTableRequestModel request)
    {
        return new TbTable
        {
            TableName = request.TableName,
            ZoneId = request.ZoneId,
            Capacity = request.Capacity,
            PositionX = request.PositionX,
            PositionY = request.PositionY,
            Size = Enum.Parse<ETableSize>(request.Size),
            Status = ETableStatus.Available
        };
    }

    public static void UpdateEntity(TbTable entity, UpdateTableRequestModel request)
    {
        entity.TableName = request.TableName;
        entity.ZoneId = request.ZoneId;
        entity.Capacity = request.Capacity;
        entity.Size = Enum.Parse<ETableSize>(request.Size);
    }
}
