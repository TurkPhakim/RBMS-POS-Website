namespace POS.Main.Business.HumanResource.Models;

public class EmployeeEducationResponseModel
{
    public int EducationId { get; set; }
    public int EmployeeId { get; set; }
    public string EducationLevel { get; set; } = string.Empty;
    public string? Major { get; set; }
    public string Institution { get; set; } = string.Empty;
    public decimal? Gpa { get; set; }
    public int? GraduationYear { get; set; }
}
