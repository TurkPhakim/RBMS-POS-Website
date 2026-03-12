using POS.Main.Dal.Entities;

namespace POS.Main.Business.Menu.Models;

public static class MenuMapper
{
    public static TbMenu ToEntity(CreateMenuRequestModel request)
        => new()
        {
            NameThai = request.NameThai,
            NameEnglish = request.NameEnglish,
            Description = request.Description,
            Price = request.Price,
            Category = request.Category,
            IsActive = request.IsActive,
            IsAvailable = request.IsAvailable
        };

    public static void UpdateEntity(TbMenu entity, UpdateMenuRequestModel request)
    {
        entity.NameThai = request.NameThai;
        entity.NameEnglish = request.NameEnglish;
        entity.Description = request.Description;
        entity.Price = request.Price;
        entity.Category = request.Category;
        entity.IsActive = request.IsActive;
        entity.IsAvailable = request.IsAvailable;
    }

    public static MenuResponseModel ToResponse(TbMenu entity)
        => new()
        {
            MenuId = entity.MenuId,
            NameThai = entity.NameThai,
            NameEnglish = entity.NameEnglish,
            Description = entity.Description,
            ImageFileId = entity.ImageFileId,
            ImageFileName = entity.ImageFile?.FileName,
            Price = entity.Price,
            Category = entity.Category,
            CategoryName = entity.Category.ToString(),
            IsActive = entity.IsActive,
            IsAvailable = entity.IsAvailable,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
}
