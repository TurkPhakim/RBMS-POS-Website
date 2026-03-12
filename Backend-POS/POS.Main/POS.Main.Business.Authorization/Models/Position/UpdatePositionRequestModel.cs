using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Authorization.Models.Position;

public class UpdatePositionRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อตำแหน่ง")]
    [MaxLength(100, ErrorMessage = "ชื่อตำแหน่งต้องไม่เกิน 100 ตัวอักษร")]
    public string PositionName { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "คำอธิบายต้องไม่เกิน 500 ตัวอักษร")]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
