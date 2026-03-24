using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.Customer;

public class CustomerUploadSlipRequestModel
{
    [Required]
    public int OrderBillId { get; set; }

    [MaxLength(200)]
    public string? PaymentReference { get; set; }
}
