using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

public class VerifyPasswordRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุรหัสผ่าน")]
    public string Password { get; set; } = string.Empty;
}
