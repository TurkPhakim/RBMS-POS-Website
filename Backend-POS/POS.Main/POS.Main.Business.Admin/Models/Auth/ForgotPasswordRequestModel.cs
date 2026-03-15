using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

public class ForgotPasswordRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุ Username หรือ Email")]
    public string UsernameOrEmail { get; set; } = string.Empty;
}
