using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

public class ChangePinRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุรหัส PIN ปัจจุบัน")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "รหัส PIN ต้องเป็นตัวเลข 6 หลัก")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "รหัส PIN ต้องเป็นตัวเลข 6 หลัก")]
    public string CurrentPinCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุรหัส PIN ใหม่")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "รหัส PIN ต้องเป็นตัวเลข 6 หลัก")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "รหัส PIN ต้องเป็นตัวเลข 6 หลัก")]
    public string NewPinCode { get; set; } = string.Empty;
}
