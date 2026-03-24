using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.SelfOrder;

public class RequestSplitBillModel
{
    [Required]
    public string SplitType { get; set; } = string.Empty; // "Equal" หรือ "ByItem"

    public int? NumberOfPeople { get; set; } // ใช้เมื่อ SplitType = "Equal"
}
