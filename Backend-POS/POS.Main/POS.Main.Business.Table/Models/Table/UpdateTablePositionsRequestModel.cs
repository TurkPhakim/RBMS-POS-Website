using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Table;

public class UpdateTablePositionsRequestModel
{
    [Required]
    public List<TablePositionItem> Items { get; set; } = new();
}

public class TablePositionItem
{
    public int TableId { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
}
