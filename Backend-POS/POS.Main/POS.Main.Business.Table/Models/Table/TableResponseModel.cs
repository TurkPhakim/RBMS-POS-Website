namespace POS.Main.Business.Table.Models.Table;

public class TableResponseModel
{
    public int TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public string ZoneColor { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public string Size { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? CurrentGuests { get; set; }
    public string? GuestType { get; set; }
    public DateTime? OpenedAt { get; set; }
    public string? Note { get; set; }
    public string? LinkedGroupCode { get; set; }
    public List<string>? LinkedTableNames { get; set; }
    public bool HasQrToken { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
