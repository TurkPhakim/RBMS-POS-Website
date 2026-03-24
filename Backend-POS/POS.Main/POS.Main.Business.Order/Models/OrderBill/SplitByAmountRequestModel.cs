using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Order.Models.OrderBill;

public class SplitByAmountRequestModel
{
    [Required]
    [Range(2, 20)]
    public int NumberOfSplits { get; set; }
}
