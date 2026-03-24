using POS.Main.Dal.Entities;

namespace POS.Main.Business.Order.Models.OrderItem;

public static class OrderItemMapper
{
    public static OrderItemResponseModel ToResponse(TbOrderItem entity)
    {
        return new OrderItemResponseModel
        {
            OrderItemId = entity.OrderItemId,
            MenuId = entity.MenuId,
            MenuImageFileId = entity.Menu?.ImageFileId,
            MenuNameThai = entity.MenuNameThai,
            MenuNameEnglish = entity.MenuNameEnglish,
            CategoryType = entity.CategoryType,
            SubCategoryName = entity.Menu?.SubCategory?.Name,
            Quantity = entity.Quantity,
            UnitPrice = entity.UnitPrice,
            OptionsTotalPrice = entity.OptionsTotalPrice,
            TotalPrice = entity.TotalPrice,
            Status = entity.Status.ToString(),
            Note = entity.Note,
            OrderedBy = entity.OrderedBy,
            SentToKitchenAt = entity.SentToKitchenAt,
            CookingStartedAt = entity.CookingStartedAt,
            ReadyAt = entity.ReadyAt,
            ServedAt = entity.ServedAt,
            CancelledByName = entity.CancelledByEmployee != null
                ? $"{entity.CancelledByEmployee.FirstNameThai} {entity.CancelledByEmployee.LastNameThai}"
                : null,
            CancelReason = entity.CancelReason,
            Options = entity.OrderItemOptions?
                .Select(o => new OrderItemOptionResponseModel
                {
                    OrderItemOptionId = o.OrderItemOptionId,
                    OptionGroupId = o.OptionGroupId,
                    OptionGroupName = o.OptionGroupName,
                    OptionItemId = o.OptionItemId,
                    OptionItemName = o.OptionItemName,
                    AdditionalPrice = o.AdditionalPrice
                }).ToList() ?? new()
        };
    }
}
