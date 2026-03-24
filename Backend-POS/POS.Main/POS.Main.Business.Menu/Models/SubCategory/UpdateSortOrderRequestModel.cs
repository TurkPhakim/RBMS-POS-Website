using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Menu.Models.SubCategory;

public class UpdateSortOrderRequestModel
{
    [Required]
    public List<SortOrderItem> Items { get; set; } = new();
}

public class SortOrderItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
}
