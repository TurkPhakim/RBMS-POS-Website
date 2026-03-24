using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbReservation : BaseEntity
{
    public int ReservationId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string CustomerPhone { get; set; } = string.Empty;

    public DateOnly ReservationDate { get; set; }

    public TimeOnly ReservationTime { get; set; }

    public int GuestCount { get; set; }

    public int? TableId { get; set; }
    public virtual TbTable? Table { get; set; }

    public string? Note { get; set; }

    public EReservationStatus Status { get; set; } = EReservationStatus.Pending;

    public bool ReminderSent { get; set; } = false;
}
