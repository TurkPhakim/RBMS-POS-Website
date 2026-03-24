namespace POS.Main.Business.Payment.Interfaces;

public interface ISlipOcrService
{
    /// <summary>อ่านยอดเงินจากรูปสลิป</summary>
    Task<decimal?> ExtractAmountAsync(Stream imageStream, CancellationToken ct = default);
}
