using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

public class VerifyPinRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุรหัส PIN")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "รหัส PIN ต้องเป็นตัวเลข 6 หลัก")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "รหัส PIN ต้องเป็นตัวเลข 6 หลัก")]
    public string PinCode { get; set; } = string.Empty;
}
