namespace POS.Main.Business.HumanResource.Models;

public class EmployeeWorkHistoryResponseModel
{
    public int WorkHistoryId { get; set; }
    public int EmployeeId { get; set; }
    public string Workplace { get; set; } = string.Empty;
    public string? WorkPhone { get; set; }
    public string? Position { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
