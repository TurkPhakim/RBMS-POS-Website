using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Zone;

public class UpdateZoneSortOrderRequestModel
{
    [Required]
    public List<ZoneSortOrderItem> Items { get; set; } = new();
}

public class ZoneSortOrderItem
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
}
