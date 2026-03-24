namespace POS.Main.Business.Table.Models.Reservation;

public class ReservationResponseModel
{
    public int ReservationId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateOnly ReservationDate { get; set; }
    public TimeOnly ReservationTime { get; set; }
    public int GuestCount { get; set; }
    public int? TableId { get; set; }
    public string? TableName { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool ReminderSent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
