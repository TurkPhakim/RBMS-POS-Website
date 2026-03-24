using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.SelfOrder;

public class SetNicknameRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อเล่น")]
    [StringLength(20, MinimumLength = 1, ErrorMessage = "ชื่อเล่นต้องมี 1-20 ตัวอักษร")]
    public string Nickname { get; set; } = string.Empty;
}
