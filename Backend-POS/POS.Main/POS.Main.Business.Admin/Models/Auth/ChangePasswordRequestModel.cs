using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

public class ChangePasswordRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุรหัสผ่านเก่า")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุรหัสผ่านใหม่")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "รหัสผ่านต้องมีความยาว 8-128 ตัวอักษร")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณายืนยันรหัสผ่านใหม่")]
    [Compare(nameof(NewPassword), ErrorMessage = "รหัสผ่านไม่ตรงกัน")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
