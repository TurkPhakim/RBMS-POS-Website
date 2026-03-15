using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.HumanResource.Models.EmployeeWorkHistory;

public class CreateEmployeeWorkHistoryRequestModel
{
    [Required(ErrorMessage = "Workplace is required")]
    [StringLength(200)]
    public string Workplace { get; set; } = string.Empty;

    [StringLength(20)]
    public string? WorkPhone { get; set; }

    [Required(ErrorMessage = "Position is required")]
    [StringLength(100)]
    public string Position { get; set; } = string.Empty;

    [Required(ErrorMessage = "Start date is required")]
    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
