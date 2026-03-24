using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbTable : BaseEntity
{
    public int TableId { get; set; }

    public string TableName { get; set; } = string.Empty;

    public int ZoneId { get; set; }
    public virtual TbZone Zone { get; set; } = null!;

    public int Capacity { get; set; }

    public double PositionX { get; set; }

    public double PositionY { get; set; }

    public ETableSize Size { get; set; } = ETableSize.Medium;

    public ETableStatus Status { get; set; } = ETableStatus.Available;

    public int? CurrentGuests { get; set; }

    public EGuestType? GuestType { get; set; }

    public DateTime? OpenedAt { get; set; }

    public string? Note { get; set; }

    public string? QrToken { get; set; }

    public DateTime? QrTokenExpiresAt { get; set; }

    public string? QrTokenNonce { get; set; }

    public int? ActiveOrderId { get; set; }
    public virtual TbOrder? ActiveOrder { get; set; }

    public virtual ICollection<TbTableLink> TableLinks { get; set; } = new List<TbTableLink>();

    public virtual ICollection<TbReservation> Reservations { get; set; } = new List<TbReservation>();

    public virtual ICollection<TbOrder> Orders { get; set; } = new List<TbOrder>();
}
