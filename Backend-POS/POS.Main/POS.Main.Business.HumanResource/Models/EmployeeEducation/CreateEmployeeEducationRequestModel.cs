using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.HumanResource.Models.EmployeeEducation;

public class CreateEmployeeEducationRequestModel
{
    [Required(ErrorMessage = "Education level is required")]
    [StringLength(100)]
    public string EducationLevel { get; set; } = string.Empty;

    [Required(ErrorMessage = "Major is required")]
    [StringLength(200)]
    public string Major { get; set; } = string.Empty;

    [Required(ErrorMessage = "Institution is required")]
    [StringLength(200)]
    public string Institution { get; set; } = string.Empty;

    [Range(0, 4.00, ErrorMessage = "GPA must be between 0 and 4.00")]
    public decimal? Gpa { get; set; }

    public int? GraduationYear { get; set; }
}
