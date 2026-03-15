namespace POS.Main.Dal.Entities;

public class TbEmployeeWorkHistory : BaseEntity
{
    public int WorkHistoryId { get; set; }

    public int EmployeeId { get; set; }

    public string Workplace { get; set; } = string.Empty;

    public string? WorkPhone { get; set; }

    public string? Position { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public virtual TbEmployee Employee { get; set; } = null!;
}
