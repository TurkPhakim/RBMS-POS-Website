using POS.Main.Business.Order.Models.OrderItem;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Order.Models.Order;

public static class OrderMapper
{
    public static OrderResponseModel ToResponse(TbOrder entity)
    {
        return new OrderResponseModel
        {
            OrderId = entity.OrderId,
            TableId = entity.TableId,
            TableName = entity.Table?.TableName ?? string.Empty,
            OrderNumber = entity.OrderNumber,
            Status = entity.Status.ToString(),
            GuestCount = entity.GuestCount,
            SubTotal = entity.SubTotal,
            Note = entity.Note,
            ItemCount = entity.OrderItems?.Count(i =>
                i.Status != EOrderItemStatus.Voided &&
                i.Status != EOrderItemStatus.Cancelled) ?? 0,
            ZoneName = entity.Table?.Zone?.ZoneName ?? string.Empty,
            GuestType = entity.Table?.GuestType?.ToString(),
            CreatedAt = entity.CreatedAt
        };
    }

    public static OrderDetailResponseModel ToDetailResponse(TbOrder entity)
    {
        return new OrderDetailResponseModel
        {
            OrderId = entity.OrderId,
            TableId = entity.TableId,
            TableName = entity.Table?.TableName ?? string.Empty,
            ZoneName = entity.Table?.Zone?.ZoneName ?? string.Empty,
            OrderNumber = entity.OrderNumber,
            Status = entity.Status.ToString(),
            GuestCount = entity.GuestCount,
            SubTotal = entity.SubTotal,
            Note = entity.Note,
            CreatedAt = entity.CreatedAt,
            Items = entity.OrderItems?
                .OrderBy(i => i.CreatedAt)
                .Select(OrderItemMapper.ToResponse)
                .ToList() ?? new()
        };
    }
}
