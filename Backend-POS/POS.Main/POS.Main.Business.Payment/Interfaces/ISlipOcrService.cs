using POS.Main.Business.Payment.Models.Payment;

namespace POS.Main.Business.Payment.Interfaces;

public interface ISlipOcrService
{
    /// <summary>อ่านข้อมูลจากรูปสลิป (ยอดเงิน, วันที่, เลขบัญชี)</summary>
    Task<SlipOcrResultModel> ExtractSlipDataAsync(Stream imageStream, CancellationToken ct = default);
}
