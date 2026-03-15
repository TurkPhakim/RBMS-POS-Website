using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

public class VerifyOtpRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุ Username หรือ Email")]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุรหัส OTP")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "รหัส OTP ต้องมี 6 หลัก")]
    public string OtpCode { get; set; } = string.Empty;
}
